import {  BridgeTokens, Sleep } from "../src/lib/common";
import { GlitterEnvironment } from "../src/lib/configs/config";
import { GlitterBridgeSDK } from "../src/GlitterBridgeSDK";
import { BridgeNetworks } from "../src/lib/common/networks/networks";

run();

async function run() {
  const result = await AlgoPollerTest();
  console.log(result);
}

async function SolanaPollerTest() {
      // Load SDK
      const sdk = new GlitterBridgeSDK()
      .setEnvironment(GlitterEnvironment.mainnet)
      .connect([BridgeNetworks.solana]);
      /**
       * 
       * CURRENT ISSUES 
       * 1-SOME SOLANA TXNS AMOUNT COULDN'T CONVERTED TO BIGINT BEACUSE THEY WERE FLOAT, EVEN AFTER PRECISE !!
       * 
       */
      const solana = sdk.solana; 
      const list_partial_txn = await solana?.getPartialBridgeTransactions(100);
        if(!list_partial_txn){
          throw new Error("list_void in undefined")
        }
        list_partial_txn.forEach((data) =>{
          console.log(data)
        })
      Sleep(10000)
      console.log("\n")
      console.log("==========================||========================");
      console.log("listUsdcPartialDepositTransactions")
      const list_usdc_deposit = await solana?.getUsdcDepositPartialTransactions(100)
      if(!list_usdc_deposit) throw new Error("LIST IS UNDEFINED");
      console.log("list_usdc_deposit_length",list_usdc_deposit.length)
      console.log("\n")
      list_usdc_deposit.forEach((data)=>{
        console.log(data)
      })

      Sleep(30000)
      console.log("\n")
      console.log("==========================||========================");
      console.log("listUsdcReleasePartialTransactions")
      const list_usdc_release = await solana?.getUsdcReleasePartialTransactions(100)
      if(!list_usdc_release) throw new Error("LIST IS UNDEFINED");
      console.log("list_usdc_release_length",list_usdc_release.length)
      console.log("\n")
      list_usdc_release.forEach((data)=>{
        console.log(data)
      })      
      console.log("finalized");
}

async function AlgoPollerTest() {

  /**
       * 
       * CURRENT ISSUES 
       * 1-USDC DEPOSIT AND RELEASE GIVE TXNS IN NEW TO OLD MANNER 
       * 2-SO IF QUERIED FOR NEXT ROUND GIVES NO TXNS IN THAT ROUND 
       * 
       */
        // Load SDK
        const sdk = new GlitterBridgeSDK()
        .setEnvironment(GlitterEnvironment.mainnet)
        .connect([BridgeNetworks.algorand]);
        //Reference variables locally for ease of use
        const algorandAccounts = sdk.algorand?.accounts;
        const algorand = sdk.algorand;
        const list_partial_txn = await algorand?.getPartialBridgeTransactions();
        if(!list_partial_txn){
          throw new Error("list_void in undefined")
        }
        list_partial_txn.forEach((data) =>{
          console.log(data)
        })
      Sleep(30000)
      console.log("\n")
      console.log("==========================||========================");
      console.log("listUsdcPartialDepositTransactions")        
      const lastRound = await algorand?.getPollerLastRound();
      if(!lastRound) throw new Error("last round is undefined");
      console.log("LASTROUNDINTEST",lastRound)  
      const list_partial_txn_2 = await algorand?.getPartialBridgeTransactions(lastRound);
      if(!list_partial_txn_2){
        throw new Error("list_void_ in undefined")
      }

      list_partial_txn_2.forEach((data) =>{
        console.log(data)
      })
      Sleep(30000)
      console.log("\n")
      console.log("==========================||========================");
      console.log("listUsdcPartialDepositTransactions")
      const list_usdc_deposit = await algorand?.getUsdcDepositPartialTransactions()
      if(!list_usdc_deposit) throw new Error("LIST IS UNDEFINED");
      console.log("list_usdc_deposit_length",list_usdc_deposit.length)
      console.log("\n")
      list_usdc_deposit.forEach((data)=>{
        console.log(data)
      })
      console.log("==========================||========================");
      console.log("listUsdcDepositWithNewRoundPartialTransactions")
      const lastRound_Deposit = algorand?.getUsdcDepositPolletLastRound(); 
      if(!lastRound_Deposit) throw new Error("lastRound is undefined")
      console.log("lastRound_Deposit",lastRound_Deposit)
      const new_list_deposit = await algorand?.getUsdcDepositPartialTransactions(lastRound_Deposit);
      if(!new_list_deposit) throw new Error("LIST IS UNDEFINED");
      console.log("new_list_deposit_length",new_list_deposit.length)
      console.log("\n")
      new_list_deposit.forEach((data)=>{
        console.log(data)
      })
      console.log("==========================||========================");
      console.log("listUsdcReleasePartialTransactions")
      const list_usdc_release = await algorand?.getUsdcReleasePartialTransactions()
      if(!list_usdc_release) throw new Error("LIST IS UNDEFINED");
      console.log("list_usdc_release_length",list_usdc_release.length)
      console.log("\n")
      list_usdc_release.forEach((data)=>{
        console.log(data)
      })
      console.log("==========================||========================");
      console.log("listUsdcReleaseWithNewRoundPartialTransactions")
      const lastRound_Release = algorand?.getUsdcReleasePolletLastRound(); 
      if(!lastRound_Release) throw new Error("lastRound is undefined")
      console.log("lastRound_Release",lastRound_Release)
      const new_list_release = await algorand?.getUsdcDepositPartialTransactions(lastRound_Release);
      if(!new_list_release) throw new Error("LIST IS UNDEFINED");
      console.log("new_list_release_length",new_list_release.length)
      console.log("\n")
      new_list_release.forEach((data)=>{
        console.log(data)
      })
}

