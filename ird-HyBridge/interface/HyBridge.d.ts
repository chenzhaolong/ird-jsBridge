/**
 * @file 定义类型
 */
import { TypeJS } from "./constans";
export interface Options {
    ui: string;
    wk: string;
    android: string;
}
export interface InitResponse {
    type?: TypeJS;
    callbackId?: string;
    result?: Array<any>;
    token?: string;
}
export interface CbOptions {
    type: TypeJS;
    callbackId: string;
    result: any;
    isSuccess?: boolean;
}
export interface InvokeOptions {
    methodName: string;
    params: any;
    success: (data: any) => void;
    fail: (data: any) => void;
}
export interface NaInvokeJs {
    methodName: string;
    params: any;
    callbackId?: string;
    type?: TypeJS;
}
