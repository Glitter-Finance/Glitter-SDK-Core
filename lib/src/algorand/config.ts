import { BridgeToken } from "../_common";

export type AlgorandConfig = {
    name: string;
    serverUrl: string;
    serverPort: string|number;
    indexerUrl: string;
    indexerPort: string|number;
    nativeToken: string;
    appProgramId: number;
    accounts: AlgorandAccountsConfig;
    tokens: BridgeToken[];
}
export type AlgorandAccountsConfig = {
    asaOwner: string;
    algoOwner: string;
    bridgeOwner: string;
    feeReceiver: string;
    multiSig1: string;
    multiSig2: string;
    bridge: string;
    asaVault: string;
    algoVault: string;
    usdcReceiver: string;
    usdcDeposit: string;
}