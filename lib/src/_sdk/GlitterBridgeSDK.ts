import * as util from "util";
import { AlgorandConnect } from '../algorand';
import { SolanaConnect } from '../solana';
import { BridgeToken, BridgeTokens } from '../_common';
import { GlitterBridgeConfig, GlitterEnvironment } from '../_configs/config';
import { BridgeMainnet } from '../_configs/networks/mainnet';
import { BridgeTestnet } from '../_configs/networks/testnet';

// export enum Environment {
//   testnet = 'testnet',
//   mainnet = 'mainnet',
// }

export enum BridgeNetworks {
  algorand = "Algorand",
  solana = "Solana"
}

export class GlitterBridgeSDK {

  //Configs
  private _bridgeConfig: GlitterBridgeConfig | undefined;

  //RPC overrides
  private _rpcOverrides: { [key: string]: string } = {};

  //Connections
  private _algorand: AlgorandConnect | undefined;
  private _solana: SolanaConnect | undefined;

  //Setters
  public setEnvironment(network: GlitterEnvironment): GlitterBridgeSDK {

    //Get the environment config path
    let configUrl = '';
    switch (network) {
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
    this._bridgeConfig.algorand.tokens.forEach(token => { tokens.push(token) });
    this._bridgeConfig.solana.tokens.forEach(token => { tokens.push(token) });
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
    networks.forEach(network => {
      switch (network) {
        case BridgeNetworks.algorand:
          this.connectToAlgorand();
          break;
        case BridgeNetworks.solana:
          this.connectToSolana();
          break;
      }
    });

    return this;
  }

  private connectToAlgorand(): GlitterBridgeSDK {

    //Failsafe
    if (!this._bridgeConfig) throw new Error("Glitter environment not set");
    if (!this._bridgeConfig.algorand) throw new Error("Algorand environment not set");

    if (this._rpcOverrides[BridgeNetworks.algorand]) {
      console.log("Algorand RPC override: " + this._rpcOverrides[BridgeNetworks.algorand]);
      this._bridgeConfig.algorand.serverUrl = this._rpcOverrides[BridgeNetworks.algorand];
    }

    //Get the connections
    this._algorand = new AlgorandConnect(this._bridgeConfig.algorand);

    if (!this._algorand.client) throw new Error("Algorand client not set");

    return this;
  }
  private connectToSolana(): GlitterBridgeSDK {
    //Failsafe
    if (!this._bridgeConfig) throw new Error("Glitter environment not set");
    if (!this._bridgeConfig.solana) throw new Error("Solana environment not set");

    if (this._rpcOverrides[BridgeNetworks.solana]) {
      console.log("Solana RPC override: " + this._rpcOverrides[BridgeNetworks.solana]);
      this._bridgeConfig.solana.server = this._rpcOverrides[BridgeNetworks.solana];
    }

    this._solana = new SolanaConnect(this._bridgeConfig?.solana);
    //(this._glitterNetwork.algorand.appProgramId);

    if (!this._solana.client) throw new Error("Solana client not set");
    return this;
  }

  //Getters  
  get algorand(): AlgorandConnect | undefined {
    return this._algorand;
  }
  get solana(): SolanaConnect | undefined {
    return this._solana;
  }

}