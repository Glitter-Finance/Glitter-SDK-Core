import { ethers } from "ethers";
import { AbiCoder } from "ethers/lib/utils";
import { BridgeDepositEvent, BridgeReleaseEvent, TransferEvent } from "../evm";
import { EventTopics } from "./types";

const BRIDGE_DEPOSIT_EVENT_SIGNATURE = (trWeb: any): string => trWeb.sha3('BridgeDeposit(uint16,uint256,address,bytes)')
const BRIDGE_RELEASE_EVENT_SIGNATURE = (trWeb: any): string => trWeb.sha3('BridgeRelease()')
const TRC20_TRANSFER_EVENT_SIGNATURE = (trWeb: any): string => trWeb.sha3('Transfer()')

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
            const decoded = coder.decode(
                ["uint16", "uint256", "address", "bytes"],
                `0x${log.data}`
            );
            if (decoded.length > 0) {
                const bridgeDeposit: BridgeDepositEvent = {
                    destinationChainId: Number(decoded[0].toString()),
                    amount: ethers.BigNumber.from(decoded[1].toString()),
                    destinationWallet: decoded[3],
                    erc20Address: decoded[2],
                    __type: "BridgeDeposit"
                }
                return bridgeDeposit
            }
    }

    return null
}