/**
 * @file 定义类型
 */
import { TypeJS } from "./constans";

export interface Options {
    ui: string,
    wk: string,
    android: string
}

export interface InitResponse {
    type?: TypeJS,
    callbackId?: string,
    nativeMethods?: Array<any>,
    token?: string
}

export interface InvokeOptions {
    methodName: string,
    params: any,
    success: (data: any) => void,
    fail: (data: any) => void
}

export interface CbOptions {
    result: any,
    callbackId: string,
    isSuccess: boolean,
    type: TypeJS
}