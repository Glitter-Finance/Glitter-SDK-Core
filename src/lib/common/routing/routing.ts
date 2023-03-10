import BigNumber from "bignumber.js";
import { BridgeToken } from "../tokens/tokens";
import { ValueUnits } from "../utils/value_units";

export type Routing = {
    from: RoutingPoint;
    to: RoutingPoint;
    amount: BigNumber | number | undefined;
    units: BigNumber | undefined;
}
export type RoutingPoint = {
    network: string;
    address: string;
    token: string;
    txn_signature?: string;
    txn_signature_hashed?: string;
}
export type DepositNote = {
    system: string, 
    date: string,
}

export function RoutingDefault(copyFrom: Routing | undefined = undefined): Routing {

    if (copyFrom) {
        return {
            from: RoutingPointDefault(copyFrom.from),
            to: RoutingPointDefault(copyFrom.to),
            amount: copyFrom.amount,
            units: copyFrom.units
        }
    } else {
        return {
            from: RoutingPointDefault(),
            to: RoutingPointDefault(),
            amount: undefined,
            units: undefined
        }
    }
}

export function RoutingPointDefault(copyFrom: RoutingPoint | undefined = undefined): RoutingPoint {

    if (copyFrom) {
        return {
            network: copyFrom.network,
            address: copyFrom.address,
            token: copyFrom.token,
            txn_signature: copyFrom.txn_signature
        }
    } else {
        return {
            network: "",
            address: "",
            token: "",
            txn_signature: ""
        }
    }
}

export function RoutingString(routing: Routing): string {
    return JSON.stringify(routing, (key, value) =>
        typeof value === 'bigint'
            ? value.toString()
            : JSON.stringify(value, (keyInner, valueInner) =>
                typeof valueInner === 'bigint'
                    ? valueInner.toString()
                    : valueInner
            )
    );
}

/**
 * @deprecated The method should not be used. Please use RoutingHelper instead
 */
export function SetRoutingUnits(routing: Routing, token: BridgeToken | undefined) {
    if (!token) throw new Error("Token not defined");
    if (routing.units) return;
    if (!routing.amount) throw new Error("Routing amount not defined");
    if (token.decimals == undefined) throw new Error("Routing decimals not defined");
    routing.units =  BigNumber(routing.amount).times(BigNumber(10).pow(token.decimals));    //ValueUnits.fromValue(routing.amount, token.decimals).units.toString();
}

export class RoutingHelper {
    public static BaseUnits_FromReadableValue(value: number|BigNumber, decimals: number): BigNumber {
        let baseRaw = BigNumber(value).times(BigNumber(10).pow(decimals));
        let baseString = baseRaw.toFixed(0);
        return BigNumber(baseString);
    }
    public static ReadableValue_FromBaseUnits(baseUnits: BigNumber, decimals: number): BigNumber {
        let baseRaw = BigNumber(baseUnits).div(BigNumber(10).pow(decimals));
        return baseRaw;
    }
}