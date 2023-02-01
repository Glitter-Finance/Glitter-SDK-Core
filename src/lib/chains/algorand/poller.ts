import algosdk from "algosdk";
import { BridgeTokens, Sleep } from "glitter-bridge-sdk-dev/dist";
import { Routing, ValueUnits } from "../../common";
import { BridgeToken } from "../../common/tokens/tokens";
import { PartialBridgeTxn, TransactionType } from "../../common/transactions/transactions";
import { AlgorandProgramAccount } from "./config";
import { AlgorandBridgeTxnsV1 } from "./txns/bridge";
import * as dotenv from 'dotenv'

dotenv.config({ path:'src/.env' });

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
        
        lastContractCount = 0;
        lastRound = 0;
        lastTxnID = "";
        _lastusdcTxnHash ="";
        totalTxInRound = 0;
        nextToken = '';
        polling = false;
        isStarted = false;
        lastPauseMessageTime:number | null =null;
        lastPollMessageTime = 0;
        lastNoNewTxMessageTime = 0;
        lastTxnTime = 0;
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
    public async ListPartialBridgeTxn(minRound?:number):Promise<PartialBridgeTxn[]>{
         return new Promise(async (resolve,reject) =>{
            
        try{
            if(!this._client) throw new Error("Algo Client Not Defined");
            if(!this._clientIndexer)  throw new Error("Indexer Not Set")
            let nextToken = null;
            // get the last ended round
            let nextMinRound = minRound==undefined ? this.lastRound:minRound;

            let PartialBtxnList:PartialBridgeTxn[] = [];
            do{

                try{

                 Sleep(1000) // 1 sec delay 
                var data = await this._clientIndexer
                .searchForTransactions()
                .nextToken(this.nextToken)
                .applicationID(813301700)
                .limit(1000)
                .minRound(nextMinRound)
                .do()
                
                this.nextToken = data['next-token'];
                if (data.transactions.length > 0) {
                    //There are transactions in this round.  Add to Transaction Map    
                    for (let i = 0; i < data.transactions.length; i++) {
                        let tx = data.transactions[i];
                        let txRound = tx['confirmed-round'];
                        if (txRound > nextMinRound) nextMinRound = txRound;
                        //Check if this is last transaction, if so, we've caught up
                        if (tx['id'] === this.lastTxnID) {
                            break;
                        }

                        this.lastTxnID = tx['id'];
                        const PartialBtxn = this.getPartialBTxn(tx)

                        if(PartialBtxn!=null){

                            PartialBtxnList.push(PartialBtxn);

                        }
                    }
                } else {
                    //No transactions in this round
                    break;
                }  
            }catch(err){
                   
            }

        }while(true)
            //Set last Contract Count
            this.lastRound = nextMinRound;
            // this.lastContractCount = count;  
        resolve(PartialBtxnList);     
    }catch(err){
        reject(err)
    }

})
  

}

     /**
      * 
      * 
      * Listusdcs deposit transaction handler
      * @param address 
      * @param limit 
      * @param asset 
      * @param [startHash] 
      * @returns Partial USDC deposit transactions  
      */
     private async listusdcDepositTransactionHandler(address:string,limit:number ,asset:BridgeToken, startHash?:string):Promise<PartialBridgeTxn[]>  {
            return new Promise(async (resolve,reject) =>{
                try{
              const address = this._bridgeTxnsV1?.getGlitterAccountAddress(AlgorandProgramAccount.UsdcDepositAccount);
              if(!address) throw new Error("address not defined")   ;
              if(!this._client) throw new Error("Algo Client Not Defined");
              if(!this._clientIndexer)  throw new Error("Indexer Not Set")
              if(!asset) throw new Error("asset not defined");
              const txnlist = await this._clientIndexer?.searchForTransactions().address(address as string).limit(limit).do();
              if(!txnlist) throw new Error("txn list not defined");
              let partialbridgeTxnList:PartialBridgeTxn[] = [];  
              let partialBtxn:PartialBridgeTxn 
              let lastTxnHash = "";
              let checkLimit = 0;       
              for(let result of txnlist.transactions){
                if(checkLimit == limit) break;
                if(startHash==undefined){

                const routing = await this.getNote(result);
                if(!routing){
                    partialBtxn   =  {
                        txnID:result.id,
                        txnType:TransactionType.Release,
                    };
                }else{
                     partialBtxn =  {
                        txnID:result.id,
                        txnType:TransactionType.Release,
                        routing:routing
                    };
                }    
                partialbridgeTxnList.push(partialBtxn)
                lastTxnHash = result.id;
                checkLimit++;
    
                }else {
                if(startHash == result.id){
                const routing = await this.getNote(result);
                    if(!routing){
                        partialBtxn   =  {
                            txnID:result.id,
                            txnType:TransactionType.Release,
                        };
                    }else{
                         partialBtxn =  {
                            txnID:result.id,
                            txnType:TransactionType.Release,
                            routing:routing
                        };
                    }    
                partialbridgeTxnList.push(partialBtxn)
                lastTxnHash = result.id
                startHash =undefined;
                checkLimit++;
                }
                }   
             }
     
              this._lastusdcTxnHash = lastTxnHash
                resolve(partialbridgeTxnList)
                } catch(err){
                    reject(err)    
                }
            })
        }

        /**
      * 
      * 
      * Listusdcs Release transaction handler
      * @param address 
      * @param limit 
      * @param asset 
      * @param [startHash] 
      * @returns Partial USDC Release transactions  
      */
        private async listusdcReleaseTransactionHandler(limit:number, startHash?:string):Promise<PartialBridgeTxn[]>  {
            return new Promise(async (resolve,reject) =>{
                try{
              const address = this._bridgeTxnsV1?.getGlitterAccountAddress(AlgorandProgramAccount.UsdcReceiverAccount);
              if(!address) throw new Error("address not defined")   ;
              if(!this._client) throw new Error("Algo Client Not Defined");
              if(!this._clientIndexer)  throw new Error("Indexer Not Set")
              const txnlist = await this._clientIndexer?.searchForTransactions().address(address as string).limit(limit).do();
              let partialBtxn:PartialBridgeTxn; 
              if(!txnlist) throw new Error("txn list not defined");
              let partialbridgeTxnList:PartialBridgeTxn[] = [];   
              let lastTxnHash = "";
              let checkLimit = 0;       
              for(let result of txnlist.transactions){
                if(checkLimit == limit) break;
                if(startHash==undefined){
                const routing = await this.getNote(result);

                if(!routing){
                    partialBtxn   =  {
                        txnID:result.id,
                        txnType:TransactionType.Release,
                    };
                }else{
                     partialBtxn =  {
                        txnID:result.id,
                        txnType:TransactionType.Release,
                        routing:routing
                    };
                }    
                partialbridgeTxnList.push(partialBtxn)
                lastTxnHash = result.id;
                checkLimit++;
                }else {
                if(startHash == result.id){
                    const routing = await this.getNote(result);

                    if(!routing){
                        partialBtxn   =  {
                            txnID:result.id,
                            txnType:TransactionType.Release,
                        };
                    }else{
                         partialBtxn =  {
                            txnID:result.id,
                            txnType:TransactionType.Release,
                            routing:routing
                        };
                    }      
               
                partialbridgeTxnList.push(partialBtxn)
                lastTxnHash = result.id
                startHash =undefined;
                checkLimit++;
                }
                }   
             }
    
             this._lastusdcTxnHash = lastTxnHash
                resolve(partialbridgeTxnList)
                } catch(err){
                    reject(err)    
                }
            })
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
            return this.lastRound;
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


        /**
         * 
         * 
         * Gets partial btxn
         * @param txn 
         * @returns partial btxn 
         */
        public getPartialBTxn(txn:any):PartialBridgeTxn | null{
            if (!txn["application-transaction"]) return null;
            if (!txn["application-transaction"]["application-args"]) return null;   
            //Get local Vars
            let appTxn = txn["application-transaction"];
            let txnArgs = appTxn["application-args"];
            if (txnArgs.length === 0) return null;
            
            //Ensure this is a Noop transaction
            let onComplete = appTxn["on-completion"];
            if (onComplete !== "noop") return null;
            //Ensure signature is defined (that transaction is valid)
            if (
                !txn["signature"] ||
                (!txn["signature"]["multisig"] && !txn["signature"]["sig"])
            )
            return null;

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
            let partialBTxn:PartialBridgeTxn|undefined;

            if(appCall =="xSOL-deposit"){
                let decimals = 9;
                const units = BigInt(amount)
                const amount_ = ValueUnits.fromUnits(BigInt(amount), decimals).value;
                let txnType = TransactionType.Deposit
                routing ={
                    from:{
                        address:algoSender,
                        network:"algorand",
                        token:algoAssetID,
                        txn_signature:txnID,
                    },
                    to:{
                        network:"solana",
                        address:solAddress,
                        token:solAssetID,
                        txn_signature:solSig
                    },
                    units:units,
                    amount:amount_
                } as Routing

                partialBTxn = {
                    txnID:txnID,
                    txnType:txnType,
                    routing:routing
                }
             return partialBTxn;   

            }else if(appCall=="algo-release") {

                let decimals =6; 
                const units = BigInt(amount)
                const amount_ = ValueUnits.fromUnits(BigInt(amount), decimals).value;
                let txnType = TransactionType.Release
                routing ={
                    from:{
                        address:solAddress,
                        network:"solana",
                        token:solAssetID,
                        txn_signature:solSig,
                    },
                    to:{
                        address:algoReceiver,
                        network:"algorand",
                        token:algoAssetID,
                        txn_signature:txnID
                    },
                    units:units,
                    amount:amount_
                } as Routing

                partialBTxn = {
                    txnID:txnID,
                    txnType:txnType,
                    routing:routing
                }
              
                return partialBTxn;
                
            }else if(appCall =="xSOL-release"){
              
                let decimals =9; 
                const units = BigInt(amount)
                const amount_ = ValueUnits.fromUnits(BigInt(units), decimals).value;
                let txnType = TransactionType.Release
                routing ={
                    from:{
                        address:solAddress,
                        network:"solana",
                        token:solAssetID,
                        txn_signature:solSig,
                    },
                    to:{
                        address:algoReceiver,
                        network:"algorand",
                        token:algoAssetID,
                        txn_signature:txnID
                    },
                    units:units,
                    amount:amount_
                } as Routing

                partialBTxn = {
                    txnID:txnID,
                    txnType:txnType,
                    routing:routing
                }
              
                return partialBTxn;
                
            }else if(appCall =="algo-deposit"){
          
                let decimals =6; 
                const units = BigInt(amount)
                const amount_ = ValueUnits.fromUnits(BigInt(units), decimals).value;
                let txnType = TransactionType.Deposit
                routing ={
                    from:{
                        address:algoSender,
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
                    units:units,
                    amount:amount_
                } as Routing

                partialBTxn = {
                    txnID:txnID,
                    txnType:txnType,
                    routing:routing
                }
              
                return partialBTxn;                
                
            }else if(appCall=="algo-refund") {

                let decimals =6; 
                const units = BigInt(amount)
                const amount_ = ValueUnits.fromUnits(BigInt(units), decimals).value;
                let txnType = TransactionType.Refund
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
                    units:units,
                    amount:amount_
                } as Routing

                partialBTxn = {
                    txnID:txnID,
                    txnType:txnType,
                    routing:routing
                }
              
                return partialBTxn;  

            }

            return null; 
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

