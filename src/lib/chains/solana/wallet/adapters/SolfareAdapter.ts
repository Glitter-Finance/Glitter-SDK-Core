// import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { Connection, PublicKey } from '@solana/web3.js'
import { defaultCommitment } from '../../utils'

/**
 * This Class Uses SolflareWalletAdapter from @solana/wallet-adapter-wallets which might have issues with React
 * So Until We test it with front-End Example I am Commenting it to cause any Isues with current Work
 * This Class is Has No Utilty As of now so i think its better to comment it until i found the working version(with React) or FE Dev tests it  
 */
export class SolfareAdapter {

  connection: Connection
  walletPublicKey: PublicKey | null
  // provider:any = this._getProvider()
  // $PhantomWalletAdapter: SolflareWalletAdapter = new SolflareWalletAdapter()

  constructor(client:Connection) {
    this.connection = client
    this.walletPublicKey = null
  }

//   /**
//    * @method initWallet
//    * @description Initializes the wallet
//    **/
//   async initWallet() {
//     if (this.provider.isPhantom) {
//       await this.$PhantomWalletAdapter.connect()
//       this.$PhantomWalletAdapter.on('error', (error) => {
//         throw new Error('Phantom wallet error: ' + error)
//       })
//       this.walletPublicKey = this.$PhantomWalletAdapter.publicKey
//     }
//   }

//   /**
//    * @method _getProvider
//    * @returns a provider for the wallet
//    */
//   _getProvider() {
//     if ('solana' in window) {
//       // @ts-ignore
//       const provider:any = window.solana
//       if (provider.isPhantom) {
//         return provider
//       }
//     }
//     throw new Error("MNEMONIC_NOT_PRESENT")
//   }

//   /**
//    * @method _getConnection
//    * @returns return the connectiomn
//    */
//   _getConnection(): Connection {
//     if (!this.connection) {
//       throw new Error('PhantomManager is not initialized')
//     }
//     return this.connection
//   }

//   /**
//    * @method walletPublicKey
//    * @returns the account public key
//    */
//   getwalletPublicKey(): PublicKey {
//     if (!this.walletPublicKey) {
//       throw new Error('Wallet not initialized')
//     }
//     return this.walletPublicKey
//   }

//   /**
//    * @method getCurrentAccountBalance
//    * @returns the current account balance
//    */
//   async getCurrentAccountBalance(): Promise<number | null> {
//     if (this.$PhantomWalletAdapter.connected) {
//       return this.connection.getBalance(
//         this.getwalletPublicKey(),
//         defaultCommitment,
//       )
//     }
//     return null
//   }

//   /**
//    * @method getAccountBalance
//    * @returns the balance of the given account
//    */
//   getAccountBalance(account: PublicKey) {
//     return this.connection.getBalance(account, defaultCommitment)
//   }

//   getAdapter(): SolflareWalletAdapter {
//     if (this.$PhantomWalletAdapter.connected) {
//       return this.$PhantomWalletAdapter
//     }
//     throw new Error('Phantom wallet not connected')
//   }

//   /**
//    * @method signMessage
//    * @returns the signature of the given message
//    * @param message
//    **/
//   async signMessage(message: string): Promise<Uint8Array> {
//     if (this.$PhantomWalletAdapter.connected) {
//       return this.$PhantomWalletAdapter.signMessage(Buffer.from(message))
//     }
//     throw new Error('Phantom wallet not connected')
//   }



//   _getConnectionStatus(): boolean {
//     return this.$PhantomWalletAdapter.connected
//   }
  
// //   async getActiveAccountAddress(): Promise< string | undefined> {
// //     let res:string | undefined ;
// //   if (this._getConnectionStatus()) {
    
// //     res = this.getwalletPublicKey().toBase58(),
// //   }
// //   return res;
// // }


// // async getPayerAccount(): string {
// //   return this.getwalletPublicKey().toBase58(),
// // }


}
