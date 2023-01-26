import { ConfirmedSignaturesForAddress2Options, Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { BridgeToken } from "../../common";
import { Routing } from "../../common/routing/routing";
import { PartialBridgeTxn, TransactionType } from "../../common/transactions/transactions";
import { SolanaProgramId } from "./config";
import { SolanaBridgeTxnsV1 } from "./txns/bridge";


export class SolanaPoller{

    private _client:Connection;
    private _bridgeTxnsV1: SolanaBridgeTxnsV1 | undefined = undefined;
    
    constructor(client:Connection, bridgeTxnV1:SolanaBridgeTxnsV1 ){
        this._client = client
        this._bridgeTxnsV1 = bridgeTxnV1
    }
    _lastTxnHash: string = "";

       
    /**
     * @method listDepositTransaction
     * @param limit 
     * @param starthash 
     * @returns 
     * @description returns the list of all deposit transaction hash
     */
    public async listBridgeDepositTransaction( starthash:string,endhash:string ,take:number  ):Promise<PartialBridgeTxn[]> {
        return new Promise(async(resolve, reject) =>{
            try {

                const txnList = this.listDepositTransactionHandler(starthash,endhash,take)
                resolve(txnList)

            } catch (err) {
                reject(err)
            }
        })
    }

    /**
     * @method listDepositTransactionHandler
     * @param address 
     * @param options 
     * @returns list of  partialBridgeTransaction
     */
    private async listDepositTransactionHandler(beginAt:string,endAt:string,take:number):Promise<PartialBridgeTxn[]>  {
        return new Promise(async (resolve,reject) =>{
            try{
        const address = this._bridgeTxnsV1?.getGlitterAccountAddress(SolanaProgramId.BridgeProgramId)
            if(!address) throw new Error("address not defined")   ;
            if(!this._client) throw new Error("Solana Client Not Defined");

            const DepositPubKey = new PublicKey(address); 
            let partialbridgeTxnList:PartialBridgeTxn[] = [];   
            let lastTxnHash = "";
            let depositNote:Routing|undefined;
            const signatures: string[] = [];

            let before =beginAt; 
            let until = endAt;
               
            let count =0; 
            
              const newSignatures = await this._client.getSignaturesForAddress(
                DepositPubKey ,
                {
                  limit: take,
                  before: before || undefined,
                  until: until || undefined,
                }
              );
              count+=newSignatures.length;
              signatures.push(...newSignatures.map((signature) => signature.signature));
        
              for (let i = signatures.length - 1; i >= 0; i--) {
                lastTxnHash = signatures[i];
                let transaction;
                try {
                  transaction = await this._client.getTransaction(lastTxnHash);
                } catch(err) {
                //   transaction = await this._client.getTransaction(lastTxnHash, {
                //     maxSupportedTransactionVersion: 0
                //   });
                console.log(err)
                }
          
                if (!transaction) {
                  break;
                }
                for (let i = 0; i < transaction.transaction.message.instructions.length; i++) {
                  const data_bytes = (bs58.decode(transaction.transaction.message.instructions[i].data) || "{}");
                  try {
                    const object = JSON.parse(Buffer.from(data_bytes).toString('utf8'))
                    if (object.system && object.date) {
                      depositNote = object;
                    }
                    let partialBtxn:PartialBridgeTxn =  {
                        txnID:signatures[i],
                        txnType:TransactionType.Deposit,
                        // routing:
    
                    }; 
                partialbridgeTxnList.push(partialBtxn)
                  } catch { }
              }
              lastTxnHash = signatures[i]
            
              }

            this._lastTxnHash = lastTxnHash;
            resolve(partialbridgeTxnList.reverse())
            } catch(err){
                reject(err)    
            }
        })
    }

    private async listusdcDepositTransactionHandler(beginAt:string,endAt:string,take:number):Promise<PartialBridgeTxn[]>  {
        return new Promise(async (resolve,reject) =>{
            try{
        const address = this._bridgeTxnsV1?.getGlitterAccountAddress(SolanaProgramId.BridgeProgramId)
            if(!address) throw new Error("address not defined")   ;
            if(!this._client) throw new Error("Solana Client Not Defined");

            const DepositPubKey = new PublicKey(address); 
            let partialbridgeTxnList:PartialBridgeTxn[] = [];   
            let lastTxnHash = "";
            let depositNote:Routing|undefined;
            const signatures: string[] = [];

            let before =beginAt; 
            let until = endAt;
               
            let count =0; 
            
              const newSignatures = await this._client.getSignaturesForAddress(
                DepositPubKey ,
                {
                  limit: take,
                  before: before || undefined,
                  until: until || undefined,
                }
              );
              count+=newSignatures.length;
              signatures.push(...newSignatures.map((signature) => signature.signature));
        
              for (let i = signatures.length - 1; i >= 0; i--) {
                lastTxnHash = signatures[i];
                let transaction;
                try {
                  transaction = await this._client.getTransaction(lastTxnHash);
                } catch(err) {
                //   transaction = await this._client.getTransaction(lastTxnHash, {
                //     maxSupportedTransactionVersion: 0
                //   });
                console.log(err)
                }
          
                if (!transaction) {
                  break;
                }
                for (let i = 0; i < transaction.transaction.message.instructions.length; i++) {
                  const data_bytes = (bs58.decode(transaction.transaction.message.instructions[i].data) || "{}");
                  try {
                    const object = JSON.parse(Buffer.from(data_bytes).toString('utf8'))
                    if (object.system && object.date) {
                      depositNote = object;
                    }
                    let partialBtxn:PartialBridgeTxn =  {
                        txnID:signatures[i],
                        txnType:TransactionType.Deposit,
                        // routing:
    
                    }; 
                partialbridgeTxnList.push(partialBtxn)
                  } catch { }
              }
              lastTxnHash = signatures[i]
            
              }

            this._lastTxnHash = lastTxnHash;
            resolve(partialbridgeTxnList.reverse())
            } catch(err){
                reject(err)    
            }
        })
    }

    private async listusdcReleaseTransactionHandler(beginAt:string,endAt:string,take:number):Promise<PartialBridgeTxn[]>  {
        return new Promise(async (resolve,reject) =>{
            try{
        const address = this._bridgeTxnsV1?.getGlitterAccountAddress(SolanaProgramId.BridgeProgramId)
            if(!address) throw new Error("address not defined")   ;
            if(!this._client) throw new Error("Solana Client Not Defined");

            const DepositPubKey = new PublicKey(address); 
            let partialbridgeTxnList:PartialBridgeTxn[] = [];   
            let lastTxnHash = "";
            let depositNote:Routing|undefined;
            const signatures: string[] = [];

            let before =beginAt; 
            let until = endAt;
               
            let count =0; 
            
              const newSignatures = await this._client.getSignaturesForAddress(
                DepositPubKey ,
                {
                  limit: take,
                  before: before || undefined,
                  until: until || undefined,
                }
              );
              count+=newSignatures.length;
              signatures.push(...newSignatures.map((signature) => signature.signature));
        
              for (let i = signatures.length - 1; i >= 0; i--) {
                lastTxnHash = signatures[i];
                let transaction;
                try {
                  transaction = await this._client.getTransaction(lastTxnHash);
                } catch(err) {
                //   transaction = await this._client.getTransaction(lastTxnHash, {
                //     maxSupportedTransactionVersion: 0
                //   });
                console.log(err)
                }
          
                if (!transaction) {
                  break;
                }
                for (let i = 0; i < transaction.transaction.message.instructions.length; i++) {
                  const data_bytes = (bs58.decode(transaction.transaction.message.instructions[i].data) || "{}");
                  try {
                    const object = JSON.parse(Buffer.from(data_bytes).toString('utf8'))
                    if (object.system && object.date) {
                      depositNote = object;
                    }
                    let partialBtxn:PartialBridgeTxn =  {
                        txnID:signatures[i],
                        txnType:TransactionType.Release,
                        // routing:
    
                    }; 
                partialbridgeTxnList.push(partialBtxn)
                  } catch { }
              }
              lastTxnHash = signatures[i]
            
              }

            this._lastTxnHash = lastTxnHash;
            resolve(partialbridgeTxnList.reverse())
            } catch(err){
                reject(err)    
            }
        })
    }




}