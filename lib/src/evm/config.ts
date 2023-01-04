import { GlitterNetworks } from "glitter-bridge-sdk/dist";
import { BridgeEvmNetwork, EvmConfig } from "./types";

const EVM_CONFIG: Record<GlitterNetworks, EvmConfig> = {
  testnet: {
    [BridgeEvmNetwork.Avalanche]: {
      bridge: "",
      rpcUrl: "",
      tokens: { usdc: "" },
      depositWallet: "",
      releaseWallet: "",
      chainId: 43113,
    },
    [BridgeEvmNetwork.Ethereum]: {
      bridge: "0x29e885951b8ef0a38c1f2d44aa7300cd268b398c",
      rpcUrl: "",
      tokens: { usdc: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F" },
      depositWallet: "",
      releaseWallet: "",
      chainId: 5,
    },
    [BridgeEvmNetwork.Polygon]: {
      bridge: "0xe3495ebfa9d668d2fb7ec625da6d1f74475fd263",
      rpcUrl: "",
      tokens: { usdc: "0x0fa8781a83e46826621b3bc094ea2a0212e71b23" },
      depositWallet: "",
      releaseWallet: "",
      chainId: 80001,
    },
  },
  mainnet: {
    [BridgeEvmNetwork.Avalanche]: {
      chainId: 43114,
      bridge: "",
      rpcUrl: "",
      tokens: { usdc: "" },
      depositWallet: "",
      releaseWallet: "",
    },
    [BridgeEvmNetwork.Ethereum]: {
      chainId: 1,
      bridge: "",
      rpcUrl: "",
      tokens: { usdc: "" },
      depositWallet: "",
      releaseWallet: "",
    },
    [BridgeEvmNetwork.Polygon]: {
      chainId: 137,
      bridge: "",
      rpcUrl: "",
      tokens: { usdc: "" },
      depositWallet: "",
      releaseWallet: "",
    },
  },
};

export default EVM_CONFIG;
