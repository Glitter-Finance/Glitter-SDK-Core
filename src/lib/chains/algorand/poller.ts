import algosdk from "algosdk";
import {  Sleep } from "../../common";
import { Routing, ValueUnits } from "../../common";
import { BridgeTokens } from "../../common/tokens/tokens";
import { BridgeType, ChainStatus, PartialBridgeTxn, TransactionType } from "../../common/transactions/transactions";
import { AlgorandProgramAccount } from "./config";
import { AlgorandBridgeTxnsV1 } from "./txns/bridge";
import * as dotenv from 'dotenv'
import winston from "winston";
import { ethers } from "ethers";
import { base64To0xString,base64ToBigUIntString } from "../../common/utils/utils";

dotenv.config({ path:'src/.env' });
const DEFAULT_LIMIT =500;          

export class AlgorandPoller{

    private _clientIndexer: algosdk.Indexer | undefined = undefined;
    private _client: algosdk.Algodv2 | undefined = undefined;
    private _bridgeTxnsV1: AlgorandBridgeTxnsV1 | undefined = undefined;
    
    constructor(client:algosdk.Algodv2, clientIndexer:algosdk.Indexer,bridgeTxnV1:AlgorandBridgeTxnsV1){
        this._client = client
        this._clientIndexer = clientIndexer
        this._bridgeTxnsV1 = bridgeTxnV1
    }
    
        //Logger -> Passed in on start
        logger = undefined;
        //Interval
        pollerLoop = null;
        //Local Vars
        _pollerCountflag =0;    
        _lastContractCount = 0;
        _lastRound = 0;
        _UsdclastRound=0;
        _UsdcReleaselastRound=0;
        _lastTxnID = "";
        _UsdclastTxnID="";
        _UsdcReleaselastTxnID="";
        _lastusdcTxnHash ="";
        _totalTxInRound = 0;
        nextToken = "";
        _polling = false;
        _USDCpolling=false;
        isStarted = false;
        lastPauseMessageTime:number | null =null;
        lastPollMessageTime = 0;
        lastNoNewTxMessageTime = 0;
        lastTxnTime =0;
        lastPolledTime = 0;
        //Pause
        paused = false;
        public pausePoller() {
            this.paused = true;
        }
        public continueRunningPoller() {
            this.paused = false;
        }

