import minimist = require('minimist');
import * as readline from 'readline'


export class InputParams {

    static get(field: string): string | undefined {
        const argv = minimist(process.argv.slice(2));
        return argv[field];
    }
}

export function Sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export function Precise(value:number, precision:number = 15):number {
    return Number(parseFloat(value.toString()).toPrecision(precision));
}
export function PreciseDecimals(value:number, decimals:number = 2):number {
    return Number(Precise(value).toFixed(decimals));
}

export function LogProgress(progress:string){
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
    process.stdout.write(progress)
}

export const base64ToString = (encoded: any) => {
    return Buffer.from(encoded, "base64").toString();
  };
export const base64ToBigUIntString = (encoded:any) => {
    return Buffer.from(encoded, "base64").readBigUInt64BE().toString();
  };

