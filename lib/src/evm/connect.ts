import { BridgeEvmNetwork, GlitterEvmBridgeConfig, TokenId } from "./types";
import { ethers, providers } from "ethers";
import {
  ERC20,
  ERC20__factory,
  TokenBridge,
  TokenBridge__factory,
} from "glitter-evm-contracts";
import { GlitterNetworks } from "glitter-bridge-sdk/dist";
import EVM_ADDRESSES from "./addresses";

type EvmConnection = {
  rpcProvider: providers.BaseProvider;
  bridge: TokenBridge;
  tokens: Record<TokenId, ERC20>;
};

function createConnections(
  rpcUrl: string,
  network: BridgeEvmNetwork,
  environment: GlitterNetworks
): EvmConnection {
  const bridgeAddress = EVM_ADDRESSES[environment][network].bridge;
  const tokenAddress = EVM_ADDRESSES[environment][network].tokens.usdc;
  const rpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const bridge = TokenBridge__factory.connect(bridgeAddress, rpcProvider);
  const usdc = ERC20__factory.connect(tokenAddress, rpcProvider);

  return {
    rpcProvider,
    bridge,
    tokens: { usdc },
  };
}

export class EvmConnect {
  protected readonly __providers: Record<BridgeEvmNetwork, EvmConnection>;

  constructor(sdkConfig: {
    networks: GlitterEvmBridgeConfig[];
    environment: GlitterNetworks;
  }) {
    this.__providers = sdkConfig.networks.reduce((_providers, config) => {
      _providers[config.network] = createConnections(
        config.rpcUrl,
        config.network,
        sdkConfig.environment
      );
      return _providers;
    }, {} as Record<BridgeEvmNetwork, EvmConnection>);
  }
}
