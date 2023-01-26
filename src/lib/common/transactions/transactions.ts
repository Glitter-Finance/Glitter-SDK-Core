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
    txnID:String, 
    txnType:TransactionType, 
    chainStatus?:ChainStatus|null,
    network?:String|null,
    tokenSymbol?:String|null,
    address?:String|null,
    amount?:number|null,
    routing?:Routing |null    
};

