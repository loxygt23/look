import 'hardhat/types/config';

import { DeploymentsExtension, EthNetwork, NamedPrivateKeys } from './types';

declare module 'hardhat/types/config' {
    interface HardhatUserConfig {
        namedPrivateKeys?: NamedPrivateKeys;
    }

    interface HardhatConfig {
        namedPrivateKeys?: NamedPrivateKeys;
    }

    interface HardhatNetworkUserConfig {
        zksync?: boolean;
        ethNetwork?: EthNetwork;
        deploy?: string | string[];
    }

    interface HardhatNetworkConfig {
        zksync: boolean;
        ethNetwork: EthNetwork;
        deploy?: string | string[];
    }

    interface HttpNetworkUserConfig {
        zksync?: boolean;
        ethNetwork?: EthNetwork;
        deploy?: string | string[];
    }

    interface HttpNetworkConfig {
        zksync: boolean;
        ethNetwork: EthNetwork;
        deploy?: string | string[];
    }

    interface ProjectPathsUserConfig {
        deploy?: string | string[];
    }

    interface ProjectPathsConfig {
        deploy: string | string[];
    }
}

declare module 'hardhat/types/runtime' {
    interface HardhatRuntimeEnvironment {
        deployments: DeploymentsExtension;
    }

    interface Network {
        zksync: boolean;
        ethNetwork: EthNetwork;
        deploy: string[];
    }
}