 /**
  * @methof ListPartialBridgeTxn
  * @param minRound 
  * @returns 
  */        
    public async ListPartialBridgeTxn(minRound?:number,limit?:number):Promise<PartialBridgeTxn[]|undefined>{
         return new Promise(async (resolve,reject) =>{
            
        try{

            if(!this._client) throw new Error("Algo Client Not Defined");
            if(!this._clientIndexer)  throw new Error("Indexer Not Set")
            let nextToken = null;
            //set polling flag
            this._polling = true; 
            this._pollerCountflag=1;
            // set the lastPolledTime 
            this.lastPolledTime = Date.now();
            let appId = this._bridgeTxnsV1?.getGlitterAccountAddress(AlgorandProgramAccount.appID);
            if(!appId) {
                throw new Error("APP ID NOT DEFINED")
            }
            //Check app 
            let app = await this._client.getApplicationByID(appId as number).do();
            let globalState = app['params']['global-state'];
            //Count all bridge transactions
            let algoDepositCounter = globalState.find((x: { key: string; }) => x.key === "YWxnby1kZXBvc2l0LWNvdW50ZXI=")['value']['uint'];
            let algoReleaseCounter = globalState.find((x: { key: string; }) => x.key === "YWxnby1yZWxlYXNlLWNvdW50ZXI=")['value']['uint'];
            let algoRefundCounter = globalState.find((x: { key: string; }) => x.key === "YWxnby1yZWZ1bmQtY291bnRlcg==")['value']['uint'];
            let solDepositCounter = globalState.find((x: { key: string; }) => x.key === "eFNPTC1kZXBvc2l0LWNvdW50ZXI=")['value']['uint'];
            let solReleaseCounter = globalState.find((x: { key: string; }) => x.key === "eFNPTC1yZWxlYXNlLWNvdW50ZXI=")['value']['uint'];
            let solRefundCounter = globalState.find((x: { key: string; }) => x.key === "eFNPTC1yZWZ1bmQtY291bnRlcg==")['value']['uint'];
            let count = algoDepositCounter + algoReleaseCounter + algoRefundCounter + solDepositCounter + solReleaseCounter + solRefundCounter;
        //Check if new transactions
        if (count === this._lastContractCount) {
            //No new transactions

                if (Date.now() - this.lastNoNewTxMessageTime >= 5 * 1000) {
                    if (this.lastTxnTime == null) {
                        console.log("No new transactions.  Last transaction: Never");
                    } else {
                        console.log("No new transactions.  Last transaction: " + (Date.now() / this.lastTxnTime) + " seconds ago");
                    }
                    //if (logger !== undefined) console.log("Poller is still running after " + getLastTxnTimeDelta() + " seconds.");
                    this.lastNoNewTxMessageTime = Date.now();
                }
            
            this._polling = false;
            return undefined;
        }

            // get the last ended round
            let nextMinRound = minRound==undefined ? this._lastRound:minRound;
            let lastTxnId = "";
            let NewlastTxnTime = 0;
            let PartialBtxnList:PartialBridgeTxn[] = [];
            const TxnLimit = limit==undefined?DEFAULT_LIMIT:limit

            do{

                try{

                 Sleep(1000) // 1 sec delay 
                var data = await this._clientIndexer
                .searchForTransactions()
                .nextToken(this.nextToken)
                .applicationID(813301700)
                .limit(TxnLimit)
                .minRound(nextMinRound)
                .do()
                
                this.nextToken = data['next-token'];
                if (data.transactions.length > 0) {
                    //There are transactions in this round.  Add to Transaction Map    
                    for (let i = 0; i < data.transactions.length; i++) {
                        let tx = data.transactions[i];
                        let txRound = tx['confirmed-round'];
                        const txnId = tx['id'];
                        if (txRound > nextMinRound) nextMinRound = txRound;
                        //Check if this is last transaction, if so, we've caught up
                        if (tx['id'] === lastTxnId) {
                            break;
                        }
                       const PartialBtxn = this.getPartialBTxn(tx)
                        if(PartialBtxn!=null){

                            PartialBtxnList.push(PartialBtxn);

                        }
                        
                        this._lastTxnID = lastTxnId;
                        let transactionTimestamp = tx["round-time"];
                        // NewlastTxnTime = new Date((transactionTimestamp || 0) * 1000); 
                        NewlastTxnTime = transactionTimestamp   
                        
                    }
                } else {
                    //No transactions in this round
                    break;
                }  
            }catch(err){
                   
            }

            
                //Save state
                // setLastCompletedRound("../SaveStates", nextMinRound);
                // setLastCompletedTxnID("../SaveStates", lastTxnID);
                this._lastRound = nextMinRound;
                this._lastTxnID = lastTxnId;
                this.lastTxnTime = NewlastTxnTime

        }while(true)
            //Set last Contract Count
            this._lastRound = nextMinRound;
            this._lastContractCount = count;  
            
        resolve(PartialBtxnList);     
    }catch(err){
        reject(err)
    }


    //Clear Polling Flag 

    this._polling = false;
    this._pollerCountflag=2
})
  

}


    getLastMinRound(){
        let  res:number|undefined ; 
       if(this._pollerCountflag=2) {
        res = this._lastRound
       }else {
        throw new Error("POLLER IS NOT SET")
       }

        return res 
    }

    getLastTxnId(){
        let res:string|undefined ; 
       if(this._pollerCountflag=2) {
        res = this._lastTxnID
       }else{
        throw new Error("POLLER IS NOT SET")
       }

        return res 
    }

    getLastTxnCount() {
        let res:number|undefined ; 
        if(this._pollerCountflag=2) {
         res = this._lastContractCount
        }else{
         throw new Error("POLLER IS NOT SET")
        }
 
         return res 
    }


