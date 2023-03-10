import * as ethers from "ethers"   ;
import { BridgeAccounts, BridgeAccountManager } from "../../common/interfaces/interfaces";
import { AlgorandAccount } from "../algorand";
import { SolanaAccount } from "../solana";
export type EvmAccount = {
    addr:string, 
    pk:string,
    mnemonic:string
}

export class EvmAccounts implements BridgeAccountManager<BridgeAccounts> {

    private _accounts: Record<string, EvmAccount> = {};
    public async add( ...args: [sk: Uint8Array | undefined] | [mnemonic: string | undefined] ):Promise<EvmAccount> {
    const mnemonic_ = args[0] as string;
    const wallet = await  ethers.Wallet.fromMnemonic(mnemonic_)
    const privateKey = wallet.privateKey;
    const address = wallet.address;
    const evmAccount:EvmAccount = {
        addr:address,
        pk:privateKey,
        mnemonic:mnemonic_
    }
    this._accounts[address] = evmAccount; 
    return Promise.resolve(evmAccount)
    }

    public async createNew():Promise<EvmAccount>{
        return new Promise(async(resolve,reject) =>{
            try{
                const wallet =  await  ethers.Wallet.createRandom();
                let address = wallet.address; 
                let privateKey = wallet.privateKey; 
                let mnemonic_ = wallet.mnemonic.phrase ; 
        
                let evmAccount:EvmAccount ={
                    addr:address,
                    pk:privateKey,
                    mnemonic:mnemonic_
                } 
                
                await this.add(mnemonic_);

                resolve(evmAccount)

            }catch(e){
                reject(e)
            }
        })

    }   

    createNewWithPrefix(prefix: string, tries?: number | undefined): Promise<AlgorandAccount | undefined> | Promise<EvmAccount | undefined> {
        throw new Error("Method not implemented.");
    }
    updateAccountDetails(local_account: AlgorandAccount | SolanaAccount | undefined, getAssetDetails?: boolean | undefined): Promise< EvmAccount> {
        throw new Error("Method not implemented.");
    }

}


