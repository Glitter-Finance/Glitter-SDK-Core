
import { EvmNetworkConfig } from "glitter-bridge-sdk-dev/dist";
import winston from "winston";
import { BridgeNetworks, NetworkIdentifiers } from "../../common/networks/networks";
import { BridgeType, ChainStatus, PartialBridgeTxn, TransactionType } from "../../common/transactions/transactions";
import axios from 'axios';
import { Routing, ValueUnits } from "../../common";
import { BridgeDepositEvent, BridgeReleaseEvent, TransferEvent } from "./types";
import { EvmBridgeEventsParser } from "./events";
import { ethers, providers } from "ethers";
import { DeserializeEvmBridgeTransfer } from "./serde";


const DEFAULT_MAX_TXNS_PER_POLL = 5;

export class EvmPoller{
  //Local Variables
  private _logger: winston.Logger | undefined;
  private _network:BridgeNetworks;
  private _delay: number = 5000;
  private _rpcProvider: providers.BaseProvider;
  private _apiKey: string | undefined;
  private _apiURL: string | undefined;
  private _config:EvmNetworkConfig|undefined = undefined
    _lastBlock:number|undefined =0;
    _lastTxn:string|undefined='';
    constructor(config:EvmNetworkConfig,network:BridgeNetworks,provider:providers.BaseProvider){
        this._config = config;
        this._network = network;
        this._rpcProvider = provider
        //Setup local
        switch (network) {
            case BridgeNetworks.Ethereum:
                this._apiKey = process.env.ETH_API_KEY;
                this._apiURL = process.env.ETH_API_URL;
                break;
            case BridgeNetworks.Avalanche:
                this._apiKey = process.env.AVAX_API_KEY;
                this._apiURL = process.env.AVAX_API_URL;
                break;
            case BridgeNetworks.Polygon:
                this._apiKey = process.env.POLYGON_API_KEY;
                this._apiURL = process.env.POLYGON_API_URL;
                break;
            default:
                throw new Error("Invalid Network");
        }
    }

 /**
  * @method Usdcpoller
  * @param lastBlockNumber
  * @param lastTxnString
  * @param limit
  * @returns PartialBridgeTransaction List  
  */
 async UsdcPoller(lastBlockNumber?:number, lastTxnString?:string,limit?:number):Promise<PartialBridgeTxn[]>{
        
    return new Promise(async (resolve, reject) =>{
        try{
         if(!this._config) throw new Error("CONFIG NOT SET")
         if(!this._config) throw new Error("CONFIG NOT SET")
         
       //get contract address
       let bridgeAddress = this._config['bridge'].toLowerCase();
       let MAX_TXNS_PER_POLL:number =0;
       if(limit!=undefined)   {
            MAX_TXNS_PER_POLL = limit
       }else {
        MAX_TXNS_PER_POLL = DEFAULT_MAX_TXNS_PER_POLL
       }
       let partialBTxn:PartialBridgeTxn[] = [];
       //Last Block
       let lastBlock = lastBlockNumber==undefined?this._lastBlock:lastBlockNumber;
       let lastTxn = lastTxnString==undefined?this._lastTxn:lastTxnString;
       let url = this._apiURL + `/api?module=account&action=txlist&address=${bridgeAddress}&startblock=${lastBlock}&offset=${MAX_TXNS_PER_POLL}&page=1&sort=asc&apikey=` + this._apiKey;
       let newLastBlock = lastBlock;
       let newLastTxn = lastTxn;
       try{
                   //Request Data
                   let response = await axios.get(url);

                   let resultData = JSON.parse(JSON.stringify(response.data));
                   let results = resultData.result;
                   for (let index = 0; index < results.length; index++) {
                   const txn = results[index];
                   const hash = txn.hash;
                   const blockNumber = txn.blockNumber;
                   if(!newLastBlock)  throw new Error("newLastBlock us not Set");
                   if (blockNumber > newLastBlock) newLastBlock = blockNumber;
                   //Check if we're caught up
                   if (hash == lastTxn) {
                   } else {
                       //create job
                       newLastTxn = hash;
                       // this.CreateEvmPartialTxn(hash);
                       let partialTxn = await this.getUSDCPartialTxn(hash);
                       if (!partialTxn) {
                        throw new Error("Invalid TxnID");
                      }
                      partialBTxn.push(partialTxn)
                   }
                   }
               }catch(err){
                       console.log("ERROR",err)
               }

               //update the state 
               this._lastBlock = newLastBlock; 
               this._lastTxn = newLastTxn; 

                    resolve(partialBTxn)

    }catch(err){

                 reject(err)   
            }
        })
    }

/**
   * Parse transaction receipts to retrieve
   * bridge transfer data
   * @param {string} txHash transaction hash of deposit or release event on evm chain
   * @returns {Array<TransferEvent | BridgeDepositEvent | BridgeReleaseEvent>}
   */
async parseLogs(
    txHash: string
  ): Promise<Array<TransferEvent | BridgeDepositEvent | BridgeReleaseEvent>> {
    try {
      let events: Array<
        TransferEvent | BridgeDepositEvent | BridgeReleaseEvent
      > = [];
      const parser = new EvmBridgeEventsParser();
      const transactionReceipt =
        await this._rpcProvider.getTransactionReceipt(txHash);

      for (const log of transactionReceipt.logs) {
        const deposit = parser.parseDeposit([log]);
        const release = parser.parseRelease([log]);
        const transfer = parser.parseTransfer([log]);

        if (deposit) events.push(deposit);
        if (release) events.push(release);
        if (transfer) events.push(transfer);
      }

      return events;
    } catch (error: any) {
      return Promise.reject(error.message);
    }
  }
  async getTimeStamp(txHash: string): Promise<number> {
    try {
      const transactionReceipt = await this._rpcProvider.getTransactionReceipt(txHash);
      const blockNumber = transactionReceipt.blockNumber;
      const block = await this._rpcProvider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      return timestamp;
    } catch (error: any) {
      return Promise.reject(error.message);
    }
  }
  async getTxnStatus(txHash: string): Promise<ChainStatus> {
    try {
      const txnReceipt = await this._rpcProvider.getTransactionReceipt(txHash);
      let returnValue: ChainStatus = ChainStatus.Unknown;
      if (txnReceipt.status === 1) {
        returnValue = ChainStatus.Completed;
      } else if (txnReceipt.status === 0) {
        returnValue = ChainStatus.Failed;
      } else {
        returnValue = ChainStatus.Pending;
      }
      return Promise.resolve(returnValue);
    } catch (error: any) {
      return Promise.reject(error.message);
    }
  }

