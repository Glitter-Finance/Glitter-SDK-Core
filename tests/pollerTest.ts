import {  BridgeTokens, Sleep } from "../src/lib/common";
import { GlitterEnvironment } from "../src/lib/configs/config";
import { GlitterBridgeSDK } from "../src/GlitterBridgeSDK";
import { BridgeNetworks } from "../src/lib/common/networks/networks";

run();

async function run() {
  const result = await TransactionListTest();
  console.log(result);
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
        const new_list = await solana?.listBridgetransactions(take,undefined,undefined); 
        if(!new_list){
          throw new Error("new_list undefiend")
        }
        console.log("\n"); 
        console.log(new_list)
  
        console.log("===========================||=============================")
        Sleep(30000) // 30 sec sleep 
  
        const endAt = new_list[0].txnID
        const new_list_before = await solana?.listBridgetransactions(take,undefined,endAt); 
        if(!new_list_before){
          throw new Error("new_list_before undefiend")
        }
        console.log("\n"); 
        console.log(new_list_before)
  
  
        console.log("===========================||=============================")
        console.log("USDC DEPOSIT LIST")
  
        Sleep(30000) // 30 sec sleep 
  
        const usdc_deposit_list = await solana?.getUSDCDepositTransactions(take,undefined,undefined)
        if(!usdc_deposit_list){
          throw new Error("usdc_deposit_list undefiend")
        }
        console.log("\n"); 
        console.log(usdc_deposit_list)
  
  
        console.log("===========================||=============================")
        console.log("USDC RELEASE LIST")
  
        Sleep(30000) // 30 sec sleep 
  
        const usdc_release_list = await solana?.getUSDCDReleaseTransactions(take,undefined,undefined)
        if(!usdc_release_list){
          throw new Error("usdc_release_list undefiend")
        }
        console.log("\n"); 
        console.log(usdc_deposit_list)
      }catch(err){
  
      }
    })
  }
  
  