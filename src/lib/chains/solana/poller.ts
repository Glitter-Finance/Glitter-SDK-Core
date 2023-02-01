import { Connection, PublicKey, TransactionResponse } from "@solana/web3.js";
import bs58 from "bs58";
import {  ValueUnits } from "../../common";
import { Routing } from "../../common/routing/routing";
import { PartialBridgeTxn, TransactionType } from "../../common/transactions/transactions";
import { SolanaProgramId } from "./config";
import { SolanaBridgeTxnsV1 } from "./txns/bridge";
import { deserialize } from "borsh";
import algosdk from "algosdk";
import { DepositNote } from "./utils";

export class SolanaPoller{

    private _client:Connection;
    private _bridgeTxnsV1: SolanaBridgeTxnsV1 | undefined = undefined;
    
    constructor(client:Connection, bridgeTxnV1:SolanaBridgeTxnsV1 ){
        this._client = client
        this._bridgeTxnsV1 = bridgeTxnV1
    }
    _lastTxnHash: string = "";
    _lastTxnHashUsdcDeposit:string ="";
    _lastTxnHashUsdcRelease:string = "";
       
    /**
     * @method listDepositTransaction
     * @param limit 
     * @param starthash 
     * @returns 
     * @description returns the list of all deposit transaction hash
     */
    public async listBridgeTransaction( take:number, starthash?:string,endhash?:string   ):Promise<PartialBridgeTxn[]> {
        return new Promise(async(resolve, reject) =>{
            try {

                const txnList = this.listBridgeTransactionHandler(take,starthash,endhash)
                resolve(txnList)

            } catch (err) {
                reject(err)
            }
        })
    }


 /**
  * 
  * Lists bridge transaction handler
  * @param take 
  * @param [beginAt] 
  * @param [endAt] 
  * @returns bridge transaction handler 
  */
 private async listBridgeTransactionHandler(take:number,beginAt?:string,endAt?:string):Promise<PartialBridgeTxn[]>  {
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
            let before =endAt; 
            let until = beginAt ;
              /**
               * startHash = until 
               * endAt = before
               */
              const newSignatures = await this._client.getSignaturesForAddress(
              DepositPubKey ,
              {
                limit: take,
                before: before || undefined,
                until: until || undefined,
              }
            );
            signatures.push(...newSignatures.map((signature) => signature.signature));
            const RevSignatures = signatures.reverse();
            const chunk = await this._client.getTransactions(RevSignatures);
            for(let i=0; i<chunk.length;i++){
              const txn = chunk[i]!;
                let l = chunk[i]!.transaction.message.instructions.length
              const txnID = RevSignatures[i];
                let partialBtxn:PartialBridgeTxn ={
                txnID:txnID,
                txnType:TransactionType.Unknown,
              };  
              const txnData = chunk[i]!.transaction.message.instructions[0].data;
              let data_bytes = bs58.decode(txnData);
              if (Number(data_bytes[0]) === 10) {
              depositNote = this.solDeposit(txn, data_bytes, txnID);
              partialBtxn.txnID = TransactionType.Deposit
            } else if (Number(data_bytes[0]) === 11) {
                partialBtxn.txnType = TransactionType.Finalize;
            } else if (Number(data_bytes[0]) === 13) {
              depositNote = this.SOLRelease(txn, data_bytes, txnID);
              partialBtxn.txnType = TransactionType.Release
            } else if (Number(data_bytes[0]) === 20) {
              depositNote = this.xALGODeposit(txn, data_bytes, txnID);
              partialBtxn.txnType = TransactionType.Deposit
            } else if (Number(data_bytes[0]) === 21) {
                partialBtxn.txnType = TransactionType.Finalize;
            } else if (Number(data_bytes[0]) === 23) {
              depositNote = this.xALGORelease(txn, data_bytes, txnID);
              partialBtxn.txnType = TransactionType.Release
            } else {
                console.log(`Transaction ${txnID} is not a bridge transaction`);
            }
            if(!depositNote){
              partialBtxn 
              }else{
                partialBtxn.routing = depositNote
              }
              partialbridgeTxnList.push(partialBtxn)
              lastTxnHash = RevSignatures[i]
            }
          this._lastTxnHash = lastTxnHash;
          resolve(partialbridgeTxnList)
          } catch(err){
              reject(err)    
          }
      })
  }

