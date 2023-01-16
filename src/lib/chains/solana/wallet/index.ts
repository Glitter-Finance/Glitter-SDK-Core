import EventEmitter from "eventemitter3";

import { Network, SolanaWalletOption, WALLET_PROVIDERS } from "./config";
import { PhantomWalletAdapter,SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

// Solana Wallet Class
// This class will be used to conenct solana wallets
export class SolanaWallets extends EventEmitter {
  // Connect Solana Wallet public async function
  // public async connectSolanaWallet(
  //   walletOption: SolanaWalletOption,
  //   network: Network
  // ): Promise<void> {
  //   // Return a promise that will be resolved or rejected
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       // Find provider which we support
  //       const provider = WALLET_PROVIDERS.find(
  //         ({ name }) => name === walletOption
  //       );

  //       // If provider not found reject the promise and return nothing
  //       if (!provider) {
  //         reject("Wallet option not supported");
  //         return;
  //       }

  //       // Get network type. mainnet, devnet or testnet
  //       const networkType = Network[network];

  //       // If network type not found or not supported reject the promise and return nothing
  //       if (!networkType) {
  //         reject(
  //           "Network option not supported. Please pick the right network type"
  //         );
  //         return;
  //       }

  //       // Wallet connection
  //       const wallet: any = new (provider.adapter || Wallet)(
  //         provider.url,
  //         network
  //       );

  //       // Return wallet object. If phantom wallet return phantom provider, otherwsie return normal wallet
  //       const walletConnection =
  //         walletOption === SolanaWalletOption.phantom
  //           ? wallet.phantomProvider
  //           : wallet;

  //       // On connect
  //       wallet.on("connect", (args: any) =>
  //         this.emit("connect", args, walletConnection)
  //       );

  //       // On disconnect
  //       wallet.on("disconnect", () => this.emit("disconnect"));

  //       // Connect wallet
  //       await wallet.connect();

  //       // Resolve
  //       resolve();
  //     } catch (error) {
  //       // Reject
  //       reject(error);
  //     }
  //   });
  // }

public async  connectToSolanaWallet(walletType: SolanaWalletOption):Promise<void> {

  return new Promise(async (resolve,reject) => {

    try {
      let Phantomwallet:PhantomWalletAdapter = new PhantomWalletAdapter();
      let solfareWallet:SolflareWalletAdapter = new SolflareWalletAdapter();
  
      const provider = WALLET_PROVIDERS.find(
        ({ name }) => name === walletType
      );
  
      // If provider not found reject the promise and return nothing
      if (!provider) {
      // reject("Wallet option not supported");
           return;
      }
  
      if (provider.name == "phantom"){
        await Phantomwallet.connect();
        Phantomwallet.on('error', (error) =>{
        throw new Error('Phantom wallet error: ' + error);
        })
           
      }else {
        await solfareWallet.connect() ;
        solfareWallet.on('error', (error) =>{
          throw new Error('Phantom wallet error: ' + error);
          })
      }

      resolve();
      
    }catch (err){
        reject(err)  
    }
  });
   
}
}


