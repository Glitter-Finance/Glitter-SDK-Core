import * as fs from 'fs'

export type BridgeAccountConfig = {
    bridgeAccounts: BridgeAccount[];
    bridgeMSigs: BridgeMSig[];
}
export type BridgeAccount = {
    network: string;
    name: string;
    address: string;
}
export type BridgeMSig = {
    network: string;
    name: string;
    address: string;
    signers: string[];
}
export enum BridgeAccountNames {
    algorand_asaOwner = "algorand_asaOwner",
    algorand_algoOwner = "algorand_algoOwner",
    algorand_bridgeOwner = "algorand_bridgeOwner",
    algorand_feeReceiver = "algorand_feeReceiver",
    algorand_multisig1 = "algorand_multisig1",
    algorand_multisig2 = "algorand_multisig2",
    algorand__bridge = "algorand__bridge",
    algorand_asaVault = "algorand_asaVault",
    algorand_algoVault = "algorand_algoVault",
    solana_bridge_program_id = "bridge_program_id",
    solana_vesting_program_id = "vesting_program_id",
    solana_owner_address = "owner_address"
}

export class BridgeAccounts {

    private static bridgeAccounts: BridgeAccount[];
    private static bridgeMSigs: BridgeMSig[];

    //Load Config
    public static loadConfig(config: BridgeAccountConfig) {
        BridgeAccounts.bridgeAccounts = config.bridgeAccounts;
        BridgeAccounts.bridgeMSigs = config.bridgeMSigs;

        if (BridgeAccounts.bridgeAccounts === undefined) throw new Error("Bridge Accounts config not found");
        if (BridgeAccounts.bridgeMSigs === undefined) throw new Error("Bridge MSigs config not found");
    };

    //Get Account Info
    public static getAddress(name: BridgeAccountNames): string {
        const network = name.split("_")[0];
        const accountName = name.split("_")[1];
        const info = BridgeAccounts.getAccountInfo(network, accountName);
        if (info === undefined) {
            //Check msig
            const msigInfo = BridgeAccounts.getMSigInfo(network, accountName);
            if (msigInfo === undefined) {
                throw new Error("Account not found: " + name);
            } else {
                return msigInfo.address;
            }
        } else {
            return info.address;
        }
    }
    public static getAccountInfo(network: string, name: string): BridgeAccount | undefined {
        console.log(`matching: ${name.toLowerCase()} ${network.toLowerCase()}`);

        const accounts = this.bridgeAccounts;
        //accounts.push(...BridgeAccounts.config.local_accounts);
        for (let i = 0; i < accounts.length; i++) {
            const info = accounts[i];
            if (info.network.toLowerCase() === network.toLowerCase() &&
                info.name.toLowerCase() === name.toLowerCase()) {
                console.log(`matched: ${info.name.toLowerCase()} ${info.network.toLowerCase()}`);
                if (info.address === undefined) throw new Error("Account address not specified: " + name);
                return info;
            }
        }
        return undefined;
    }
    public static getMSigInfo(network: string, name: string): BridgeMSig | undefined {
        console.log(`matching: ${name.toLowerCase()} ${network.toLowerCase()}`);

        const accounts = this.bridgeMSigs;
        //accounts.push(...BridgeAccounts.config.local_msigs);
        for (let i = 0; i < accounts.length; i++) {
            const info = accounts[i];
             if (info.network.toLowerCase() === network.toLowerCase() &&
                info.name.toLowerCase() === name.toLowerCase()) {
                    console.log(`matched: ${info.name.toLowerCase()} ${info.network.toLowerCase()}`);
                    if (info.address === undefined) throw new Error("MSig address not specified: " + name);
                    return info;
            }
        }

        return undefined;
    }

}