import { Routing } from "../routing/routing"

export enum TransactionType{
    Unknown = "Unknown",
    Deposit = "Deposit",
    Release = "Release ",
    Refund =  "Refund",
    Transfer = "Transfer",
}
export enum ChainStatus{
    Unknown = "Unknown",
    Pending = "Pending",
    Completed = "Completed",
    Failed = "Failed",
    Cancelled = "Cancelled",
}

export type PartialBridgeTxn ={
    TxnId:string, 
    TxnType:TransactionType, 
    ChainStatus:ChainStatus,
    routing?:Routing |null    
};

