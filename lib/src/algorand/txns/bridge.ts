import algosdk, { Transaction } from "algosdk";
import { AlgorandTxns } from "./txns";
import * as util from "util";
import AlgodClient from "algosdk/dist/types/src/client/v2/algod/algod";
import {
    BridgeAccountNames,
    BridgeAccounts,
    BridgeToken,
    BridgeTokens,
    Routing,
    RoutingDefault,
    RoutingString,
    SetRoutingUnits
} from "glitter-bridge-common";


export enum AlgorandBridgeTxnType {
    none,
    token_vault_setup = "token_vault_setup",
    token_vault_update_fee = "token_vault_update_fee",
    token_vault_update_limits = "token_vault_update_limits",
    token_vault_deposit = "token_vault_deposit",
    token_vault_release = "token_vault_release",
    token_vault_refund = "token_vault_refund",
    token_vault_optin = "token_vault_optin",
    xsol_release = "xSOL-release",
    algo_release = "algo-release",
    xsol_deposit = "xSOL-deposit",
    algo_deposit = "algo-deposit",
    xsol_refund = "xSOL-refund",
    algo_refund = "algo-refund",
    usdc_deposit = "usdc-deposit"
}

export class AlgorandBridgeTxnsV1 {

    private _bridgeApprovalAppId = 0;
    private _client: AlgodClient | undefined = undefined;
    private _transactions: AlgorandTxns | undefined = undefined;
    
    //constructor
    public constructor(algoClient: AlgodClient, appId: number, transactions: AlgorandTxns) {

        this._client = algoClient;
        this._bridgeApprovalAppId = appId;
        this._transactions = transactions;
    }

