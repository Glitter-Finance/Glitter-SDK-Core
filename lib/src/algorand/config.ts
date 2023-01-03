import { PeraWalletConnect } from "@perawallet/connect";
import MyAlgoConnect from "@randlabs/myalgo-connect";

export type AlgorandConfig = {
  name: string;
  serverUrl: string;
  serverPort: string | number;
  indexerUrl: string;
  indexerPort: string | number;
  nativeToken: string;
  appProgramId: number;
  assets_info: AlgorandAssetConfig[];
};

export type AlgorandAssetConfig = {
  symbol: string;
  type: string;
  asset_id: number;
  decimal: number;
  min_balance: number;
  fee_rate: number;
};

export type PeraWalletResult = {
  address: string;
  wallet: PeraWalletConnect;
};

export type MyAlgoWalletResult = {
  address: string;
  wallet: MyAlgoConnect;
};
