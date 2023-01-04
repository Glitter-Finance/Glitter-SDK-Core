import { AlgorandAccount, AlgorandAccounts } from "../lib/src/algorand";
import { SolanaAccount, SolanaAccounts } from "../lib/src/solana";
import { BridgeToken, BridgeTokens } from "../lib/src/_common";
import { GlitterEnvironment } from "../lib/src/_configs/config";
import { BridgeNetworks, GlitterBridgeSDK } from "../lib/src/_sdk/GlitterBridgeSDK";
const path = require('path');
const util = require('util');
const fs = require('fs');

run()

async function run() {
    const result = await runMain();
    console.log(result);
}

async function runMain(): Promise<boolean> {

    return new Promise(async (resolve, reject) => {
        try {
            const sdk = new GlitterBridgeSDK()
                .setEnvironment(GlitterEnvironment.mainnet)
                .connect([BridgeNetworks.algorand, BridgeNetworks.solana]);

            const algorandAccounts = sdk.algorand?.accounts;
            const solanaAccounts = sdk.solana?.accounts;
            const algorand = sdk.algorand;
            const solana = sdk.solana;

            if (!algorandAccounts) throw new Error("Algorand Accounts not loaded");
            if (!solanaAccounts) throw new Error("Solana Accounts not loaded");
            if (!algorand) throw new Error("Algorand not loaded");
            if (!solana) throw new Error("Solana not loaded");
            //load/create new algorand account

            console.log();
            console.log("==== Loading/Creating New Algorand Account ============");
            const algorandAccount = await getAlgorandAccount(algorandAccounts);
            console.log(`Algorand Account: ${algorandAccount?.addr}`);

            //load Create new solana account
            console.log();
            console.log("==== Creating New Solana Account ============");
            const solanaAccount = await getSolanaAccount(solanaAccounts);

            console.log(`Solana Account: ${solanaAccount.addr}`);


            // fund Algorand account
            console.log();
            console.log("==== Funding Algorand Account  ============");
            console.log("Here is the address of your account.  Click on the link to fund it with **6** or more testnet tokens.");
            console.log(`https://testnet.algoexplorer.io/address/${algorandAccount?.addr}`);
            console.log();
            console.log("Dispenser");
            console.log(`https://testnet.algoexplorer.io/dispenser}`);
            console.log();
            console.log(`Address: ${algorandAccount?.addr}`);
            await algorand.waitForMinBalance(algorandAccount?.addr ?? "", 6, 5 * 60); //You need to send 6 or more testnet algos to the account 
            console.log();
            const algorandBalance = await algorand.getBalance(algorandAccount?.addr ?? "");

            console.log(`Algorand Balance: ${algorandBalance}`);

            // fund Solana account
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

            //Andrew:  NOT NEEDED. The BridgeTokens are already loaded in the SDK
            // Add USDC to Bridge Tokens 
            // const solanaUSDC:BridgeToken = {
            //     symbol:"USDC"    ,
            //     network:"solana",
            //     address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",               //"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            //     decimals:6, 
            //     params:{
            //         name:"usdc",
            //         min_transfer:1,
            //         max_transfer:9900,
            //         fee_divisor:200,
            //         total_supply:BigInt(5034954057964621)

            //     }
            // }  ;

            //BridgeTokens.add(solanaUSDC);
            // console.log("====  SOLANAUSDC added ============");

            // const algoUSDC:BridgeToken = {
            //     symbol:"USDC"    ,
            //     network:"algorand",
            //     address:31566704,
            //     decimals:6, 
            //     params:{
            //         name:"usdc",
            //         min_transfer:1,
            //         max_transfer:9900,
            //         fee_divisor:200,
            //         total_supply:BigInt(18446744073709551615)

            //     }
            // }  ;

            // BridgeTokens.add(algoUSDC);
            //const tokenList = [solanaUSDC,algoUSDC]; 
            //const bridgeTokenConfig:BridgeTokenConfig = {
            //    tokens:tokenList
            //};
            //BridgeTokens.loadConfig(bridgeTokenConfig)

            console.log("====  ALGOUSDC added ============");

            const token = BridgeTokens.get("algorand", "USDC");
            if (!token) throw new Error("Token not found on algo");

            const tokenS = BridgeTokens.get("solana", "USDC");
            if (!tokenS) throw new Error("Token not found on solana ");


            //         console.log();
            //         console.log("====  Opting USDC To Algorand  ============");
            //         let startingBalance = await algorand.getBalance(algorandAccount?.addr ?? "DEWV6H5KYDD3VXGQOOGN5X622IM25XPSLWJEIL7ULUU6XMZAAYH6DFLJXU");
            //         await algorand.optinToken(algorandAccount as AlgorandAccount, "USDC");
            //         await algorand.waitForBalanceChange(algorandAccount?.addr?? "DEWV6H5KYDD3VXGQOOGN5X622IM25XPSLWJEIL7ULUU6XMZAAYH6DFLJXU", startingBalance); //Wait for balance to change
            //         console.log();
            //         console.log("Opted in to USDC to Algorand");



            //          //Opt in to USDC
            //          console.log();
            //          console.log("==== Opting Solana Account In to USDC ============");
            //          startingBalance = await solana.getBalance(solanaAccount.addr);
            //          await solana.optinToken(solanaAccount, "USDC");


            //          if (!(await solana.optinAccountExists(solanaAccount, "USDC"))) {
            //             await solana.waitForBalanceChange(solanaAccount.addr, startingBalance); //Wait for balance to change
            //         }
            //          console.log("Opted in to USDC to solana");

            //         //   Solana to Algorand USDC
            //         console.log();
            //         console.log("====  Bridging xALGO to ALGO  ============");
            //         startingBalance = await algorand.getBalance(algorandAccount?.addr ?? "DEWV6H5KYDD3VXGQOOGN5X622IM25XPSLWJEIL7ULUU6XMZAAYH6DFLJXU");

            //         // dummy solanaConfig 

            //         const SolanaConf = {
            //             name:"",
            //             server: "https://api.mainnet-beta.solana.com",
            //             programAddress:""
            //         } as SolanaConfig ;


            //         const solanaConnect = new SolanaConnect(SolanaConf);
            //         if (!algorandAccount){
            //             throw new Error("algo account not found ")
            //         }
            //       const sres =  await solanaConnect.createBridgeTransferInstruction(solanaAccount, "USDC", "algorand", algorandAccount.addr, "USDC", 1,"mainnet-beta");
            //       console.log("  Solana to Algo  USDC TRANSACTION COMPLETED");
            //       console.log(sres);
            //     const USDCalgorandAssetConfig = {

            //         symbol:"USDC",
            //         type:"token",
            //         asset_id:31566704,
            //         decimal:6,
            //         min_balance:1,
            //         fee_rate:0.005
            //     } as AlgorandAssetConfig;



            //     const ALGOalgorandAssetConfig = {

            //         symbol:"ALGO",
            //         type:"native",
            //         asset_id:27165954,
            //         decimal:6,
            //         min_balance:5,
            //         fee_rate:0.005
            //     } as AlgorandAssetConfig;

            //     const xSOLalgorandAssetConfig = {

            //         symbol:"XSol",
            //         type:"token",
            //         asset_id:792313023,
            //         decimal:9,
            //         min_balance:0.05,
            //         fee_rate:0.005
            //     } as AlgorandAssetConfig;


            // const list = [USDCalgorandAssetConfig,ALGOalgorandAssetConfig,xSOLalgorandAssetConfig];
            //     const algoConfig:AlgorandConfig = {
            //         name:"Mainnet" , 
            //         serverUrl:"https://node.algoexplorerapi.io",
            //         serverPort:"",
            //         indexerUrl:"https://algoindexer.algoexplorerapi.io",
            //         indexerPort:"",
            //         nativeToken:"",
            //         appProgramId:813301700,
            //         assets_info:list
            //     } ;


            //     const algoConnect = new AlgorandConnect(algoConfig);
            //     if (!algorandAccount) throw new Error("Algorand Client not defined");
            //     const res = algoConnect.createUSDCBridgeTransfer(algorandAccount,"USDC","solana",solanaAccount.addr,"USDC",1,"mainnet");
            //         console.log();
            //         console.log(" Algo to Solana USDC TRANSACTION COMPLETED");
            //         console.log(res);

            //         resolve(true)

        } catch (err) {
            reject(err)
        }
    })

}


