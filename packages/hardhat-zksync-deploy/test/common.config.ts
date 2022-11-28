import '../src/index';
import { HardhatUserConfig } from 'hardhat/types';
import { ETH_NETWORK_RPC_URL, ZKSYNC_NETWORK_NAME, ZKSYNC_NETWORK_RPC_URL } from './constants';

const config: HardhatUserConfig = {
    networks: {
        goerli: {
            url: ETH_NETWORK_RPC_URL,
        },
        [ZKSYNC_NETWORK_NAME]: {
            url: ZKSYNC_NETWORK_RPC_URL,
            ethNetwork: 'goerli',
            zksync: true,
            accounts: ['0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110'],
        },
    },
};

export default config;
