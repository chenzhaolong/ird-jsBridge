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