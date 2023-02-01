import BeeQueue from "bee-queue";
import { BridgeNetworks,  EvmConnect, RoutingString } from "glitter-bridge-sdk-dev/dist";
import { GlitterSingleton } from "../lib/Glitter";
import * as util from "util";
import {  NetworkIdentifiers } from "glitter-bridge-sdk-dev/dist/lib/common/networks/networks";
import { PartialBridgeTxn } from "glitter-bridge-sdk-dev/dist/lib/common/transactions/transactions";
import { PartialBridgeTxnData } from "../entities/BridgePartialTxnData";
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { JOB_QUEUES } from "./config";
import { EvmRawUSDCTxn } from "../lib/Handlers/RawTxnHandler";

export const processEvmUSDCTxn = async (job: BeeQueue.Job<EvmRawUSDCTxn>) => {

    //Destructure Inputs
    const { data } = job;
    const txnID = data.txnID;
    const network = data.network;
    const logger = JOB_QUEUES.evm_partial_usdc_txn.logger;

    //Get Database
    const partialTxnsDb = AppDataSource.getRepository(PartialBridgeTxnData); 

    //Log
    const BASE_LOG = `New ${network} Txn: ${data.txnID}`;
    logger.log("info", BASE_LOG);

    //Check if txn is already processed
    const exitingTxn = await partialTxnsDb.findOne({
        where: { txnID: txnID },
    });
    if (exitingTxn) {
        /** Do not process an existing record */
        /** Does not need further processing */
        const errorMessage = `${BASE_LOG} already exists, no further processing.`;
        logger.log("info", errorMessage);
        return true;
    }    

    //Get Evm Connection
    let connect: EvmConnect | undefined;
    switch (network) {
        case BridgeNetworks.Ethereum:
            connect = GlitterSingleton.sdk?.ethereum;
            break;
        case BridgeNetworks.Polygon:
            connect = GlitterSingleton.sdk?.polygon;
            break;
        case BridgeNetworks.Avalanche:
            connect = GlitterSingleton.sdk?.avalanche;
            break;
        default:
            throw new Error("Invalid Network");
    }    

    //Get PartialTxn
    let partialTxn = await connect?.getUSDCPartialTxn(txnID);
    if (!partialTxn) {
        throw new Error("Invalid TxnID");
    }
    console.log("Partial Txn: ", util.inspect(partialTxn, false, null, true /* enable colors */) );

    //Save
    await saveTxn(partialTxnsDb, partialTxn);

    return true;
}

async function saveTxn(partialTxnsDb: Repository<PartialBridgeTxnData>,
    newTxn: PartialBridgeTxn) {

    //Convert partialTxn to database object
    const newTxnData = new PartialBridgeTxnData();
    newTxnData.txnID = newTxn.txnID;
    newTxnData.txnIDHashed = newTxn.txnIDHashed || "";
    newTxnData.bridgeType = newTxn.bridgeType || "";
    newTxnData.timestamp = newTxn.txnTimestamp || new Date();
    newTxnData.txnType = newTxn.txnType;
    newTxnData.chainStatus = newTxn.chainStatus || "";
    newTxnData.network = newTxn.network || "";
    newTxnData.tokenSymbol = newTxn.tokenSymbol || "";
    newTxnData.address = newTxn.address || "";
    newTxnData.units = newTxn.units?.toString() || "";
    newTxnData.amount = newTxn.amount || 0;
    newTxnData.routing = (newTxn.routing ? RoutingString(newTxn.routing) : "");

    await AppDataSource.transaction(async (eM) => {
        await partialTxnsDb.save(newTxnData);
    });
}


export function getNetworkId(network: BridgeNetworks): number {
    let netIds = Object.entries(NetworkIdentifiers);
    let _network = netIds.find((n) => n[1] === network);
    if (!_network) throw new Error("Unable to identify network");

    return parseInt(_network[0]);
}