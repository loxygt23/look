import { extendConfig, extendEnvironment, task } from 'hardhat/config';
import { HardhatConfig, HardhatRuntimeEnvironment, HardhatUserConfig } from 'hardhat/types';

import { TASK_DEPLOY_ZKSYNC } from './task-names';
import './type-extensions';
import { zkSyncDeploy } from './task-actions';
import { networkFromConfig } from './utils';
import { DEFAULT_DEPLOY_SCRIPTS_PATH } from './constants';

export * from './deployer';

extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    config.paths.deploy = userConfig.paths?.deploy ?? DEFAULT_DEPLOY_SCRIPTS_PATH;
});

extendEnvironment((hre: HardhatRuntimeEnvironment) => {
    networkFromConfig(hre, hre.network);
});

task(TASK_DEPLOY_ZKSYNC, 'Runs the deploy scripts for zkSync network')
    .addParam('script', 'A certain deploy script to be launched', '')
    .setAction(zkSyncDeploy);