/**
 *
 * 
 * Lists usdcdeposit transaction handler
 * @param take 
 * @param [beginAt] 
 * @param [endAt] 
 * @returns usdcdeposit transaction handler 
 */
public async ListUSDCDepositTransactionHandler(take:number,beginAt?:string,endAt?:string):Promise<PartialBridgeTxn[]>  {
      return new Promise(async (resolve,reject) =>{
          try{
            const address = this._bridgeTxnsV1?.getGlitterAccountAddress(SolanaProgramId.UsdcDepositId)
            if(!address) throw new Error("address not defined")   ;
            if(!this._client) throw new Error("Solana Client Not Defined");
            const DepositPubKey = new PublicKey(address); 
            let partialbridgeTxnList:PartialBridgeTxn[] = [];   
            let lastTxnHash = "";
            let depositNote:Routing|undefined;
            const signatures: string[] = [];

            let before =endAt; 
            let until = beginAt ;
            let partialBtxn:PartialBridgeTxn;  
          /**
           * startHash = until 
           * endAt = before
           */
            const newSignatures = await this._client.getSignaturesForAddress(
              DepositPubKey ,
              {
                limit: take,
                before: before || undefined,
                until: until || undefined,
              }
            );
            signatures.push(...newSignatures.map((signature) => signature.signature));
            const RevSignatures = signatures.reverse();
            const chunk = await this._client.getTransactions(RevSignatures);
            for(let i=0; i<chunk.length;i++){
                let l = chunk[i]!.transaction.message.instructions.length
                  for(let j= 0;j< l;j++){
                    if (!chunk[i]||chunk[i]==null) break;
                    const data_bytes = (bs58.decode(chunk[i]!.transaction.message.instructions[j].data) || "{}");
                
                    try {
                      const object = JSON.parse(Buffer.from(data_bytes).toString('utf8'))
                      if (object.system && object.date) {
                        depositNote = object;
                      }
                      } catch(err) { }          
                  }
                  if(!depositNote){
                    partialBtxn =  {
                     txnID:RevSignatures[i],
                     txnType:TransactionType.Deposit,
                   }; 
                   }else{
                      partialBtxn =  {
                       txnID:RevSignatures[i],
                       txnType:TransactionType.Deposit,
                       routing:depositNote
                     }; 
                   }
                   lastTxnHash = RevSignatures[i]
                   partialbridgeTxnList.push(partialBtxn)                
              
            }
            this._lastTxnHashUsdcDeposit = lastTxnHash;
          
            resolve(partialbridgeTxnList)
          } catch(err){
              reject(err)    
          }
      })
  }

  /**
   * 
   * 
   * Optymizedlistusdcs release transaction handler
   * @param take 
   * @param [beginAt] 
   * @param [endAt] 
   * @returns release transaction handler 
   */
  public async ListUSDCReleaseTransactionHandler(take:number,beginAt?:string,endAt?:string):Promise<PartialBridgeTxn[]>  {
    return new Promise(async (resolve,reject) =>{
        try{
          const address = this._bridgeTxnsV1?.getGlitterAccountAddress(SolanaProgramId.UsdcReceiverId)
          if(!address) throw new Error("address not defined")   ;
          if(!this._client) throw new Error("Solana Client Not Defined");

          const DepositPubKey = new PublicKey(address); 
          let partialbridgeTxnList:PartialBridgeTxn[] = [];   
          let lastTxnHash = "";
          let depositNote:Routing|undefined;
          const signatures: string[] = [];

          let before =endAt; 
          let until = beginAt ;
          let partialBtxn:PartialBridgeTxn;  
        /**
         * startHash = until 
         * endAt = before
         */
          const newSignatures = await this._client.getSignaturesForAddress(
            DepositPubKey ,
            {
              limit: take,
              before: before || undefined,
              until: until || undefined,
            }
          );
          signatures.push(...newSignatures.map((signature) => signature.signature));
          const RevSignatures = signatures.reverse();
          const chunk = await this._client.getTransactions(RevSignatures);
          for(let i=0; i<chunk.length;i++){
              let l = chunk[i]!.transaction.message.instructions.length
                for(let j= 0;j< l;j++){
                  if (!chunk[i]||chunk[i]==null) break;
                  const data_bytes = (bs58.decode(chunk[i]!.transaction.message.instructions[j].data) || "{}");
                  try {
                    const object = JSON.parse(Buffer.from(data_bytes).toString('utf8'))
                    if (object.system && object.date) {
                      depositNote = object;
                    }
                    } catch(err) { }          
                }
                if(!depositNote){
                  partialBtxn =  {
                   txnID:RevSignatures[i],
                   txnType:TransactionType.Release,
                 }; 
                 }else{
                    partialBtxn =  {
                     txnID:RevSignatures[i],
                     txnType:TransactionType.Release,
                     routing:depositNote
                   }; 
                 }
                 lastTxnHash = RevSignatures[i]
                 partialbridgeTxnList.push(partialBtxn)                
            
          }
          this._lastTxnHashUsdcRelease = lastTxnHash;
        resolve(partialbridgeTxnList)
        } catch(err){
            reject(err)    
        }
    })

}

