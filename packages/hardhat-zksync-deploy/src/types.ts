import { Artifact } from 'hardhat/types';
import * as zk from 'zksync-web3';
import * as ethers from 'ethers';

export interface DeployOptions {
    from?: string;
    artifact?: ZkSyncArtifact;
    constructorArguments?: any[];
    overrides?: ethers.Overrides;
    additionalFactoryDeps?: ethers.BytesLike[];
}

export type Address = string;

export type ABI = any[];

export interface Deployment {
    address: Address;
    abi: ABI;
}

export interface DeployResult extends Deployment {
    newlyDeployed: boolean;
}

export interface DeploymentsExtension {
    /**
     * Sends a deploy transaction to the zkSync network.
     * For now, it will use defaults for the transaction parameters:
     * - fee amount is requested automatically from the zkSync server.
     *
     * @param contractNameOrFullyQualifiedName The name of the contract.
     *   It can be a contract bare contract name (e.g. "Token") if it's
     *   unique in your project, or a fully qualified contract name
     *   (e.g. "contract/token.sol:Token") otherwise.
     * @param options Deploy options.
     *
     * @throws Throws an error if zkSync wallet is not set.
     *
     * @returns A contract object.
     */
    deploy(contractNameOrFullyQualifiedName: string, options: DeployOptions): Promise<zk.Contract>;
    setWallet(wallet: zk.Wallet): void;
    setWalletFromEthWallet(ethWallet: ethers.Wallet): void;
    setWalletFromPrivatekey(privateKey: ethers.utils.BytesLike | ethers.utils.SigningKey): void;
    loadArtifact(contractNameOrFullyQualifiedName: string): Promise<ZkSyncArtifact>;
    estimateDeployFee(artifact: ZkSyncArtifact, constructorArguments: any[]): Promise<ethers.BigNumber>;
    estimateDeployGas(artifact: ZkSyncArtifact, constructorArguments: any[]): Promise<ethers.BigNumber>;
    // extractFactoryDeps(artifact: ZkSyncArtifact): Promise<string[]>;
}

export interface DeployManagerData {
    privateKeysLoaded: boolean;
    namedPrivateKeys: { [name: string]: string };
    chainId?: number;
}

export interface NamedPrivateKeys {
    [name: string]: string | number | { [network: string]: null | number | string };
}

/**
 * Identifier of the Ethereum network (layer 1).
 * Can be set either to the RPC address of network (e.g. `http://127.0.0.1:3030`)
 * or the network ID (e.g. `mainnet` or `goerli`).
 */
export type EthNetwork = string;

/**
 * Description of the factory dependencies of a contract.
 * Dependencies are contracts that can be deployed by this contract via `CREATE` operation.
 */
export interface FactoryDeps {
    // A mapping from the contract hash to the contract bytecode.
    [contractHash: string]: string;
}

export interface ZkSyncArtifact extends Artifact {
    // List of factory dependencies of a contract.
    factoryDeps: FactoryDeps;
    // Mapping from the bytecode to the zkEVM assembly (used for tracing).
    sourceMapping: string;
}
