import EventEmitter from "eventemitter3";
import Wallet from "@project-serum/sol-wallet-adapter";
import { Network, SolanaWalletOption, WALLET_PROVIDERS } from "./config";

// Solana Wallet Class
// This class will be used to conenct solana wallets
export class SolanaWallet extends EventEmitter {
  // Connect Solana Wallet public async function
  public async connectSolanaWallet(
    walletOption: SolanaWalletOption,
    network: Network
  ): Promise<void> {
    // Return a promise that will be resolved or rejected
    return new Promise(async (resolve, reject) => {
      try {
        // Find provider which we support
        const provider = WALLET_PROVIDERS.find(
          ({ name }) => name === walletOption
        );

        // If provider not found reject the promise and return nothing
        if (!provider) {
          reject("Wallet option not supported");
          return;
        }

        // Get network type. mainnet, devnet or testnet
        const networkType = Network[network];

        // If network type not found or not supported reject the promise and return nothing
        if (!networkType) {
          reject(
            "Network option not supported. Please pick the right network type"
          );
          return;
        }

        // Wallet connection
        const wallet: any = new (provider.adapter || Wallet)(
          provider.url,
          network
        );

        // Return wallet object. If phantom wallet return phantom provider, otherwsie return normal wallet
        const walletConnection =
          walletOption === SolanaWalletOption.phantom
            ? wallet.phantomProvider
            : wallet;

        // On connect
        wallet.on("connect", (args: any) =>
          this.emit("connect", args, walletConnection)
        );

        // On disconnect
        wallet.on("disconnect", () => this.emit("disconnect"));

        // Connect wallet
        await wallet.connect();

        // Resolve
        resolve();
      } catch (error) {
        // Reject
        reject(error);
      }
    });
  }
}
