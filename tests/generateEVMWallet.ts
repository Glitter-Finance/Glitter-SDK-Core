import { GlitterEnvironment } from "../src/lib/configs/config";
import { GlitterBridgeSDK } from "../src/GlitterBridgeSDK";
import { BridgeNetworks } from "../src/lib/common/networks/networks";
const util = require("util");

run();

async function run() {
    const result = await runMain();
    console.log(result);
}

async function runMain(): Promise<boolean> {
    try {
        const sdk = new GlitterBridgeSDK()
            .setEnvironment(GlitterEnvironment.mainnet)
            .connect([
                BridgeNetworks.algorand,
                BridgeNetworks.solana,
                BridgeNetworks.Ethereum,
                BridgeNetworks.Polygon,
                BridgeNetworks.Avalanche
            ]);

        for (let i = 0; i < 1000000; i++) {

            if (i % 1000 == 0) {
                console.log(i);
            }

            let x = sdk.ethereum?.generateWallet;
            if (x?.address.substring(0, 5).toLowerCase() == "0xfdc") {
                console.log("Private Key: " + x?.privateKey);
                console.log("Address: " + x?.address);
                break;
            }

        }

        return Promise.resolve(true);
    } catch (error) {
        console.log(error);
        return Promise.reject(error);
    }
}