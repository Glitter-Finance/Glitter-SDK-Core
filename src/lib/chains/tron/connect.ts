import { TronConfig } from "./types";
const TronWeb = require('tronweb');
const Trc20DetailedAbi = require('./abi/TRC20Detailed.json');
const TokenBridgeAbi = require('./abi/TokenBridge.json');

export class TronConnect {
    protected __tronConfig: TronConfig
    protected __tronWeb: any;
    protected __usdc: any;
    protected __bridge: any;

    constructor(
        tronconfig: TronConfig
    ) {
        this.__tronConfig = tronconfig
        this.__tronWeb = TronWeb(
            tronconfig.fullNode,
            tronconfig.solidityNode,
            tronconfig.eventServer
        );
        this.initContracts();
    }

    private async initContracts(): Promise<void> {
        const usdcConf = this.__tronConfig.tokens.find(x => x.symbol.toLowerCase() === "usdc")

        if (usdcConf) {
            this.__usdc = await this.getContractAt(
                usdcConf.address,
                Trc20DetailedAbi
            )
        }

        this.__bridge = await this.getContractAt(
            this.__tronConfig.addresses.bridge,
            TokenBridgeAbi
        )
    }

    private async getContractAt(
        address: string,
        abi: any
    ) {
        const contract = await this.__tronWeb.contract(
            abi,
            address
        )
        return contract
    }
}