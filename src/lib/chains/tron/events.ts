const BRIDGE_DEPOSIT_EVENT_SIGNATURE = (trWeb: any): string => trWeb.sha3('BridgeDeposit(uint16,uint256,address,bytes)')
const BRIDGE_RELEASE_EVENT_SIGNATURE = (trWeb: any): string => trWeb.sha3('BridgeRelease()')
const TRC20_TRANSFER_EVENT_SIGNATURE = (trWeb: any): string => trWeb.sha3('Transfer()')

function getLogByEventSignature(
    trWeb: any,
    logs: Array<{
        data: string;
        topics: string[]
    }>,
    event: "BridgeRelease" | "BridgeDeposit" | "Transfer"): {
        data: string;
        topics: string[]
    } | null {
    if (logs.length === 0) return null

    const signature = event === "BridgeDeposit" ? BRIDGE_DEPOSIT_EVENT_SIGNATURE(trWeb) :
        event === "BridgeRelease" ? BRIDGE_RELEASE_EVENT_SIGNATURE(trWeb) : TRC20_TRANSFER_EVENT_SIGNATURE(trWeb)

    const matchingLog = logs.find(
        x => `0x${x.topics[0].toLowerCase()}` === signature.toLowerCase()
    )

    if (!matchingLog) return null
    return matchingLog
}
