import { existsSync } from 'fs';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import * as path from 'path';
import { glob } from 'glob';
import { promisify } from 'util';

import { ZkSyncDeployPluginError } from './errors';

const globPromise = promisify(glob);

export async function findAllDeployScripts(deployDirs: string[]): Promise<string[]> {
    let files: string[] = [];

    for (const dir of deployDirs) {
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

export function findDeployScript(deployDirs: string[], script: string): string {
    for (const dir of deployDirs) {
        if (!existsSync(dir)) {
            continue;
        }

        const matchedFiles = glob.sync(path.join(dir, '**', script));

        if (matchedFiles.length) {
            return matchedFiles[0];
        }
    }

    throw new ZkSyncDeployPluginError(
        `Deploy script '${script}' not found, in deploy folders:\n${deployDirs.join(',\n')}.`
    );
}

export async function callDeployScripts(hre: HardhatRuntimeEnvironment, targetScript: string) {
    const deployDirs = hre.network.deploy;

    if (targetScript === '') {
        const scripts = await findAllDeployScripts(deployDirs);
        for (const script of scripts) {
            await runScript(hre, script);
        }
    } else {
        await runScript(hre, findDeployScript(deployDirs, targetScript));
    }
}

async function runScript(hre: HardhatRuntimeEnvironment, script: string) {
    delete require.cache[script];
    let deployFn: any = require(script);

    if (typeof deployFn.default === 'function') {
        deployFn = deployFn.default;
    }

    if (typeof deployFn !== 'function') {
        throw new ZkSyncDeployPluginError('Deploy function does not exist or exported invalidly.');
    }

    await deployFn(hre);
}
