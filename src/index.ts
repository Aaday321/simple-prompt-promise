import {expectType, getInput_SharedLogic, getInputCore, userDidCancel, validateRange} from "./internals.js";

export type Cancel = boolean | string[]
export interface Options {
    validation?: (value: string | number) => boolean;
    canCancel?: Cancel;
}
async function getInputWithPrompt(prompt: string, options?: Options) {
    expectType({prompt, type: 'string'});
    return await getInput_SharedLogic(prompt, options);
}

async function getInput(options: Options) {
    return await getInput_SharedLogic('', options);
}

export type RangeArray = [number, number];
export interface NumberOptions extends Options {
    range?: RangeArray;
}
async function getNumberWithPrompt(prompt: string, options: NumberOptions) {
    const { validation, range, canCancel } = options || {};
    expectType({prompt, type: 'string'});
    expectType({validation, type: 'function'});
    expectType({range, type: 'array'});
    expectType({canCancel, type: ['boolean', 'array']});
    if(range) validateRange(range);
    
    let input = "";
    let valid = false;
    let failedMsg = `Sorry, that's not a valid number`;
    while(!valid){
        input = await getInputCore(prompt);
        input = input.trim();
        if(canCancel && userDidCancel(input, canCancel)) return 'cancelled';
        const inputToNumber = Number(input);

        //Validation check
        if(!isNaN(inputToNumber)){ //if input is a number
            valid = true;
            if(validation){
                valid = false;
                const result = validation(inputToNumber);
                if(result === true) valid = true;
                else if(typeof result === 'string') failedMsg = result;
            }
            if(valid && range) {
                valid = false;
                if(inputToNumber >= range[0] && inputToNumber <= range[1]) valid = true;
                else failedMsg = `Sorry, that's not a valid number in the range ${range[0]} to ${range[1]}`;
            }
        }

        if(!valid) console.log(failedMsg);
    }

    return Number(input);
}


//The type information should say that if we disable default
//Then we have to pass BOTH accept and reject conditions
export interface BooleanOptions extends Options {
    accept?: string[];
    reject?: string[];
    disableDefault?: boolean;
    matchCase?: boolean;
    rejectMsg?: string;
}
async function getBooleanWithPrompt(prompt: string, options: BooleanOptions){
    let { accept, reject, disableDefault, matchCase, rejectMsg, canCancel } = options || {};
    rejectMsg = rejectMsg ?? 'invalid boolean input';
    
    expectType({accept, type:'array'});
    expectType({reject, type: 'array'});
    expectType({disableDefault, type: 'boolean'});
    expectType({matchCase, type: 'boolean'});
    expectType({rejectMsg, type: 'string'});
    expectType({canCancel, type: ['boolean', 'array']});

    let input = "";
    let valid = false;
    let response;

    const acceptDefault = ['y', 'yes', 'true', 'Y', 'Yes', 'True']
    const rejectDefault = ['n', 'no', 'false', 'N', 'No', 'False']

    if(disableDefault){
        if(!Array.isArray(accept) || !Array.isArray(reject)){
            const msg = "If you use disableDefault, you must pass explicit accept and reject conditions"
            const alsoMsg = "If you want to disable acceptance or rejection then you can pass an empty array to indicate explicit intentionality"
            throw new Error(msg +  "\n" + alsoMsg);
        }
    } else {
        if(accept) accept = [...acceptDefault, ...accept];
        else accept = acceptDefault;
        if (reject) reject = [...rejectDefault, ...reject];
        else reject = rejectDefault;
    }

    if(!matchCase && accept){
        accept = accept.map(i=>i.toLowerCase());
    }

    if(!matchCase && reject){
        reject = reject.map(i=>i.toLowerCase());
    }

    while(!valid){
        input = await getInputCore(prompt);
        input = input.trim();
        if(!matchCase) {
            input = input.toLowerCase();
            if(Array.isArray(canCancel)) canCancel = canCancel.map(i=>i.toLowerCase());
        }
        if(canCancel && userDidCancel(input, canCancel)) return 'cancelled';

        if(accept?.includes(input)){
            valid = true;
            response = true;
            break;
        } else if(reject?.includes(input)){
            valid = true;
            response = false;
            break;
        }

        console.log(rejectMsg);
    }

    return response;
}

export {
    getInputWithPrompt, getInput, getNumberWithPrompt, getBooleanWithPrompt
};=