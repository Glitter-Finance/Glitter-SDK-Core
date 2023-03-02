import * as ethers from "ethers"   ;
export type EvmAccount = {
    addr:string, 
    pk:string,
    mnemonic:string
}


export class EvmAccounts {

    private _accounts: Record<string, EvmAccount> = {};
    public async add(evmAccount:EvmAccount):Promise<EvmAccount> {

        this._accounts[evmAccount.addr] = evmAccount
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
                
                await this.add(evmAccount);

                resolve(evmAccount)

            }catch(e){
                reject(e)
            }
        })
        


    }   

}