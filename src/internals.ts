import {ExpectTypeParams, RangeArray} from "./types.js";

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

