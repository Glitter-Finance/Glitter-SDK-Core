import { BridgeNetworks, getNumericNetworkId } from '../src/lib/common/networks/networks'
import { TronSerde } from '../src/lib/chains/tron/serde'
import { GlitterBridgeSDK } from '../src/GlitterBridgeSDK'
import { GlitterEnvironment } from '../src/lib/configs/config'

describe("TRON Serde Tests", () => {
    it('Should serialize/deserialize Algo transfer', () => {
        const destinationAddress = "7LXIEKO3KLYNKT4TV7IE5CMGNM4UX6MQBKI7UA2KGVDC6MW4OMAJ55BUA4"
        const destinationChain = BridgeNetworks.algorand
        const serde = new TronSerde()

        const algoS = serde.serialize(
            destinationChain,
            destinationAddress
        )

        expect(algoS.chainId).toEqual(getNumericNetworkId(destinationChain))

        const algoD = serde.deSerialize(
            algoS.chainId,
            algoS.address
        )

        expect(algoD.address).toEqual(destinationAddress)
        expect(algoD.network).toEqual(destinationChain)
    })
})

describe("TRON SDk Test", () => {
    it('Should initialize and get evm connect', () => {
        const sdk = new GlitterBridgeSDK();
        sdk.setEnvironment(GlitterEnvironment.testnet)

        sdk.connect([
            BridgeNetworks.TRON,
        ])

        const tronConnect = sdk.tron
        expect(tronConnect).toBeTruthy()
    })
})