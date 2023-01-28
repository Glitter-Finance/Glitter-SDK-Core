import { Routing } from "../routing/routing"

export enum TransactionType{
    Deposit = "Deposit",
    Release = "Release ",
    Refund =  "Refund",
    Unknown = "Unknown",
    Finalize = "Finalize"
}

export type PartialBridgeTxn ={
    TxnId:string, 
    TxnType:TransactionType, 
    routing?:Routing |null 
};

