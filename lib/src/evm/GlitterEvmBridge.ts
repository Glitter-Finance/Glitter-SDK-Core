import {
  BridgeEvmNetwork,
  GlitterEvmBridgeConfig,
  TokenId,
  TokenIds,
} from "./types";
import { ethers, providers } from "ethers";
import {
  ERC20,
  ERC20__factory,
  TokenBridge,
  TokenBridge__factory,
} from "glitter-evm-contracts";
import { BridgeNetworks, GlitterNetworks } from "glitter-bridge-sdk/dist";
import EVM_CONFIG from "./config";
import {
  BridgeDepositEvent,
  BridgeReleaseEvent,
  EvmBridgeEvents,
  TransferEvent,
} from "./events";
import { PublicKey } from "@solana/web3.js";
import algosdk from "algosdk";
import { SerializeEvmBridgeTransfer } from "./serde";

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
  const bridgeAddress = EVM_CONFIG[environment][network].bridge;
  const rpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const bridge = TokenBridge__factory.connect(bridgeAddress, rpcProvider);
  const tokens = TokenIds.reduce((_tokens, curr) => {
    _tokens[curr] = ERC20__factory.connect(
      EVM_CONFIG[environment][network].tokens[curr],
      rpcProvider
    );
    return _tokens;
  }, {} as Record<TokenId, ERC20>);

  return {
    rpcProvider,
    bridge,
    tokens,
  };
}

export class GlitterEvmBridge {
  protected readonly __providers: Record<BridgeEvmNetwork, EvmConnection>;
  protected readonly __environment: GlitterNetworks;

  constructor(sdkConfig: {
    networks: GlitterEvmBridgeConfig[];
    environment: GlitterNetworks;
  }) {
    this.__environment = sdkConfig.environment;
    this.__providers = sdkConfig.networks.reduce((_providers, config) => {
      _providers[config.network] = createConnections(
        config.rpcUrl,
        config.network,
        sdkConfig.environment
      );
      return _providers;
    }, {} as Record<BridgeEvmNetwork, EvmConnection>);
  }

  getAddress(
    entity: "tokens" | "bridge" | "depositWallet" | "releaseWallet",
    network: BridgeEvmNetwork,
    tokenId?: TokenId
  ): string {
    if (entity === "tokens" && !tokenId) {
      throw new Error(
        "[GlitterEvmBridge] Can not provide address of undefined token."
      );
    }

    return entity === "tokens"
      ? EVM_CONFIG[this.__environment][network][entity][
          tokenId as TokenId
        ].toLowerCase()
      : EVM_CONFIG[this.__environment][network][entity].toLowerCase();
  }

  async getTokenBalanceOnNetwork(
    network: BridgeEvmNetwork,
    token: TokenId,
    address: string
  ): Promise<ethers.BigNumber> {
    const erc20 = this.__providers[network].tokens[token];
    const balance = await erc20.balanceOf(address);
    return balance;
  }

  async approveTokensForBridge(
    sourceNetwork: BridgeEvmNetwork,
    tokenId: TokenId,
    amount: ethers.BigNumber | string,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> {
    const bridgeAddress = this.getAddress("bridge", sourceNetwork);
    const tokenAddress = this.getAddress("tokens", sourceNetwork, tokenId);

    const token = ERC20__factory.connect(tokenAddress, signer);
    return await token.increaseAllowance(bridgeAddress, amount);
  }

  async bridgeAllowance(
    sourceNetwork: BridgeEvmNetwork,
    tokenId: TokenId,
    signer: ethers.Signer
  ): Promise<ethers.BigNumber> {
    const tokenAddress = this.getAddress("tokens", sourceNetwork, tokenId);
    const usdc = ERC20__factory.connect(tokenAddress, signer);

    const allowance = await usdc.allowance(
      signer.getAddress(),
      this.getAddress("bridge", sourceNetwork, tokenId)
    );

    return allowance;
  }

  async parseLogs(
    sourceNetwork: BridgeEvmNetwork,
    txHash: string
  ): Promise<Array<TransferEvent | BridgeDepositEvent | BridgeReleaseEvent>> {
    try {
      let events: Array<
        TransferEvent | BridgeDepositEvent | BridgeReleaseEvent
      > = [];
      const parser = new EvmBridgeEvents();
      const transactionReceipt = await this.__providers[
        sourceNetwork
      ].rpcProvider.getTransactionReceipt(txHash);

      for (const log of transactionReceipt.logs) {
        const deposit = parser.parseDeposit([log]);
        const release = parser.parseRelease([log]);
        const transfer = parser.parseTransfer([log]);

        if (deposit) events.push(deposit);
        if (release) events.push(release);
        if (transfer) events.push(transfer);
      }

      return events;
    } catch (error: any) {
      return Promise.reject(error.message);
    }
  }

  async bridge(
    source: BridgeEvmNetwork,
    destination: BridgeEvmNetwork | BridgeNetworks,
    tokenId: TokenId,
    amount: ethers.BigNumber | string,
    destinationWallet: string | PublicKey | algosdk.Account,
    wallet: ethers.Wallet
  ): Promise<ethers.ContractTransaction> {
    try {
      const bridge = TokenBridge__factory.connect(
        this.getAddress("bridge", source),
        wallet
      );

      const tokenAddress = this.getAddress("tokens", source, tokenId);
      const depositAddress = this.getAddress("depositWallet", source);
      const _amount =
        typeof amount === "string" ? ethers.BigNumber.from(amount) : amount;

      const serlized = SerializeEvmBridgeTransfer.serialize(
        source,
        destination,
        wallet.address,
        destinationWallet,
        _amount
      );

      return await bridge.deposit(
        serlized.destinationChain,
        serlized.amount,
        depositAddress,
        tokenAddress,
        serlized.destinationWallet
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
