import {
  BridgeDepositEvent,
  BridgeReleaseEvent,
  EvmNetworkConfig,
  TransferEvent,
} from "./types";
import { ethers, providers } from "ethers";
import {
  ERC20,
  ERC20__factory,
  TokenBridge,
  TokenBridge__factory,
} from "glitter-evm-contracts";
import { EvmBridgeEventsParser } from "./events";
import { PublicKey } from "@solana/web3.js";
import algosdk from "algosdk";
import { SerializeEvmBridgeTransfer } from "./serde";
import {
  BridgeEvmNetworks,
  BridgeNetworks,
} from "../../common/networks/networks";

type Connection = {
  rpcProvider: providers.BaseProvider;
  bridge: TokenBridge;
  tokens: Record<string, ERC20>;
};

export class EvmConnect {
  protected readonly __network: BridgeEvmNetworks;
  protected readonly __providers: Connection;
  protected readonly __config: EvmNetworkConfig;

  private createConnections(
    rpcUrl: string,
    config: EvmNetworkConfig
  ): Connection {
    const bridgeAddress = config.bridge;
    const rpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const bridge = TokenBridge__factory.connect(bridgeAddress, rpcProvider);
    const tokens = config.tokens.reduce((_tokens, curr) => {
      const symbol = curr.symbol.toLowerCase();
      _tokens[symbol] = ERC20__factory.connect(curr.address, rpcProvider);
      return _tokens;
    }, {} as Record<string, ERC20>);

    return {
      rpcProvider,
      bridge,
      tokens,
    };
  }

  constructor(network: BridgeEvmNetworks, config: EvmNetworkConfig) {
    this.__config = config;
    this.__network = network;
    this.__providers = this.createConnections(config.rpcUrl, config);
  }

  get provider(): ethers.providers.BaseProvider {
    return this.__providers.rpcProvider;
  }

  get config(): EvmNetworkConfig {
    return this.__config;
  }

  get network(): BridgeEvmNetworks {
    return this.__network;
  }
  /**
   * Provide address of bridge
   * component
   * @param {"tokens" | "bridge" | "depositWallet" | "releaseWallet"} entity
   * @param {"USDC"} tokenSymbol only USDC for now
   * @returns {string}
   */
  getAddress(
    entity: "tokens" | "bridge" | "depositWallet" | "releaseWallet",
    tokenSymbol?: string
  ): string {
    if (entity === "tokens") {
      if (!tokenSymbol)
        throw new Error("[EvmConnect] Please provide token symbol.");

      const token = this.__config.tokens.find(
        (token) => token.symbol.toLowerCase() === tokenSymbol.toLowerCase()
      );

      if (!token) {
        throw new Error(
          "[EvmConnect] Can not provide address of undefined token."
        );
      }

      return token.address.toLowerCase();
    }

    return this.__config[entity].toLowerCase();
  }

