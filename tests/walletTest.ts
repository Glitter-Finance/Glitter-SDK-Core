import { AlgorandAccount, AlgorandAccounts } from "../src/lib/chains/algorand";
import { SolanaAccount, SolanaAccounts } from "../src/lib/chains/solana";
import { BridgeToken, BridgeTokens, Sleep } from "../src/lib/common";
import { GlitterEnvironment } from "../src/lib/configs/config";
import { GlitterBridgeSDK } from "../src/GlitterBridgeSDK";
import { BridgeNetworks } from "../src/lib/common/networks/networks";
import { SolanaProgramId } from "../src/lib/chains/solana/config";
import { AlgorandProgramAccount } from "../src/lib/chains/algorand/config";
const path = require("path");
const util = require("util");
const fs = require("fs");

run();

async function run() {
  const result = await TransactionListTest();
  console.log(result);
}

async function testGetAddress():Promise<boolean> {

  return new Promise(async (resolve,reject) =>{
    try{
       //Load SDK
       const sdk = new GlitterBridgeSDK()
       .setEnvironment(GlitterEnvironment.mainnet)
       .connect([BridgeNetworks.algorand, BridgeNetworks.solana]);

   //Reference variables locally for ease of use
   const algorandAccounts = sdk.algorand?.accounts;
   const solanaAccounts = sdk.solana?.accounts;
   const algorand = sdk.algorand;
   const solana = sdk.solana;

   console.log("bridgeAddressSolana",solana?.getSolanaBridgeAddress(SolanaProgramId.BridgeProgramId)== "GLittnj1E7PtSF5thj6nYgjtMvobyBuZZMuoemXpnv3G");
   console.log("vestingProgramSolana",solana?.getSolanaBridgeAddress(SolanaProgramId.VestingProgramId)== "EMkD74T2spV3A71qfY5PNqVNrNrpbFcdwMF2TerRMr9n");
   console.log("ownerAddressSolana",solana?.getSolanaBridgeAddress(SolanaProgramId.OwnerId)=="hY5PXHYm58H5KtJW4GrtegxXnpMruoX3LLP6CufHoHj");
   console.log("usdcReceiverSolana",solana?.getSolanaBridgeAddress(SolanaProgramId.UsdcReceiverId)=="GUsVsb8R4pF4T7Bo83dkzhKeY5nGd1vdpK4Hw36ECbdK");
   console.log("usdcDepositSolana",solana?.getSolanaBridgeAddress(SolanaProgramId.UsdcDepositId)=="9i8vhhLTARBCd7No8MPWqJLKCs3SEhrWKJ9buAjQn6EM");
   console.log("memoProgramSolana",solana?.getSolanaBridgeAddress(SolanaProgramId.MemoProgramId)=="MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
   console.log("UsdcMintSolana",solana?.getSolanaBridgeAddress(SolanaProgramId.UsdcMint) =="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");


   console.log("asaOwnerAlgorand",algorand?.getAlgorandBridgeAddress(AlgorandProgramAccount.AsaOwnerAccount) =="A3OSGEZJVBXWNXHZREDBB5Y77HSUKA2VS7Y3BWHWRBDOWZ5N4CWXPVOHZE");
   console.log("algoOwnerAlgorand",algorand?.getAlgorandBridgeAddress(AlgorandProgramAccount.AlgoOwnerAccount) =="5TFPIJ5AJLFL5IBOO2H7QXYLDNJNSQYTZJOKISGLT67JF6OYZS42TRHRJ4");
   console.log("bridgeOwnerAlgorand",algorand?.getAlgorandBridgeAddress(AlgorandProgramAccount.BridgeOwnerAccount) =="HUPQIOAF3JZWHW553PGBKWXYSODFYUG5MF6V246TIBW66WVGOAEB7R6XAE");
   console.log("feeReceiverAlgorand",algorand?.getAlgorandBridgeAddress(AlgorandProgramAccount.FeeRecieverAccount) =="A2GPNMIWXZDD3O3MP5UFQL6TKAZPBJEDZYHMFFITIAJZXLQH37SJZUWSZQ");
   console.log("multiSig1Algorand",algorand?.getAlgorandBridgeAddress(AlgorandProgramAccount.MultiSig1Account) =="JPDV3CKFABIXDVH36E7ZBVJ2NC2EQJIBEHCKYTWVC4RDDOHHOPSBWH3QFY");
   console.log("multiSig2Algorand",algorand?.getAlgorandBridgeAddress(AlgorandProgramAccount.MultiSig2Account) =="DFFTYAB6MWMRTZGHL2GAP7TMK7OUGHDD2AACSO7LXSZ7SY2VLO3OEOJBQU");
   console.log("usdcReceiverAlgorand",algorand?.getAlgorandBridgeAddress(AlgorandProgramAccount.UsdcReceiverAccount) =="GUSN5SEZQTM77WE2RMNHXRAKP2ELDM7GRLOEE3GJWNS5BMACRK7JVS3PLE");
   console.log("usdcDepositAlgorand",algorand?.getAlgorandBridgeAddress(AlgorandProgramAccount.UsdcDepositAccount) =="O7MYJZR3JQS5RYFJVMW4SMXEBXNBPQCEHDAOKMXJCOUSH3ZRIBNRYNMJBQ");
   console.log("bridgeAlgorand",algorand?.getAlgorandBridgeAddress(AlgorandProgramAccount.BridgeAccount) =="XJQ25THCV734QIUZARPZGG3NPRFZXTIIU77JSJBT23TJMGL3FXJWVR57OQ");
   console.log("asaVaultAlgorand",algorand?.getAlgorandBridgeAddress(AlgorandProgramAccount.AsaVaultAccount) =="U4A3YARBVMT7PORTC3OWXNC75BMGF6TCHFOQY4ZSIIECC5RW25SVKNKV3U");
   console.log("algoVaultAlgorand",algorand?.getAlgorandBridgeAddress(AlgorandProgramAccount.AlgoVaultAccount) =="R7VCOR74LCUIFH5WKCCMZOS7ADLSDBQJ42YURFPDT3VGYTVNBNG7AIYTCQ");
   console.log("usdcMint",algorand?.getAlgorandBridgeAddress(AlgorandProgramAccount.UsdcAssetId))
   console.log("usdcMint",algorand?.getAlgorandBridgeAddress(AlgorandProgramAccount.BridgeProgramId))


    resolve(true)
    }catch (err) {
      reject(err)
    }
  })
  
}

async function TransactionListTest():Promise<boolean> {

  return new Promise(async(resolve,reject) =>{
    try{

      //Load SDK
      const sdk = new GlitterBridgeSDK()
      .setEnvironment(GlitterEnvironment.mainnet)
      .connect([BridgeNetworks.algorand, BridgeNetworks.solana]);

      //Reference variables locally for ease of use
      const algorandAccounts = sdk.algorand?.accounts;
      const solanaAccounts = sdk.solana?.accounts;
      const algorand = sdk.algorand;
      const solana = sdk.solana;     
      const asset = BridgeTokens.get("algorand", "algo");
      if(!asset) throw new Error("asset is not Defined");


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

      const endAt = new_list[0].TxnId
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


// async function WalletTest():Promise<boolean> {

//   return new Promise(async (resolve, reject) =>{

//     try{
//     //Load SDK
//       const sdk = new GlitterBridgeSDK()
//       .setEnvironment(GlitterEnvironment.mainnet)
//       .connect([BridgeNetworks.algorand, BridgeNetworks.solana]);

//       //Reference variables locally for ease of use
//       const algorandAccounts = sdk.algorand?.accounts;
//       const solanaAccounts = sdk.solana?.accounts;
//       const algorand = sdk.algorand;
//       const solana = sdk.solana;     
      
//      const phantomWallet = solana?.getPhantomWalletAdapter();
//      const solfareWallet = solana?.getSolfareWalletAdapter();

//      phantomWallet?.initWallet();
//      solfareWallet?.initWallet();
//      const pubkeyPhantom = phantomWallet?.walletPublicKey?.toBase58()
//      const pubkeySolfare = solfareWallet?.walletPublicKey?.toBase58()
      
//      console.log("phantomPubkey",pubkeyPhantom);
//      console.log("solfarePubkey",pubkeySolfare);

//      resolve(true)

//     }catch(err) {

//       reject(err)
//     }
//   })
// }



async function runMain(): Promise<boolean> {7
    return new Promise(async (resolve, reject) => {
      try {
       //Load SDK
       const sdk = new GlitterBridgeSDK()
       .setEnvironment(GlitterEnvironment.mainnet)
       .connect([BridgeNetworks.algorand, BridgeNetworks.solana]);

   //Reference variables locally for ease of use
   const algorandAccounts = sdk.algorand?.accounts;
   const solanaAccounts = sdk.solana?.accounts;
   const algorand = sdk.algorand;
   const solana = sdk.solana;

   //Ensure SDK variables are loaded
   if (!algorandAccounts) throw new Error("Algorand Accounts not loaded");
   if (!solanaAccounts) throw new Error("Solana Accounts not loaded");
   if (!algorand) throw new Error("Algorand not loaded");
   if (!solana) throw new Error("Solana not loaded");

   //load/create new algorand account
   console.log();
   console.log("==== Loading/Creating New Algorand Account ============");
   const algorandAccount = await getAlgorandAccount(algorandAccounts);
   if (!algorandAccount) {
    throw new Error("algorand account not defines")
   }
   console.log(`Algorand Account: ${algorandAccount.addr}`);
   
   //load Create new solana account
   console.log();
   console.log("==== Creating New Solana Account ============");
   const solanaAccount = await getSolanaAccount(solanaAccounts);
   console.log(`Solana Account: ${solanaAccount.addr}`);

   //fund Algorand account
   console.log();
   console.log("==== Funding Algorand Account  ============");
   console.log("Here is the address of your account.  Click on the link to fund it with **6** or more testnet tokens.");
   console.log(`https://testnet.algoexplorer.io/address/${algorandAccount.addr}`);
   console.log();
   console.log("Dispenser");
   console.log(`https://testnet.algoexplorer.io/dispenser}`);
   console.log();
   console.log(`Address: ${algorandAccount.addr}`);
   await algorand.waitForMinBalance(algorandAccount.addr, 6, 5 * 60); //You need to send 6 or more testnet algos to the account 
   console.log();
   const algorandBalance = await algorand.getBalance(algorandAccount.addr);
   console.log(`Algorand Balance: ${algorandBalance}`);

   //fund Solana account
   console.log();
   console.log("==== Funding Solana Account  ============");
   console.log("Here is the address of your account.  Click on the link to fund it with **10** testnet tokens.");
   console.log(`https://explorer.solana.com/address/${solanaAccount.addr}?cluster=testnet`);
   console.log();
   console.log("Dispenser");
   console.log(`https://solfaucet.com/}`);
   console.log(`Address: ${solanaAccount.addr}`);
   await solana.waitForMinBalance(solanaAccount.addr, 1, 5 * 60); //You need to send 1 or more testnet sol to the account 
   console.log();
   const solanaBalance = await solana.getBalance(solanaAccount.addr);
   console.log(`Solana Balance: ${solanaBalance}`);

   //Opt in to xSOL
   console.log();
   console.log("==== Opting Algorand Account In to xSOL  ============");
   let startingBalance = await algorand.getBalance(algorandAccount.addr);
   await algorand.optinToken(algorandAccount, "xSOL");
   await algorand.waitForBalanceChange(algorandAccount.addr, startingBalance); //Wait for balance to change
   console.log();
   console.log("Opted in to xSOL");

   //Opt in to xALGO
   console.log();
   console.log("==== Opting Solana Account In to xALGO  ============");
   startingBalance = await solana.getBalance(solanaAccount.addr);
   await solana.optinToken(solanaAccount, "xALGO");


   //Check if the account exists - if not, wait for the RPC to confirm txn
   if (!(await solana.optinAccountExists(solanaAccount, "xALGO"))) {
       await solana.waitForBalanceChange(solanaAccount.addr, startingBalance); //Wait for balance to change
   }
      console.log("Opted in to xALGO");

      console.log();
      console.log("====  Opting USDC To Algorand  ============");
      startingBalance = await algorand.getBalance(algorandAccount.addr);
      await algorand.optinToken(algorandAccount , "USDC");
      await algorand.waitForBalanceChange(
        algorandAccount.addr,
        startingBalance
      ); //Wait for balance to change
      console.log();
      console.log("Opted algorand account to USDC");

      //Opt in to USDC
      console.log();
      console.log("==== Opting Solana Account In to USDC ============");
      startingBalance = await solana.getBalance(solanaAccount.addr);
      await solana.optinToken(solanaAccount, "USDC");
      if (!(await solana.optinAccountExists(solanaAccount, "USDC"))) {
        await solana.waitForBalanceChange(solanaAccount.addr, startingBalance); //Wait for balance to change
      }

        console.log("Opted solana account to  USDC to");


     console.log("=============USDC SWAP============");
      console.log("=============SOLANA to ALGO============");   
      /**
       * This txns needs to be signed by the wallet first !!
       * 
       */
      // Send usdc to AlgorandAccount from SolanaAccount
      const txn = await solana.bridgeTransactions(
        solanaAccount.addr,
        "USDC",
        "algorand",
        algorandAccount.addr,
        "USDC",
        1
      );
      if (!txn) {
        throw new Error("Txn Failed");
      }

     const usdc_bridge_txn_sol = await solana.sendAndConfirmTransaction(txn,solanaAccount);
     if (!usdc_bridge_txn_sol) {
      console.log("usdc bridge transaction failed")
     }else {
      console.log(`   ✅ - Transaction sent to network ${usdc_bridge_txn_sol}`);

     }
     console.log("===========Solana To Algorand USDC Swap Successful================");
     if (!algorandAccount) throw new Error("Algorand Client not defined");

    //wait for 60 sec
    await Sleep(60000);
    console.log("=============USDC SWAP============");
    console.log("=============ALGO to SOLANA============");   

    // Send usdc to SolanaAccount from AlgorandAccount
    const txnA = await algorand.bridgeTransaction(
      algorandAccount.addr,
      "USDC",
      "solana",
      solanaAccount.addr,
      "USDC",
      1
    );

    if (!txnA) {
      throw new Error("Txn Failed");
    }  
    const usdc_bridge_txn_algo = await algorand.signAndSend_SingleSigner(txnA,algorandAccount);

    console.log("Solana  To Algorand USDC Swap Successful");
    // Send usdc to SolanaAccount from AlgorandAccount
    if (!txnA) {
      throw new Error("Txn Failed");
    }

   console.log("=========== Algo to solana Usdc Swap Successful===================");

     Sleep(40000);
   console.log();
   console.log("==== Bridging ALGO to xALGO  ============");
   startingBalance = await solana.getTokenBalance(solanaAccount.addr, "xALGO");
   const bridge_transaction_algo_a =  await algorand.bridgeTransaction(algorandAccount.addr, "algo", "solana", solanaAccount.addr, "xalgo", 5.5);
   if(! bridge_transaction_algo_a){
     throw new Error("bridge_transaction_algo_a failed ")
   }
   const usdc_bridge_txn_algo_a_res = await algorand.signAndSend_SingleSigner(bridge_transaction_algo_a,algorandAccount);
   
   await solana.waitForTokenBalanceChange(solanaAccount.addr, "xAlgo", startingBalance,90);
   console.log();
   console.log("Bridged ALGO to xALGO");
   console.log(" Algo to Solana Bridge transactions  Successful");
   //Bridge xALGO to Algo

   console.log();
   console.log("==== Bridging xALGO to ALGO  ============");
   startingBalance = await algorand.getBalance(algorandAccount.addr);
   const bridge_txn_sol_a =   await solana.bridgeTransactions(solanaAccount.addr, "xalgo", "algorand", algorandAccount.addr, "algo", 5);
   if(!bridge_txn_sol_a){
     throw new Error("bridge_txn_sol_a failed")
   }
   const bridge_txn_sol_a_hash = await solana.sendAndConfirmTransaction(bridge_txn_sol_a,solanaAccount);
   if (!bridge_txn_sol_a_hash) {
    console.log("usdc bridge transaction failed")
   }else {
    console.log(`   ✅ - Transaction sent to network ${bridge_txn_sol_a_hash}`);

   }

   await algorand.waitForBalanceChange(algorandAccount.addr, startingBalance,90);
   console.log();
   console.log("Bridged xALGO to ALGO");

   await Sleep(30000);

    //Bridge SOL to xSOL
    console.log();
    console.log("==== Bridging SOL to xSOL  ============");
    startingBalance = await algorand.getTokenBalance(algorandAccount.addr, "xSOL");
    console.log("Starting Balance: ", startingBalance);
    const bridge_txn_sol_b = await solana.bridgeTransactions(solanaAccount.addr, "sol", "algorand", algorandAccount.addr, "xsol", 0.1);
    if(!bridge_txn_sol_b){
     throw new Error("bridge_txn_sol_b failed")
   }
   const bridge_txn_sol_b_hash = await solana.sendAndConfirmTransaction(bridge_txn_sol_b,solanaAccount);
   if (!bridge_txn_sol_b_hash) {
    console.log("usdc bridge transaction failed")
   }else {
    console.log(`   ✅ - Transaction sent to network ${bridge_txn_sol_b_hash}`);

   }
    await algorand.waitForTokenBalanceChange(algorandAccount.addr, "xSOL", startingBalance,90);
    console.log();
    console.log("Bridged SOL to xSOL");

    await Sleep(30000);

    //Bridge xSOL to SOL
    console.log();
    console.log("==== Bridging xSOL to SOL  ============");
    startingBalance = await solana.getBalance(solanaAccount.addr);
    const bridge_transaction_algo_b =  await algorand.bridgeTransaction(algorandAccount.addr, "xsol", "solana", solanaAccount.addr, "sol", 0.09);
    if(! bridge_transaction_algo_b){
     throw new Error("bridge_transaction_algo_a failed ")
   }
    const usdc_bridge_txn_algo_b_res = await algorand.signAndSend_SingleSigner(bridge_transaction_algo_b,algorandAccount);
    await solana.waitForBalanceChange(solanaAccount.addr, startingBalance,90);
    console.log();
    console.log("Bridged xSOL to SOL");


    resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }

  async function getAlgorandAccount(
    algorandAccounts: AlgorandAccounts
  ): Promise<AlgorandAccount | undefined> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        //Check file path for saved config:
        const algoAccountFile = path.join(__dirname, "local/algoAccount.txt");
  
        //Load account if exists in file
        if (fs.existsSync(algoAccountFile)) {
          //file exists
          const mnemonic = fs.readFileSync(algoAccountFile, "utf8");
  
          if (mnemonic) {
            //Add to loaded accounts
            let algoAccount = await algorandAccounts.add(mnemonic);
            resolve(algoAccount);
            return;
          }
        }
  
        //Create new algorand account
        console.log("Creating new Algorand Account");
        const newAlgoAccount = await algorandAccounts.createNew();
        console.log(
          util.inspect(newAlgoAccount, false, 5, true /* enable colors */)
        );
  
        //Get mnemonic
        const mnemonic = algorandAccounts.getMnemonic(newAlgoAccount);
        console.log("Algorand Mnemonic: " + mnemonic);
  
        //Save algorand account to file
        console.log("Saving Algorand Account to file " + algoAccountFile);
  
        var getDirName = require('path').dirname;
  
        fs.mkdir(getDirName(algoAccountFile), { recursive: true }, function (err: any) {
          if (err) {
            console.log(
              "An error occured while writing algorand Object to File."
            );
            return console.log(err);
          } else {
  
            //Write account to file
            fs.writeFile(algoAccountFile, mnemonic, "utf8", function (err: any) {
              if (err) {
                console.log(
                  "An error occured while writing algorand Object to File."
                );
                return console.log(err);
              }
  
              console.log("algorand file has been saved.");
            });
          }
        });
  
        resolve(newAlgoAccount);
      } catch (error) {
        reject(error);
      }
    });
  }
  
  async function getSolanaAccount(
    solanaAccounts: SolanaAccounts
  ): Promise<SolanaAccount> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        //Check file path for saved config:
        const solanaAccountFile = path.join(__dirname, "local/solanaAccount.txt");
  
        //Load account if exists in file
        if (fs.existsSync(solanaAccountFile)) {
          //file exists
          const mnemonic = fs.readFileSync(solanaAccountFile, "utf8");
  
          if (mnemonic) {
            //Add to loaded accounts
            let solanaAccount = await solanaAccounts.add(mnemonic);
            resolve(solanaAccount);
            return;
          }
        }
  
        //Create new solana account
        console.log("Creating new Solana Account");
        const newSolanaAccount = await solanaAccounts.createNew();
        console.log(
          util.inspect(newSolanaAccount, false, 5, true /* enable colors */)
        );
  
        let mnemonic = newSolanaAccount.mnemonic;
        console.log("Solana Mnemonic: " + mnemonic);
  
        //Save solana account to file
        console.log("Saving Solana Account to file " + solanaAccountFile);
  
        var getDirName = require('path').dirname;
        fs.mkdir(getDirName(solanaAccountFile), { recursive: true }, function (err: any) {
          if (err) {
            console.log(
              "An error occured while writing algorand Object to File."
            );
            return console.log(err);
          } else {
  
            //Write account to file
            fs.writeFile(solanaAccountFile, mnemonic, "utf8", function (err: any) {
              if (err) {
                console.log("An error occured while writing solana Object to File.");
                return console.log(err);
              }
  
              console.log("Solana file has been saved.");
            });
          }
        });
  
        resolve(newSolanaAccount);
      } catch (error) {
        reject(error);
      }
    });
  }
  