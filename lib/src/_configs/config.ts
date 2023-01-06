import { AlgorandConfig } from "../algorand";
import { EvmConfig } from "../evm";
import { SolanaConfig } from "../solana";

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
