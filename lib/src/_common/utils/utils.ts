import * as minimist from 'minimist'
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

export function LogProgress(progress:string){
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
    process.stdout.write(progress)
}

