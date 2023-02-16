export enum BridgeNetworks {
  algorand = "Algorand",
  solana = "Solana",
  Ethereum = "ethereum",
  Polygon = "polygon",
  Avalanche = "avalanche",
  TRON = 'tron'
}

export type BridgeEvmNetworks =
  | typeof BridgeNetworks.Avalanche
  | typeof BridgeNetworks.Ethereum
  | typeof BridgeNetworks.Polygon;

export type PartialEvmNetwork = typeof BridgeNetworks.TRON
/**
 * These IDs will be stored
 * within event logs to
 * recreate routing information
 * on chain
 */
export const NetworkIdentifiers: {
  [chainId: number]: BridgeNetworks;
} = {
  1: BridgeNetworks.algorand,
  2: BridgeNetworks.Avalanche,
  3: BridgeNetworks.Ethereum,
  4: BridgeNetworks.solana,
  5: BridgeNetworks.Polygon,
  6: BridgeNetworks.TRON
};
