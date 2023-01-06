import { AlgorandConfig } from "../chains/algorand";
import { EvmConfig } from "../chains/evm";
import { SolanaConfig } from "../chains/solana";

export type GlitterBridgeConfig = {
  name: string;
  algorand: AlgorandConfig;
  solana: SolanaConfig;
  evm: EvmConfig;
};

export enum GlitterEnvironment {
  mainnet = "mainnet",
  testnet = "testnet",
}