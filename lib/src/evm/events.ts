import { ethers } from "ethers";

export type BridgeDepositEvent = {
  destinationChainId: number;
  amount: ethers.BigNumber;
  tokenContractAddress: string;
  destinationWallet: string;
  __type: "BridgeDeposit";
};

export type BridgeReleaseEvent = {
  amount: ethers.BigNumber;
  tokenContractAddress: string;
  destinationWallet: string;
  depositId: string;
  __type: "BridgeRelease";
};

export type TransferEvent = {
  from: string;
  to: string;
  amount: ethers.BigNumber;
  __type: "Transfer";
};

export class EvmBridgeEvents {
  static readonly EventsABI = [
    "event BridgeDeposit(uint16 destinationChainId, uint256 amount, address tokenContractAddress, bytes destinationWallet)",
    "event BridgeRelease(uint256 amount, address tokenContractAddress, address destinationWallet, bytes32 depositId)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ];

  private parseLogs(
    eventLogs: ethers.providers.Log[]
  ): ethers.utils.LogDescription[] {
    const bridgeContractinterface = new ethers.utils.Interface(
      EvmBridgeEvents.EventsABI
    );

    return eventLogs
      .map((log) => {
        try {
          return bridgeContractinterface.parseLog(log);
        } catch (error) {
          console.log("[EvmBridgeEvents] Unable to parse event logs.", error);
          return null;
        }
      })
      .filter((parsedLog) => !!parsedLog) as ethers.utils.LogDescription[];
  }

  parseDeposit(logs: ethers.providers.Log[]): BridgeDepositEvent | null {
    const parsedLogs = this.parseLogs(logs);
    const parsedDeposit = parsedLogs.find((x) => x.name === "BridgeDeposit");

    if (!parsedDeposit) return null;
    const {
      destinationChainId,
      amount,
      tokenContractAddress,
      destinationWallet,
    } = parsedDeposit.args;

    return {
      destinationChainId,
      amount,
      tokenContractAddress,
      destinationWallet,
      __type: "BridgeDeposit",
    };
  }

  parseTransfer(logs: ethers.providers.Log[]): TransferEvent | null {
    const parsedLogs = this.parseLogs(logs);
    const parsedTransfer = parsedLogs.find((x) => x.name === "Transfer");

    if (!parsedTransfer) return null;
    const { from, to, amount } = parsedTransfer.args;

    return {
      amount,
      from,
      to,
      __type: "Transfer",
    };
  }

  parseRelease(logs: ethers.providers.Log[]): BridgeReleaseEvent | null {
    const parsedLogs = this.parseLogs(logs);
    const parsedRelease = parsedLogs.find((x) => x.name === "BridgeRelease");

    if (!parsedRelease) return null;
    const { amount, tokenContractAddress, destinationWallet, depositId } =
      parsedRelease.args;

    return {
      amount,
      tokenContractAddress,
      destinationWallet,
      depositId,
      __type: "BridgeRelease",
    };
  }
}
