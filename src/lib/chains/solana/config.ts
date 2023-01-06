import { BridgeToken } from "../../common";

export type SolanaConfig = {
    name: string;
    server: string;
    accounts: SolanaAccountsConfig;
    tokens: BridgeToken[];
  };  
  export type SolanaAccountsConfig = {
    bridgeProgram: string;
    vestingProgram: string;
    owner: string;
    usdcReceiver: string;
    usdcDeposit: string;
    memoProgram: string;
}