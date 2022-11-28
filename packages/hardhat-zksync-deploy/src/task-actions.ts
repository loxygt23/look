import { HardhatRuntimeEnvironment, TaskArguments } from 'hardhat/types';
import { deployManager } from '.';

export async function zkSyncDeploy(taskArgs: TaskArguments, _: HardhatRuntimeEnvironment) {
    await deployManager.callDeployScripts(taskArgs.script);
}
