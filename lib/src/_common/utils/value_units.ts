import { Precise } from "./utils";

export class ValueUnits {
    public value: number = 0;
    public units: bigint = BigInt(0);

    public static fromValue(value: number, decimals: number): ValueUnits {
        {
            let returnValue = new ValueUnits();
            returnValue.value = value;

            //Note precise is used to avoid floating point errors
            returnValue.units = BigInt(Precise(value * Math.pow(10, decimals)));
            return returnValue;
        }
    }
    public static fromUnits(units: bigint, decimals: number): ValueUnits {
        {
            let returnValue = new ValueUnits();
            returnValue.units = units;

            let x = units.toString().padStart(decimals, "0");
            var position = x.length - decimals;
            var output = [x.slice(0, position), ".", x.slice(position)].join('');
            returnValue.value = Number(output);

            return returnValue;
        }
    }
}