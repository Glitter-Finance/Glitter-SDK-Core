import { ethers } from "ethers";
import { AbiCoder } from "ethers/lib/utils";
import { BridgeDepositEvent, BridgeReleaseEvent, TransferEvent } from "../evm";
import { EventTopics } from "./types";

const BRIDGE_DEPOSIT_EVENT_SIGNATURE = (trWeb: any): string => trWeb.sha3('BridgeDeposit(uint16,uint256,address,bytes)')
const BRIDGE_RELEASE_EVENT_SIGNATURE = (trWeb: any): string => trWeb.sha3('BridgeRelease(uint256,address,address,bytes32)')
const TRC20_TRANSFER_EVENT_SIGNATURE = (trWeb: any): string => trWeb.sha3('Transfer(address,address,uint256)')

export function getLogByEventSignature(
    trWeb: any,
    logs: Array<{
        data: string;
        topics: string[]
    }>,
    topic: EventTopics): {
        data: string;
        topics: string[]
    } | null {
    if (logs.length === 0) return null

    const signature = topic === "BridgeDeposit" ? BRIDGE_DEPOSIT_EVENT_SIGNATURE(trWeb) :
        topic === "BridgeRelease" ? BRIDGE_RELEASE_EVENT_SIGNATURE(trWeb) : TRC20_TRANSFER_EVENT_SIGNATURE(trWeb)

    const matchingLog = logs.find(
        x => `0x${x.topics[0].toLowerCase()}` === signature.toLowerCase()
    )

    if (!matchingLog) return null
    return matchingLog
}

export function decodeEventData(
    log: { data: string; topics: string[] },
    topic: EventTopics
): BridgeDepositEvent | BridgeReleaseEvent | TransferEvent | null {
    const coder = new AbiCoder()
    switch (topic) {
        case "BridgeDeposit":
            const decodedDeposit = coder.decode(
                ["uint16", "uint256", "address", "bytes"],
                !log.data.startsWith("0x") ? `0x${log.data}` : log.data
            );
            if (decodedDeposit.length > 0) {
                const bridgeDeposit: BridgeDepositEvent = {
                    destinationChainId: Number(decodedDeposit[0].toString()),
                    amount: ethers.BigNumber.from(decodedDeposit[1].toString()),
                    destinationWallet: decodedDeposit[3],
                    erc20Address: decodedDeposit[2],
                    __type: "BridgeDeposit"
                }
                return bridgeDeposit
            }
        case "BridgeRelease":
            const decodedRelease = coder.decode(
                ["address", "address", "uint256"],
                !log.data.startsWith("0x") ? `0x${log.data}` : log.data
            );
            if (decodedRelease.length > 0) {
                const bridgeRelease: BridgeReleaseEvent = {
                    amount: ethers.BigNumber.from(decodedRelease[0].toString()),
                    depositTransactionHash: decodedRelease[3],
                    destinationWallet: decodedRelease[1],
                    erc20Address: decodedRelease[2],
                    __type: "BridgeRelease"
                }
                return bridgeRelease
            }
        case "Transfer":
            const decodedTransfer = coder.decode(
                ["address", "address", "uint256"],
                !log.data.startsWith("0x") ? `0x${log.data}` : log.data
            );
            if (decodedTransfer.length > 0) {
                const transfer: TransferEvent = {
                    from: decodedTransfer[0],
                    to: decodedTransfer[1],
                    value: ethers.BigNumber.from(decodedTransfer[2].toString()),
                    __type: "Transfer"
                }
                return transfer
            }
    }

    return null
}