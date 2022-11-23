import { assert } from 'chai';
import * as path from 'path';
import { ethers } from 'ethers';
import { Wallet } from 'zksync-web3';
import { callDeployScripts, findAllDeployScripts, findDeployScript } from '../src/plugin';
import { TASK_DEPLOY_ZKSYNC } from '../src/task-names';
import { useEnvironment } from './helpers';
import { Deployer } from '../src/deployer';
import { ETH_NETWORK_RPC_URL, ZKSYNC_NETWORK_RPC_URL, ZKSYNC_NETWORK_NAME, WALLET_PRIVATE_KEY } from './constants';

describe('Plugin tests', async function () {
    describe('successful-compilation artifact', async function () {
        useEnvironment('successful-compilation');

        it('Should load artifacts', async function () {
            const artifactExists = await this.env.artifacts.artifactExists('Greeter');
            assert(artifactExists, "Greeter artifact doesn't exist");

            const artifact = await this.env.artifacts.readArtifact('Greeter');
            assert.equal(artifact._format, 'hh-zksolc-artifact-1', 'Incorrect artifact build');

            // Check that we can load an additional key (it turns that we can which is great).
            assert.equal((artifact as any)._additionalKey, 'some_value', 'Additional key not loaded!');
        });

        it('Should find all deploy scripts in default deploy folder', async function () {
            const baseDir = this.env.config.paths.root;
            const files = await findAllDeployScripts(this.env.network.deploy);

            assert.deepEqual(files, [path.join(baseDir, 'deploy', '001_deploy.ts')], 'Incorrect deploy scripts list');
        });

        it('Should find a specified deploy script', async function () {
            const baseDir = this.env.config.paths.root;
            const file = findDeployScript(this.env.network.deploy, '001_deploy.ts');

            assert.deepEqual(file, path.join(baseDir, 'deploy', '001_deploy.ts'), 'Deploy script not found');
        });

        it('Should call deploy scripts', async function () {
            await callDeployScripts(this.env, '');
        });

        it('Should call deploy scripts through HRE', async function () {
            await this.env.run(TASK_DEPLOY_ZKSYNC);
        });
    });

    describe('Deployer with zkSync network provided', async function () {
        useEnvironment('successful-compilation', ZKSYNC_NETWORK_NAME);

        it('Should connect to correct L1 and L2 networks based on zkSync network', async function () {
            const zkWallet = new Wallet(WALLET_PRIVATE_KEY);
            const deployer = new Deployer(this.env, zkWallet);

            assert.equal(
                (deployer.ethWallet.provider as ethers.providers.JsonRpcProvider).connection.url,
                ETH_NETWORK_RPC_URL,
                'Incorrect L1 network url'
            );
            assert.equal(deployer.zkWallet.provider.connection.url, ZKSYNC_NETWORK_RPC_URL, 'Incorrect L2 network url');
        });
    });

    describe('Deployer without zkSync network provided', async function () {
        useEnvironment('successful-compilation');

        it('Should use default L1 and L2 network providers (local-setup)', async function () {
            const zkWallet = new Wallet(WALLET_PRIVATE_KEY);
            const deployer = new Deployer(this.env, zkWallet);

            assert.equal(
                (deployer.ethWallet.provider as ethers.providers.JsonRpcProvider).connection.url,
                'http://localhost:8545',
                'Incorrect default L1 network provider'
            );
            assert.equal(
                deployer.zkWallet.provider.connection.url,
                'http://localhost:3050',
                'Incorrect default L2 network provider'
            );
        });
    });

    describe('multiple-deploy-folders', async function () {
        useEnvironment('multiple-deploy-folders', ZKSYNC_NETWORK_NAME);

        it('Should find all deploy scripts', async function () {
            const baseDir = this.env.config.paths.root;
            const files = await findAllDeployScripts(this.env.network.deploy);

            const expectedFiles = [
                path.join(baseDir, 'deploy-scripts-1', '001_deploy.ts'),
                path.join(baseDir, 'deploy-scripts-2', '001_deploy.js'),
                path.join(baseDir, 'deploy-scripts-2', '002_deploy.ts'),
            ];

            assert.deepEqual(files, expectedFiles, 'Incorrect deploy scripts list');
        });

        it('Should find a specified deploy script', async function () {
            const baseDir = this.env.config.paths.root;
            const file = findDeployScript(this.env.network.deploy, '001_deploy.js');

            assert.deepEqual(file, path.join(baseDir, 'deploy-scripts-2', '001_deploy.js'), 'Deploy script not found');
        });
    });
});
