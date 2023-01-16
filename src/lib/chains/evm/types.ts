import { ethers } from "ethers";
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

export type BridgeDepositEvent = {
  amount: ethers.BigNumber;
  destinationChainId: number;
  destinationWallet: string;
  erc20Address: string;
  __type: "BridgeDeposit";
};

export type BridgeReleaseEvent = {
  amount: ethers.BigNumber;
  depositTransactionHash: string;
  destinationWallet: string;
  erc20Address: string;
  __type: "BridgeRelease";
};

export type TransferEvent = {
  from: string;
  to: string;
  amount: ethers.BigNumber;
  __type: "Transfer";
};

export type EvmNetworkConfig = EvmConfig[BridgeEvmNetworks];
