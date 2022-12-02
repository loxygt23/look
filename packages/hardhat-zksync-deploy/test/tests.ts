import { assert } from 'chai';
import * as path from 'path';
import { ethers } from 'ethers';
import { TASK_DEPLOY_ZKSYNC } from '../src/task-names';
import { useEnvironment } from './helpers';
import { Deployer } from '../src/deployer';
import { ETH_NETWORK_RPC_URL, ZKSYNC_NETWORK_RPC_URL, ZKSYNC_NETWORK_NAME } from './constants';
import { DeployManager } from '../src/deploy-manager';

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
            const deployManager = new DeployManager(this.env, this.env.network);
            const baseDir = this.env.config.paths.root;
            const files = await deployManager.findAllDeployScripts();

            assert.deepEqual(files, [path.join(baseDir, 'deploy', '001_deploy.ts')], 'Incorrect deploy scripts list');
        });

        it('Should find a specified deploy script', async function () {
            const deployManager = new DeployManager(this.env, this.env.network);
            const baseDir = this.env.config.paths.root;
            const file = deployManager.findDeployScript('001_deploy.ts');

            assert.deepEqual(file, path.join(baseDir, 'deploy', '001_deploy.ts'), 'Deploy script not found');
        });

        it('Should call deploy scripts', async function () {
            const deployManager = new DeployManager(this.env, this.env.network);
            await deployManager.callDeployScripts('');
        });

        it('Should call deploy scripts through HRE', async function () {
            await this.env.run(TASK_DEPLOY_ZKSYNC);
        });
    });

    describe('Deployer with zkSync network provided', async function () {
        useEnvironment('successful-compilation', ZKSYNC_NETWORK_NAME);

        it('Should connect to correct L1 and L2 networks based on zkSync network', async function () {
            const deployer = new Deployer(this.env);

            assert.equal(
                (deployer.ethProvider as ethers.providers.JsonRpcProvider).connection.url,
                ETH_NETWORK_RPC_URL,
                'Incorrect L1 network url'
            );
            assert.equal(deployer.zkProvider.connection?.url, ZKSYNC_NETWORK_RPC_URL, 'Incorrect L2 network url');
        });
    });

    describe('Deployer without zkSync network provided', async function () {
        useEnvironment('successful-compilation');

        it('Should use default L1 and L2 network providers (local-setup)', async function () {
            const deployer = new Deployer(this.env);

            assert.equal(
                (deployer.ethProvider as ethers.providers.JsonRpcProvider).connection.url,
                'http://localhost:8545',
                'Incorrect default L1 network provider'
            );
            assert.equal(
                deployer.zkProvider.connection?.url,
                'http://localhost:3050',
                'Incorrect default L2 network provider'
            );
        });
    });

    describe('multiple-deploy-folders', async function () {
        useEnvironment('multiple-deploy-folders', ZKSYNC_NETWORK_NAME);

        it('Should find all deploy scripts', async function () {
            const deployManager = new DeployManager(this.env, this.env.network);
            const baseDir = this.env.config.paths.root;
            const files = await deployManager.findAllDeployScripts();

            const expectedFiles = [
                path.join(baseDir, 'deploy-scripts-1', '001_deploy.ts'),
                path.join(baseDir, 'deploy-scripts-2', '001_deploy.js'),
                path.join(baseDir, 'deploy-scripts-2', '002_deploy.ts'),
            ];

            assert.deepEqual(files, expectedFiles, 'Incorrect deploy scripts list');
        });

        it('Should find a specified deploy script', async function () {
            const deployManager = new DeployManager(this.env, this.env.network);
            const baseDir = this.env.config.paths.root;
            const file = deployManager.findDeployScript('001_deploy.js');

            assert.deepEqual(file, path.join(baseDir, 'deploy-scripts-2', '001_deploy.js'), 'Deploy script not found');
        });
    });

    describe('Deply scripts with tags and dependencies', async function () {
        useEnvironment('deploy-scripts-with-tags-and-dependencies', ZKSYNC_NETWORK_NAME);

        it('Should collect specified tags', async function () {
            const deployManager = new DeployManager(this.env, this.env.network);
            const scripts = await deployManager.findAllDeployScripts();
            const filePathsByTag = await deployManager.collectTags(scripts);

            assert.deepEqual(Object.keys(filePathsByTag), ['second', 'all', 'third', 'first'], 'Collected tags don\'t match');
        });

        it('Should match tags with file paths', async function () {
            const deployManager = new DeployManager(this.env, this.env.network);
            const baseDir = this.env.config.paths.root;
            const scripts = await deployManager.findAllDeployScripts();
            const filePathsByTag = await deployManager.collectTags(scripts);

            const firstTagFilePaths = [path.join(baseDir, 'deploy-scripts', '003_deploy.ts')];
            const secondTagFilePaths = [path.join(baseDir, 'deploy-scripts', '001_deploy.ts')];
            const thirdTagFilePaths = [path.join(baseDir, 'deploy-scripts', '002_deploy.js')];
            const allTagFilePaths = [
                path.join(baseDir, 'deploy-scripts', '001_deploy.ts'),
                path.join(baseDir, 'deploy-scripts', '002_deploy.js'),
                path.join(baseDir, 'deploy-scripts', '003_deploy.ts'),
            ];

            assert.deepEqual(filePathsByTag['first'], firstTagFilePaths, 'Incorrect file paths list by tag');
            assert.deepEqual(filePathsByTag['second'], secondTagFilePaths, 'Incorrect file paths list by tag');
            assert.deepEqual(filePathsByTag['third'], thirdTagFilePaths, 'Incorrect file paths list by tag');
            assert.deepEqual(filePathsByTag['all'], allTagFilePaths, 'Incorrect file paths list by tag');
        });

        it('Should filter scripts to run by specified tags, when collecting', async function () {
            const deployManager = new DeployManager(this.env, this.env.network);
            const baseDir = this.env.config.paths.root;
            const scripts = await deployManager.findAllDeployScripts();

            const firstTagFilePaths = [path.join(baseDir, 'deploy-scripts', '003_deploy.ts')];
            const secondTagFilePaths = [path.join(baseDir, 'deploy-scripts', '001_deploy.ts')];
            const thirdTagFilePaths = [path.join(baseDir, 'deploy-scripts', '002_deploy.js')];
            const allTagFilePaths = [
                path.join(baseDir, 'deploy-scripts', '003_deploy.ts'),
                path.join(baseDir, 'deploy-scripts', '001_deploy.ts'),
                path.join(baseDir, 'deploy-scripts', '002_deploy.js'),
            ];

            let filePathsByTag = await deployManager.collectTags(scripts, ['first']);
            let scriptsToRun = await deployManager.getScriptsToRun(filePathsByTag);
            assert.deepEqual(scriptsToRun, firstTagFilePaths, 'List of scripts to run doesn\'t match with filtered file paths');

            filePathsByTag = await deployManager.collectTags(scripts, ['all']);
            scriptsToRun = await deployManager.getScriptsToRun(filePathsByTag);
            assert.deepEqual(scriptsToRun, allTagFilePaths, 'List of scripts to run doesn\'t match with filtered file paths');

            filePathsByTag = await deployManager.collectTags(scripts, ['first', 'second']);
            scriptsToRun = await deployManager.getScriptsToRun(filePathsByTag);
            assert.deepEqual(scriptsToRun, firstTagFilePaths.concat(secondTagFilePaths), 'List of scripts to run doesn\'t match with filtered file paths');

            filePathsByTag = await deployManager.collectTags(scripts, ['first', 'second', 'third']);
            scriptsToRun = await deployManager.getScriptsToRun(filePathsByTag);
            assert.deepEqual(scriptsToRun, firstTagFilePaths.concat(secondTagFilePaths).concat(thirdTagFilePaths), 'List of scripts to run doesn\'t match with filtered file paths');
        });

        it('Should run scripts in specified order', async function () {
            const deployManager = new DeployManager(this.env, this.env.network);
            const baseDir = this.env.config.paths.root;
            const scripts = await deployManager.findAllDeployScripts();

            const expectedScriptToRunOrder = [
                path.join(baseDir, 'deploy-scripts', '003_deploy.ts'), // first tag
                path.join(baseDir, 'deploy-scripts', '001_deploy.ts'), // second tag
                path.join(baseDir, 'deploy-scripts', '002_deploy.js'), // third tag
            ];

            let filePathsByTag = await deployManager.collectTags(scripts);
            let scriptsToRun = await deployManager.getScriptsToRun(filePathsByTag);

            assert.deepEqual(scriptsToRun, expectedScriptToRunOrder, 'Order of executing scripts doesn\'t match');
        });
    });
});
