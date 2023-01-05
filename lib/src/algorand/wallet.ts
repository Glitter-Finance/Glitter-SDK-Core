import { PeraWalletConnect } from "@perawallet/connect";
// @ts-ignore
import MyAlgoConnect from "@randlabs/myalgo-connect";
import EventEmitter from "eventemitter3";
import { MyAlgoWalletResult, PeraWalletResult } from "./config";

// Algorand Wallet class
// Will be used to connect different algorand wallets
export class AlgorandWallet extends EventEmitter {
  // Reconnect pera wallet
  // This will only be used if nothing is detected in pera wallet. We would reconnect it.
  private async reconnectPeraWallet(): Promise<PeraWalletResult> {
    // Return a promise that will be resolved or rejected
    return new Promise(async (resolve, reject) => {
      try {
        // Initialize pera wallet and connect
        const peraWallet = new PeraWalletConnect();
        const result = await peraWallet.connect();

        if (peraWallet.connector?.peerMeta?.name !== "Pera Wallet") {
          await peraWallet.disconnect();
          reject("Please make sure you connect with Pera Wallet");
          return;
        }

        // On disconnect. If pera wallet gets disconnected the emitter will emit "disconnect" event
        peraWallet.connector?.on("disconnect", () => this.emit("disconnect"));

        // Get pera wallet address
        const peraWalletAddress = result?.[0] || "";

        // Resolve
        resolve({ address: peraWalletAddress, wallet: peraWallet });
      } catch (err) {
        // Reject
        reject(err);
      }
    });
  }

  // Connect pera wallet
  public async connectPeraWallet(): Promise<PeraWalletResult> {
    // Return a promise that will be resolved or rejected
    return new Promise(async (resolve, reject) => {
      try {
        // Initialize pera wallet and reconnect session
        const peraWallet = new PeraWalletConnect();
        const result = await peraWallet.reconnectSession();

        // If no result or no length of result found then reconnect
        if (!result || !result?.length) {
          const { address, wallet } = await this.reconnectPeraWallet();
          resolve({ address, wallet });
          return;
        }

        // On disconnect. If pera wallet gets disconnected the emitter will emit "disconnect" event
        peraWallet.connector?.on("disconnect", () => this.emit("disconnect"));

        // Get pera wallet address
        const peraWalletAddress = result?.[0] || "";

        // Resolve
        resolve({ address: peraWalletAddress, wallet: peraWallet });
      } catch (error) {
        // Reject
        reject(error);
      }
    });
  }

  // Disconnect pera wallet
  public disconnectPeraWallet(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Initialize pera wallet
        const peraWallet = new PeraWalletConnect();

        // disconnect pera wallet
        await peraWallet.disconnect();

        // Resolve
        resolve();
      } catch (error) {
        // Reject
        reject(error);
      }
    });
  }

  // Connect myAlgo wallet
  public connectMyAlgo(): Promise<MyAlgoWalletResult> {
    return new Promise(async (resolve, reject) => {
      try {
        // Initialize MyAlgo wallet
        const myAlgoWallet = new MyAlgoConnect();

        // connect myAlgoWallet and get address
        const accounts = await myAlgoWallet.connect();
        const address = accounts?.[0]?.address || "";

        // Resolve
        resolve({ address: address, wallet: myAlgoWallet });
      } catch (error) {
        // Reject
        reject(error);
      }
    });
  }
}
