import { BridgeEvmNetwork } from "../_common/networks/networks";

export const TokenIds = ["usdc"] as const;
export type TokenId = typeof TokenIds[number];

export type EvmConfig = {
  [network in BridgeEvmNetwork]: {
    chainId: number;
    bridge: string;
    rpcUrl: string;
    tokens: Record<TokenId, string>;
    depositWallet: string;
    releaseWallet: string;
  };
};

export type GlitterEvmBridgeConfig = {
  network: BridgeEvmNetwork;
  rpcUrl: string;
  explorerUrl: string;
};