  getChainFromID(chainId: number): BridgeNetworks | undefined {
    try {

      let returnValue = Object.entries(NetworkIdentifiers).find(
        ([_id, _network]) => {
          return Number(_id) === chainId;
        }
      );
      return (returnValue ? returnValue[1] : undefined);

    } catch (error: any) {
      return undefined;
    }
  }

  public async getUSDCPartialTxn(txnID: string): Promise<PartialBridgeTxn> {

    //USDC decimals
    let decimals = 6;

    //Get logs
    const logs = await this.parseLogs(txnID);

    //Get Timestamp
    const timestamp_s = await this.getTimeStamp(txnID);
    const timestamp = new Date(timestamp_s * 1000);

    //Check deposit/transfer/release
    const releaseEvent = logs?.find(
      (log) => log.__type === "BridgeRelease"
    ) as BridgeReleaseEvent;

    const depositEvent = logs?.find(
      (log) => log.__type === "BridgeDeposit"
    ) as BridgeDepositEvent;

    const transferEvent = logs?.find(
      (log) => log.__type === "Transfer"
    ) as TransferEvent;

    //Get transaction type
    let type: TransactionType;
    if (releaseEvent) {
      type = TransactionType.Release;
    } else if (depositEvent) {
      type = TransactionType.Deposit;
    } else {
      type = TransactionType.Unknown;
    }

    //Get return object
    let returnTxn: PartialBridgeTxn = {
      txnID: txnID,
      txnIDHashed: this.getTxnHashed(txnID),
      bridgeType: BridgeType.USDC,
      txnType: type,
      txnTimestamp: timestamp,
      chainStatus: await this.getTxnStatus(txnID),
      network: this._network,
      tokenSymbol: "usdc",
    };

    //Get txn params
    if (type === TransactionType.Deposit && transferEvent) {
      returnTxn.address = transferEvent.from;
      returnTxn.units = BigInt(depositEvent.amount.toString());
      returnTxn.amount = ValueUnits.fromUnits(BigInt(returnTxn.units), decimals).value;

      //Get Routing
      let toNetwork = this.getChainFromID(depositEvent.destinationChainId);
      let toAddress = toNetwork ? DeserializeEvmBridgeTransfer.deserializeAddress(toNetwork, depositEvent.destinationWallet) : "";
      let routing: Routing = {
        from: {
          network: this._network,
          address: transferEvent.from,
          token: "usdc",
          txn_signature: txnID,
        },
        to: {
          network: toNetwork?.toString() || "",
          address: toAddress,
          token: "usdc"
        },
        amount: returnTxn.amount,
        units: returnTxn.units.toString(),
      };
      returnTxn.routing = routing;

    } else if (type === TransactionType.Release && transferEvent) {

      returnTxn.address = releaseEvent.destinationWallet;
      returnTxn.units = BigInt(releaseEvent.amount.toString());
      returnTxn.amount = ValueUnits.fromUnits(BigInt(returnTxn.units), decimals).value;

      //Get Routing
      let routing: Routing = {
        from: {
          network: "",
          address: "",
          token: "usdc",
          txn_signature_hashed: releaseEvent.depositTransactionHash,
        },
        to: {
          network: this._network,
          address: returnTxn.address,
          token: "usdc",
          txn_signature: txnID,
        },
        amount: returnTxn.amount,
        units: returnTxn.units.toString(),
      };
      returnTxn.routing = routing;

    }
    return Promise.resolve(returnTxn);
  }

  public getTxnHashed(txnID: string): string {
    return ethers.utils.keccak256(txnID);
  }

}