     /**
      * 
      * 
      * Listusdcs deposit transaction handler
      * @param address 
      * @param limit 
      * @param asset 
      * @param startHash
      * @returns {PartialBridgeTxn[]}  
      */
     public async ListusdcDepositTransactionHandler(limit?:number,minRound?:number,startHash?:string):Promise<PartialBridgeTxn[]>  {
        return new Promise(async (resolve,reject) =>{
            try{
                    const address = this._bridgeTxnsV1?.getGlitterAccountAddress(AlgorandProgramAccount.UsdcDepositAccount) as string;
                    if(!address) throw new Error("address not defined")   ;
                    if(!this._client) throw new Error("Algo Client Not Defined");
                    if(!this._clientIndexer)  throw new Error("Indexer Not Set")
                    this._USDCpolling = true; 
                    this._pollerCountflag=3;
                    let nextMinRound = minRound==undefined ? this._UsdclastRound:minRound;
                    let lastTxnId = "";
                    let PartialBtxnList:PartialBridgeTxn[] = [];
                    const TxnLimit = limit==undefined?DEFAULT_LIMIT:limit
                    do{
                        try{
                            Sleep(1000)
                            var data = await this._clientIndexer
                            .searchForTransactions()
                            .nextToken(this.nextToken)
                            .limit(TxnLimit)
                            .minRound(nextMinRound)
                            .address(address)
                            .do();
                            if(!data) throw new Error("DATA IS udndefined ")
                            this.nextToken = data['next-token'];
                            if (data.transactions.length > 0) {
                                //There are transactions in this round. Add to Transaction Map    
                                for (let i = 0; i < data.transactions.length; i++) {
                                    let tx = data.transactions[i];
                                    let txRound = tx['confirmed-round'];
                                    if (txRound > nextMinRound) nextMinRound = txRound;
                                    //Check if this is last transaction, if so, we've caught up
                                    if (tx['id'] === lastTxnId) {
                                        break;
                                    }
                                    lastTxnId = tx['id'];
                                    // //Get Algorand Transaction data
                                    let partialTxn: PartialBridgeTxn = {
                                        txnID: tx['id'],
                                        txnIDHashed: this.getTxnHashedFromBase64(tx['id']),
                                        bridgeType: BridgeType.USDC,
                                        txnType: TransactionType.Unknown,
                                        network: "algorand",
                                        chainStatus: ChainStatus.Completed
                                    }
                                    //Timestamp
                                    const transactionTimestamp = tx["round-time"];
                                    partialTxn.txnTimestamp = new Date((transactionTimestamp || 0) * 1000); //*1000 is to convert to milliseconds
                                    partialTxn.block = tx["confirmed-round"];
                                    const txntype = tx['tx-type']; 
                                    const noteObj = tx.note ? algosdk.decodeObj(Buffer.from(tx.note, "base64")) as DepositNote : null;
                                    const note = noteObj ? noteObj["system"] : null;
                                    const routing: Routing | null = note ? JSON.parse(note) : null;
                                    if(txntype=='pay'){
                                        partialTxn.tokenSymbol="usdc";
                                        partialTxn.address = tx['sender'];
                                        const units = tx['payment-transaction'].amount;
                                        partialTxn.units = units;
                                        partialTxn.amount = ValueUnits.fromUnits(units, 6).value;
                                        partialTxn.routing = routing
                                        PartialBtxnList.push(partialTxn);
                                    }else {
                                        const PartialBtxn = await this.handleDeposit(tx,routing,partialTxn)
                                        // console.log("GOT THE PARTIAL TXN")
                                        if(PartialBtxn!=null){
                                            PartialBtxnList.push(PartialBtxn);
                                        }
                                    }
                                    this._UsdclastTxnID = lastTxnId;
                                }
                            } else {
                                //No transactions in this round
                                break;
                            }  
                        }catch(err){
                        }
                        //Save state
                        // setLastCompletedRound("../SaveStates", nextMinRound);
                        // setLastCompletedTxnID("../SaveStates", lastTxnID);
                        this._UsdclastRound = nextMinRound;
                        this._UsdclastTxnID = lastTxnId;
                    }while(true)
                    //Set last Contract Count
                    this._UsdclastRound = nextMinRound;
                    // this._lastContractCount = count;  
                    // txns are getting listed in New to Old Manner 
                    // reversing the final list to get the opposite
                    resolve(PartialBtxnList.reverse());     
                } catch(err){
                    console.log("ERROR", err)  
                }
                //Clear Polling Flag 
                this._USDCpolling = false;
                this._pollerCountflag=4
            })
        }

