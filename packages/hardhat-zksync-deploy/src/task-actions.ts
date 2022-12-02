import { HardhatRuntimeEnvironment, TaskArguments } from 'hardhat/types';
import { deployManager } from '.';

export async function zkSyncDeploy(taskArgs: TaskArguments, _: HardhatRuntimeEnvironment) {
    let tags = taskArgs.tags;
    if (typeof tags === 'string') {
      tags = tags.split(',');
    }

    await deployManager.callDeployScripts(taskArgs.script, tags);
}
