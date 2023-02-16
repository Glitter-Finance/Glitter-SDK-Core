import { PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";
const TronWeb = require('tronweb');
import { fromHexString } from "../../common/utils/bytes";
import algoSdk from "algosdk";
import {
  BridgeEvmNetworks,
  BridgeNetworks,
  NetworkIdentifiers,
  PartialEvmNetwork,
} from "../../common/networks/networks";

export class SerializeEvmBridgeTransfer {
  /**
   * Convert encoded addresses to bytes
   * @param {Network} sourceChain
   * @param {string | algoSdk.Account | PublicKey} address
   * @returns hex string
   */
  static serializeAddress(
    sourceChain: BridgeNetworks | BridgeEvmNetworks,
    account: PublicKey | algoSdk.Account | string
  ): string {
    switch (sourceChain) {
      case BridgeNetworks.TRON:
        return `0x${TronWeb.address.toHex(account as string)}`
      case BridgeNetworks.solana:
        return ethers.utils
          .hexZeroPad((account as PublicKey).toBytes(), 32)
          .toString();
      case BridgeNetworks.Polygon:
      case BridgeNetworks.Avalanche:
      case BridgeNetworks.Ethereum:
        return account as string;
      case BridgeNetworks.algorand:
        return ethers.utils
          .hexZeroPad(
            algoSdk.decodeAddress((account as algoSdk.Account).addr).publicKey,
            32
          )
          .toString();
    }
  }
  /**
   * Serialize bridge transfer parameters
   * @param {BridgeEvmNetworks} sourceChain
   * @param {BridgeEvmNetworks | BridgeNetworks} destinationChain
   * @param {string} sourceWallet
   * @param {PublicKey | algoSdk.Account | string} destinationWallet
   * @param {ethers.BigNumber} amount
   * @returns Serialized transfer
   */
  static serialize(
    sourceChain: BridgeEvmNetworks | PartialEvmNetwork,
    destinationChain: BridgeNetworks,
    sourceWallet: string,
    destinationWallet: PublicKey | algoSdk.Account | string,
    amount: ethers.BigNumber
  ): {
    sourceChain: number;
    destinationChain: number;
    sourceWallet: string;
    destinationWallet: string;
    amount: string;
  } {
    const _sourceChain = Object.entries(NetworkIdentifiers).find(
      ([_id, network]) => {
        return network === sourceChain;
      }
    );

    const _destinationChain = Object.entries(NetworkIdentifiers).find(
      ([_id, network]) => {
        return network === destinationChain;
      }
    );

    if (!_sourceChain || !_destinationChain)
      throw new Error(
        "[SerializeEvmBridgeTransfer] Unable to serialize bridge transfer networks"
      );

    return {
      sourceChain: Number(_sourceChain[0]),
      destinationChain: Number(_destinationChain[0]),
      destinationWallet: SerializeEvmBridgeTransfer.serializeAddress(
        _destinationChain[1],
        destinationWallet
      ),
      sourceWallet,
      amount: amount.toString(),
    };
  }
}

export class DeserializeEvmBridgeTransfer {
  /**
   * Deserialize address from bytes
   * @param {Network} sourceChain
   * @param {string} address
   * @returns {string} formatted address
   */
  static deserializeAddress(
    chain: BridgeEvmNetworks | BridgeNetworks,
    data: string
  ): string {
    switch (chain) {
      case BridgeNetworks.TRON:
        return TronWeb.address.fromHex(data)
      case BridgeNetworks.algorand:
        return algoSdk.encodeAddress(fromHexString(data));
      case BridgeNetworks.Polygon:
      case BridgeNetworks.Avalanche:
      case BridgeNetworks.Ethereum:
        return `0x${data.toLowerCase()}`;
      case BridgeNetworks.solana:
        return new PublicKey(fromHexString(data) as Uint8Array).toString();
    }
  }

  static deserialize(
    sourceChainId: number,
    destinationChainId: number,
    sourceWallet: string,
    destinationIdBytes: string,
    amount: ethers.BigNumber
  ): {
    sourceNetwork: BridgeEvmNetworks;
    destinationNetwork: BridgeEvmNetworks | BridgeNetworks;
    sourceWallet: string;
    destinationWallet: string;
    amount: ethers.BigNumber;
  } {
    const sourceChain = Object.entries(NetworkIdentifiers).find(
      ([_id, _network]) => {
        return Number(_id) === sourceChainId;
      }
    );

    const destinationChain = Object.entries(NetworkIdentifiers).find(
      ([_id, _network]) => {
        return Number(_id) === destinationChainId;
      }
    );

    if (!sourceChain || !destinationChain)
      throw new Error(
        "[DeserializeEvmBridgeTransfer] Unable to deserialize bridge transfer networks"
      );

    return {
      sourceNetwork: sourceChain[1] as BridgeEvmNetworks,
      destinationNetwork: destinationChain[1],
      amount,
      sourceWallet,
      destinationWallet: DeserializeEvmBridgeTransfer.deserializeAddress(
        destinationChain[1],
        // omit '0x'
        destinationIdBytes.slice(2)
      ),
    };
  }
}