        getLastMinRoundUsdcDeposit(){
            let  res:number|undefined ; 
           if(this._pollerCountflag=3) {
            res = this._UsdclastRound
           }else {
            throw new Error("POLLER IS NOT SET")
           }
    
            return res 
        }
    
        getLastTxnIdUsdcDeposit(){
            let res:string|undefined ; 
           if(this._pollerCountflag=3) {
            res = this._UsdclastTxnID
           }else{
            throw new Error("POLLER IS NOT SET")
           }
    
            return res 
        }


        public getTxnHashedFromBase64(txnID: string): string {
            return ethers.utils.keccak256(base64To0xString(txnID));
          }
     
                    
    /**
      * 
      * 
      * Listusdcs Release transaction handler
      * @param address 
      * @param limit 
      * @param asset 
      * @param startHash
      * @returns {PartialBridgeTxn[]}
      */
        public async ListusdcReleaseTransactionHandler(limit?:number,minRound?:number,startHash?:string):Promise<PartialBridgeTxn[]>  {
            return new Promise(async (resolve,reject) =>{
                try{
                    
                    const address = this._bridgeTxnsV1?.getGlitterAccountAddress(AlgorandProgramAccount.UsdcReceiverAccount) as string;
                    if(!address) throw new Error("address not defined")   ;
                    if(!this._client) throw new Error("Algo Client Not Defined");
                    if(!this._clientIndexer)  throw new Error("Indexer Not Set")
                    this._USDCpolling = true; 
                    this._pollerCountflag=5;
                    let nextMinRound = minRound==undefined ? this._UsdcReleaselastRound:minRound;
                    let lastTxnId = "";
                    let PartialBtxnList:PartialBridgeTxn[] = [];
                    const TxnLimit = limit==undefined?DEFAULT_LIMIT:limit
                    do{
                        try{
                            Sleep(1000)
                            var data = await this._clientIndexer
                            .searchForTransactions()
                            .nextToken(this.nextToken)
                            .limit(TxnLimit)
                            .minRound(nextMinRound)
                            .address(address)
                            .do();
                            if(!data) throw new Error("data IS udndefined ")
                            this.nextToken = data['next-token'];
                            if (data.transactions.length > 0) {
                                //There are transactions in this round. Add to Transaction Map    
                                for (let i = 0; i < data.transactions.length; i++) {
                                    let tx = data.transactions[i];
                                    let txRound = tx['confirmed-round'];
                                    if (txRound > nextMinRound) nextMinRound = txRound;
                                    //Check if this is last transaction, if so, we've caught up
                                    if (tx['id'] === lastTxnId) {
                                        break;
                                    }
                                    lastTxnId = tx['id'];
                                    let partialTxn: PartialBridgeTxn = {
                                        txnID: tx['id'],
                                        txnIDHashed: this.getTxnHashedFromBase64(tx['id']),
                                        bridgeType: BridgeType.USDC,
                                        txnType: TransactionType.Unknown,
                                        network: "algorand",
                                        chainStatus: ChainStatus.Completed
                                    }
                                    //Timestamp
                                    const transactionTimestamp = tx["round-time"];
                                    partialTxn.txnTimestamp = new Date((transactionTimestamp || 0) * 1000); //*1000 is to convert to milliseconds
                                    partialTxn.block = tx["confirmed-round"];
                                    const txntype = tx['tx-type']; 
                                    const noteObj = tx.note ? algosdk.decodeObj(Buffer.from(tx.note, "base64")) as DepositNote : null;
                                    const note = noteObj ? noteObj["system"] : null;
                                    const routing: Routing | null = note ? JSON.parse(note) : null;
                                    if(txntype=='pay'){
                                        partialTxn.tokenSymbol="usdc";
                                        partialTxn.address = tx['sender'];
                                        const units = tx['payment-transaction'].amount;
                                        partialTxn.units = units;
                                        partialTxn.amount = ValueUnits.fromUnits(units, 6).value;
                                        partialTxn.routing = routing
                                        PartialBtxnList.push(partialTxn);
                                    }else {
                                        const PartialBtxn = await this.handleRelease(tx,routing,partialTxn)
                                        // console.log("GOT THE PARTIAL TXN")
                                        if(PartialBtxn!=null){
                                            PartialBtxnList.push(PartialBtxn);
                                        }
                                    }
                                    this._UsdcReleaselastTxnID = lastTxnId;
                                }
                            } else {
                                //No transactions in this round
                                break;
                            }  
                        }catch(err){
                        }
                        //Save state
                        // setLastCompletedRound("../SaveStates", nextMinRound);
                        // setLastCompletedTxnID("../SaveStates", lastTxnID);
                        this._UsdcReleaselastRound = nextMinRound;
                        this._UsdcReleaselastTxnID = lastTxnId;
                    }while(true)
                        this._UsdcReleaselastRound = nextMinRound;
                        // txns are getting listed in New to Old Manner 
                        // reversing the final list to get the opposite
                        resolve(PartialBtxnList.reverse());  
                    } catch(err){
                        reject(err)    
                    }
                        //Clear Polling Flag 
                        this._USDCpolling = false;
                        this._pollerCountflag=6;
                })
        }

