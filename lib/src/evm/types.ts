export enum TokenId {
  USDC = "usdc",
}

export type EvmAddressConfig = {
  [network in BridgeEvmNetwork]: {
    bridge: string;
    tokens: Record<TokenId, string>;
    glitterCircleWallet: string;
  };
};

export enum BridgeEvmNetwork {
  Ethereum = "ethereum",
  Polygon = "polygon",
  Avalanche = "avalanche",
  Hedera = "hedera",
}

export type GlitterEvmBridgeConfig = {
  network: BridgeEvmNetwork;
  rpcUrl: string;
  explorerUrl: string;
};
