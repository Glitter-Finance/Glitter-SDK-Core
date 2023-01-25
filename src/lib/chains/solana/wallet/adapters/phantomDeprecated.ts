import EventEmitter from "eventemitter3";

// Phantom Provider
// This Provider will be used to connect to a phantom wallet
export class PhantomProvider extends EventEmitter {
  // Get phantom provider
  // See wether phantom wallet is available
  // get phantomProvider() {
  //   const windowBrowser = window as any;

  //   // If phantom is not installed return nothing
  //   if (!windowBrowser?.solana?.isPhantom) {
  //     return;
  //   }

  //   // Otherwise return solana window object
  //   return windowBrowser.solana;
  // }

  // // Connect
  // public connect(): Promise<void> {
  //   // Return a promise that will be resolved or rejected
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       // Get phantom wallet provider
  //       const provider = this.phantomProvider;

  //       // If provider does not exist return reject with a phantom wallet app link window
  //       if (!provider) {
  //         window.open("https://phantom.app/", "_blank");
  //         reject("You don't have phantom wallet installed");
  //         return;
  //       }

  //       // On connect
  //       provider?.on("connect", (args: any) => this.emit("connect", args));

  //       // Connect to provider (phantom wallet)
  //       await provider.connect();

  //       // Rseolve
  //       resolve();
  //     } catch (error) {
  //       // Reject
  //       reject(error);
  //     }
  //   });
  // }
}
