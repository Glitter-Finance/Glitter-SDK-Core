import { BridgeToken } from "../tokens/tokens";
import { ValueUnits } from "../utils/value_units";

export type Routing = {
    from: RoutingPoint;
    to: RoutingPoint;
    amount: number | undefined;
    units: bigint | undefined;
}
export type RoutingPoint = {
    network: string;
    address: string;
    token: string;
    txn_signature: string;
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

export function RoutingString(routing: Routing): String {
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

export function SetRoutingUnits(routing: Routing, token: BridgeToken | undefined) {
    if (!token) throw new Error("Token not defined");
    if (routing.units) return;
    if (!routing.amount) throw new Error("Routing amount not defined");
    if (!token.decimals) throw new Error("Routing decimals not defined");

    routing.units = ValueUnits.fromValue(routing.amount, token.decimals).units
}

