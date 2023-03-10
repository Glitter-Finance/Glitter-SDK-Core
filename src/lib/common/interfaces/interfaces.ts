import { AlgorandAccount } from "../../chains/algorand";
import { EvmAccount } from "../../chains/evm/accounts";
import { SolanaAccount } from "../../chains/solana";
import { Transaction } from "@solana/web3.js";
import algosdk from "algosdk";
import { Account } from "algosdk";
import { Routing } from "../routing/routing";
import { BridgeToken } from "../tokens/tokens";

export interface BridgeAccounts{
    solanaAccount:SolanaAccount,
    algorandAccount:AlgorandAccount,
    evmAccount:EvmAccount,
}
export interface BridgeAccountManager<T extends BridgeAccounts> {
    createNew(): Promise<T[keyof T]>;
    add(...args: [sk: Uint8Array | undefined] | [mnemonic: string | undefined] ): Promise<T[keyof T] | undefined>;
    createNewWithPrefix(prefix: string, tries?: number): Promise<T[keyof T]|undefined>
    updateAccountDetails(local_account: T[keyof T] | undefined, getAssetDetails?: boolean): Promise<T[keyof T]>;
}

export interface BridgeConnectManager<T extends BridgeAccounts> {

    bridgeTransaction(
        fromAddress: string,
        fromSymbol: string,
        toNetwork: string,
        toAddress: string,
        tosymbol: string,
        amount: number
    ): Promise<Transaction | algosdk.Transaction[]|undefined>,
    
    bridge(
        account: T[keyof T], 
        fromSymbol: string, 
        toNetwork: string, 
        toAddress: string, 
        tosymbol: string, 
        amount: number
        ): Promise<boolean>,

    fundAccount(
        funder: T[keyof T], 
        account: T[keyof T], 
        amount: number
        ):Promise<boolean>,

    fundAccountTokens(
        funder: T[keyof T], 
        account: T[keyof T], 
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
