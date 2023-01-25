// import { PhantomProvider } from "./adapters/phantomDeprecated";

export const WALLET_PROVIDERS = [
  {
    name: "phantom",
    url: "https://phantom.app/",
    // adapter: PhantomProvider,
  },
  {
    name: "solflare",
    url: "https://solflare.com/access-wallet",
  },
];

export enum SolanaWalletOption {
  solflare = "solflare",
  phantom = "phantom",
}

export enum Network {
  mainnet = "mainnet",
  devnet = "devnet",
  testnet = "testnet",
}
