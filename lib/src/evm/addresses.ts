import { GlitterNetworks } from "glitter-bridge-sdk/dist";
import { BridgeEvmNetwork, EvmAddressConfig } from "./types";

const EVM_ADDRESSES: Record<GlitterNetworks, EvmAddressConfig> = {
  testnet: {
    [BridgeEvmNetwork.Avalanche]: {
      bridge: "",
      tokens: { usdc: "" },
      glitterCircleWallet: "",
    },
    [BridgeEvmNetwork.Ethereum]: {
      bridge: "",
      tokens: { usdc: "" },
      glitterCircleWallet: "",
    },
    [BridgeEvmNetwork.Hedera]: {
      bridge: "",
      tokens: { usdc: "" },
      glitterCircleWallet: "",
    },
    [BridgeEvmNetwork.Polygon]: {
      bridge: "",
      tokens: { usdc: "" },
      glitterCircleWallet: "",
    },
  },
  mainnet: {
    [BridgeEvmNetwork.Avalanche]: {
      bridge: "",
      tokens: { usdc: "" },
      glitterCircleWallet: "",
    },
    [BridgeEvmNetwork.Ethereum]: {
      bridge: "",
      tokens: { usdc: "" },
      glitterCircleWallet: "",
    },
    [BridgeEvmNetwork.Hedera]: {
      bridge: "",
      tokens: { usdc: "" },
      glitterCircleWallet: "",
    },
    [BridgeEvmNetwork.Polygon]: {
      bridge: "",
      tokens: { usdc: "" },
      glitterCircleWallet: "",
    },
  },
};

export default EVM_ADDRESSES;
