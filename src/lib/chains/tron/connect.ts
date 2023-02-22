import { PublicKey } from "@solana/web3.js";
import { BigNumber, ethers } from "ethers";
import { BridgeNetworks } from "../../common/networks/networks";
import { BridgeDepositEvent, BridgeReleaseEvent, TransferEvent } from "../evm";
import { TronConfig } from "./types";
import { decodeEventData, getLogByEventSignature } from "./utils";
import { TronDeserialized, TronSerde } from "./serde";
import { walletToAddress } from "../../common/utils/utils";
const TronWeb = require('tronweb');
const Trc20DetailedAbi = require('./abi/TRC20Detailed.json');
const TokenBridgeAbi = require('./abi/TokenBridge.json');
import algosdk from "algosdk";

export class TronConnect {
    protected __tronConfig: TronConfig
    protected __tronWeb: any;
    protected __usdc: any;
    protected __bridge: any;

    constructor(
        tronconfig: TronConfig
    ) {
        this.__tronConfig = tronconfig
        this.__tronWeb = new TronWeb(
            tronconfig.fullNode,
            tronconfig.solidityNode,
            tronconfig.eventServer
        );
        https://github.com/tronprotocol/tronweb/issues/90
        this.__tronWeb.setAddress(this.tronConfig.addresses.releaseWallet)
        this.initContracts();
    }

    private async initContracts(): Promise<void> {
        const usdcConf = this.__tronConfig.tokens.find(x => x.symbol.toLowerCase() === "usdc")

        if (usdcConf) {
            this.__usdc = await this.getContractAt(
                this.fromTronAddress(usdcConf.address),
                Trc20DetailedAbi.abi
            )
        }

        this.__bridge = await this.getContractAt(
            this.fromTronAddress(this.__tronConfig.addresses.bridge),
            TokenBridgeAbi.abi
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
            Trc20DetailedAbi.abi
        )
        const balance = await token.balanceOf(
            this.fromTronAddress(address)
        ).call();
        return ethers.BigNumber.from(balance.toString());
    }
    async approveTokensForBridge(
        tokenSymbol: string,
        amount: ethers.BigNumber | string,
        privateKey: string
    ): Promise<string> {
        if (!this.isValidToken(tokenSymbol))
            return Promise.reject("[TronConnect] Unsupported token symbol.");

        const bridgeAddress = this.getAddress("bridge");
        const tokenAddress = this.getAddress("tokens", tokenSymbol);

        const trWeb = new TronWeb(
            this.__tronConfig.fullNode,
            this.__tronConfig.solidityNode,
            this.__tronConfig.eventServer,
            privateKey
        )

        const token = await trWeb.contract(
            Trc20DetailedAbi.abi,
            tokenAddress
        )

        return await token.approve(bridgeAddress, amount).send();
    }
    async bridgeAllowance(
        _tokenSymbol: string,
        userWalletAddress: string
    ): Promise<ethers.BigNumber> {
        if (!this.isValidToken(_tokenSymbol))
            return Promise.reject("Unsupported token symbol.");

        const tokenAddress = this.getAddress("tokens", _tokenSymbol);
        const usdc = await this.getContractAt(tokenAddress, Trc20DetailedAbi.abi);

        const allowance = await usdc.allowance(
            this.fromTronAddress(userWalletAddress),
            this.getAddress("bridge")
        ).call();

        return ethers.BigNumber.from(allowance.toString());
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
        privateKey: string
    ): Promise<string> {
        try {
            if (!this.__tronWeb) {
                throw new Error(`[TronConnect] Sdk uninitialized.`);
            }

            if (!this.isValidToken(tokenSymbol)) {
                throw new Error(`[TronConnect] Unsupported token symbol.`);
            }

            const trWeb = new TronWeb(
                this.__tronConfig.fullNode,
                this.__tronConfig.solidityNode,
                this.__tronConfig.eventServer,
                privateKey
            )

            const bridge = await trWeb.contract(
                this.getAddress('bridge'),
                TokenBridgeAbi.abi
            )

            const tokenAddress = this.getAddress("tokens", tokenSymbol);
            const depositAddress = this.getAddress("depositWallet");
            const _amount =
                typeof amount === "string" ? ethers.BigNumber.from(amount) : amount;

            let destinationInStr: string = walletToAddress(destinationWallet)
            const serialized = new TronSerde().serialize(
                destination,
                destinationInStr
            );

            return await bridge.deposit(
                serialized.chainId,
                _amount.toString(),
                depositAddress,
                tokenAddress,
                serialized.address
            ).send();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    deSerializeDepositEvent(
        deposit: BridgeDepositEvent
    ): TronDeserialized {
        return new TronSerde().deSerialize(
            deposit.destinationChainId,
            deposit.destinationWallet
        )
    }

    async getBridgeLogs(
        depositOrReleaseTxId: string
    ): Promise<Array<
        TransferEvent |
        BridgeDepositEvent |
        BridgeReleaseEvent
    >> {
        let events: Array<
            TransferEvent |
            BridgeDepositEvent |
            BridgeReleaseEvent
        > = []
        const txInfo = await this.__tronWeb.trx.getTransactionInfo(depositOrReleaseTxId)
        let depositMatch = null;
        let releaseMatch = null;
        let transferMatch = null;

        if (!('log' in txInfo)) {
            return [];
        }

        for (const log of txInfo.log) {
            try {
                const d = getLogByEventSignature(this.__tronWeb, log, "BridgeDeposit");
                const r = getLogByEventSignature(this.__tronWeb, log, "BridgeRelease");
                const t = getLogByEventSignature(this.__tronWeb, log, "Transfer");

                if (d) {
                    depositMatch = d;
                }

                if (r) {
                    releaseMatch = r;
                }

                if (t) {
                    transferMatch = t;
                }

            } catch (error) {
                console.error('[TronConnect] Error: ' + error)
            }
        }

        if (depositMatch) {
            const decodedDeposit = decodeEventData(
                depositMatch,
                "BridgeDeposit"
            )

            if (decodedDeposit)
                events.push(
                    decodedDeposit
                )
        }

        if (releaseMatch) {
            const decodedRelease = decodeEventData(
                releaseMatch,
                "BridgeRelease"
            )

            if (decodedRelease)
                events.push(
                    decodedRelease
                )
        }

        if (transferMatch) {
            const decodedTransfer = decodeEventData(
                transferMatch,
                "Transfer"
            )

            if (decodedTransfer)
                events.push(
                    decodedTransfer
                )
        }

        return events
    }

    get tronWeb() {
        return this.__tronWeb
    }

    get tronConfig() {
        return this.__tronConfig
    }
}