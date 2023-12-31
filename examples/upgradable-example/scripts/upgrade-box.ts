import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { Wallet } from 'zksync-web3';
import chalk from 'chalk';

import * as hre from 'hardhat';

async function main() {
    const testMnemonic = 'stuff slice staff easily soup parent arm payment cotton trade scatter struggle';
    const zkWallet = Wallet.fromMnemonic(testMnemonic, "m/44'/60'/0'/0/0");
    const deployer = new Deployer(hre, zkWallet);

    // deploy proxy
    const contractName = 'Box';

    const contract = await deployer.loadArtifact(contractName);
    const box = await hre.zkUpgrades.deployProxy(deployer.zkWallet, contract, [42], { initializer: 'store' });

    await box.deployed();

    // upgrade proxy implementation

    const BoxV2 = await deployer.loadArtifact('BoxV2');
    const upgradedBox = await hre.zkUpgrades.upgradeProxy(deployer.zkWallet, box.address, BoxV2);
    console.info(chalk.green('Successfully upgraded Box to BoxV2'));

    upgradedBox.connect(zkWallet);
    const value = await upgradedBox.retrieve();
    console.info(chalk.cyan('Box value is', value));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