  private isValidToken(tokenSymbol: string): boolean {
    return !!this.__providers.tokens[tokenSymbol.toLowerCase()];
  }
  /**
   * Provide token balance of an address
   * on the connected evm network
   * @param {"USDC"} tokenSymbol only USDC for now
   * @param {string} address
   * @returns {ethers.BigNumber}
   */
  async getTokenBalanceOnNetwork(
    tokenSymbol: string,
    address: string
  ): Promise<ethers.BigNumber> {
    if (!this.isValidToken(tokenSymbol))
      return Promise.reject("[EvmConnect] Unsupported token symbol.");

    const erc20 = this.__providers.tokens[tokenSymbol];
    const balance = await erc20.balanceOf(address);
    return balance;
  }
  /**
   * Before bridging tokens we need to check
   * if tokens are approved for bridge to use
   * if not, we can use this method to sign
   * and approve transaction
   * @param {"USDC"} tokenSymbol only USDC for now
   * @param {ethers.BigNumber | string} amount in BigNumber units e.g 1_000_000 for 1USDC
   * @param {ethers.Signer} signer to sign the transaction
   * @returns {ethers.ContractTransaction}
   */
  async approveTokensForBridge(
    tokenSymbol: string,
    amount: ethers.BigNumber | string,
    signer: ethers.Signer
  ): Promise<ethers.ContractTransaction> {
    if (!this.isValidToken(tokenSymbol))
      return Promise.reject("[EvmConnect] Unsupported token symbol.");

    const bridgeAddress = this.getAddress("bridge");
    const tokenAddress = this.getAddress("tokens", tokenSymbol);

    const token = ERC20__factory.connect(tokenAddress, signer);
    return await token.increaseAllowance(bridgeAddress, amount);
  }
  /**
   * Get the amount of tokens approved
   * to be used by the bridge
   * @param {"USDC"} tokenSymbol only USDC for now
   * @param {ethers.Signer} signer to sign the transaction
   * @returns {ethers.BigNumber}
   */
  async bridgeAllowance(
    tokenSymbol: string,
    signer: ethers.Signer
  ): Promise<ethers.BigNumber> {
    if (!this.isValidToken(tokenSymbol))
      return Promise.reject("Unsupported token symbol.");

    const tokenAddress = this.getAddress("tokens", tokenSymbol);
    const usdc = ERC20__factory.connect(tokenAddress, signer);

    const allowance = await usdc.allowance(
      signer.getAddress(),
      this.getAddress("bridge", tokenSymbol)
    );

    return allowance;
  }
  /**
   * Parse transaction receipts to retrieve
   * bridge transfer data
   * @param {string} txHash transaction hash of deposit or release event on evm chain
   * @returns {Array<TransferEvent | BridgeDepositEvent | BridgeReleaseEvent>}
   */
  async parseLogs(
    txHash: string
  ): Promise<Array<TransferEvent | BridgeDepositEvent | BridgeReleaseEvent>> {
    try {
      let events: Array<
        TransferEvent | BridgeDepositEvent | BridgeReleaseEvent
      > = [];
      const parser = new EvmBridgeEventsParser();
      const transactionReceipt =
        await this.__providers.rpcProvider.getTransactionReceipt(txHash);

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
  /**
   * Check if provided wallet is
   * connected to same chain as EvmConnect
   * to execute a transaction
   * @param {ethers.Wallet} wallet
   * @returns {Promise<boolean>}
   */
  private async isCorrectChain(wallet: ethers.Wallet): Promise<boolean> {
    const chainId = await wallet.getChainId();
    return this.__config.chainId === chainId;
  }
  /**
   * Bridge tokens to another supported chain
   * @param {BridgeNetworks} destination
   * @param {"USDC"} tokenSymbol only USDC for now
   * @param {string | ethers.BigNumber} amount in BigNumber units e.g 1_000_000 for 1USDC
   * @param {string | PublicKey | algosdk.Account} destinationWallet provide USDC reciever address on destination chain
   * @param {ethers.Wallet} wallet to sign transaction
   * @returns {Promise<ethers.ContractTransaction>}
   */
  async bridge(
    destination: BridgeNetworks,
    tokenSymbol: string,
    amount: ethers.BigNumber | string,
    destinationWallet: string | PublicKey | algosdk.Account,
    wallet: ethers.Wallet
  ): Promise<ethers.ContractTransaction> {
    try {
      const isCorrectChain = await this.isCorrectChain(wallet);
      if (!isCorrectChain)
        throw new Error(
          `[EvmConnect] Signer should be connected to network ${this.__network}`
        );
      if (!this.isValidToken(tokenSymbol)) {
        throw new Error(`[EvmConnect] Unsupported token symbol.`);
      }

      if (destination === this.__network) {
        throw new Error("[EvmConnect] Cannot transfer tokens to same chain.");
      }

      const bridge = TokenBridge__factory.connect(
        this.getAddress("bridge"),
        wallet
      );

      const tokenAddress = this.getAddress("tokens", tokenSymbol);
      const depositAddress = this.getAddress("depositWallet");
      const _amount =
        typeof amount === "string" ? ethers.BigNumber.from(amount) : amount;

      const serlized = SerializeEvmBridgeTransfer.serialize(
        this.__network,
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
