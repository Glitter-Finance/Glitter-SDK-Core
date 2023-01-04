import { config } from "dotenv";
// import { NETWORK } from "../type";
import { Chain, Circle, CircleEnvironments } from "@circle-fin/circle-sdk";
import fs from 'fs';
import algosdk from "algosdk";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
// import {SolanaUtils} from "glitter-bridge-solana-dev/dist/src/utils"

config();


const enum NETWORK {
    TESTNET ="testnet",
    MAINNET ="mainnet"
}


export const bridgeFee = {
  numerator: 50, // 0.5%
  denominator: 10000,
}


export const circleConfig = {
  [NETWORK.TESTNET]: {
    depositAddress: {
      [Chain.Sol]: "95LVMAzn9PDr4wzBDgK37B8Cnz6vRDCh7nxx7SuJooVN",
      [Chain.Algo]: "JBWQUEBU6HX4PMX7I2HHDMQCBANLBBZAMQYPFQUNYFKZPC5VPIKGAM5ETI",      
      [Chain.Eth]: "",
      [Chain.Avax]: "",
      [Chain.Flow]: "",
      [Chain.Hbar]: "",
      [Chain.Matic]: "",
      [Chain.Trx]: "",
      [Chain.Xlm]: "",      
      [Chain.Btc]: "",
    },
    receiverAddress:{
      [Chain.Sol]: "GUsVsb8R4pF4T7Bo83dkzhKeY5nGd1vdpK4Hw36ECbdK",
      [Chain.Algo]: "GUSN5SEZQTM77WE2RMNHXRAKP2ELDM7GRLOEE3GJWNS5BMACRK7JVS3PLE",      
      [Chain.Eth]: "",
      [Chain.Avax]: "",
      [Chain.Flow]: "",
      [Chain.Hbar]: "",
      [Chain.Matic]: "",
      [Chain.Trx]: "",
      [Chain.Xlm]: "",      
      [Chain.Btc]: "",
    },
    feeCollectorAddress:{
      [Chain.Sol]: "EQJgtwM3C89ZoESMW3znTSYiB346VWW25vVD9XrSW8nw",
      [Chain.Algo]: "A2GPNMIWXZDD3O3MP5UFQL6TKAZPBJEDZYHMFFITIAJZXLQH37SJZUWSZQ",      
      [Chain.Eth]: "",
      [Chain.Avax]: "",
      [Chain.Flow]: "",
      [Chain.Hbar]: "",
      [Chain.Matic]: "",
      [Chain.Trx]: "",
      [Chain.Xlm]: "",      
      [Chain.Btc]: "",
    }
  },
  [NETWORK.MAINNET]: {
    depositAddress: {
      [Chain.Sol]: "9i8vhhLTARBCd7No8MPWqJLKCs3SEhrWKJ9buAjQn6EM", 
      [Chain.Algo]: "O7MYJZR3JQS5RYFJVMW4SMXEBXNBPQCEHDAOKMXJCOUSH3ZRIBNRYNMJBQ",      
      [Chain.Eth]: "",
      [Chain.Avax]: "",
      [Chain.Flow]: "",
      [Chain.Hbar]: "",
      [Chain.Matic]: "",
      [Chain.Trx]: "",
      [Chain.Xlm]: "",      
      [Chain.Btc]: "",
    },
    receiverAddress:{
      [Chain.Sol]: "GUsVsb8R4pF4T7Bo83dkzhKeY5nGd1vdpK4Hw36ECbdK",
      [Chain.Algo]: "GUSN5SEZQTM77WE2RMNHXRAKP2ELDM7GRLOEE3GJWNS5BMACRK7JVS3PLE",      
      [Chain.Eth]: "",
      [Chain.Avax]: "",
      [Chain.Flow]: "",
      [Chain.Hbar]: "",
      [Chain.Matic]: "",
      [Chain.Trx]: "",
      [Chain.Xlm]: "",      
      [Chain.Btc]: "",
    },
    feeCollectorAddress:{
      [Chain.Sol]: "EQJgtwM3C89ZoESMW3znTSYiB346VWW25vVD9XrSW8nw",
      [Chain.Algo]: "A2GPNMIWXZDD3O3MP5UFQL6TKAZPBJEDZYHMFFITIAJZXLQH37SJZUWSZQ",      
      [Chain.Eth]: "",
      [Chain.Avax]: "",
      [Chain.Flow]: "",
      [Chain.Hbar]: "",
      [Chain.Matic]: "",
      [Chain.Trx]: "",
      [Chain.Xlm]: "",      
      [Chain.Btc]: "",
    }
  }
}

export const solanaConfig = {
  [NETWORK.TESTNET]: {
    usdcAddress: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    memoProgram: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
  },
  [NETWORK.MAINNET]: {
    usdcAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    memoProgram: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
  }
}

export const algorandConfig = {
  [NETWORK.TESTNET]: {
    indexer: "https://algoindexer.testnet.algoexplorerapi.io",
    usdcAssetId: 10458941,
  },
  [NETWORK.MAINNET]: {
    indexer: "https://algoindexer.algoexplorerapi.io",
    usdcAssetId: 31566704,
  }
}

// export const getLogFile = () => __dirname + "/log.txt";

// export const getLastTransferId = () => {
//   const lastTransferIdFile = __dirname + "/lastTransferId";

//   return fs.readFileSync(lastTransferIdFile).toString() || "";
// }

// export const saveLastTransferId = (lastTransferId?: string) => {
//   const lastTransferIdFile = __dirname + "/lastTransferId";

//   fs.writeFile(
//     lastTransferIdFile,
//     (lastTransferId || "").toString(),
//     function (err) {
//       if (err) throw err;
//     }
//   );
// }


export const getNetwork = ():NETWORK => {
  switch (process.env.NETWORK) {
    case "testnet":
      return NETWORK.TESTNET;
    case "mainnet":
      return NETWORK.MAINNET;
    default:
      return NETWORK.TESTNET;
  }
};

export const getChain = (chainName:string):Chain|undefined => {
  switch (chainName.toLowerCase()) {
    case "solana":
      return Chain.Sol;
    case "algorand":
      return Chain.Algo;
    default:
      return undefined;
  }
}
export const getReceiverAddress = (chainName:string):string|undefined => {
  let chain = getChain(chainName);
  if (!chain) return undefined;
  let network = getNetwork();
  return circleConfig[network].receiverAddress[chain];
}
export const getFeeCollectorAddress = (chainName:string):string|undefined => {
  let chain = getChain(chainName);
  if (!chain) return undefined;
  let network = getNetwork();
  return circleConfig[network].feeCollectorAddress[chain];
}

export const getAlgorandClient = () => {
  if (getNetwork() == NETWORK.TESTNET) {
    return new algosdk.Algodv2(
      "",
      "https://node.testnet.algoexplorerapi.io",
      "",
    );
  }
  else {
    return new algosdk.Algodv2(
      "",
      "https://node.algoexplorerapi.io/",
      "",
    );
  }
}

export const getSolanaClient = () => {
  if (getNetwork() == NETWORK.TESTNET) {
    return new Connection(clusterApiUrl("devnet", true), "confirmed");
  }
  else {
    return new Connection(clusterApiUrl("mainnet-beta", true), "confirmed");
  }
}