const readline = require('readline');

async function getInputWithPrompt(prompt, options) {
    expectType({prompt, type: 'string'});
    return await getInput_SharedLogic( prompt, options);
}

async function getInput(options) {
    const { validation, canCancel } = options;
    expectType({validation, type: 'function'});
    expectType({canCancel, type: ['boolean', 'array']});
    return await getInput_SharedLogic('', options);
}

async function getInput_SharedLogic(prompt, { validation, canCancel }) {
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
        }
        console.log(failedMsg);
    }
    return input;
}

function getInputCore(prompt) {
      
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve=>{
        rl.question(prompt, (input) => {
            rl.close();
            resolve(input);
        });
    });
};

async function getNumberWithPrompt(prompt, options){
    const { validation, range, canCancel } = options;
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

async function getBooleanWithPrompt(prompt, options){
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

    if(!disableDefault){
        accept = ['y', 'yes', 'true', 'Y', 'Yes', 'True', ...accept];
        reject = ['n', 'no', 'false', 'N', 'No', 'False', ...reject];
    }

    if(!matchCase){
        accept = accept.map(i=>i.toLowerCase());
        reject = reject.map(i=>i.toLowerCase());
    }

    while(!valid){
        input = await getInputCore(prompt);
        input = input.trim();
        if(!matchCase) {
            input = input.toLowerCase();
            if(typeof canCancel === 'array') canCancel = canCancel.map(i=>i.toLowerCase());
        }
        if(canCancel && userDidCancel(input, canCancel)) return 'cancelled';

        if(accept.includes(input)){
            valid = true;
            response = true;
            break;
        } else if(reject.includes(input)){
            valid = true;
            response = false;
            break;
        }

        console.log(rejectMsg);
    }

    return response;
}

function getUnknownKey(obj, knownKeys){
    let keys =  Object.keys(obj);
    keys = keys.filter(key => !knownKeys.includes(key));
    return keys[0];
}

function expectType(params){
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

function validateRange(range){
    let errMsg = "";
    if(range.length !== 2) errMsg = "Range must be an array with 2 values";
    else if(range[0] > range[1]) errMsg = "The first number in the range must be smaller than the second number";
    if(errMsg) throw new Error(errMsg);
    else return true;
}

function userDidCancel(cancel, input){
    if(typeof cancel === 'boolean') return input === 'cancel' || input === 'exit';
    else if(Array.isArray(cancel)) return cancel.includes(input);
}

module.exports = {
    getInputWithPrompt, getInput, getNumberWithPrompt, getBooleanWithPrompt
};