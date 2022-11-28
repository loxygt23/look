import { HardhatPluginError } from 'hardhat/plugins';
import { PLUGIN_NAME } from './constants';

export class ZkSyncDeployPluginError extends HardhatPluginError {
    constructor(message: string, parentError?: Error) {
        super(PLUGIN_NAME, message, parentError);
    }
}

export class WalletNotInitializedError extends ZkSyncDeployPluginError {
    constructor(parentError?: Error) {
        const message =
            "zkSync wallet is not initialized. Call one of the wallet setters, or use 'from' deploy options field to set deployer private key.";
        super(message, parentError);
    }
}
