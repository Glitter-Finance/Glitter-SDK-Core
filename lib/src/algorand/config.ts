export type AlgorandConfig = {
    name: string;
    serverUrl: string;
    serverPort: string|number;
    indexerUrl: string;
    indexerPort: string|number;
    nativeToken: string;
    appProgramId: number;
    assets_info: AlgorandAssetConfig[];
}

export type AlgorandAssetConfig = {
    symbol: string;
    type: string;
    asset_id: number;
    decimal: number;
    min_balance: number;
    fee_rate: number;
  };