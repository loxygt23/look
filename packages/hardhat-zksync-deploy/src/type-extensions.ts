import 'hardhat/types/config';

import { EthNetwork } from './types';

declare module 'hardhat/types/config' {
    interface HardhatNetworkUserConfig {
        zksync: boolean;
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
    interface Network {
        zksync: boolean;
        ethNetwork: EthNetwork;
        deploy: string[];
    }
}
