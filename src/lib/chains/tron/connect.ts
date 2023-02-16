import { BigNumber, ethers } from "ethers";
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
                this.fromTronAddress(usdcConf.address),
                Trc20DetailedAbi
            )
        }

        this.__bridge = await this.getContractAt(
            this.fromTronAddress(this.__tronConfig.addresses.bridge),
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
    private fromTronAddress(address: string): string {
        return TronWeb.address.toHex(address)
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

            const token = this.__tronConfig.tokens.find(
                (token) => token.symbol.toLowerCase() === tokenSymbol.toLowerCase()
            );

            if (!token) {
                throw new Error(
                    "[EvmConnect] Can not provide address of undefined token."
                );
            }

            return this.fromTronAddress(token.address).toLowerCase();
        }

        return this.fromTronAddress(this.__tronConfig.addresses[entity]).toLowerCase();
    }
    private isValidToken(tokenSymbol: string): boolean {
        return !!this.__tronConfig.tokens.find(x => x.symbol.toLowerCase() === tokenSymbol.toLowerCase());
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
    ): Promise<BigNumber> {
        if (!this.isValidToken(tokenSymbol))
            return Promise.reject("[EvmConnect] Unsupported token symbol.");

        const token = await this.getContractAt(
            this.getAddress("tokens", tokenSymbol),
            Trc20DetailedAbi
        )
        const balance = await token.balanceOf(address).call();
        return ethers.BigNumber.from(balance.toString());
    }
    async approveTokensForBridge(
        tokenSymbol: string,
        amount: ethers.BigNumber | string,
        privateKey: string
    ): Promise<ethers.ContractTransaction> {
        if (!this.isValidToken(tokenSymbol))
            return Promise.reject("[EvmConnect] Unsupported token symbol.");

        const bridgeAddress = this.getAddress("bridge");
        const tokenAddress = this.getAddress("tokens", tokenSymbol);

        const trWeb = TronWeb(
            this.__tronConfig.fullNode,
            this.__tronConfig.solidityNode,
            this.__tronConfig.eventServer,
            privateKey
        )

        const token = await trWeb.contract(
            Trc20DetailedAbi,
            tokenAddress
        )

        return await token.increaseAllowance(bridgeAddress, amount).call();
    }
}