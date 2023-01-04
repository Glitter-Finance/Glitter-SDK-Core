import { GlitterNetworks } from "glitter-bridge-sdk/dist";
import { BridgeEvmNetwork, EvmAddressConfig } from "./types";

const EVM_CONFIG: Record<GlitterNetworks, EvmAddressConfig> = {
  testnet: {
    [BridgeEvmNetwork.Avalanche]: {
      bridge: "",
      rpcUrl: "",
      tokens: { usdc: "" },
      depositWallet: "",
      releaseWallet: "",
    },
    [BridgeEvmNetwork.Ethereum]: {
      bridge: "0x29e885951b8ef0a38c1f2d44aa7300cd268b398c",
      rpcUrl: "",
      tokens: { usdc: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F" },
      depositWallet: "",
      releaseWallet: "",
    },
    [BridgeEvmNetwork.Hedera]: {
      bridge: "",
      rpcUrl: "",
      tokens: { usdc: "" },
      depositWallet: "",
      releaseWallet: "",
    },
    [BridgeEvmNetwork.Polygon]: {
      bridge: "0xe3495ebfa9d668d2fb7ec625da6d1f74475fd263",
      rpcUrl: "",
      tokens: { usdc: "0x0fa8781a83e46826621b3bc094ea2a0212e71b23" },
      depositWallet: "",
      releaseWallet: "",
    },
  },
  mainnet: {
    [BridgeEvmNetwork.Avalanche]: {
      bridge: "",
      rpcUrl: "",
      tokens: { usdc: "" },
      depositWallet: "",
      releaseWallet: "",
    },
    [BridgeEvmNetwork.Ethereum]: {
      bridge: "",
      rpcUrl: "",
      tokens: { usdc: "" },
      depositWallet: "",
      releaseWallet: "",
    },
    [BridgeEvmNetwork.Hedera]: {
      bridge: "",
      rpcUrl: "",
      tokens: { usdc: "" },
      depositWallet: "",
      releaseWallet: "",
    },
    [BridgeEvmNetwork.Polygon]: {
      bridge: "",
      rpcUrl: "",
      tokens: { usdc: "" },
      depositWallet: "",
      releaseWallet: "",
    },
  },
};

export default EVM_CONFIG;