        getLastMinRoundUsdcRelease(){
            let  res:number|undefined ; 
           if(this._pollerCountflag=3) {
            res = this._UsdcReleaselastRound
           }else {
            throw new Error("POLLER IS NOT SET")
           }
    
            return res 
        }
    
        getLastTxnIdUsdcRelease(){
            let res:string|undefined ; 
           if(this._pollerCountflag=3) {
            res = this._UsdcReleaselastTxnID
           }else{
            throw new Error("POLLER IS NOT SET")
           }
    
            return res 
        }

        
        public async getNote(transaction:any):Promise<Routing|undefined> {
           try{
            const note = transaction.note || ''
            let depositNote: Routing |undefined;
            
            if(note!=null){
            depositNote  = note ? algosdk.decodeObj(Buffer.from(note, "base64")) as any : {}
            }
            return Promise.resolve(depositNote)
           }catch(err){
              return Promise.reject(err)
           }
        
        };

        public getLastPolledRound() {
            return this._lastRound;
        }
        public getLastPolledTimeDelta() {
            return Math.round((Date.now() - this.lastPolledTime) / 1000 * 10) / 10;
        }

        public getLastPolledTime() {
            return this.lastPolledTime;
        }
        public getLastTxnTimeDelta() {
            return Math.round((Date.now() - this.lastTxnTime) / 1000 * 10) / 10;
        }

        async  handleDeposit(
            txn: any,
            routing: Routing | null,
            partialTxn: PartialBridgeTxn,
           ): Promise<PartialBridgeTxn> {
            let decimals = 6;
        
        
            //Set type
            partialTxn.tokenSymbol = "usdc";
        
            //Get Address
            let units = txn["asset-transfer-transaction"].amount;
            let assetID = txn["asset-transfer-transaction"]["asset-id"];
        
            //Check if asset is USDC
            if (assetID !== BridgeTokens.get("algorand","usdc")?.address) {
                return Promise.resolve(partialTxn);
            }
        
            let sender = txn.sender;
            if (sender == this._bridgeTxnsV1?.getGlitterAccountAddress(AlgorandProgramAccount.UsdcDepositAccount)) {
               
                //This is a transfer or refund
                if (!routing){
                    partialTxn.txnType = TransactionType.Transfer;
                } else {
                   partialTxn.txnType = TransactionType.Refund;
                }       
                partialTxn.address = txn["asset-transfer-transaction"].receiver;
           
            } else {
                //this is a deposit
                partialTxn.address = txn.sender;
                partialTxn.txnType = TransactionType.Deposit;
            }
        
            partialTxn.units = units;
            partialTxn.amount = ValueUnits.fromUnits(units, decimals).value;
        
            partialTxn.routing = routing;
            return Promise.resolve(partialTxn);
        }