async function getAlgorandAccount(algorandAccounts: AlgorandAccounts): Promise<AlgorandAccount | undefined> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {

            //Check file path for saved config:
            const algoAccountFile = path.join(__dirname, 'local/algoAccount.txt');

            //Load account if exists in file
            if (fs.existsSync(algoAccountFile)) {
                //file exists
                const mnemonic = fs.readFileSync(algoAccountFile, 'utf8');

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
            console.log(util.inspect(newAlgoAccount, false, 5, true /* enable colors */));

            //Get mnemonic
            const mnemonic = algorandAccounts.getMnemonic(newAlgoAccount);
            console.log("Algorand Mnemonic: " + mnemonic);

            //Save algorand account to file
            console.log("Saving Algorand Account to file " + algoAccountFile);

            //Write account to file
            fs.writeFile(algoAccountFile, mnemonic, 'utf8', function (err: any) {
                if (err) {
                    console.log("An error occured while writing algorand Object to File.");
                    return console.log(err);
                }

                console.log("algorand file has been saved.");
            });

            resolve(newAlgoAccount);

        } catch (error) {
            reject(error);
        }
    });

}


async function getSolanaAccount(solanaAccounts: SolanaAccounts): Promise<SolanaAccount> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        try {

            //Check file path for saved config:
            const solanaAccountFile = path.join(__dirname, 'local/solanaAccount.txt');

            //Load account if exists in file
            if (fs.existsSync(solanaAccountFile)) {
                //file exists
                const mnemonic = fs.readFileSync(solanaAccountFile, 'utf8');

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
            console.log(util.inspect(newSolanaAccount, false, 5, true /* enable colors */));

            let mnemonic = newSolanaAccount.mnemonic;
            console.log("Solana Mnemonic: " + mnemonic);

            //Save solana account to file
            console.log("Saving Solana Account to file " + solanaAccountFile);

            //Write account to file
            fs.writeFile(solanaAccountFile, mnemonic, 'utf8', function (err: any) {
                if (err) {
                    console.log("An error occured while writing solana Object to File.");
                    return console.log(err);
                }

                console.log("Solana file has been saved.");
            });

            resolve(newSolanaAccount);

        } catch (error) {
            reject(error);
        }
    });

}
