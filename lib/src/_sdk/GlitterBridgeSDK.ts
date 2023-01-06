import { AlgorandConnect } from "../algorand";
import { EvmConnect } from "../evm";
import { SolanaConnect } from "../solana";
import { BridgeToken, BridgeTokens } from "../_common";
import {
  BridgeEvmNetworks,
  BridgeNetworks,
} from "../_common/networks/networks";
import { GlitterBridgeConfig, GlitterEnvironment } from "../_configs/config";
import { BridgeMainnet } from "../_configs/networks/mainnet";
import { BridgeTestnet } from "../_configs/networks/testnet";
export class GlitterBridgeSDK {
  //Configs
  private _bridgeConfig: GlitterBridgeConfig | undefined;

  //RPC overrides
  private _rpcOverrides: { [key: string]: string } = {};

  //Connections
  private _algorand: AlgorandConnect | undefined;
  private _solana: SolanaConnect | undefined;
  private _evm: Record<BridgeEvmNetworks, EvmConnect | undefined> = {
    ethereum: undefined,
    polygon: undefined,
    avalanche: undefined,
  };

  //Setters
  public setEnvironment(environment: GlitterEnvironment): GlitterBridgeSDK {
    switch (environment) {
      case GlitterEnvironment.mainnet:
        this._bridgeConfig = BridgeMainnet;
        break;
      case GlitterEnvironment.testnet:
        this._bridgeConfig = BridgeTestnet;
        break;
      default:
        throw new Error("Environment not found");
    }

    //Get Tokens
    let tokens: BridgeToken[] = [];
    this._bridgeConfig.algorand.tokens.forEach((token) => {
      tokens.push(token);
    });
    this._bridgeConfig.solana.tokens.forEach((token) => {
      tokens.push(token);
    });
    BridgeTokens.loadConfig(tokens);

    return this;
  }

  public setRPC(network: BridgeNetworks, rpc: string): GlitterBridgeSDK {
    this._rpcOverrides[network] = rpc;
    return this;
  }

  //Connectors
  public connect(networks: BridgeNetworks[]): GlitterBridgeSDK {
    //Connect to the networks
    networks.forEach((network) => {
      switch (network) {
        case BridgeNetworks.algorand:
          this.connectToAlgorand();
          break;
        case BridgeNetworks.solana:
          this.connectToSolana();
          break;
        case BridgeNetworks.Ethereum:
          this.connectToEvmNetwork(BridgeNetworks.Ethereum);
          break;
        case BridgeNetworks.Polygon:
          this.connectToEvmNetwork(BridgeNetworks.Polygon);
          break;
        case BridgeNetworks.Avalanche:
          this.connectToEvmNetwork(BridgeNetworks.Avalanche);
          break;
      }
    });

    return this;
  }

  private connectToAlgorand(): GlitterBridgeSDK {
    //Failsafe
    if (!this._bridgeConfig) throw new Error("Glitter environment not set");
    if (!this._bridgeConfig.algorand)
      throw new Error("Algorand environment not set");

    if (this._rpcOverrides[BridgeNetworks.algorand]) {
      console.log(
        "Algorand RPC override: " + this._rpcOverrides[BridgeNetworks.algorand]
      );
      this._bridgeConfig.algorand.serverUrl =
        this._rpcOverrides[BridgeNetworks.algorand];
    }

    //Get the connections
    this._algorand = new AlgorandConnect(this._bridgeConfig.algorand);

    if (!this._algorand.client) throw new Error("Algorand client not set");

    return this;
  }

  private connectToSolana(): GlitterBridgeSDK {
    //Failsafe
    if (!this._bridgeConfig) throw new Error("Glitter environment not set");
    if (!this._bridgeConfig.solana)
      throw new Error("Solana environment not set");

    if (this._rpcOverrides[BridgeNetworks.solana]) {
      console.log(
        "Solana RPC override: " + this._rpcOverrides[BridgeNetworks.solana]
      );
      this._bridgeConfig.solana.server =
        this._rpcOverrides[BridgeNetworks.solana];
    }

    this._solana = new SolanaConnect(this._bridgeConfig?.solana);
    //(this._glitterNetwork.algorand.appProgramId);

    if (!this._solana.client) throw new Error("Solana client not set");
    return this;
  }

  private connectToEvmNetwork(network: BridgeEvmNetworks): GlitterBridgeSDK {
    //Failsafe
    if (!this._bridgeConfig) throw new Error("Glitter environment not set");
    if (!this._bridgeConfig.evm[network])
      throw new Error("EVM environment not set");

    if (this._rpcOverrides[network]) {
      this._bridgeConfig.evm[network].rpcUrl = this._rpcOverrides[network];
    }

    this._evm[network] = new EvmConnect(
      network,
      this._bridgeConfig.evm[network]
    );
    return this;
  }

  /**
   * Returns EVMConnect for
   * a specific evm network
   * @param {BridgeEvmNetworks} network
   * @returns {EvmConnect | undefined}
   */
  public getEvmNetwork(network: BridgeEvmNetworks): EvmConnect | undefined {
    return this._evm[network];
  }

  //Getters
  get algorand(): AlgorandConnect | undefined {
    return this._algorand;
  }
  get solana(): SolanaConnect | undefined {
    return this._solana;
  }
}