        async  handleRelease(
            txn: any,
            routing: Routing | null,
            partialTxn: PartialBridgeTxn,
            ): Promise<PartialBridgeTxn> {
            let decimals = 6;
        
            //Set type
            partialTxn.tokenSymbol = "usdc";
        
            //Get Address
            let units = txn["asset-transfer-transaction"].amount;
            let assetID = txn["asset-transfer-transaction"]["asset-id"];
        
            //Check if asset is USDC
            if (assetID !== BridgeTokens.get("algorand","usdc")?.address) {
                console.log(`Transaction ${txn['id']} is not a USDC transaction`);
                return Promise.resolve(partialTxn);
            }
        
            let receiver = txn["asset-transfer-transaction"].receiver;
            if (receiver === this._bridgeTxnsV1?.getGlitterAccountAddress(AlgorandProgramAccount.UsdcReceiverAccount)) {
                //This is a transfer
                partialTxn.address = receiver;
                partialTxn.txnType = TransactionType.Transfer;
            } else {
                //this is a release
                partialTxn.address = receiver;
                partialTxn.txnType = TransactionType.Release;
            }
        
            partialTxn.units = units;
            partialTxn.amount = ValueUnits.fromUnits(units, decimals).value;
        
            partialTxn.routing = routing;
            return Promise.resolve(partialTxn);
        }        

