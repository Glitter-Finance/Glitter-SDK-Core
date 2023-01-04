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

export enum BridgeEvmNetwork {
  Ethereum = "ethereum",
  Polygon = "polygon",
  Avalanche = "avalanche",
}

export type GlitterEvmBridgeConfig = {
  network: BridgeEvmNetwork;
  rpcUrl: string;
  explorerUrl: string;
};
