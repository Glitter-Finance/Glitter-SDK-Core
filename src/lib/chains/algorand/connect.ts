import * as algosdk from 'algosdk';
import { Account, Transaction } from "algosdk";
import { AlgorandAccount, AlgorandAccounts } from "./accounts";
import { AlgorandConfig, AlgorandProgramAccount } from "./config";
import { AlgorandTxns } from "./txns/txns";
import { AlgorandAssets } from "./assets";
import { AlgorandBridgeTxnsV1 } from "./txns/bridge";
import * as fs from 'fs';
import { BridgeToken, BridgeTokens, LogProgress, Routing, RoutingDefault, Sleep } from '../../common';
import { PartialBridgeTxn, TransactionType } from '../../common/transactions/transactions';
import { add } from 'winston';
import SearchForTransactions from 'algosdk/dist/types/client/v2/indexer/searchForTransactions';
import { DepositNote } from '../solana/utils';
import { AlgorandPoller } from './poller';

/**
 * Connection to the Algorand network
 * 
 */
export class AlgorandConnect {

    private _clientIndexer: algosdk.Indexer | undefined = undefined;
    private _client: algosdk.Algodv2 | undefined = undefined;
    private _accounts: AlgorandAccounts | undefined = undefined;
    private _assets: AlgorandAssets | undefined = undefined;
    private _transactions: AlgorandTxns | undefined = undefined;
    private _bridgeTxnsV1: AlgorandBridgeTxnsV1 | undefined = undefined;
    private _poller:AlgorandPoller|undefined
    _lastTxnHash: string = "";

    constructor(config: AlgorandConfig) {
        this._client = GetAlgodClient(config.serverUrl, config.serverPort, config.nativeToken);
        this._clientIndexer = GetAlgodIndexer(config.indexerUrl, config.indexerUrl, config.nativeToken);
        this._accounts = new AlgorandAccounts(this._client);
        this._assets = new AlgorandAssets(this._client);
        this._transactions = new AlgorandTxns(this._client,config.accounts);
        this._bridgeTxnsV1 = new AlgorandBridgeTxnsV1(this._client, config.appProgramId, this._transactions, config.accounts);
        this._poller = new AlgorandPoller(this._client,this._clientIndexer,this._bridgeTxnsV1)
    }

    //Getters
    public get client() {
        return this._client;
    }
    public get clientIndexer() {
        return this._clientIndexer;
    }
    public get accounts() {
        return this._accounts;
    }
    public get assets() {
        return this._assets;
    }

    //Check
    public checkHealth(): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this._client) throw new Error("Algorand Client not defined");
                let returnValue = await this._client.healthCheck().do();
                resolve(returnValue);
            } catch (error) {
                reject(error);
            }
        });
    }
    public checkVersion(): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this._client) throw new Error("Algorand Client not defined");
                let returnValue = await this._client.versionsCheck().do();
                resolve(returnValue);
            } catch (error) {
                reject(error);
            }
        });
    }

    public async listDepositTransaction(limit:number,asset:BridgeToken, starthash?:string  ):Promise<PartialBridgeTxn[] | undefined> {
        return new Promise(async(resolve, reject) =>{
            try {
                if(!asset) throw new Error("Asset Not Found")
                const symbol = asset.symbol  ;
                let depositaddress:string | number |undefined ;
                if (symbol.toLocaleLowerCase() == "xsol" || symbol.toLocaleLowerCase() == "sol"  ) {
                    depositaddress = this.getAlgorandBridgeAddress(AlgorandProgramAccount.BridgeAccount);
                }else if (symbol.toLocaleLowerCase() =="xalgo" || symbol.toLocaleLowerCase() =="algo" ){
                    depositaddress = this.getAlgorandBridgeAddress(AlgorandProgramAccount.BridgeAccount);
                }else if (symbol.toLocaleLowerCase() == "usdc"){
                    depositaddress = this.getAlgorandBridgeAddress(AlgorandProgramAccount.UsdcDepositAccount);
                }
                console.log(depositaddress)
                if(!starthash){
                    starthash = this._lastTxnHash == "" ?undefined:this._lastTxnHash
                }
                // const txnList = this.testListTxn(depositaddress as string,limit,asset,starthash)
              const txnList =  this.listDepositTransactionHandler(depositaddress as string,limit,asset);
              if(!txnList) throw new Error("txn List undefined")
                resolve(txnList)

            } catch (err) {
                reject(err)
            }
        })
}

