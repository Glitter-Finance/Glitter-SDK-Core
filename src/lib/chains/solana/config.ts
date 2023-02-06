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

export enum SolanaProgramId {
  BridgeProgramId = "bridgeProgram",
  VestingProgramId = "vestingProgram",
  OwnerId = "owner",
  UsdcReceiverId ="usdcReceiver",
  UsdcDepositId = "usdcDeposit",
  MemoProgramId = "memoProgram",
  UsdcMint ="UsdcMint"
}

export type PollerOptions = {
  limit?:number,
  startHash?:string,
  endHash?:string
}
