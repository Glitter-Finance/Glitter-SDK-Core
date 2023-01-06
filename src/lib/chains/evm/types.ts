import { BridgeEvmNetworks } from "../../common/networks/networks";

export type TokenConfig = {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
};

export type EvmConfig = {
  [network in BridgeEvmNetworks]: {
    chainId: number;
    bridge: string;
    rpcUrl: string;
    tokens: TokenConfig[];
    depositWallet: string;
    releaseWallet: string;
  };
};

export type EvmNetworkConfig = EvmConfig[BridgeEvmNetworks];