private async listDepositTransactionHandler(address:string,limit:number ,asset:BridgeToken, startHash?:string):Promise<PartialBridgeTxn[]>  {
        return new Promise(async (resolve,reject) =>{
            try{
          if(!address) throw new Error("address not defined")   ;
          if(!this._client) throw new Error("Algo Client Not Defined");
          if(!this._clientIndexer)  throw new Error("Indexer Not Set")
          if(!asset) throw new Error("asset not defined");
          const txnlist = await this.clientIndexer?.lookupAccountTransactions(address).do();
          if(!txnlist) throw new Error("txn list not defined");
          let partialbridgeTxnList:PartialBridgeTxn[] = [];   
          let lastTxnHash = "";
          let checkLimit = 0;       
          for(let result of txnlist.transactions){
            if(checkLimit == limit) break;
            if(startHash==undefined){
            let partialBtxn:PartialBridgeTxn =  {
                TxnId:result.id,
                TxnType:TransactionType.Deposit,
            };
            partialbridgeTxnList.push(partialBtxn)
            lastTxnHash = result.id;
            checkLimit++;

            }else {
            if(startHash == result.id){
                //+1 
            let partialBtxn:PartialBridgeTxn =  {
                TxnId:result.id,
                TxnType:TransactionType.Deposit,
            };
            partialbridgeTxnList.push(partialBtxn)
            lastTxnHash = result.id
            startHash =undefined;
            checkLimit++;
            }
            }   
         }

         this._lastTxnHash = lastTxnHash
            resolve(partialbridgeTxnList)
            } catch(err){
                reject(err)    
            }
        })
    }

    public get lastTxnHash() {
        return this._lastTxnHash
    }

    public async listReleaseTransaction( ):Promise<PartialBridgeTxn[]> {
        return new Promise(async(resolve, reject) =>{
            try {
                
            } catch (err) {

            }
        })
    }



    /**
     * 
     * @param fromAddress 
     * @param fromSymbol 
     * @param toNetwork 
     * @param toAddress 
     * @param tosymbol 
     * @param amount 
     * @returns 
     */
 public async bridgeTransaction(
    fromAddress:string, 
    fromSymbol:string,
    toNetwork:string,
    toAddress:string, 
    tosymbol:string,
    amount:number
 ): Promise<algosdk.Transaction[]> {
    return new Promise(async (resolve, reject ) =>{
        try{

            if (!this._client) throw new Error("Algorand Client not defined");
            if (!this._bridgeTxnsV1) throw new Error("Algorand Bridge Txns not defined");

            //Get Token
            const asset = BridgeTokens.get("algorand", fromSymbol);
            // ?? asset should be xsol 
            if (!asset) throw new Error("Asset not found");

            //Get routing
            const routing = RoutingDefault();
            routing.from.address = fromAddress;
            routing.from.token = fromSymbol;
            routing.from.network = "algorand";

            routing.to.address = toAddress;
            routing.to.token = tosymbol;
            routing.to.network = toNetwork;
            routing.amount = amount;


            let  transaction :Transaction[] ;

            if (asset.symbol.toLocaleLowerCase() =="usdc" && routing.to.token.toLocaleLowerCase()=="usdc" ) {

                 transaction = await this._bridgeTxnsV1.HandleUsdcSwap(routing);
            }else {
               
            transaction = await this._bridgeTxnsV1.bridgeTransactions(routing, asset);
            }

            resolve(transaction);

        } catch(err){

            reject(err)
        }
    })

 }   

    //Bridge Actions
    public async bridge(account: AlgorandAccount, fromSymbol: string, toNetwork: string, toAddress: string, tosymbol: string, amount: number): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this._client) throw new Error("Algorand Client not defined");
                if (!this._bridgeTxnsV1) throw new Error("Algorand Bridge Txns not defined");

                //Get Token
                const asset = BridgeTokens.get("algorand", fromSymbol);
                if (!asset) throw new Error("Asset not found");

                //Get routing
                const routing = RoutingDefault();
                routing.from.address = account.addr;
                routing.from.token = fromSymbol;
                routing.from.network = "algorand";

                routing.to.address = toAddress;
                routing.to.token = tosymbol;
                routing.to.network = toNetwork;
                routing.amount = amount;

                //Run Transaction
                let  transaction :Transaction[] ;

                if (asset.symbol.toLocaleLowerCase() =="usdc" && routing.to.token.toLocaleLowerCase()=="usdc" ) {

                     transaction = await this._bridgeTxnsV1.HandleUsdcSwap(routing);
                }else {
                   transaction = await this._bridgeTxnsV1.bridgeTransactions(routing, asset);
                }

                let result = await this.signAndSend_SingleSigner(transaction, account);
                console.log(`Algorand Bridge Transaction Complete`);
    
                resolve(true);
                
            } catch (error) {
                reject(error);
            }
        });
    }


    //Account Actions
    public async fundAccount(funder: AlgorandAccount, account: AlgorandAccount, amount: number): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this._client) throw new Error("Algorand Client not defined");

                //Get routing
                const routing = RoutingDefault();
                routing.from.address = funder.addr;
                routing.from.token = "algo";
                routing.from.network = "algorand";

                routing.to.address = account.addr;
                routing.to.token = "algo";
                routing.to.network = "algorand";

                routing.amount = amount;

                let returnValue = await this.sendAlgo(routing, funder);
                resolve(returnValue);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async fundAccountToken(funder: AlgorandAccount, account: AlgorandAccount, amount: number, symbol: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this._client) throw new Error("Algorand Client not defined");

                //Get Token
                const asset = BridgeTokens.get("algorand", symbol);
                if (!asset) throw new Error("Asset not found");

                //Get routing
                const routing = RoutingDefault();
                routing.from.address = funder.addr;
                routing.from.token = symbol;
                routing.from.network = "algorand";

                routing.to.address = account.addr;
                routing.to.token = symbol;
                routing.to.network = "algorand";

                routing.amount = amount;

                let returnValue = await this.sendTokens(routing, funder, asset);
                resolve(returnValue);
            } catch (error) {
                reject(error);
            }
        });
    }

    //Txn Actions
    async sendAlgo(routing: Routing,
        signer: Account,
        debug_rootPath?: string): Promise<boolean> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._transactions) throw new Error("Algorand Transactions not defined");
                if (!signer) throw new Error("Signer is required");

                //Get Txns
                const transactions: Transaction[] = [];
                transactions.push(await this._transactions.sendAlgoTransaction(routing));

                //Send
                await this.signAndSend_SingleSigner(transactions, signer, debug_rootPath)
                resolve(true);

            } catch (error) {
                reject(error);
            }
        });

    }
    async sendTokens(routing: Routing,
        signer: Account,
        token: BridgeToken,
        debug_rootPath?: string): Promise<boolean> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._transactions) throw new Error("Algorand Transactions not defined");
                if (!signer) throw new Error("Signer is required");


                //Get Txn
                console.log(`Sending ${routing.amount} ${token.symbol} from ${routing.from.address} to ${routing.to.address}`);
                const transactions: Transaction[] = [];
                transactions.push(await this._transactions.sendTokensTransaction(routing, token));

                //Send
                await this.signAndSend_SingleSigner(transactions, signer, debug_rootPath)
                console.log(`Txn Completed`);
                resolve(true);

            } catch (error) {
                reject(error);
            }
        });

    }
    async mintTokens(signers: Account[],
        msigParams: algosdk.MultisigMetadata,
        routing: Routing,
        token: BridgeToken,
        debug_rootPath?: string): Promise<boolean> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._transactions) throw new Error("Algorand Transactions not defined");

                //Get Txn
                console.log(`Minting ${routing.amount} ${token.symbol} to ${routing.to.address}`);
                const transactions: Transaction[] = [];
                transactions.push(await this._transactions.sendTokensTransaction(routing, token));

                //Send
                await this.signAndSend_MultiSig(transactions, signers, msigParams, debug_rootPath);
                console.log("Minting Completed")
                resolve(true);

            } catch (error) {
                reject(error);
            }
        });

    }
    async optinToken(signer: Account,
        symbol: string): Promise<boolean> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {

                //Get Token
                const token = BridgeTokens.get("algorand", symbol);
                if (!token) throw new Error("Token not found");

                //Fail Safe
                if (!this._transactions) throw new Error("Algorand Transactions not defined");
                if (!token.address) throw new Error("asset_id is required");
                if (typeof token.address !== "number") throw new Error("token address is required in number format");

                //Get Txn
                console.log(`Opting in ${signer.addr} to ${token.address}`);
                const transactions: Transaction[] = [];
                const txn = await this._transactions.optinTransaction(signer.addr, token.address);
                transactions.push(txn);

                //Send Txn
                await this.signAndSend_SingleSigner(transactions, signer);
                console.log(`Optin Completed`);
                resolve(true);

            } catch (error) {
                reject(error);
            }
        });
    }
    async closeOutTokenAccount(signer: Account,
        receiver: string,
        symbol: string): Promise<boolean> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {

                //Get Token
                const token = BridgeTokens.get("algorand", symbol);
                if (!token) throw new Error("Token not found");

                //Fail Safe
                if (!this._transactions) throw new Error("Algorand Transactions not defined");
                if (!token.address) throw new Error("asset_id is required");
                if (typeof token.address !== "number") throw new Error("address is required in number format");

                //Get Txns                
                console.log(`Closing out token account for ${signer.addr} to ${receiver}`);
                const transactions: Transaction[] = [];
                const txn = await this._transactions.closeOutTokenTransaction(signer.addr, receiver, token.address);
                transactions.push(txn);

                //Send Txn
                await this.signAndSend_SingleSigner(transactions, signer);
                console.log(`Token Closeout Completed`);
                resolve(true);

            } catch (error) {
                reject(error);
            }
        });
    }
    async closeOutAccount(signer: AlgorandAccount,
        receiver: string): Promise<boolean> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._transactions) throw new Error("Algorand Transactions not defined");

                //Get txns
                console.log(`Closing out token account for ${signer.addr} to ${receiver}`);
                const transactions: Transaction[] = [];
                const txn = await this._transactions.closeOutAccountTransaction(signer.addr, receiver);
                transactions.push(txn);

                //Send Txn
                await this.signAndSend_SingleSigner(transactions, signer);
                console.log(`Closeout Completed`);
                resolve(true);

            } catch (error) {
                reject(error);
            }
        });
    }

    //Txn Helpers
    async signAndSend_SingleSigner(groupedTxns: Transaction[],
        signer: Account,
        debug_rootPath?: string): Promise<boolean> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._transactions) throw new Error("Algorand Transactions not defined");
                if (!this._client) throw new Error("Algorand Client not defined");
                if (!signer) throw new Error("Signer not defined");
                if (!signer.sk) throw new Error("Signer Secret Key is required");

                //Check Txns
                if (groupedTxns.length == 0) throw new Error("No Transactions to sign");
                if (groupedTxns.length > 4) throw new Error("Maximum 4 Transactions in a group");

                const signedTxns: Uint8Array[] = [];
                const groupID = algosdk.computeGroupID(groupedTxns);

                for (let i = 0; i < groupedTxns.length; i++) {
                    groupedTxns[i].group = groupID;
                    const signedTxn: Uint8Array = groupedTxns[i].signTxn(signer.sk);
                    signedTxns.push(signedTxn);
                }

                if (debug_rootPath) {
                    await this.createDryrun(signedTxns, debug_rootPath);
                }

                //Prep and Send Transactions
                console.log('------------------------------')
                const txnResult = await this._client.sendRawTransaction(signedTxns).do();
                await algosdk.waitForConfirmation(this._client, groupedTxns[0].txID().toString(), 4);
                console.log('------------------------------')
                console.log('Group Transaction ID: ' + txnResult.txId);
                for (let i = 0; i < groupedTxns.length; i++) {
                    const txnID = groupedTxns[i].txID().toString();
                    console.log('Transaction ' + i + ': ' + txnID);
                }
                console.log('------------------------------')

                resolve(true);

            } catch (error) {
                reject(error);
            }
        });
    }

    //wallet-txn helper
    async sendSignedTransaction(
    rawsignedTxns:Uint8Array[],
    debug_rootPath?:string                
    ):Promise<boolean>{
        return new Promise(async (resolve,reject) =>{
        // eslint-disable-next-line no-async-promise-executor
            try{
                //Fail Safe
                if (!this._transactions) throw new Error("Algorand Transactions not defined");
                if (!this._client) throw new Error("Algorand Client not defined");
                if (debug_rootPath) {
                    await this.createDryrun(rawsignedTxns, debug_rootPath);
                }
                const txnResult = await this._client.sendRawTransaction(rawsignedTxns).do();
                await algosdk.waitForConfirmation(this._client, txnResult, 4); // why 4? 
                console.log('Group Transaction ID: ' + txnResult.txId);
                
                resolve(true)


            }catch(err) {
                reject(err)
            }
        })
    }

    async signAndSend_MultiSig(groupedTxns: Transaction[],
        signers: Account[],
        mParams: algosdk.MultisigMetadata,
        debug_rootPath?: string): Promise<boolean> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._client) throw new Error("Algorand Client not defined");

                //Check signers
                if (signers.length == 0) throw new Error("No Signers");
                signers.forEach((signer) => {
                    if (!signer) throw new Error("Signer not defined");
                    if (!signer.sk) throw new Error("Signer Secret Key is required");
                });

                //Check Txns
                if (groupedTxns.length == 0) throw new Error("No Transactions to sign");
                if (groupedTxns.length > 4) throw new Error("Maximum 4 Transactions in a group");

                const signedTxns: Uint8Array[] = [];
                const groupID = algosdk.computeGroupID(groupedTxns);

                for (let i = 0; i < groupedTxns.length; i++) {
                    groupedTxns[i].group = groupID;

                    let signedTxn: Uint8Array = algosdk.signMultisigTransaction(groupedTxns[i], mParams, signers[0].sk).blob;
                    for (let j = 1; j < signers.length; j++) {
                        signedTxn = algosdk.appendSignMultisigTransaction(signedTxn, mParams, signers[j].sk).blob
                    }
                    signedTxns.push(signedTxn);
                }

                if (debug_rootPath) {
                    console.log(`Creating Dryrun at ${debug_rootPath}`);
                    await this.createDryrun(signedTxns, debug_rootPath);
                }

                //Prep and Send Transactions
                console.log('------------------------------')
                const txnResult = await this._client.sendRawTransaction(signedTxns).do();
                await algosdk.waitForConfirmation(this._client, groupedTxns[0].txID().toString(), 4);
                console.log('------------------------------')
                console.log('Group Transaction ID: ' + txnResult.txId);
                for (let i = 0; i < groupedTxns.length; i++) {
                    const txnID = groupedTxns[i].txID().toString();
                    console.log('Transaction ' + i + ': ' + txnID);
                }
                console.log('------------------------------')
                resolve(true);

            } catch (error) {
                reject(error);
            }
        });
    }
    async createDryrun(rawSignedTxnBuff: Uint8Array[], rootPath?: string): Promise<boolean> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
            try {

                //Fail Safe
                if (!this._client) throw new Error("Algorand Client not defined");

                //Make sure root path is defined
                if (!rootPath) resolve(false);

                let dryRun = null;

                const txnsDecoded = rawSignedTxnBuff.map((txn) => {
                    return algosdk.decodeSignedTransaction(txn);
                });

                dryRun = await algosdk.createDryrun({
                    client: this._client,
                    txns: txnsDecoded,
                });

                console.log(rootPath + '/tests/debug/algodebug.msgp');
                await fs.writeFile(rootPath + '/tests/debug/algodebug.msgp', algosdk.encodeObj(dryRun.get_obj_for_encoding(true)), (error: NodeJS.ErrnoException | null) => {
                    if (error) throw error;
                })

                resolve(true);

            } catch (error) {
                console.log(error);
                resolve(false);
            }
        });
    }

    //Account Info
    public async getBalance(address: string): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this._accounts) throw new Error("Algorand Accounts not defined");
                const balance = await this._accounts.getBalance(address);

                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async waitForBalance(address: string, expectedAmount: number, timeoutSeconds: number = 60, threshold: number = 0.001, anybalance: boolean = false, noBalance: boolean = false): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {

                //Get start time & balance
                const start = Date.now();
                let balance = await this.getBalance(address);

                //Loop until balance (or timeout) is reached
                while (true) {

                    //Check break conditions
                    if (anybalance && balance > 0) {
                        break;
                    } else if (noBalance && balance == 0) {
                        break;
                    } else if (Math.abs(balance - expectedAmount) < threshold) {
                        break;
                    }

                    //Log
                    let timeInSeconds = (Date.now() - start) / 1000;
                    LogProgress(`$bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds)*10)/10}s`);

                    //Check timeout
                    if (Date.now() - start > timeoutSeconds * 1000) {
                        reject(new Error("Timeout waiting for balance"));
                    }

                    //Wait and Check balance
                    await Sleep(1000);
                    balance = await this.getBalance(address);
                }

                //Log
                let timeInSeconds = (Date.now() - start) / 1000;
                LogProgress(`$bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds)*10)/10}s`);


                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async waitForMinBalance(address: string, minAmount: number, timeoutSeconds: number = 60): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {

                //Get start time & balance
                const start = Date.now();
                let balance = await this.getBalance(address);

                //Loop until balance (or timeout) is reached
                while (true) {

                    //Check break conditions
                    if (balance >= minAmount) {
                        break;
                    }

                    //Log
                    let timeInSeconds = (Date.now() - start) / 1000;
                    LogProgress(`$bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds)*10)/10}s`);

                    //Check timeout
                    if (Date.now() - start > timeoutSeconds * 1000) {
                        reject(new Error("Timeout waiting for balance"));
                    }

                    //Wait and Check balance
                    await Sleep(1000);
                    balance = await this.getBalance(address);
                }

                //Log
                let timeInSeconds = (Date.now() - start) / 1000;
                LogProgress(`$bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds)*10)/10}s`);


                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }

    public async waitForBalanceChange(address: string, startingAmount: number, timeoutSeconds: number = 60): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {

                //Get start time & balance
                const start = Date.now();
                let balance = await this.getBalance(address);

                //Loop until balance (or timeout) is reached
                while (true) {

                    //Check break conditions
                    if (balance != startingAmount) {
                        break;
                    }

                    //Log
                    let timeInSeconds = (Date.now() - start) / 1000;
                    LogProgress(`$bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds)*10)/10}s`);

                    //Check timeout
                    if (Date.now() - start > timeoutSeconds * 1000) {
                        reject(new Error("Timeout waiting for balance"));
                    }

                    //Wait and Check balance
                    await Sleep(1000);
                    balance = await this.getBalance(address);
                }

                //Log
                let timeInSeconds = (Date.now() - start) / 1000;
                LogProgress(`$bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds)*10)/10}s`);


                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async getTokenBalance(address: string, symbol: string): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this._accounts) throw new Error("Algorand Accounts not defined");

                //Get Token
                const token = BridgeTokens.get("algorand", symbol);
                if (!token) throw new Error("Token not found");
                if (!token.address) throw new Error("mint address is required");
                if (typeof token.address !== "number") throw new Error("token address is required in number format");

                //Get Token Balance
                const balance = await this._accounts.getTokensHeld(address, token);
                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async waitForTokenBalance(address: string, symbol: string, expectedAmount: number, timeoutSeconds: number = 60, threshold: number = 0.001,anybalance: boolean = false, noBalance: boolean = false): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {

                //Get start time & balance
                const start = Date.now();
                let balance = await this.getTokenBalance(address, symbol);

                //Loop until balance (or timeout) is reached
                while (true) {

                    //Check break conditions
                    if (anybalance && balance > 0) {
                        break;
                    } else if (noBalance && balance == 0) {
                        break;
                    } else if (Math.abs(balance - expectedAmount) < threshold) {
                        break;
                    }

                    //Log
                    let timeInSeconds = (Date.now() - start) / 1000;
                    LogProgress(`${symbol} bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds)*10)/10}s`);
                   
                    //Check timeout
                    if (Date.now() - start > timeoutSeconds * 1000) {
                        reject(new Error("Timeout waiting for balance"));
                    }

                    //Wait and Check balance
                    await Sleep(1000);
                    balance = await this.getTokenBalance(address, symbol);
                }

                //Final Log
                let timeInSeconds = (Date.now() - start) / 1000;
                LogProgress(`${symbol} bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds)*10)/10}s`);
                   

                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async waitForMinTokenBalance(address: string, symbol: string, minAmount: number, timeoutSeconds: number = 60): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {

                //Get start time & balance
                const start = Date.now();
                let balance = await this.getTokenBalance(address, symbol);

                //Loop until balance (or timeout) is reached
                while (true) {

                    //Check break conditions
                    if (balance  >= minAmount) {
                        break;
                    }

                    //Log
                    let timeInSeconds = (Date.now() - start) / 1000;
                    LogProgress(`${symbol} bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds)*10)/10}s`);
                   
                    //Check timeout
                    if (Date.now() - start > timeoutSeconds * 1000) {
                        reject(new Error("Timeout waiting for balance"));
                    }

                    //Wait and Check balance
                    await Sleep(1000);
                    balance = await this.getTokenBalance(address, symbol);
                }

                //Final Log
                let timeInSeconds = (Date.now() - start) / 1000;
                LogProgress(`${symbol} bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds)*10)/10}s`);
                   
                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async waitForTokenBalanceChange(address: string, symbol: string, startingAmount: number, timeoutSeconds: number = 60): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {

                //Get start time & balance
                const start = Date.now();
                let balance = await this.getTokenBalance(address, symbol);

                //Loop until balance (or timeout) is reached
                while (true) {

                    //Check break conditions
                    if (balance  != startingAmount) {
                        break;
                    }

                    //Log
                    let timeInSeconds = (Date.now() - start) / 1000;
                    LogProgress(`${symbol} bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds)*10)/10}s`);
                   
                    //Check timeout
                    if (Date.now() - start > timeoutSeconds * 1000) {
                        reject(new Error("Timeout waiting for balance"));
                    }

                    //Wait and Check balance
                    await Sleep(1000);
                    balance = await this.getTokenBalance(address, symbol);
                }

                //Final Log
                let timeInSeconds = (Date.now() - start) / 1000;
                LogProgress(`${symbol} bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds)*10)/10}s`);
                   
                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }

    public getAlgorandBridgeAddress(id:AlgorandProgramAccount):string |number|undefined{
        
        return this._bridgeTxnsV1?.getGlitterAccountAddress(id);
    }
}


export const GetAlgodIndexer = (url: string, port: string | number, token = ''): algosdk.Indexer => {
    // const server = config.algo_client;
    // const port   = config.algo_port;
    console.log(`Connecting to Algorand Indexer at ${url}:${port}`)
    const indexer = new algosdk.Indexer(token, url, port);
    indexer.setIntEncoding(algosdk.IntDecoding.MIXED);
    return indexer;
};

export const GetAlgodClient = (url: string, port: string | number, token: string): algosdk.Algodv2 => {
    console.log(`Connecting to Algorand Client at ${url}:${port}`)
    const client = new algosdk.Algodv2(token, url, port);
    client.setIntEncoding(algosdk.IntDecoding.MIXED);
    return client;
};