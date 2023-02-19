import { ethers } from 'ethers'
import { DeserializeEvmBridgeTransfer, SerializeEvmBridgeTransfer } from '../src/lib/chains/evm/serde'
import { BridgeNetworks, getNumericNetworkId } from '../src/lib/common/networks/networks'
import { GlitterBridgeSDK } from '../src/GlitterBridgeSDK'
import { GlitterEnvironment } from '../src/lib/configs/config'

describe("EVM Serde Tests", () => {
    it('Should serialize/deserialize Algo transfer', () => {
        const destinationAddress = "7LXIEKO3KLYNKT4TV7IE5CMGNM4UX6MQBKI7UA2KGVDC6MW4OMAJ55BUA4"
        const sourceWallet = "0xa697a01f9f0686bcf9ee53687292c37e7252d190"
        const amount = "1000000"
        const sourceChain = BridgeNetworks.Ethereum
        const destinationChain = BridgeNetworks.algorand

        const algoS = SerializeEvmBridgeTransfer.serialize(
            sourceChain,
            destinationChain,
            sourceWallet,
            destinationAddress,
            ethers.BigNumber.from(amount)
        )

        expect(algoS.destinationChain).toEqual(getNumericNetworkId(destinationChain))
        expect(algoS.amount).toEqual(amount)

        const algoD = DeserializeEvmBridgeTransfer.deserialize(
            getNumericNetworkId(sourceChain),
            getNumericNetworkId(destinationChain),
            sourceWallet,
            algoS.destinationWallet,
            ethers.BigNumber.from(amount)
        )

        expect(algoD.destinationWallet).toEqual(destinationAddress)
        expect(algoD.destinationNetwork).toEqual(destinationChain)
        expect(algoD.amount.toString()).toEqual(amount)
    }),
    it('Should serialize/deserialize TRON transfer', () => {
        const destinationAddress = "TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL"
        const sourceWallet = "0xa697a01f9f0686bcf9ee53687292c37e7252d190"
        const amount = "1000000"
        const sourceChain = BridgeNetworks.Ethereum
        const destinationChain = BridgeNetworks.TRON

        const tronS = SerializeEvmBridgeTransfer.serialize(
            sourceChain,
            destinationChain,
            sourceWallet,
            destinationAddress,
            ethers.BigNumber.from(amount)
        )

        expect(tronS.destinationChain).toEqual(getNumericNetworkId(destinationChain))
        expect(tronS.amount).toEqual(amount)
        
        const tronD = DeserializeEvmBridgeTransfer.deserialize(
            getNumericNetworkId(sourceChain),
            getNumericNetworkId(destinationChain),
            sourceWallet,
            tronS.destinationWallet,
            ethers.BigNumber.from(amount)
        )

        expect(tronD.destinationWallet).toEqual(destinationAddress)
        expect(tronD.destinationNetwork).toEqual(destinationChain)
        expect(tronD.amount.toString()).toEqual(amount)
    }),
    it('Should serialize/deserialize Solana transfer', () => {
        const destinationAddress = "CXaTaTRKjXFhjfDYzAxyeQRgFcjbqAvpbhBdNDNBQjQR"
        const sourceWallet = "0xa697a01f9f0686bcf9ee53687292c37e7252d190"
        const amount = "1000000"
        const sourceChain = BridgeNetworks.Ethereum
        const destinationChain = BridgeNetworks.solana

        const solS = SerializeEvmBridgeTransfer.serialize(
            sourceChain,
            destinationChain,
            sourceWallet,
            destinationAddress,
            ethers.BigNumber.from(amount)
        )

        expect(solS.destinationChain).toEqual(getNumericNetworkId(destinationChain))
        expect(solS.amount).toEqual(amount)

        const solD = DeserializeEvmBridgeTransfer.deserialize(
            getNumericNetworkId(sourceChain),
            getNumericNetworkId(destinationChain),
            sourceWallet,
            solS.destinationWallet,
            ethers.BigNumber.from(amount)
        )

        expect(solD.destinationWallet).toEqual(destinationAddress)
        expect(solD.destinationNetwork).toEqual(destinationChain)
        expect(solD.amount.toString()).toEqual(amount)
    })
    it('Should serialize/deserialize EVM transfer', () => {
        const destinationAddress = "0xa697a01f9f0686bcf9ee53687292c37e7252d190"
        const sourceWallet = "0xa697a01f9f0686bcf9ee53687292c37e7252d190"
        const amount = "1000000"
        const sourceChain = BridgeNetworks.Ethereum
        const destinationChain = BridgeNetworks.Polygon

        const solS = SerializeEvmBridgeTransfer.serialize(
            sourceChain,
            destinationChain,
            sourceWallet,
            destinationAddress,
            ethers.BigNumber.from(amount)
        )

        expect(solS.destinationChain).toEqual(getNumericNetworkId(destinationChain))
        expect(solS.amount).toEqual(amount)

        const solD = DeserializeEvmBridgeTransfer.deserialize(
            getNumericNetworkId(sourceChain),
            getNumericNetworkId(destinationChain),
            sourceWallet,
            solS.destinationWallet,
            ethers.BigNumber.from(amount)
        )

        expect(solD.destinationWallet).toEqual(destinationAddress)
        expect(solD.destinationNetwork).toEqual(destinationChain)
        expect(solD.amount.toString()).toEqual(amount)
    })
})

describe("EVM SDk Test", () => {
    it('Should initialize and get evm connect', () => {
        const sdk = new GlitterBridgeSDK();
        sdk.setEnvironment(GlitterEnvironment.testnet)

        sdk.connect([
            BridgeNetworks.Avalanche,
            BridgeNetworks.Ethereum,
            BridgeNetworks.Polygon,
        ])

        const evmConnect = sdk.getEvmNetwork(BridgeNetworks.Ethereum)
        expect(evmConnect).toBeTruthy()
    })
})