async function TransactionListTest():Promise<boolean> {

    return new Promise(async(resolve,reject) =>{
      try{
  
        // Load SDK
        const sdk = new GlitterBridgeSDK()
        .setEnvironment(GlitterEnvironment.mainnet)
        .connect([BridgeNetworks.algorand, BridgeNetworks.solana]);
    
        const Evmsdk = new GlitterBridgeSDK()
        .setEnvironment(GlitterEnvironment.testnet)
        .connect([BridgeNetworks.Ethereum])
            //Reference variables locally for ease of use
        const algorandAccounts = sdk.algorand?.accounts;
        const solanaAccounts = sdk.solana?.accounts;
        const algorand = sdk.algorand;
        const solana = sdk.solana;  
        const evm = Evmsdk.ethereum;
  
        const asset = BridgeTokens.get("algorand", "algo");
        if(!asset) throw new Error("asset is not Defined");
  
        const evm_usdc_list = await evm?.getUsdcPartialTransactions(8333937);
        if(!evm_usdc_list) throw new Error("not set")
        evm_usdc_list.forEach((data) =>{
          console.log(data)
        })
       
       console.log("TEST")  
       const list = await  algorand?.getPartialBridgeTransactions();
  
       if(!list){
        throw new Error("LIST UNDEFINED")
       }
        list.forEach((data) =>{
  
          console.log(data)
  
        })
  
  
  console.log("=====================||=====================")
  
  const new_list_algorand = await  algorand?.getPartialBridgeTransactions(26646129);
  if(!new_list_algorand){
    throw new Error("LIST UNDEFINED")
   }
   new_list_algorand.forEach((data) =>{
  
      console.log(data)
  
    })
  
  
        console.log("BRIDGE TRANSACTION LIST")
        const take  = 100; 
        const new_list = await solana?.getPartialBridgeTransactions(take,undefined,undefined); 
        if(!new_list){
          throw new Error("new_list undefiend")
        }
        console.log("\n"); 
        console.log(new_list)
  
        console.log("===========================||=============================")
        Sleep(30000) // 30 sec sleep 
  
        const endAt = new_list[0].txnID
        const new_list_before = await solana?.getPartialBridgeTransactions(take,undefined,endAt); 
        if(!new_list_before){
          throw new Error("new_list_before undefiend")
        }
        console.log("\n"); 
        console.log(new_list_before)
  
  
        console.log("===========================||=============================")
        console.log("USDC DEPOSIT LIST")
  
        Sleep(30000) // 30 sec sleep 
  
        const usdc_deposit_list = await solana?.getUsdcDepositPartialTransactions(take,undefined,undefined)
        if(!usdc_deposit_list){
          throw new Error("usdc_deposit_list undefiend")
        }
        console.log("\n"); 
        console.log(usdc_deposit_list)
  
  
        console.log("===========================||=============================")
        console.log("USDC RELEASE LIST")
  
        Sleep(30000) // 30 sec sleep 
  
        const usdc_release_list = await solana?.getUsdcReleasePartialTransactions(take,undefined,undefined)
        if(!usdc_release_list){
          throw new Error("usdc_release_list undefiend")
        }
        console.log("\n"); 
        console.log(usdc_deposit_list)
      }catch(err){
  
      }
    })
  }
  
  