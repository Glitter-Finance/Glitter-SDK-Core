import { AlgorandAccount } from "../../chains/algorand";
import { SolanaAccount } from "../../chains/solana";

export interface IAccount {
    add(...args: [sk: Uint8Array | undefined] | [mnemonic: string | undefined]): Promise<AlgorandAccount | undefined> | Promise<SolanaAccount>;
    createNew(): Promise<AlgorandAccount> | Promise<SolanaAccount>;
    createNewWithPrefix(prefix: string, tries?: number): Promise<AlgorandAccount | undefined> | Promise<SolanaAccount | undefined>;
    updateAccountDetails(local_account: AlgorandAccount | SolanaAccount | undefined, getAssetDetails?: boolean): Promise<AlgorandAccount | SolanaAccount>;
  }
  