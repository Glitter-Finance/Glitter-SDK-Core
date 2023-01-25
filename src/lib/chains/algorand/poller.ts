import algosdk from "algosdk";
import { Routing } from "../../common";
import { BridgeToken } from "../../common/tokens/tokens";
import { PartialBridgeTxn, TransactionType } from "../../common/transactions/transactions";
import { AlgorandProgramAccount } from "./config";
import { AlgorandBridgeTxnsV1 } from "./txns/bridge";

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
        //  indexerUrl = getIndexerURL();
        lastContractCount = 0;

        lastRound = 0;
        lastTxnID = null;
        _lastusdcTxnHash ="";
        totalTxInRound = 0;
        nextToken = "";//<--Used by algo indexer for pagination
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

        private async ListBridgeTxn(address:string,limit:number,asset:BridgeToken) {

            if(!address) throw new Error("address not defined")   ;
            if(!this._client) throw new Error("Algo Client Not Defined");
            if(!this._clientIndexer)  throw new Error("Indexer Not Set")
            if(!asset) throw new Error("asset not defined");
            let lastContractCount = 0;
            let txnList:PartialBridgeTxn[] =[];
            let paused = false;
            var data = await this._clientIndexer
            .searchForTransactions()
            .nextToken(this.nextToken)
            .applicationID(813301700 as number)
            .limit(1)
            .minRound(this.lastRound)
            .do()
            //Set last polled time
            if (this.polling) {
                    let lastPolledTimeDelta = this.getLastPolledTimeDelta();
                    if (this.lastPollMessageTime >= 5 && Date.now() - this.lastPollMessageTime >= 5 * 1000) {
                        console.log("Poller is still running after " + lastPolledTimeDelta + " seconds.");
                        this.lastPollMessageTime = Date.now();
                    }
                
                return;
            }
            if (paused) {
                    if (this.lastPauseMessageTime == null || Date.now() - this.lastPauseMessageTime >= 5 * 1000) {
                        if (this.lastPolledTime == null) {
                        console.log("Poller is paused due to connection.  Last polled: Never");
                        } else {
                        console.log("Poller is paused due to connection.  Last polled: " + this.getLastPolledTime() + " seconds ago");
                        }
                        this.lastPauseMessageTime = Date.now();
                    }
                return;
            }

            try{
            this.polling = true;
            this.lastPolledTime = Date.now();

            let  appID = this._bridgeTxnsV1?.getGlitterAccountAddress(AlgorandProgramAccount.BridgeProgramId)
            if (appID== "813301700"){
                console.log("not app id",appID)
            }
            if(!appID){
                throw new Error("not defined")
            }
            
            //Check app 
            let app = await this._client.getApplicationByID(appID as number).do();

            let globalState = app['params']['global-state'];
            //Count all bridge transactions
            let algoDepositCounter = globalState.find((x: { key: string; }) => x.key === "YWxnby1kZXBvc2l0LWNvdW50ZXI=")['value']['uint'];
            let algoReleaseCounter = globalState.find((x: { key: string; }) => x.key === "YWxnby1yZWxlYXNlLWNvdW50ZXI=")['value']['uint'];
            let algoRefundCounter = globalState.find((x: { key: string; }) => x.key === "YWxnby1yZWZ1bmQtY291bnRlcg==")['value']['uint'];
            let solDepositCounter = globalState.find((x: { key: string; }) => x.key === "eFNPTC1kZXBvc2l0LWNvdW50ZXI=")['value']['uint'];
            let solReleaseCounter = globalState.find((x: { key: string; }) => x.key === "eFNPTC1yZWxlYXNlLWNvdW50ZXI=")['value']['uint'];
            let solRefundCounter = globalState.find((x: { key: string; }) => x.key === "eFNPTC1yZWZ1bmQtY291bnRlcg==")['value']['uint'];
            let count = algoDepositCounter + algoReleaseCounter + algoRefundCounter + solDepositCounter + solReleaseCounter + solRefundCounter;

            //   //Check if new transactions
                if (count === lastContractCount) {

                    console.log("COMING HERE3");
                    //No new transactions
                        if (Date.now() - this.lastNoNewTxMessageTime >= 5 * 1000) {
                            if (this.lastTxnTime == null) {
                                console.log("No new transactions.  Last transaction: Never");
                            } else {
                                console.log("No new transactions.  Last transaction: " + (Date.now() / this.lastTxnTime) + " seconds ago");
                            }
                            console.log("Poller is still running after " + this.getLastTxnTimeDelta() + " seconds.");
                            this.lastNoNewTxMessageTime = Date.now();
                        }
                    
                    this.polling = false;
                    return;
                }
            //Get New Transactions
            let nextToken = null;
            let nextMinRound = this.lastRound;
            let lastTxnHash = "";
        do {
            //Get transactions
            //@ts-ignore
                var  data = await this._clientIndexer
                        .searchForTransactions()
                        .nextToken(nextToken)
                        .applicationID(813301700)
                        .limit(1)
                        .minRound(this.lastRound)
                        .do();
                        if(!data)     {
                            throw new Error("Responce is Undefined");
                        }
                        nextToken = data['next-token'];
                    if(data.transactions.length>0){
                    //There are transactions in this round.  Add to Transaction Map    
                    for (let i = 0; i < data.transactions.length; i++) {
                        let tx = data.transactions[i];
                        let txRound = tx['confirmed-round'];
                        if (txRound > nextMinRound) nextMinRound = txRound;

                        //Check if this is last transaction, if so, we've caught up
                        if (tx['id'] === this.lastTxnID) {
                            console.log("Caught up to last transaction");
                            break;
                        }

                        this.lastTxnID = tx['id'];
                        // need to create the PartialBridgeTxn
                        let partialBridgeTxn:PartialBridgeTxn = {
                            TxnId: tx['id'],
                            TxnType:TransactionType.Deposit,
                            
                        }
                        txnList.push(partialBridgeTxn);
                    }
                    //If txns found, log
                    if (txnList.length > 0) {
                        console.log("transactionLenght:",txnList.length);
                    }
                }  else {
                    //No transactions in this round
                    console.log("No transactions in batch");
                    break;
                }

                //Save state
                // setLastCompletedRound("../SaveStates", nextMinRound);
                // setLastCompletedTxnID("../SaveStates", lastTxnID);

            }while(true)
                //Set last Contract Count
                this.lastRound = nextMinRound;
                lastContractCount = count;

                return txnList;
        } catch(err){

        console.log(err);

        }
        this.polling = false;         
        }

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
                        TxnId:result.id,
                        TxnType:TransactionType.Release,
                    };
                }else{
                     partialBtxn =  {
                        TxnId:result.id,
                        TxnType:TransactionType.Release,
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
                            TxnId:result.id,
                            TxnType:TransactionType.Release,
                        };
                    }else{
                         partialBtxn =  {
                            TxnId:result.id,
                            TxnType:TransactionType.Release,
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
                        TxnId:result.id,
                        TxnType:TransactionType.Release,
                    };
                }else{
                     partialBtxn =  {
                        TxnId:result.id,
                        TxnType:TransactionType.Release,
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
                            TxnId:result.id,
                            TxnType:TransactionType.Release,
                        };
                    }else{
                         partialBtxn =  {
                            TxnId:result.id,
                            TxnType:TransactionType.Release,
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
}