/**
 * 
 * 
 * Sols deposit
 * @param txn 
 * @param data_bytes 
 * @param txnID 
 * @returns Sol Deposit Routing 
 */
public solDeposit(txn: TransactionResponse, data_bytes: Uint8Array,txnID:string): Routing {

      let decimals = 9;
      //Set type
      
      // partialTxn.tokenSymbol = "sol";
  
      //Deserialize Instructions
      const instruction = deserialize(
         BridgeInstruction.init_schema,
          BridgeInstruction,
          Buffer.from(data_bytes.slice(1))
      );
  
      //Get Address
      const address = this.getSolanaAddress(txn, true, false);
      // partialTxn.address = address || "";
  
      //Extract Data
      const algoAddress = algosdk
          .encodeAddress(instruction["algo_address"])
          .toString();
      const units = instruction["amount"].toString();
      const units_ = BigInt(units);
      const amount = ValueUnits.fromUnits(BigInt(units), decimals).value;
  
      //Set Fields
       const routing:Routing = {
          from: {
              network: "solana",
              address: address || "",
              token: "sol",
              txn_signature: txnID
          },
          to: {
              network: "algorand",
              address: algoAddress,
              token: "xsol",
              txn_signature: ""
          },
          units: units_,
          amount: amount,
      }
      const bridgeNodeInstructionData:DepositNote = {
        system: JSON.stringify({
          from: routing.from,
          to: routing.to,
          amount: routing.amount,
          units: routing.units?.toString(),
        }),
      };  

      //return
      return routing;
  }

  /**
   * 
   * Solreleases 
   * @param txn 
   * @param data_bytes 
   * @param txnID 
   * @returns solrelease Routing
   */
  public SOLRelease(txn: TransactionResponse, data_bytes: Uint8Array, txnID:string): Routing {

          let decimals = 9;

          //Deserialize Instructions
          const instruction = deserialize(
              BridgeInstruction.release_schema,
              BridgeInstruction,
              Buffer.from(data_bytes.slice(1))
          );

          //Get Address
          const address = this.getSolanaAddress(txn, false, false);
          // partialTxn.address = address || "";

          //Extract Data
          const algoAddress = algosdk
              .encodeAddress(instruction["algo_address"])
              .toString();
          const algoTxId = new TextDecoder().decode(instruction["algo_txn_id"]);
          const units = instruction["amount"].toString();
          const units_ = BigInt(units);
          const amount = ValueUnits.fromUnits(BigInt(units), decimals).value;

          //Set Fields
          const routing = {
              from: {
                  network: "algorand",
                  address: algoAddress,
                  token: "xsol",
                  txn_signature: algoTxId
              },
              to: {
                  network: "solana",
                  address: address || "",
                  token: "sol",
                  txn_signature: txnID
              },
              units:units_,
              amount:amount,
          }

          //return
          return routing;
      }

      /**
       * 
       * Xalgodeposit
       * @param txn 
       * @param data_bytes 
       * @param txnID 
       * @returns algodeposit  Routing
       */
      public xALGODeposit(txn: TransactionResponse, data_bytes: Uint8Array, txnID: string): Routing {
        let decimals = 6;
        //Set type
        //Deserialize Instructions
        const instruction = deserialize(
          BridgeInstruction.init_schema,
          BridgeInstruction,
            Buffer.from(data_bytes.slice(1))
        );

        //Get Address
        const address = this.getSolanaAddress(txn, true, true);
        // partialTxn.address = address || "";

        //Extract Data
        const algoAddress = algosdk
            .encodeAddress(instruction["algo_address"])
            .toString();
        const units = instruction["amount"].toString();
        const units_ = BigInt(units);
        const amount = ValueUnits.fromUnits(BigInt(units), decimals).value;

        //Set Fields
        const routing = {
            from: {
                network: "solana",
                address: address || "",
                token: "algo",
                txn_signature: txnID
            },
            to: {
                network: "algorand",
                address: algoAddress,
                token: "xalgo",
                txn_signature: ""
            },
            units: units_,
            amount: amount,
        }

        //return
        return routing;
      }


      /**
       * 
       * Xalgorelease
       * @param txn 
       * @param data_bytes 
       * @param txnID 
       * @returns algorelease Routing
       */
      public xALGORelease(txn: TransactionResponse, data_bytes: Uint8Array, txnID: string): Routing {
        let decimals = 6;

        //Set type

      const instruction = deserialize(
        BridgeInstruction.release_schema,
        BridgeInstruction,
          Buffer.from(data_bytes.slice(1))
      );

        //Get Address
        const address = this.getSolanaAddress(txn, false, true);
        // partialTxn.address = address || "";

        //Extract Data
        const algoAddress = algosdk
            .encodeAddress(instruction["algo_address"])
            .toString();

        const algoTxId = new TextDecoder().decode(instruction["algo_txn_id"]);

        const units = instruction["amount"].toString();

        const units_ = BigInt(units);
        const amount = ValueUnits.fromUnits(BigInt(units), decimals).value;

        //Set Fields
        const routing = {
            from: {
                network: "algorand",
                address: algoAddress,
                token: "algo",
                txn_signature: algoTxId
            },
            to: {
                network: "solana",
                address: address || "",
                token: "xalgo",
                txn_signature: txnID
            },
            units: units_,
            amount: amount,
        }

        //return
        return routing;
      }


      /**
       * 
       * Gets solana address
       * @param txn 
       * @param isDeposit 
       * @param isToken 
       * @returns solana address 
       */
      public getSolanaAddress(txn: TransactionResponse, isDeposit: boolean, isToken: boolean): string {

        //Parse All Addresses in Transaction
        let address: string = "";
        for (let i = 0; i < txn?.transaction?.message?.accountKeys.length; i++) {

            //Get Address
            address = txn?.transaction?.message?.accountKeys[i].toString();

            let delta: Number = Number(0);
            let preBalance: number | null | undefined = 0;
            let postBalance: number | null | undefined = 0;
            if (isToken) {

                //Check token delta
                preBalance = txn?.meta?.preTokenBalances?.find((obj) => obj.owner?.toLocaleLowerCase() === address.toLocaleLowerCase())?.uiTokenAmount.uiAmount;
                postBalance = txn?.meta?.postTokenBalances?.find((obj) => obj.owner?.toLocaleLowerCase() === address.toLocaleLowerCase())?.uiTokenAmount.uiAmount;
                delta = Number(postBalance || 0) - Number(preBalance || 0);

            } else {

                //Check Sol delta
                preBalance = txn?.meta?.preBalances[i];
                postBalance = txn?.meta?.postBalances[i];
                delta = Number(postBalance || 0) - Number(preBalance || 0);

            }

            if (isDeposit && delta < 0) {
                return address;
            } else if (!isDeposit && delta > 0) {
                return address;
            }
        }

        return "";
      }

      }

/**
 * 
 * Bridge instruction
 * Schemas for deseralisation
 */
class BridgeInstruction {
        readonly algo_address: Uint8Array
        readonly amount: number
        readonly algo_txn_id:Uint8Array
        constructor(properties: { algo_address: Uint8Array, amount: number , algo_txn_id:Uint8Array}) {
          this.algo_address = properties.algo_address
            this.amount = properties.amount;
            this.algo_txn_id = properties.algo_txn_id
        
        }
      
        static release_schema = new Map([
          [
            BridgeInstruction,
              {
                  kind: "struct",
                  fields: [
                      ["algo_txn_id", [52]],
                      ["algo_address", [32]],
                      ["amount", "u64"],
                  ],
              },
          ],
      ]);


      static init_schema = new Map([
        [
          BridgeInstruction,
            {
                kind: "struct",
                fields: [
                    ["algo_address", [32]],
                    ["amount", "u64"],
                ],
            },
        ],
      ]);

  }

