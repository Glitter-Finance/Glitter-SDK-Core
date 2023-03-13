import { PublicKey } from "@solana/web3.js";
import algosdk from "algosdk";
import { ethers } from "ethers";
import { BridgeNetworks, NetworkIdentifiers } from "../../common/networks/networks";
import { fromHexString } from "../../common/utils/bytes";

export type TronSerialized = { address: string; chainId: number }
export type TronDeserialized = { address: string; network: BridgeNetworks }

interface Serde {
    serialize(
        destinationChain: BridgeNetworks,
        destinationWallet: string
    ): TronSerialized
    deSerialize(
        destinationChain: number,
        destinationWallet: string
    ): TronDeserialized
}

export class TronSerde implements Serde {
    serialize(destinationChain: BridgeNetworks, destinationWallet: string): TronSerialized {
        let chainId: number | [string, BridgeNetworks] | undefined = Object.entries(NetworkIdentifiers).find(
            ([_id, network]) => {
                return network === destinationChain;
            }
        );

        if (!chainId) throw new Error('Chain Unsupported')
        chainId = Number(chainId[0])

        switch (destinationChain) {
            case "Algorand":
                return {
                    address: ethers.utils.hexZeroPad(
                        algosdk.decodeAddress(destinationWallet).publicKey,
                        32
                    ),
                    chainId
                }
            case "Solana":
                return {
                    address: ethers.utils.hexZeroPad(
                        new PublicKey(destinationWallet).toBytes(),
                        32
                    ),
                    chainId
                }
            case "ethereum":
            case "polygon":
            case "avalanche":
                return {
                    address: destinationWallet,
                    chainId
                }
            default:
                throw new Error('Chain Unsupported')
        }
    }
    deSerialize(destinationChain: number, destinationWallet: string): TronDeserialized {
        switch (destinationChain) {
            case 1:
                return {
                    address: algosdk.encodeAddress(
                        Uint8Array.from(
                            fromHexString(destinationWallet.slice(2))
                        )
                    ),
                    network: BridgeNetworks.algorand
                }
            case 4:
                return {
                    address: new PublicKey(
                        Uint8Array.from(
                            fromHexString(destinationWallet.slice(2))
                        )
                    ).toBase58(),
                    network: BridgeNetworks.solana
                }
            case 3:
                return {
                    address: destinationWallet,
                    network: BridgeNetworks.Ethereum
                }
            case 5:
                return {
                    address: destinationWallet,
                    network: BridgeNetworks.Polygon
                }
            case 2:
                return {
                    address: destinationWallet,
                    network: BridgeNetworks.Avalanche
                }
            default:
                throw new Error('Chain Unsupported')
        }

    }

}

