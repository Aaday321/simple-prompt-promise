const readline = require('readline');

function getInputWithPrompt(prompt) {
    if(!prompt) prompt = '$';
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve=>{
        rl.question(prompt + ': ', input => {
            rl.close();
            resolve(input);
        });
    });
};

async function getNumberWithPrompt(prompt, validation){
    const options = typeof prompt === "object" ? prompt : null;
    if(options){
        return await getNumberWithPromptCore(options);
    }
    return await getNumberWithPromptCore({ prompt, validation });
}


async function getNumberWithPromptCore (options){
    validateArgumentTypes(options);
    const { prompt, validation, range, canCancel } = options;
    let input = "";
    let valid = false;
    let failedMsg = `Sorry, that's not a valid number`;
    while(!valid){
        input = await getInputWithPrompt(prompt);
        if(canCancel && input.toUpperCase() === 'CANCEL') return input;

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
                validateRange(range);
                if(!(input < range[0] || input > range[1])) valid = true;
                else failedMsg = `Sorry, that's not a valid number in the range ${range[0]}-${range[1]}`;
            }
        }

        if(!valid) console.log(failedMsg);
    }

    return input;
}

function validateArgumentTypes({ prompt, validation, range, canCancel }){
    if(typeof prompt !== 'string' && prompt != null)
        return new Error('Type error: prompt must be of type string');
    if(typeof validation !== 'function' && validation != null)
        return new Error('Type error: validation function must be of type function');
    if(!Array.isArray(range) && range != null)
        return new Error('Type error: range must be of type array');
    if(typeof canCancel !== 'boolean' && canCancel != null)
        return new Error('Type error: canCancel must be of type boolean');
}

function validateRange(range){
    let errMsg = "";
    if(range.length !== 2) errMsg = "Range must be an array with 2 values";
    else if(range[0] > range[1]) errMsg = "The first number in the range must be smaller than the second number";
    if(errMsg) throw new Error(errMsg);
    else return true;
}

//TODO: Refactor this code so that there is more customization for the consumer
async function getBooleanWithPrompt (prompt, arr) {
    let input = await getInputWithPrompt(prompt);
    input = input.toLowerCase();
    const acceptableYes = ['y','yes', 'true', ...arr];
    const acceptableNo = ['n','no', 'false'];
    while(true){
        if([...acceptableYes, ...acceptableNo].includes(input)){
            return acceptableYes.includes(input);
        }
        console.log('Sorry, only yes or no is accepted');
        input = await getInputWithPrompt(prompt);
    }
};

module.exports = {
    getInputWithPrompt, getNumberWithPrompt, getBooleanWithPrompt
};