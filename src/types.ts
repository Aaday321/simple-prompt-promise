export type Cancel = boolean | string[]
export type RangeArray = [number, number];

export interface Options {
    validation?: (value: string | number) => boolean;
    canCancel?: Cancel;
}

export interface BooleanOptions extends Options {
    accept: string[];
    reject: string[];
    disableDefault: boolean;
    matchCase: boolean;
    rejectMsg: string;
}

export interface NumberOptions extends Options {
    range: RangeArray;
}

export type ExpectTypeParams = {
    type: string | string[];
    allowNullAndUndefined?: boolean;
} & Record<string, unknown>;