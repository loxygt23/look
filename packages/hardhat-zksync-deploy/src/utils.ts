import path from 'path';
import { HardhatConfig, HardhatRuntimeEnvironment, HttpNetworkConfig, Network, NetworkConfig } from 'hardhat/types';
import { ZkSyncDeployPluginError } from './errors';
import { NamedPrivateKeys } from './types';

export function isHttpNetworkConfig(networkConfig: NetworkConfig): networkConfig is HttpNetworkConfig {
    return 'url' in networkConfig;
}

export function validateZkSyncNetworkConfig(network: Network) {
    const { name: networkName, config: networkConfig } = network;

    if (!isHttpNetworkConfig(networkConfig)) {
        throw new ZkSyncDeployPluginError(
            `Invalid zkSync network configuration for '${networkName}'. 'url' needs to be provided.`
        );
    }

    if (!networkConfig.zksync) {
        throw new ZkSyncDeployPluginError(
            `Invalid zkSync network configuration for '${networkName}'. 'zksync' flag not set to 'true'.`
        );
    }

    if (networkConfig.ethNetwork === undefined) {
        throw new ZkSyncDeployPluginError(
            `Invalid zkSync network configuration for '${networkName}'. 'ethNetwork' (layer 1) is missing.`
        );
    }
}

export function networkFromConfig(hre: HardhatRuntimeEnvironment, network: Network) {
    const configDeployPaths = network.config.deploy ?? hre.config.paths.deploy;
    const configDeployPathsArray = typeof configDeployPaths === 'string' ? [configDeployPaths] : configDeployPaths;
    network.deploy = normalizePathArray(hre.config, configDeployPathsArray);

    if (network.name === 'hardhat') {
        return;
    }

    validateZkSyncNetworkConfig(network);

    network.zksync = true;
    network.ethNetwork = network.config.ethNetwork as string;
}

export function normalizePath(config: HardhatConfig, userPath: string | undefined, defaultPath: string): string {
    if (userPath === undefined) {
        return path.join(config.paths.root, defaultPath);
    }

    if (!path.isAbsolute(userPath)) {
        return path.normalize(path.join(config.paths.root, userPath));
    }

    return userPath;
}

export function normalizePathArray(config: HardhatConfig, paths: string[]): string[] {
    return paths.map((path) => normalizePath(config, path, path));
}

export function processPrivateKeys(
    network: Network,
    configNamedPrivateKeys: NamedPrivateKeys,
    chainId: number
): { namedPrivateKeys: { [name: string]: string } } {
    return configNamedPrivateKeys ? transformPrivateKeys(configNamedPrivateKeys, chainId) : { namedPrivateKeys: {} };
}

function transformPrivateKeys(
    configNamedPrivateKeys: NamedPrivateKeys,
    chainId: number
): { namedPrivateKeys: { [name: string]: string } } {
    // TO DO: Implement
    return { namedPrivateKeys: {} };
}