    public appArgs(functionName: AlgorandBridgeTxnType): Uint8Array[] | undefined;
    public appArgs(functionName: AlgorandBridgeTxnType, routing: Routing): Uint8Array[] | undefined;
    public appArgs(functionName: AlgorandBridgeTxnType, routing: Routing, token: BridgeToken): Uint8Array[] | undefined;
    public appArgs(functionName: AlgorandBridgeTxnType, routing?: Routing, token?: BridgeToken): Uint8Array[] | undefined {

        const appArgs: Uint8Array[] = [];
        let solana_asset = "";
        let app_asset_type = "";

        switch (functionName) {
            case AlgorandBridgeTxnType.token_vault_setup:
            case AlgorandBridgeTxnType.token_vault_update_fee:
            case AlgorandBridgeTxnType.token_vault_update_limits:
            case AlgorandBridgeTxnType.token_vault_optin:

                //Fail Safe
                if (!token) throw new Error("Token Config is required");
                {
                    appArgs.push(new Uint8Array(Buffer.from(AlgorandBridgeTxnType[functionName]))); //0
                    appArgs.push(algosdk.encodeUint64(Number(token.address)));  //1
                    appArgs.push(new Uint8Array(Buffer.from(token.symbol)));  //2
                    appArgs.push(algosdk.encodeUint64(Number(token.decimals)));  //3
                    appArgs.push(algosdk.encodeUint64(Number(token.params.fee_divisor)));  //4

                    const min_transfer = token.params.min_transfer ? token.params.min_transfer : 0;
                    appArgs.push(algosdk.encodeUint64(Number(min_transfer * Math.pow(10, token.decimals))));  //5
                    const max_transfer = token.params.max_transfer ? token.params.max_transfer : 0;
                    appArgs.push(algosdk.encodeUint64(Number(max_transfer * Math.pow(10, token.decimals))));  //6
                }
                break;

            case AlgorandBridgeTxnType.xsol_deposit:
            case AlgorandBridgeTxnType.algo_deposit:

                //Fail Safe
                if (!routing) throw new Error("Bridge Transaction is required");
                if (routing.to.network.toLowerCase() != "solana") throw new Error("to network is not solana");
                if (routing.from.network.toLowerCase() != "algorand") throw new Error("from network is not algorand");

                //Get Integer Amount
                {
                    if (!token) throw new Error("Token Config is required");
                    if (!routing.units) SetRoutingUnits(routing, token);

                    //Set Solana Asset
                    if (functionName == AlgorandBridgeTxnType.xsol_deposit) {
                        solana_asset = "sol";
                        app_asset_type = "xSOL";
                    } else if (functionName == AlgorandBridgeTxnType.algo_deposit) {
                        solana_asset = "xALGoH1zUfRmpCriy94qbfoMXHtK6NDnMKzT4Xdvgms";
                        app_asset_type = "algo";  
                    }

                    //Set routing units
                    if (routing.units) {
                        let token = BridgeTokens.get("algorand", app_asset_type);
                        SetRoutingUnits(routing, token);
                    }

                    appArgs.push(new Uint8Array(Buffer.from(routing.to.address))); //0 (Solana Address)
                    appArgs.push(new Uint8Array(Buffer.from(routing.from.address))); //1 (Algorand Address)
                    appArgs.push(new Uint8Array(Buffer.from(solana_asset))); //2 (Solana Asset)
                    appArgs.push(new Uint8Array(Buffer.from(app_asset_type))); //3 (Algorand Asset)
                    appArgs.push(new Uint8Array(Buffer.from(functionName.toString()))); //4 (App Call)
                    appArgs.push(new Uint8Array(Buffer.from(routing.to.txn_signature))); //5 (Solana Signature)
                    appArgs.push(algosdk.encodeUint64(Number(routing.units))); //6 (Amount)
                }
                break;

            case AlgorandBridgeTxnType.xsol_release:
            case AlgorandBridgeTxnType.algo_release:
            case AlgorandBridgeTxnType.xsol_refund:
            case AlgorandBridgeTxnType.algo_refund:

                //Fail Safe
                if (!routing) throw new Error("Bridge Transaction is required");
                if (routing.from.network.toLowerCase() != "solana") throw new Error("from network is not solana");
                if (routing.to.network.toLowerCase() != "algorand") throw new Error("to network is not algorand");

                //Get Integer Amount
                if (!token) throw new Error("Token Config is required");
                {
                    if (!routing.units) SetRoutingUnits(routing, token);

                    //Set Solana Asset
                    if (functionName == AlgorandBridgeTxnType.xsol_release ||
                        functionName == AlgorandBridgeTxnType.xsol_refund) {
                        solana_asset = "sol";
                        app_asset_type = "xSOL";
                    } else if (functionName == AlgorandBridgeTxnType.algo_release ||
                        functionName == AlgorandBridgeTxnType.algo_refund) {
                        solana_asset = "xALGoH1zUfRmpCriy94qbfoMXHtK6NDnMKzT4Xdvgms";
                        app_asset_type = "algo";
                    }

                    //Set routing units
                    if (routing.units) {
                        let token = BridgeTokens.get("algorand", app_asset_type);
                        SetRoutingUnits(routing, token);
                    }

                    appArgs.push(new Uint8Array(Buffer.from(routing.from.address))); //0 (Solana Address)
                    appArgs.push(new Uint8Array(Buffer.from(routing.to.address))); //1 (Algorand Address)
                    appArgs.push(new Uint8Array(Buffer.from(solana_asset))); //2 (Solana Asset)
                    appArgs.push(new Uint8Array(Buffer.from(app_asset_type))); //3 (Algorand Asset)
                    appArgs.push(new Uint8Array(Buffer.from(functionName.toString()))); //4 (App Call)
                    appArgs.push(new Uint8Array(Buffer.from(routing.to.txn_signature))); //5 (Solana Signature)
                    appArgs.push(algosdk.encodeUint64(Number(routing.units))); //6 (Amount)
                }
                break;

            case AlgorandBridgeTxnType.token_vault_deposit:
            case AlgorandBridgeTxnType.token_vault_release:
            case AlgorandBridgeTxnType.token_vault_refund:

                //Fail Safe
                if (!routing) throw new Error("Bridge Transaction is required");
                if (!token) throw new Error("Token Config is required");

                {

                    let from_signature = "null";
                    if (routing.from.txn_signature) from_signature = routing.from.txn_signature;

                    //console.log(JSON.stringify(routing));
                    let from_pk: Uint8Array = new Uint8Array();
                    if (routing.from.address && routing.from.network.toLocaleLowerCase() === "algorand") from_pk = algosdk.decodeAddress(routing.from.address).publicKey;
                    let to_pk: Uint8Array = new Uint8Array();
                    if (routing.to.address && routing.to.network.toLocaleLowerCase() === "algorand") to_pk = algosdk.decodeAddress(routing.to.address).publicKey;

                    //Set routing units
                    if (routing.units) {
                        SetRoutingUnits(routing, token);
                    }

                    appArgs.push(new Uint8Array(Buffer.from(AlgorandBridgeTxnType[functionName]))); //0
                    appArgs.push(new Uint8Array(Buffer.from(routing.from.network))); //1
                    appArgs.push(new Uint8Array(Buffer.from(routing.from.address))); //2
                    appArgs.push(from_pk); //3
                    appArgs.push(new Uint8Array(Buffer.from(from_signature))); //4
                    appArgs.push(new Uint8Array(Buffer.from(routing.to.network))); //5
                    appArgs.push(new Uint8Array(Buffer.from(routing.to.address))); //6
                    appArgs.push(to_pk); //7
                    appArgs.push(algosdk.encodeUint64(Number(routing.units))); //8
                }

                break;

            default:
                return undefined;
        }

        return appArgs;


    }

