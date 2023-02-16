import { PublicKey } from "@solana/web3.js";
import { BigNumber, ethers } from "ethers";
import { BridgeNetworks } from "../../common/networks/networks";
import { BridgeDepositEvent, BridgeReleaseEvent, SerializeEvmBridgeTransfer, TransferEvent } from "../evm";
import { TronConfig } from "./types";
import algosdk from "algosdk";
import { decodeEventData, getLogByEventSignature } from "./utils";
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
        const balance = await token.balanceOf(
            this.fromTronAddress(address)
        ).call();
        return ethers.BigNumber.from(balance.toString());
    }
    async approveTokensForBridge(
        tokenSymbol: string,
        amount: ethers.BigNumber | string,
        privateKey: string
    ): Promise<ethers.ContractTransaction> {
        if (!this.isValidToken(tokenSymbol))
            return Promise.reject("[TronConnect] Unsupported token symbol.");

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

        return await token.increaseAllowance(bridgeAddress, amount).send();
    }
    async bridgeAllowance(
        tokenSymbol: string,
        signer: ethers.Signer
    ): Promise<ethers.BigNumber> {
        if (!this.isValidToken(tokenSymbol))
            return Promise.reject("Unsupported token symbol.");

        const tokenAddress = this.getAddress("tokens", tokenSymbol);
        const usdc = await this.getContractAt(tokenAddress, Trc20DetailedAbi);

        const allowance = await usdc.allowance(
            signer.getAddress(),
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
    ): Promise<ethers.ContractTransaction> {
        try {
            if (!this.__tronWeb) {
                throw new Error(`[TronConnect] Unsupported token symbol.`);
            }

            if (!this.isValidToken(tokenSymbol)) {
                throw new Error(`[TronConnect] Unsupported token symbol.`);
            }

            const trWeb = TronWeb(
                this.__tronConfig.fullNode,
                this.__tronConfig.solidityNode,
                this.__tronConfig.eventServer,
                privateKey
            )

            const bridge = await trWeb.contract(
                this.getAddress('bridge'),
                Trc20DetailedAbi
            )

            const tokenAddress = this.getAddress("tokens", tokenSymbol);
            const depositAddress = this.getAddress("depositWallet");
            const _amount =
                typeof amount === "string" ? ethers.BigNumber.from(amount) : amount;

            const serialized = SerializeEvmBridgeTransfer.serialize(
                BridgeNetworks.TRON,
                destination,
                TronWeb.address.fromPrivateKey(privateKey),
                destinationWallet,
                _amount
            );

            return await bridge.deposit(
                serialized.destinationChain,
                serialized.amount,
                depositAddress,
                tokenAddress,
                serialized.destinationWallet
            ).send();
        } catch (error) {
            return Promise.reject(error);
        }
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
        const dpstTxInfo = await this.__tronWeb.trx.getTransactionInfo(depositOrReleaseTxId)
        let depositMatch = null;
        let releaseMatch = null;
        let transferMatch = null;


        for (const log of dpstTxInfo.log) {
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
}