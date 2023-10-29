const readline = require('readline');

async function getInputWithPrompt(prompt, options){
    const { validation, canCancel } = options;
    expectType({prompt, type: 'string'});
    expectType({validation, type: 'function'});
    expectType({canCancel, type: ['boolean', 'array']});
    let valid = false;
    let failedMsg = 'invalid input';
    let input = '';
    
    while(!valid) {
        input = await getInputCore(prompt);
        input = input.trim();
        if(canCancel) if(userDidCancel(input, canCancel)) return 'cancelled';
        if(validation){
            const result = validation(input);
            if(result === true) valid = true;
            else if(typeof result === 'string') failedMsg = result;
            else if(typeof result !== 'boolean' || typeof result !== 'string')
                throw new Error('validation function must return true or false or a string');
        }
        console.log(failedMsg);
    }
}

async function getInput(options){
    const { validation, canCancel } = options;
    expectType({validation, type: 'function'});
    expectType({canCancel, type: ['boolean', 'array']});
    let valid = false;
    let failedMsg = 'invalid input';
    let input = '';

    while(!valid) {
        input = await getInputCore('');
        input = input.trim();
        if(canCancel) if(userDidCancel(input, canCancel)) return 'cancelled';
        if(validation){
            const result = validation(input);
            if(result === true) valid = true;
            else if(typeof result === 'string') failedMsg = result;
            else if(typeof result !== 'boolean' || typeof result !== 'string')
                throw new Error('validation function must return true or false or a string');
        }
        console.log(failedMsg);
    }
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
        if(canCancel) if(userDidCancel(input, canCancel)) return 'cancelled';

        //Validation check
        if(!isNaN(Number(input))){ //if input is a number
            valid = true;
            if(validation){
                valid = false;
                const result = validation(Number(input));
                if(result === true) valid = true;
                else if(typeof result === 'string') failedMsg = result;
            }
            if(valid && range) {
                valid = false;
                if(!(input <= range[0] || input >= range[1])) valid = true;
                else failedMsg = `Sorry, that's not a valid number in the range ${range[0]} to ${range[1]}`;
            }
        }

        if(!valid) console.log(failedMsg);
    }

    return input;
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
            if(typeof canCancel === 'array') canCancel = canCancel.map(i=>i.toLowerCase);
        }
        if(canCancel) if(userDidCancel(input, canCancel)) return 'cancelled';

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

function expectType(params){
    const keys = Object.keys(params);
    const value = params[keys[0]];
    const arg2 = params[keys[1]];
    const types = typeof arg2 === 'string' ? [arg2] : arg2;
    const allowNullAndUndefined = true;
    if(keys.length === 3) allowNullAndUndefined = params[keys[3]];
    const argName = Object.keys(params)[0];
    let err;
    for(let type of types){
        if(!(allowNullAndUndefined && value == null)){ //if it cant be and it isn't
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
    if(typeof cancel === 'boolean') return !(input === 'cancel' || input === 'exit');
    else if(Array.isArray(cancel)) return cancel.includes(input);
}

module.exports = {
    getInputWithPrompt, getInput, getNumberWithPrompt, getBooleanWithPrompt
};