    public async UsdcTransactionHandler(routing:Routing, token:BridgeToken):Promise<algosdk.Transaction[]> {
        return new Promise(async(resolve, reject) =>{
            try {

                if (!routing) throw new Error("Bridge Transaction is required");
                if (!token) throw new Error("Token Config is required");
                if (!this.ValidateSendRouting(routing)) throw new Error("Invalid Routing");
                if(token.symbol == "USDC" || routing.to.token.toLowerCase()=="usdc") {
                    let depositTxn = await this.BridgeDepositTransaction(routing);
                    let transactions = [ depositTxn];
    
                    resolve(transactions);
                }


            }
            catch(err) {

                reject(err)
            }
        })
    }


    public async bridgeTransactions(routing: Routing, token: BridgeToken): Promise<algosdk.Transaction[]> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!routing) throw new Error("Bridge Transaction is required");
                if (!token) throw new Error("Token Config is required");
                if (!this.ValidateSendRouting(routing)) throw new Error("Invalid Routing");

                //Set up Transactions
                // algorand wallet algo|xsol|usdc 
                let fn = AlgorandBridgeTxnType.none;
                if (token.symbol.toLowerCase() === "algo") {
                    fn = AlgorandBridgeTxnType.algo_deposit;
                } else if (token.symbol.toLowerCase() === "xsol") {
                    fn = AlgorandBridgeTxnType.xsol_deposit;
                }

                let appTxn = await this.BridgeApprovalTransaction(fn, routing, token); // switch for usdc 
                let feeTxn = await this.BridgeFeeTransaction(routing);   // 
                let depositTxn = await this.BridgeDepositTransaction(routing);
                let transactions = [appTxn, feeTxn, depositTxn];

                resolve(transactions);
            } catch (error) {
                reject(error);
            }
        });

    }

    public ValidateSendRouting(routing: Routing): boolean {

        let fNetwork = routing.from.network.toLowerCase();
        let fToken = routing.from.token.toLowerCase();
        let tNetwork = routing.to.network.toLowerCase();
        let tToken = routing.to.token.toLowerCase();

        if (fNetwork == "algorand" && fToken == "algo" && tNetwork == "solana" && tToken == "xalgo") return true;
        if (fNetwork == "algorand" && fToken == "xsol" && tNetwork == "solana" && tToken == "sol") return true;
        return false;
    }
    public async BridgeApprovalTransaction(
        functionName: AlgorandBridgeTxnType,
        routing: Routing,
        token: BridgeToken
    ): Promise<Transaction> {

        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {
                //Fail Safe
                if (!this._client) throw new Error("Algorand Client is required");
                if (!routing) throw new Error("Bridge Transaction is required");

                //Get Default Parameters
                const params = await this._client.getTransactionParams().do();
                params.fee = 1000;
                params.flatFee = true;

                //Encode Note
                const record = {
                    routing: RoutingString(routing),
                    date: `${new Date()}`,
                }
                const note = algosdk.encodeObj(
                    record
                );

                //Get app args 
                const appArgs = this.appArgs(functionName, routing, token) as Uint8Array[];

                //get accounts
                const accounts: string[] = [];
                switch (functionName) {
                    case AlgorandBridgeTxnType.xsol_deposit:
                        accounts.push(routing.from.address);
                        accounts.push(BridgeAccounts.getAddress(BridgeAccountNames.algorand_asaVault));
                        break;
                    case AlgorandBridgeTxnType.algo_deposit:
                        accounts.push(routing.from.address);
                        accounts.push(BridgeAccounts.getAddress(BridgeAccountNames.algorand_algoVault));
                       break;
                    case AlgorandBridgeTxnType.usdc_deposit:
                        accounts.push(routing.from.address);
                        accounts.push(BridgeAccounts.getAddress(BridgeAccountNames.algorand_algoVault));
                        //O7MYJZR3JQS5RYFJVMW4SMXEBXNBPQCEHDAOKMXJCOUSH3ZRIBNRYNMJBQ

                    default:
                        accounts.push(routing.from.address);
                        accounts.push(BridgeAccounts.getAddress(BridgeAccountNames.algorand_algoVault));
                        break;
                }

                //Get Bridge 
                const txn = algosdk.makeApplicationNoOpTxnFromObject({
                    note: note,
                    suggestedParams: params,
                    from: routing.from.address,
                    accounts: accounts,
                    appIndex: Number(this._bridgeApprovalAppId),
                    appArgs: appArgs,
                    rekeyTo: undefined,
                });
                resolve(txn);

            } catch (error) {
                reject(error);
            }
        });

    }

    public async BridgeFeeTransaction(
        routing: Routing,
    ): Promise<Transaction> {

        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {
                //Fail Safe
                if (!this._client) throw new Error("Algorand Client is required");
                if (!routing) throw new Error("Bridge Transaction is required");

                //Get Token
                const token = await BridgeTokens.get("algorand", routing.from.token);
                if (!token) throw new Error("Token Config is required");
                if (!token.params) throw new Error("Token Params is required");
                if (!token.params.fee_divisor) throw new Error("Token Fee Divisor is required");
                if (!routing.amount) throw new Error("Routing Amount is required");
                if (!this._transactions) throw new Error("Algorand Transactions is required");

                //Get Fee Routing
                const feeRouting = RoutingDefault(routing);
                feeRouting.to.network = "algorand";
                feeRouting.to.token = feeRouting.from.token;
                feeRouting.to.address = BridgeAccounts.getAddress(BridgeAccountNames.algorand_feeReceiver);
                feeRouting.units = undefined;

                //Get Fee
                feeRouting.amount = routing.amount / token.params.fee_divisor;

                //Get Transaction
                //  usdc 
                let txn = undefined;
                if (feeRouting.from.token.toLowerCase() === "algo") {
                    txn = await this._transactions.sendAlgoTransaction(feeRouting);
                } else {
                    console.log(util.inspect(feeRouting, false, null, true /* enable colors */));
                    txn = await this._transactions.sendTokensTransaction(feeRouting, token);
                }
                resolve(txn);

            } catch (error) {
                reject(error);
            }
        });

    }
    //
    public async BridgeDepositTransaction(
        routing: Routing,
    ): Promise<Transaction> {

        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {
                //Fail Safe
                if (!this._client) throw new Error("Algorand Client is required");
                if (!routing) throw new Error("Bridge Transaction is required");

                //Get Token
                const token = await BridgeTokens.get("algorand", routing.from.token);
                if (!token) throw new Error("Token Config is required");
                if (!token.params) throw new Error("Token Params is required");
                if (!token.params.fee_divisor) throw new Error("Token Fee Divisor is required");
                if (!routing.amount) throw new Error("Routing Amount is required");
                if (!this._transactions) throw new Error("Algorand Transactions is required");

                //Get Fee Routing
                const depositRouting = RoutingDefault(routing);
                depositRouting.to.network = "algorand";
                depositRouting.to.token = depositRouting.from.token;
                depositRouting.units = undefined;

                if (routing.from.token.toLowerCase() == "algo") {
                    depositRouting.to.address = BridgeAccounts.getAddress(BridgeAccountNames.algorand_algoVault);
                }else if(routing.from.token.toLowerCase() == "usdc") { 
                   // 
                    depositRouting.to.address = "O7MYJZR3JQS5RYFJVMW4SMXEBXNBPQCEHDAOKMXJCOUSH3ZRIBNRYNMJBQ";
            }
                else {
                    depositRouting.to.address = BridgeAccounts.getAddress(BridgeAccountNames.algorand_asaVault);
                }
                
                
                //Get Transaction
                let txn = undefined;
                if (depositRouting.from.token.toLowerCase() === "algo") {
                    txn = await this._transactions.sendAlgoTransaction(depositRouting);
                } else {
                    console.log(util.inspect(depositRouting, false, null, true /* enable colors */));
                    txn = await this._transactions.sendTokensTransaction(depositRouting, token);
                }
                resolve(txn);

            } catch (error) {
                reject(error);
            }
        });

    }

}