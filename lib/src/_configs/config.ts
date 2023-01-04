import { AlgorandConfig } from "../algorand";
import { SolanaConfig } from "../solana";

export type GlitterBridgeConfig = {
    name: string;
    algorand: AlgorandConfig;
    solana: SolanaConfig;
}
export enum GlitterEnvironment {
    mainnet = "mainnet",
    testnet = "testnet",
}