import { GlitterSingleton } from "../Glitter";
import { LoggerFactory } from "../Logger";
import axios from 'axios';
import * as util from 'util';
import { BridgeNetworks, EvmConnect } from "glitter-bridge-sdk-dev/dist";
import winston from "winston";
import { JOB_QUEUES } from "../../jobs/config";
import { EvmRawUSDCTxn } from "../Handlers/RawTxnHandler";

//Local Logger
const MAX_TXNS_PER_POLL = 5;

//Poller Class
export class EvmUSDCPoller {

    //Local Variables
    private logger: winston.Logger | undefined;
    private delay: number = 5000;
    private apiKey: string | undefined;
    private apiURL: string | undefined;
    private connect: EvmConnect | undefined;
    private network: BridgeNetworks|undefined;

    //Start Poller
    public async start(network: BridgeNetworks, delay: number): Promise<void> {
        this.delay = delay;
        this.network = network;

        //Setup local
        switch (network) {
            case BridgeNetworks.Ethereum:
                this.logger = LoggerFactory.buildLogger("eth-poller")
                this.apiKey = process.env.ETH_API_KEY;
                this.apiURL = process.env.ETH_API_URL;
                this.connect = GlitterSingleton.sdk?.ethereum;
                break;
            case BridgeNetworks.Avalanche:
                this.logger = LoggerFactory.buildLogger("avax-poller")
                this.apiKey = process.env.AVAX_API_KEY;
                this.apiURL = process.env.AVAX_API_URL;
                this.connect = GlitterSingleton.sdk?.avalanche;
                break;
            case BridgeNetworks.Polygon:
                this.logger = LoggerFactory.buildLogger("poly-poller")
                this.apiKey = process.env.POLYGON_API_KEY;
                this.apiURL = process.env.POLYGON_API_URL;
                this.connect = GlitterSingleton.sdk?.polygon;
                break;
            default:
                throw new Error("Invalid Network");
        }

        //First Call
        setTimeout(async () => {
            this.poll();
        }, delay);
    }

    //Poll
    public async poll(): Promise<void> {
        console.log(`Polling ${this.network}`);

        //get contract address
        let pollerAddress = this.connect?.usdcBridgePollerAddress;
        //console.log("Poller Address: " + pollerAddress)

        //Last Block
        let lastBlock: number = Number(await GlitterSingleton.redisClient.get(`${this.network}_lastblock`));
        let lastTxn: string = await GlitterSingleton.redisClient.get(`${this.network}_lasttxn`) ||"";

        //build url
        let url = this.apiURL + `/api?module=account&action=txlist&address=${pollerAddress}&startblock=${lastBlock}&offset=${MAX_TXNS_PER_POLL}&page=1&sort=asc&apikey=` + this.apiKey;

        //Request Data
        let response = await axios.get(url);
        let resultData = JSON.parse(JSON.stringify(response.data));
        let results = resultData.result;

        //Add to Jobs
        let newLastBlock = lastBlock;
        let newLastTxn = lastTxn;
        for (let index = 0; index < results.length; index++) {
            const txn = results[index];
            const hash = txn.hash;
            const blockNumber = txn.blockNumber;
            if (blockNumber > newLastBlock) newLastBlock = blockNumber;

            //Check if we're caught up
            if (hash == lastTxn) {
            } else {
                //create job
                newLastTxn = hash;
                this.CreateEvmPartialTxnJob(hash);
            }
        }

        //Update Last Block
        GlitterSingleton.redisClient.set(`${this.network}_lastblock`, newLastBlock);
        GlitterSingleton.redisClient.set(`${this.network}_lasttxn`, newLastTxn);

        //Set Next Poll
        setTimeout(async () => {
            this.poll();
        }, this.delay);
    }

    private CreateEvmPartialTxnJob(txnID: string) {
        this.logger?.info(`Creating ${this.network} Partial Txn Job: ${txnID}`);
        let EvmRawTxn:EvmRawUSDCTxn = {
            network: this.network,
            txnID: txnID,
            usdc: true
        }
        const job = JOB_QUEUES.evm_partial_usdc_txn.queue.createJob(EvmRawTxn);
        job.save();
    }

}

