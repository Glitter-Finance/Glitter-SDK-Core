import {  Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction, TransactionInstruction } from '@solana/web3.js';
import { SolanaAccount, SolanaAccounts } from './accounts';
import { SolanaAssets } from './assets';
import { SolanaBridgeTxnsV1 } from './txns/bridge';
import { SolanaConfig } from './config';
import { SolanaTxns } from './txns/txns';
import * as util from 'util';
import { BridgeToken, BridgeTokens, LogProgress, Precise, Routing, RoutingDefault, Sleep, ValueUnits } from '../../common';
import { COMMITMENT, DepositNote } from './utils';
import { createTransferInstruction, getAssociatedTokenAddress, getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export class SolanaConnect {

    private _client?: Connection;
    private _accounts: SolanaAccounts | undefined = undefined;
    private _assets: SolanaAssets | undefined = undefined;
    private _transactions: SolanaTxns | undefined = undefined;
    private _bridgeTxnsV1: SolanaBridgeTxnsV1 | undefined = undefined;

    constructor(config: SolanaConfig) {
        this._client = new Connection(config.server);

        this._accounts = new SolanaAccounts(this._client);
        this._assets = new SolanaAssets(this._client);
        this._transactions = new SolanaTxns(this._client);
        this._bridgeTxnsV1 = new SolanaBridgeTxnsV1(this._client,config.accounts.bridgeProgram, config.accounts );

    }

    public get client() {
        return this._client;
    }
    public get accounts() {
        return this._accounts;
    }
    public get assets() {
        return this._assets;
    }

    public async bridgeTransactions(
        fromAddress:string, 
        fromSymbol:string,
        toNetwork:string, 
        toAddress:string, 
        tosymbol:string,
        amount:number
    ):Promise<Transaction | undefined>{
        return new Promise(async (resolve, reject) => {

        try{
            //Fail Safe
            if (!this._client) throw new Error('Solana Client not found');
            if (!this._bridgeTxnsV1) throw new Error('Solana Bridge Transactions not found');
            if (!this._accounts) throw new Error('Solana Accounts not found');
            if (!this._assets) throw new Error('Solana Assets not found');

             //Get Token
             const token = BridgeTokens.get("solana", fromSymbol);
             if (!token) throw new Error("Token not found");


               //Get routing
               const routing = RoutingDefault();
               routing.from.address = fromAddress;
               routing.from.token = fromSymbol;
               routing.from.network = "solana";

               routing.to.address = toAddress; 
               routing.to.token = tosymbol;
               routing.to.network = toNetwork;
               routing.amount = amount;
               
               const sourcePubkey = new PublicKey(fromAddress);
               let txn: Transaction | undefined = undefined;
               if (token.symbol.toLowerCase() === "sol"  ) {
                   txn = await this._bridgeTxnsV1.solBridgeTransaction(sourcePubkey, routing, token);
               } else if (token.symbol.toLocaleLowerCase() == "usdc" && tosymbol.toLocaleLowerCase() == "usdc"){

                txn = await this._bridgeTxnsV1.HandleUsdcSwapUnsigned( routing, token);

               }else {
                   txn = await this._bridgeTxnsV1.tokenBridgeTransaction(sourcePubkey, routing, token);
                }

                resolve(txn);

        }catch(err){
            reject(err)
        }

    })
}

public async bridge(account: SolanaAccount,
        fromSymbol: string,
        toNetwork: string,
        toAddress: string,
        tosymbol: string,
        amount: number
    ) {
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._client) throw new Error('Solana Client not found');
                if (!this._bridgeTxnsV1) throw new Error('Solana Bridge Transactions not found');
                if (!this._accounts) throw new Error('Solana Accounts not found');
                if (!this._assets) throw new Error('Solana Assets not found');

                //Get Token
                const token = BridgeTokens.get("solana", fromSymbol);
                if (!token) throw new Error("Token not found");

                //Get routing
                const routing = RoutingDefault();
                routing.from.address = account.addr;
                routing.from.token = fromSymbol;
                routing.from.network = "solana";

                routing.to.address = toAddress; 
                routing.to.token = tosymbol;
                routing.to.network = toNetwork;
                routing.amount = amount;

                //get token account
                let txn: Transaction | undefined = undefined;
                if (token.symbol.toLowerCase() === "sol"  ) {
                    txn = await this._bridgeTxnsV1.solBridgeTransaction(account.pk, routing, token);
                } else if(routing.to.token.toLocaleLowerCase() === "usdc" && token.symbol.toLocaleLowerCase() === "usdc") {
                    txn =  await this._bridgeTxnsV1.HandleUsdcSwap(account, routing);
                }else {
                    txn = await this._bridgeTxnsV1.tokenBridgeTransaction(account.pk, routing, token);
                }
                if (!txn) throw new Error("Transaction not found");

                //Send Transaction
                const txid = await this._client.sendTransaction(
                    txn,
                    [Keypair.fromSecretKey(account.sk)],
                    {
                        skipPreflight: true,
                        preflightCommitment: "processed"
                    }
                );
                console.log(`   ✅ - Transaction sent to network ${txid}`);
                resolve(true);

            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    }

    //Account Actions
    public async fundAccount(funder: SolanaAccount, account: SolanaAccount, amount: number): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {

                //Fail safe
                if (!this._client) throw new Error("Solana Client not defined");

                //Get routing
                const routing = RoutingDefault();
                routing.from.address = funder.addr;
                routing.from.token = "sol";
                routing.from.network = "solana";

                routing.to.address = account.addr;
                routing.to.token = "sol";
                routing.to.network = "solana";

                routing.amount = amount;

                let returnValue = await this.sendSol(routing, funder);
                resolve(returnValue);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async fundAccountTokens(funder: SolanaAccount, account: SolanaAccount, amount: number, symbol: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {

                //Fail safe
                if (!this._client) throw new Error("Solana Client not defined");

                //Get Token
                const token = BridgeTokens.get("solana", symbol);
                if (!token) throw new Error("Token not found");

                //Get routing
                const routing = RoutingDefault();
                routing.from.address = funder.addr;
                routing.from.token = symbol;
                routing.from.network = "solana";

                routing.to.address = account.addr;
                routing.to.token = symbol;
                routing.to.network = "solana";

                routing.amount = amount;

                let returnValue = await this.sendTokens(routing, funder, token);
                resolve(returnValue);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async closeOutAccount(signer: SolanaAccount, receiver: SolanaAccount): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {

                //Fail safe
                if (!this._client) throw new Error("Solana Client not defined");
                if (!this._transactions) throw new Error("Solana Transactions not defined");
                if (!this._accounts) throw new Error("Solana Accounts not defined");

                //Get balance
                const balance = await this.getBalance(signer.addr);

                //Get routing
                const routing = RoutingDefault();
                routing.from.address = signer.addr;
                routing.from.token = "sol";
                routing.from.network = "solana";

                routing.to.address = receiver.addr;
                routing.to.token = "sol";
                routing.to.network = "solana";

                //Get sol token
                const solToken = await this._transactions.SolToken;
                if (!solToken) throw new Error("Sol Token not found");

                routing.amount = ValueUnits.fromUnits(BigInt(1), solToken.decimals).value;

                //get mock transaction
                const mock_txn = await this._transactions.sendSolTransaction(routing);
                mock_txn.recentBlockhash = (await this._client.getRecentBlockhash()).blockhash;
                mock_txn.sign(...[SolanaAccounts.getSignerObject(signer)]);

                //get fee and set amount
                const feeUnits = await mock_txn.getEstimatedFee(this._client);
                const fee = ValueUnits.fromUnits(BigInt(feeUnits), solToken.decimals).value;
                routing.amount = balance - fee;

                const txn = await this._transactions.sendSolTransaction(routing);

                //Send Transactions
                const result = await this._client.sendTransaction(txn,
                    [SolanaAccounts.getSignerObject(signer)])

                //console.log("Sent {0} SOL to {1} to close account", routing.amount, receiver.addr);
                console.log(`Sent ${routing.amount} SOL to ${receiver.addr} to close account ${signer.addr}`);
                resolve(true);

            } catch (error) {
                reject(error);
            }
        });
    }

    //Txn Actions
    public async sendSol(routing: Routing, signer: SolanaAccount): Promise<boolean> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._client) throw new Error('Solana Client not found');
                if (!this._transactions) throw new Error('Solana Transactions not found');
                if (!this._accounts) throw new Error('Solana Accounts not found');

                //Get Transactions
                console.log(`Sending ${routing.amount} SOL from ${signer.addr} to ${routing.to.address}`);
                const txn = await this._transactions.sendSolTransaction(routing);

                //Send Transactions
                const result = await this._client.sendTransaction(txn,
                    [SolanaAccounts.getSignerObject(signer)])

                console.log(`SOL Sent ${result}`);
                resolve(true);

            } catch (error) {
                reject(error);
            }
        });
    }
    public async sendTokens(routing: Routing,
        account: SolanaAccount,
        token: BridgeToken): Promise<boolean> {

        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._transactions) throw new Error("Solana Transactions not defined");
                if (!account) throw new Error("Sender account is required");
                if (!token) throw new Error("Token is required");
                if (!this._assets) throw new Error("Solana Assets not defined");
                if (!this._accounts) throw new Error("Solana Accounts not defined");
                if (!this._client) throw new Error("Solana Client not defined");

                //get token accounts
                const senderTokenAccount = await this._assets.getTokenAccount(account.pk, token);
                const receiverTokenAccount = await this._assets.getTokenAccount(new PublicKey(routing.to.address), token);
                if (!senderTokenAccount) {
                    throw new Error(`Sender Token Account not found for ${account.addr}`);
                }
                if (!receiverTokenAccount) {
                    throw new Error(`Receiver Token Account not found for ${routing.to.address}`);
                }
                //Get Txn
                console.log(`Sending ${routing.amount} ${token.symbol} from ${routing.from.address} to ${routing.to.address}`);
                const txn = await this._transactions.sendTokenTransaction(
                    routing,
                    senderTokenAccount.address,
                    receiverTokenAccount.address,
                    token);

                //Send Transactions
                const result = await this._client.sendTransaction(txn,
                    [SolanaAccounts.getSignerObject(account)])

                console.log(`${token.symbol} Sent ${result}`);
                resolve(true);

            } catch (error) {
                reject(error);
            }
        });


    }
    
    async optinToken
    (account: SolanaAccount,
        symbol: string): Promise<boolean> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._accounts) throw new Error("Solana Accounts not defined");
                if (!this._transactions) throw new Error("Solana Transactions not defined");
                if (!this._assets) throw new Error("Solana Assets not defined");

                //Get Token
                const token = BridgeTokens.get("solana", symbol);
                if (!token) throw new Error("Token not found");
                if (!token.address) throw new Error("mint address is required");
                if (typeof token.address !== "string") throw new Error("token address is required in string format");

                //Get Txn
                console.log(`Opting in ${account.addr} to ${token.address}`);

                //get token account
                const tokenAccount = await this._assets.getTokenAccount(account.pk, token);
                if (tokenAccount) {
                    console.log(`Account ${account.addr} already opted in to ${token.address}`);
                    resolve(true);
                    return;
                }

                //Create new account
                const signer = SolanaAccounts.getSignerObject(account);
                const newAccount = await this._assets.createTokenAccount(signer, account.pk, token);

                console.log(`Account ${account.addr} opted in to ${token.address}`);
                console.log(util.inspect(newAccount, false, 5, true));

                // const transactions: Transaction[] = [];
                // const txn = await this._transactions.optinTransaction(signer.addr, token.address);
                // transactions.push(txn);

                // //Send Txn
                // await this.signAndSend_SingleSigner(transactions, signer);
                console.log(`Optin Completed`);
                resolve(true);

            } catch (error) {
                reject(error);
            }
        });
    }
    public async closeOutTokenAccount(
        signer: SolanaAccount,
        receiver: SolanaAccount,
        symbol: string) {

        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._transactions) throw new Error("Solana Transactions not defined");
                if (!this._assets) throw new Error("Solana Assets not defined");

                //Get balance
                let balance = await this.getTokenBalance(signer.addr, symbol);

                //Get Token
                const token = BridgeTokens.get("solana", symbol);
                if (!token) throw new Error("Token not found");
                if (!token.address) throw new Error("mint address is required");
                if (typeof token.address !== "string") throw new Error("token address is required in string format");

                //Check if balance needs to be closed out
                if (balance > 0) {
                    //Get routing
                    await this.fundAccountTokens(signer, receiver, balance, symbol);
                    balance = await this.waitForTokenBalance(signer.addr, symbol, 0)
                    console.log(`Sent ${balance} ${symbol} to ${receiver.addr}. New Balance: ${balance}`);
                }
                //get token account
                const tokenAccount = await this._assets.getTokenAccount(signer.pk, token);
                if (!tokenAccount) throw new Error("Token Account not found");

                let txn = this._transactions.closeTokenAccountTransaction(signer.pk, tokenAccount.address);
                resolve(true);

            } catch (error) {
                reject(error);
            }
        });
    }
    
    async optinAccountExists(account: SolanaAccount,
        symbol: string): Promise<boolean> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {

                //Fail Safe
                if (!this._assets) throw new Error("Solana Assets not defined");

                // //Get Token
                const token = BridgeTokens.get("solana", symbol);
                if (!token) throw new Error("Token not found");
                if (!token.address) throw new Error("mint address is required");
                if (typeof token.address !== "string") throw new Error("token address is required in string format");

                //get token account
                const tokenAccount = await this._assets.getTokenAccount(account.pk, token);
                if (tokenAccount) {
                    resolve(true);
                    return;
                } else {
                    resolve(false);
                }

            } catch (error) {
                reject(error);
            }
        });
    }

    //Account Info
    public async getBalance(address: string): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this._client) throw new Error("Solana Client not defined");
                if (!this._accounts) throw new Error("Solana Accounts not defined");
                if (!this._transactions) throw new Error("Solana transactions not defined");

                //get account
                const account = this._accounts.getAccount(address);
                if (!account) throw new Error("Account not found");

                //Get sol token
                const solToken = await this._transactions.SolToken;
                if (!solToken) throw new Error("Sol Token not found");

                let units = await this._client.getBalance(account.pk);

                //Convert units to integer.  The precision round floating point errors
                units = Number(Precise(units).toString());
                let balance = ValueUnits.fromUnits(BigInt(units), solToken.decimals).value;

                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async waitForBalance(address: string, expectedAmount: number, timeoutSeconds: number = 60, threshold: number = 0.001, anybalance: boolean = false, noBalance: boolean = false): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {

                //Get start time & balance
                const start = Date.now();
                let balance = await this.getBalance(address);

                //Loop until balance (or timeout) is reached
                while (true) {

                    //Check break conditions
                    if (anybalance && balance > 0) {
                        break;
                    } else if (noBalance && balance == 0) {
                        break;
                    } else if (Math.abs(balance - expectedAmount) < threshold) {
                        break;
                    }

                    //Log
                    let timeInSeconds = (Date.now() - start) / 1000;
                    LogProgress(`$bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds) * 10) / 10}s`);

                    //Check timeout
                    if (Date.now() - start > timeoutSeconds * 1000) {
                        reject(new Error("Timeout waiting for balance"));
                    }

                    //Wait and Check balance
                    await Sleep(1000);
                    balance = await this.getBalance(address);
                }
                //Log
                let timeInSeconds = (Date.now() - start) / 1000;
                LogProgress(`$bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds) * 10) / 10}s`);


                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async waitForMinBalance(address: string, minAmount: number, timeoutSeconds: number = 60): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {

                //Get start time & balance
                const start = Date.now();
                let balance = await this.getBalance(address);

                //Loop until balance (or timeout) is reached
                while (true) {

                    //Check break conditions
                    if (balance >= minAmount) {
                        break;
                    }

                    //Log
                    let timeInSeconds = (Date.now() - start) / 1000;
                    LogProgress(`$bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds) * 10) / 10}s`);

                    //Check timeout
                    if (Date.now() - start > timeoutSeconds * 1000) {
                        reject(new Error("Timeout waiting for balance"));
                    }

                    //Wait and Check balance
                    await Sleep(1000);
                    balance = await this.getBalance(address);
                }
                //Log
                let timeInSeconds = (Date.now() - start) / 1000;
                LogProgress(`$bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds) * 10) / 10}s`);


                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async waitForBalanceChange(address: string, startingAmount: number, timeoutSeconds: number = 60): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {

                //Get start time & balance
                const start = Date.now();
                let balance = await this.getBalance(address);

                //Loop until balance (or timeout) is reached
                while (true) {

                    //Check break conditions
                    if (balance != startingAmount) {
                        break;
                    }

                    //Log
                    let timeInSeconds = (Date.now() - start) / 1000;
                    LogProgress(`$bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds) * 10) / 10}s`);

                    //Check timeout
                    if (Date.now() - start > timeoutSeconds * 1000) {
                        reject(new Error("Timeout waiting for balance"));
                    }

                    //Wait and Check balance
                    await Sleep(1000);
                    balance = await this.getBalance(address);
                }
                //Log
                let timeInSeconds = (Date.now() - start) / 1000;
                LogProgress(`$bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds) * 10) / 10}s`);


                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async getTokenBalance(address: string, symbol: string): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this._client) throw new Error("Solana Client not defined");
                if (!this._accounts) throw new Error("Solana Accounts not defined");
                if (!this._transactions) throw new Error("Solana transactions not defined");
                if (!this._assets) throw new Error("Solana Assets not defined");

                //Get Token
                const token = BridgeTokens.get("solana", symbol);
                if (!token) throw new Error("Token not found");
                if (!token.address) throw new Error("mint address is required");
                if (typeof token.address !== "string") throw new Error("token address is required in string format");

                //get token account
                const tokenAccount = await this._assets.getTokenAccount(new PublicKey(address), token);
                if (!tokenAccount) throw new Error("Token Account not found");

                //Get balance (Units)
                let unitsContext = await this._client.getTokenAccountBalance(tokenAccount.address);
                let unitsValue = unitsContext.value;
                let balance = ValueUnits.fromUnits(BigInt(unitsValue.amount), unitsValue.decimals).value;
                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async waitForTokenBalance(address: string, symbol: string, expectedAmount: number, timeoutSeconds: number = 60, threshold: number = 0.001, anybalance: boolean = false, noBalance: boolean = false): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {

                //Get start time & balance
                const start = Date.now();
                let balance = await this.getTokenBalance(address,symbol);

                //Loop until balance (or timeout) is reached
                while (true) {

                    //Check break conditions
                    if (anybalance && balance > 0) {
                        break;
                    } else if (noBalance && balance == 0) {
                        break;
                    } else if (Math.abs(balance - expectedAmount) < threshold) {
                        break;
                    }

                    //Log
                    let timeInSeconds = (Date.now() - start) / 1000;
                    LogProgress(`${symbol} bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds) * 10) / 10}s`);

                    //Check timeout
                    if (Date.now() - start > timeoutSeconds * 1000) {
                        reject(new Error("Timeout waiting for balance"));
                    }

                    //Wait and Check balance
                    await Sleep(1000);
                    balance = await this.getTokenBalance(address, symbol);
                }
                //Log
                let timeInSeconds = (Date.now() - start) / 1000;
                LogProgress(`${symbol} bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds) * 10) / 10}s`);


                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async waitForMinTokenBalance(address: string, symbol: string, minAmount: number, timeoutSeconds: number = 60): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {

                //Get start time & balance
                const start = Date.now();
                let balance = await this.getTokenBalance(address,symbol);

                //Loop until balance (or timeout) is reached
                while (true) {

                    if (balance >= minAmount) {
                        break;
                    }

                    //Log
                    let timeInSeconds = (Date.now() - start) / 1000;
                    LogProgress(`${symbol} bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds) * 10) / 10}s`);

                    //Check timeout
                    if (Date.now() - start > timeoutSeconds * 1000) {
                        reject(new Error("Timeout waiting for balance"));
                    }

                    //Wait and Check balance
                    await Sleep(1000);
                    balance = await this.getTokenBalance(address, symbol);
                }
                //Log
                let timeInSeconds = (Date.now() - start) / 1000;
                LogProgress(`${symbol} bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds) * 10) / 10}s`);


                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }
    public async waitForTokenBalanceChange(address: string, symbol: string, startingAmount: number, timeoutSeconds: number = 60): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {

                //Get start time & balance
                const start = Date.now();
                let balance = await this.getTokenBalance(address,symbol);

                //Loop until balance (or timeout) is reached
                while (true) {

                    if (balance != startingAmount) {
                        break;
                    }

                    //Log
                    let timeInSeconds = (Date.now() - start) / 1000;
                    LogProgress(`${symbol} bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds) * 10) / 10}s`);

                    //Check timeout
                    if (Date.now() - start > timeoutSeconds * 1000) {
                        reject(new Error("Timeout waiting for balance"));
                    }

                    //Wait and Check balance
                    await Sleep(1000);
                    balance = await this.getTokenBalance(address, symbol);
                }
                //Log
                let timeInSeconds = (Date.now() - start) / 1000;
                LogProgress(`${symbol} bal. (${balance}), Timeout in ${Math.round((timeoutSeconds - timeInSeconds) * 10) / 10}s`);


                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }

    //Helper Functions
    async getTestAirDrop(signer: SolanaAccount): Promise<boolean> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            try {
                if (!this._client) throw new Error('Solana Client not found');
                const result = await this._client.requestAirdrop(signer.pk, 1_000_000_000);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Txn helper 
    async sendAndConfirmTransaction(txn:Transaction,account:SolanaAccount): Promise<string> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async(resolve, reject) => {
            try{

                if(!txn) throw new Error("transaction is not valid");
                if(!account) throw new Error(" account is not defined");
                if(!this._client) throw new Error("solana client not connected")
                const wallet = Keypair.fromSecretKey(account.sk); 

                const txn_signature = await sendAndConfirmTransaction(this._client, txn,[wallet]);


                resolve(txn_signature)

            }catch(err){
                reject(err)
            }
        });
        
    }

   // wallet- txn helper 
    public async sendSignedTransaction(txn:number[] | Uint8Array ) :Promise<string> {
        return new Promise(async (resolve,reject) => {
            try{
                if (!txn) throw new Error("Transaction is not Signed");
                if (!this._client) throw new Error(" solana client not connected");
                const txn_hash = await this._client.sendRawTransaction(txn,{
                    skipPreflight: false,
                    preflightCommitment: COMMITMENT
                  });

                resolve(txn_hash)
            }catch(err){
                reject(err)
            }
        })

    }
}



