import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Wallet } from 'zksync-web3';
import { WALLET_PRIVATE_KEY } from '../../../constants';

export default async function (hre: HardhatRuntimeEnvironment) {
    const { loadArtifact, setWallet } = hre.deployments;

    const zkWallet = new Wallet(WALLET_PRIVATE_KEY);
    setWallet(zkWallet);
    const artifact = await loadArtifact('Greeter');

    console.log(`${artifact.contractName} was loaded`);
}
