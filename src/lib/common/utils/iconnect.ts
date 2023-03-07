import { Transaction } from "@solana/web3.js";
import algosdk from "algosdk";
import { Account } from "algosdk";
import { SolanaAccount } from "glitter-bridge-sdk-dev/dist";
import { AlgorandAccount } from "../../chains/algorand/accounts";
import { Routing } from "../routing/routing";
import { BridgeToken } from "../tokens/tokens";

export interface BridgeConnect {

    bridgeTransaction(
        fromAddress: string,
        fromSymbol: string,
        toNetwork: string,
        toAddress: string,
        tosymbol: string,
        amount: number
    ): Promise<Transaction | algosdk.Transaction[]|undefined>,
    
    bridge(
        account: AlgorandAccount|SolanaAccount, 
        fromSymbol: string, 
        toNetwork: string, 
        toAddress: string, 
        tosymbol: string, 
        amount: number
        ): Promise<boolean>,

    fundAccount(
        funder: SolanaAccount|AlgorandAccount, 
        account: SolanaAccount|AlgorandAccount, 
        amount: number
        ):Promise<boolean>,

    fundAccountTokens(
        funder: SolanaAccount|AlgorandAccount, 
        account: SolanaAccount|AlgorandAccount, 
        amount: number, 
        symbol: string
        ): Promise<boolean>,  

    sendTokens(
        routing: Routing,
        account: SolanaAccount|Account,
        token: BridgeToken,
        debug_rootPath?: string
        ): Promise<boolean>,

    optinToken(
        account: SolanaAccount|Account,
        symbol: string
        ): Promise<boolean>

    OptinTokenTransaction(
        address:string,
        symbol:string,
        ):Promise<Transaction|algosdk.Transaction[]|undefined>

    OptinAccountExists(
        address:string,
        symbol:string
        ):Promise<boolean>,        
 
    closeOutTokenAccount(
        signer: SolanaAccount|Account,
        receiver: SolanaAccount|string,
        symbol: string
        ): Promise<boolean>,

    waitForMinBalance(
        address: string, 
        minAmount: number, 
        timeoutSeconds: number 
        ): Promise<number>,
        
    waitForBalanceChange(
        address: string, 
        startingAmount: number, 
        timeoutSeconds: number
        ): Promise<number>,        
    
    getTokenBalance(
        address: string, 
        symbol: string
        ): Promise<number>    

    waitForTokenBalance(
        address: string, 
        symbol: string, 
        expectedAmount: number, 
        timeoutSeconds: number, 
        threshold: number,
        anybalance: boolean ,
        noBalance: boolean
         ): Promise<number>,
         
    waitForMinTokenBalance(
        address: string, 
        symbol: string, 
        minAmount: number, 
        timeoutSeconds: number
        ): Promise<number> ,

    waitForTokenBalanceChange(
        address: string, 
        symbol: string, 
        startingAmount: number, 
        timeoutSeconds: number
        ): Promise<number>                
}
