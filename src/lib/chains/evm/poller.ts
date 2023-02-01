
import { EvmNetworkConfig } from "glitter-bridge-sdk-dev/dist";
import winston from "winston";
import { BridgeNetworks } from "../../common/networks/networks";
import { PartialBridgeTxn } from "../../common/transactions/transactions";
import { EvmConnect } from "./connect";
import axios from 'axios';

//Local Logger
const MAX_TXNS_PER_POLL = 5;

export class EvmPoller{
  //Local Variables
  private _logger: winston.Logger | undefined;
  private _network:BridgeNetworks;
  private _delay: number = 5000;
  private _apiKey: string | undefined;
  private _apiURL: string | undefined;
  private _config:EvmNetworkConfig|undefined
    _lastBlock:number|undefined;
    _lastTxn:string|undefined;
    constructor(config:EvmNetworkConfig,network:BridgeNetworks){
        this._config = config;
        this._network = network;
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

    
async UsdcPoller(lastBlockNumber?:number, lastTxnString?:string):Promise<PartialBridgeTxn[]>{
        
    return new Promise(async (resolve, reject) =>{
        try{
         if(!this._config) throw new Error("CONFIG NOT SET")

            //get contract address
            let bridgeAddress = this._config.bridge;
            //console.log("Poller Address: " + pollerAddress)

            //Last Block
            let lastBlock = lastBlockNumber==undefined?this._lastBlock:lastBlockNumber;
            let lastTxn = lastTxnString==undefined?this._lastTxn:lastTxnString;

            let url = this._apiURL + `/api?module=account&action=txlist&address=${bridgeAddress}&startblock=${lastBlock}&offset=${MAX_TXNS_PER_POLL}&page=1&sort=asc&apikey=` + this._apiKey;

            //Request Data
            let response = await axios.get(url);
            console.log("RESPONCE", response)

            let resultData = JSON.parse(JSON.stringify(response.data));
            let results = resultData.result;
            console.log("RESULT", results)
            
            let newLastBlock = lastBlock;
            let newLastTxn = lastTxn;

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
            }
        }

            //update the state 
            this._lastBlock = newLastBlock; 
            this._lastTxn = newLastTxn; 

    }catch(err){


            }
        })
    }
}


