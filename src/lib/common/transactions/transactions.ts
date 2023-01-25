import { Routing } from "../routing/routing"

export enum TransactionType{
    Deposit = "Deposit",
    Release = "Release ",
    Refund =  "Refund"
}

export type PartialBridgeTxn ={
    TxnId:String, 
    TxnType:TransactionType, 
    routing?:Routing |null 
};

