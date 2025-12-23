import readline from "node:readline";
import { Options, Cancel, RangeArray } from './index.js';

//Let's see if we can have better type definition here
type ExpectTypeParams = {
    type: string | string[];
    allowNullAndUndefined?: boolean;
} & Record<string, unknown>;
export function expectType(params: ExpectTypeParams) {
    const types = typeof params.type === 'string' ? [params.type] : params.type;
    let allowNullAndUndefined = params.allowNullAndUndefined ?? true;
    const argName = getUnknownKey(params, ['type', 'allowNullAndUndefined']);
    const value = params[argName];
    let err;
    for(let type of types){
        if(allowNullAndUndefined && value == null) return;
        if(type === 'array') {
            if(Array.isArray(value)) return;
            else err = new Error(`Type error: ${argName} must be ${
                types.length > 1 ? 'an array or ' + types.filter(i=>i!='array').join(' or ') : 'an array'
            }`);
        } else if(typeof value === type) return;
        else err = new Error(`Type error: ${argName} must be of type ${
                types.length > 1 ? types.join(' or ') : type
            }`);

    }
    if(err) throw err;
}

function getUnknownKey(obj:ExpectTypeParams, knownKeys: string[]){
    let keys =  Object.keys(obj);
    keys = keys.filter(key => !knownKeys.includes(key));
    return keys[0];
}

export function validateRange(range: RangeArray){
    let errMsg = "";
    if(range.length !== 2) errMsg = "Range must be an array with 2 values";
    else if(range[0] > range[1]) errMsg = "The first number in the range must be smaller than the second number";
    if(errMsg) throw new Error(errMsg);
    else return true;
}

export async function getInput_SharedLogic(prompt: string, options?: Options) {
    let validation = options?.validation;
    let canCancel = options?.canCancel;

    if (validation) expectType({validation, type: 'function'});
    if (canCancel)  expectType({canCancel, type: ['boolean', 'array']});

    let valid = false;
    let failedMsg = 'invalid input';
    let input = '';
    canCancel = canCancel ?? true;
    while(!valid) {
        input = await getInputCore(prompt);
        input = input.trim();
        if (canCancel && userDidCancel(input, canCancel)) return 'cancelled';
        if (validation) {
            const result = validation(input);
            if (result === true) valid = true;
            else if (typeof result === 'string') failedMsg = result;
            else throw new Error('validation function must return true or false or a string');
        } else valid = true
    }
    return input;
}

export function getInputCore(prompt: string) {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise<string>(resolve=>{
        rl.question(prompt, (input) => {
            rl.close();
            resolve(input);
        });
    });
};

export function userDidCancel(input: string, cancel: Cancel){
    if(typeof cancel === 'boolean') return input === 'cancel' || input === 'exit';
    else if(Array.isArray(cancel)) return cancel.includes(input);
    else return false;
}