        /**
         * 
         * 
         * Gets partial btxn
         * @param txn 
         * @returns partial btxn 
         */
        public getPartialBTxn(txn:any):PartialBridgeTxn|undefined{
            if (!txn["application-transaction"]) return undefined;
            if (!txn["application-transaction"]["application-args"]) return undefined ;   
            //Get local Vars
            let appTxn = txn["application-transaction"];
            let txnArgs = appTxn["application-args"];
            if (txnArgs.length === 0) return undefined ;
            
            //Ensure this is a Noop transaction
            let onComplete = appTxn["on-completion"];
            if (onComplete !== "noop") return undefined;
            //Ensure signature is defined (that transaction is valid)
            if (
                !txn["signature"] ||
                (!txn["signature"]["multisig"] && !txn["signature"]["sig"])
            ){
            return undefined;
            }
            let solAddress = this.convertToAscii(txnArgs[0]);
            let algoSender = this.convertToAscii(txnArgs[1]);
            let algoReceiver = appTxn["accounts"][0];
            let solAssetID: string | null = null;
            let algoAssetID: string | null = null;
            let xALGOAssetID = "xALGoH1zUfRmpCriy94qbfoMXHtK6NDnMKzT4Xdvgms";
            switch (this.convertToAscii(txnArgs[2])) {
              case xALGOAssetID:
                solAssetID = "xalgo";
                break;
              case "sol":
                solAssetID = "sol";
                break;
              default:
                solAssetID = null;
                break;
            }
            switch (this.convertToAscii(txnArgs[3])) {
              case "xSOL":
                algoAssetID = "xsol";
                break;
              case "algo":
                algoAssetID = "algo";
                break;
              default:
                algoAssetID = null;
                break;
            }
            let appCall = this.convertToAscii(txnArgs[4]);
            let amount = this.convertToNumber(txnArgs[6]);
            let txnID = txn["id"];
            let txnSignature = txn["signature"]["sig"];
            let solSig = this.convertToAscii(txnArgs[5]);
            if (!solSig) solSig = "null";
            let routing:Routing|undefined = undefined; 
            //Get Algorand Transaction data
            let PartialBtxn: PartialBridgeTxn | undefined = {
                txnID: txnID,
                txnIDHashed: this.getTxnHashedFromBase64(txnID),
                bridgeType: BridgeType.Token,
                txnType: TransactionType.Unknown,
                network: "algorand",
                chainStatus: ChainStatus.Completed
            }
            //Timestamp
            const transactionTimestamp = txn["round-time"];
            PartialBtxn.txnTimestamp = new Date((transactionTimestamp || 0) * 1000); //*1000 is to convert to milliseconds
            PartialBtxn.block = txn["confirmed-round"];
            if(appCall.toLocaleLowerCase() =="xsol-deposit"){
                let decimals = 9;
                const units = BigInt(amount)
                const amount_ = ValueUnits.fromUnits(BigInt(amount), decimals).value;
                let txnType = TransactionType.Deposit
                //Set type
                PartialBtxn.txnType = txnType;
                PartialBtxn.tokenSymbol = "xsol";
                PartialBtxn.address = algoSender;
                PartialBtxn.units = BigInt(base64ToBigUIntString(txnArgs[6])).toString();
                PartialBtxn.amount = ValueUnits.fromUnits(BigInt(PartialBtxn.units), decimals).value;

                routing ={
                    from:{
                        address:algoSender || "",
                        network:"algorand",
                        token:algoAssetID=="xsol"?algoAssetID:"xsol",
                        txn_signature:txnID,
                    },
                    to:{
                        network:"solana",
                        address:solAddress || "",
                        token:solAssetID=="sol"?solAddress:"sol",
                        txn_signature:solSig || ""
                    },
                    units: PartialBtxn.units || "",
                    amount: PartialBtxn.amount
                } as Routing
            
             PartialBtxn.routing = routing;
             return PartialBtxn;   

            }else if(appCall.toLocaleLowerCase()=="algo-release") {
                let decimals =6; 
                const units = BigInt(amount)
                const amount_ = ValueUnits.fromUnits(BigInt(amount), decimals).value;
                let txnType = TransactionType.Release
                //Set type
                PartialBtxn.txnType = txnType;
                PartialBtxn.tokenSymbol = "algo";
                PartialBtxn.address = txn["application-transaction"].accounts[0];
                PartialBtxn.units = BigInt(base64ToBigUIntString(txnArgs[6])).toString();
                PartialBtxn.amount = ValueUnits.fromUnits(BigInt(PartialBtxn.units), decimals).value;

                routing ={
                    from:{
                        address:solAddress,
                        network:"solana",
                        token:solAssetID=="xalgo"?solAssetID:"xalgo",
                        txn_signature:solSig,
                    },
                    to:{
                        address:PartialBtxn.address || algoReceiver,
                        network:"algorand",
                        token:algoAssetID=="algo"?algoAssetID:"algo",
                        txn_signature:txnID
                    },
                    units:PartialBtxn.units,
                    amount: PartialBtxn.amount
                } as Routing

                PartialBtxn.routing = routing;
                return PartialBtxn;
                
            }else if(appCall.toLocaleLowerCase() =="xsol-release"){
              
                let decimals =9; 
                const units = BigInt(amount)
                const amount_ = ValueUnits.fromUnits(BigInt(units), decimals).value;
                let txnType = TransactionType.Release
                //Set type
                PartialBtxn.txnType = txnType;
                PartialBtxn.tokenSymbol = "xsol";
                PartialBtxn.address = txn["application-transaction"].accounts[0];
                PartialBtxn.units = BigInt(base64ToBigUIntString(txnArgs[6])).toString();
                PartialBtxn.amount = ValueUnits.fromUnits(BigInt(PartialBtxn.units), decimals).value;

                routing ={
                    from:{
                        address:solAddress,
                        network:"solana",
                        token:solAssetID=="sol"?solAssetID:"sol",
                        txn_signature:solSig,
                    },
                    to:{
                        address:PartialBtxn.address || algoReceiver,
                        network:"algorand",
                        token:algoAssetID=="xsol"?algoAssetID:"xsol",
                        txn_signature:txnID
                    },
                    units: PartialBtxn.units,
                    amount:PartialBtxn.amount
                } as Routing

                PartialBtxn.routing = routing;
                return PartialBtxn;
                
            }else if(appCall.toLocaleLowerCase() == "xsol-refund"){
                let decimals = 9;

            //Set type
            PartialBtxn.txnType = TransactionType.Refund;
            PartialBtxn.tokenSymbol = "xsol";
            PartialBtxn.address = txn["application-transaction"].accounts[0];
            PartialBtxn.units = BigInt(base64ToBigUIntString(txnArgs[6])).toString();
            PartialBtxn.amount = ValueUnits.fromUnits(BigInt(PartialBtxn.units), decimals).value;
           routing = {
                from: {
                    network: "algorand",
                    address: PartialBtxn.address|| "",
                    token: "xsol",
                    txn_signature: txnID
                },
                to: {
                    network: "algorand",
                    address: PartialBtxn.address || "",
                    token: "xsol",
                    txn_signature: ""
                },
                units: PartialBtxn.units,
                amount: PartialBtxn.amount,
            }
            PartialBtxn.routing = routing;
            return PartialBtxn;

            }else if(appCall.toLocaleLowerCase() =="algo-deposit"){
          
                let decimals =6; 
                const units = BigInt(amount)
                const amount_ = ValueUnits.fromUnits(BigInt(units), decimals).value;
                let txnType = TransactionType.Deposit
                //Set type
                PartialBtxn.txnType =txnType;
                PartialBtxn.tokenSymbol = "algo";
                PartialBtxn.address = txn.sender;
                PartialBtxn.units = BigInt(base64ToBigUIntString(txnArgs[6])).toString();
                PartialBtxn.amount = ValueUnits.fromUnits(BigInt(PartialBtxn.units), decimals).value;
                routing ={
                    from:{
                        address:PartialBtxn.address || algoSender,
                        network:"algorand",
                        token:algoAssetID,
                        txn_signature:txnID,
                    },
                    to:{
                        address:solAddress,
                        network:"solana",
                        token:solAssetID,
                        txn_signature:solSig
                    },
                    units:PartialBtxn.units,
                    amount:PartialBtxn.amount
                } as Routing

                PartialBtxn.routing = routing;
                return PartialBtxn;               
                
            }else if(appCall.toLocaleLowerCase()=="algo-refund") {

                let decimals =6; 
                const units = BigInt(amount)
                const amount_ = ValueUnits.fromUnits(BigInt(units), decimals).value;
                let txnType = TransactionType.Refund

                //Set type
                PartialBtxn.txnType =txnType;
                PartialBtxn.tokenSymbol = "algo";
                PartialBtxn.address = txn["application-transaction"].accounts[0];
                PartialBtxn.units = BigInt(base64ToBigUIntString(txnArgs[6])).toString();
                PartialBtxn.amount = ValueUnits.fromUnits(BigInt(PartialBtxn.units), decimals).value;

                routing ={
                    from:{
                        address:algoReceiver,
                        network:"algorand",
                        token:algoAssetID,
                        txn_signature:solSig,
                    },
                    to:{
                        address:solAddress,
                        network:"algorand",
                        token:solAssetID,
                        txn_signature:txnID
                    },
                    units: PartialBtxn.units,
                    amount: PartialBtxn.amount
                } as Routing

                PartialBtxn.routing = routing;

                return PartialBtxn;  
            }
            return undefined; 
        }

        public convertToAscii(str:string) {
            let arg = Buffer.from(str, "base64").toString("ascii");
            return arg;
          }
          public convertToNumber(str:any) {
            if (typeof str !== "number") {
              str = Buffer.from(str, "base64");
              return Number(algosdk.decodeUint64(str,"safe"));
            } else {
              return Number(str);
            }
          }
}

export type DepositNote = {
    system: string, // RoutingData json format
    date: string,
}
