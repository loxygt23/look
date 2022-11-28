import { existsSync } from 'fs';
import { HardhatRuntimeEnvironment, Network } from 'hardhat/types';
import * as path from 'path';
import { glob } from 'glob';
import { promisify } from 'util';

import { ZkSyncDeployPluginError } from './errors';
import { DeployManagerData, DeploymentsExtension } from './types';
import { Deployer } from './deployer';
import { processPrivateKeys } from './utils';

const globPromise = promisify(glob);

export class DeployManager {
    public deploymentsExtension: DeploymentsExtension;

    private data: DeployManagerData;

    private deployPaths: string[];
    private deployer: Deployer;

    constructor(private hre: HardhatRuntimeEnvironment, private network: Network) {
        this.hre = hre;
        this.network = network;
        this.deployPaths = network.deploy;

        this.data = {
            privateKeysLoaded: false,
            namedPrivateKeys: {},
        };

        this.deployer = new Deployer(hre);

        this.deploymentsExtension = {
            deploy: this.deployer.deploy.bind(this.deployer),
            setWallet: this.deployer.setWallet.bind(this.deployer),
            setWalletFromEthWallet: this.deployer.setWalletFromEthWallet.bind(this.deployer),
            setWalletFromPrivatekey: this.deployer.setWalletFromPrivatekey.bind(this.deployer),
            loadArtifact: this.deployer.loadArtifact.bind(this.deployer),
            estimateDeployFee: this.deployer.estimateDeployFee.bind(this.deployer),
            estimateDeployGas: this.deployer.estimateDeployGas.bind(this.deployer),
        };
    }

    public async findAllDeployScripts(): Promise<string[]> {
        let files: string[] = [];

        for (const dir of this.deployPaths) {
            if (!existsSync(dir)) {
                throw new ZkSyncDeployPluginError(`Deploy folder '${dir}' not found.`);
            }

            const [tsFilesInDir, jsFilesInDir] = await Promise.all([
                globPromise(path.join(dir, '**', '*.ts')),
                globPromise(path.join(dir, '**', '*.js')),
            ]);

            const filesInDir = tsFilesInDir.concat(jsFilesInDir);
            filesInDir.sort();
            files = files.concat(filesInDir);
        }

        return files;
    }

    public findDeployScript(script: string): string {
        for (const dir of this.deployPaths) {
            if (!existsSync(dir)) {
                continue;
            }

            const matchedFiles = glob.sync(path.join(dir, '**', script));

            if (matchedFiles.length) {
                return matchedFiles[0];
            }
        }

        throw new ZkSyncDeployPluginError(
            `Deploy script '${script}' not found, in deploy folders:\n${this.deployPaths.join(',\n')}.`
        );
    }

    public async callDeployScripts(targetScript: string) {
        if (targetScript === '') {
            const scripts = await this.findAllDeployScripts();
            for (const script of scripts) {
                await this.runScript(script);
            }
        } else {
            await this.runScript(this.findDeployScript(targetScript));
        }
    }

    private async runScript(script: string) {
        delete require.cache[script];
        let deployFn: any = require(script);

        if (typeof deployFn.default === 'function') {
            deployFn = deployFn.default;
        }

        if (typeof deployFn !== 'function') {
            throw new ZkSyncDeployPluginError('Deploy function does not exist or exported invalidly.');
        }

        await deployFn(this.hre);
    }

    public async setupPrivateKeys() {
        if (!this.data.privateKeysLoaded && this.hre.config.namedPrivateKeys) {
            const chainId = await this.getChainId();

            const { namedPrivateKeys } = processPrivateKeys(this.network, this.hre.config.namedPrivateKeys, chainId);

            this.data.namedPrivateKeys = namedPrivateKeys;
            this.data.privateKeysLoaded = true;
        }
    }

    public async getChainId(): Promise<number> {
        if (this.data.chainId) {
            return this.data.chainId;
        }
        this.data.chainId = await this.deployer.zkWallet?.getChainId();
        return this.data.chainId as number;
    }
}
