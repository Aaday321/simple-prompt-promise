const readline = require('readline');

const getInputWithPrompt = prompt => {
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

const getNumberWithPrompt = async(prompt, validation)=>{
    const options = typeof prompt === "object" ? prompt : null;
    if(options){
        const { range, canCancel, validation } = options;
        return await getNumberWithPromptCore(options.prompt, range, canCancel, validation);
    }
    return await getNumberWithPromptCore(prompt, null, null, validation);
}


const getNumberWithPromptCore = async (prompt, range, canCancel, validation) => {
    canCancel = !(canCancel === false) || true;
    let input = "";
    let valid = false;
    let failedMsg = `Sorry, that's not a valid number`;
    while(!valid){
        input = await getInputWithPrompt(prompt);
        if(canCancel && input.toUpperCase() === 'CANCEL') return input;

        //Validation check
        if(!isNaN(Number(input))){ //if input is a number
            valid = true;
            if(typeof validation === "function"){
                valid = false;
                const result = validation(Number(input));
                if(result === true) valid = true;
                else if(typeof result === 'string') failedMsg = result;
            }
            if(valid && range) {
                valid = false;
                validateRange(range);
                if(!(input < range[0] || input > range[1])) valid = true;
                failedMsg = `Sorry, that's not a valid number in the range ${range[0]}-${range[1]}`;
            }
        }

        if(!valid) console.log(failedMsg);
    }

    return input;
}

function validateRange(range){
    let errMsg = "";
    if(!Array.isArray(range)) errMsg = "Range must be an array";
    else if(range.length !== 2) errMsg = "Range must be an array with 2 values";
    else if(range[0] > range[1]) errMsg = "The first number in the range must be smaller than the second number";
    if(errMsg) throw new Error(errMsg);
    else return true;
}

//TODO: Refactor this code so that there is more customization for the consumer
const getBooleanWithPrompt = async (prompt, arr) => {
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