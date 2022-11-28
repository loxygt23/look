import { extendConfig, extendEnvironment, task } from 'hardhat/config';
import { HardhatConfig, HardhatRuntimeEnvironment, HardhatUserConfig } from 'hardhat/types';
import { lazyObject } from 'hardhat/plugins';
import { TASK_DEPLOY_ZKSYNC } from './task-names';
import './type-extensions';
import { zkSyncDeploy } from './task-actions';
import { networkFromConfig } from './utils';
import { DEFAULT_DEPLOY_SCRIPTS_PATH } from './constants';
import { DeployManager } from './deploy-manager';

export * from './deployer';

extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    config.paths.deploy = userConfig.paths?.deploy ?? DEFAULT_DEPLOY_SCRIPTS_PATH;
});

export let deployManager: DeployManager;

extendEnvironment((hre: HardhatRuntimeEnvironment) => {
    networkFromConfig(hre, hre.network);
    if (deployManager === undefined || hre.deployments) {
        deployManager = new DeployManager(
            hre,
            lazyObject(() => hre.network)
        );
        hre.deployments = deployManager.deploymentsExtension;
    }
});

task(TASK_DEPLOY_ZKSYNC, 'Runs the deploy scripts for zkSync network')
    .addParam('script', 'A certain deploy script to be launched', '')
    .setAction(zkSyncDeploy);
