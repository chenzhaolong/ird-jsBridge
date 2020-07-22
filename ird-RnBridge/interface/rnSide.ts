/**
 * @file rn端的jsBridge的api类型
 */

export namespace RnSide {
    // src-side的api格式
    export type ApiMap = {[key: string]: (params: any, send: (data: any) => any) => any}

    export enum types {
        CHECKSAFETY = 'checkSafety', // 安全性校验
        ERROR = 'error', // 错误
        RCB = 'rcb', // 执行rn的cb
        RAPI = 'rapi' // 执行rn的api
    }

    export interface RnParams {
        type: types,
        callbackId?: string,
        response: any,
        method?: string
    }

    export interface InvokeH5Params {
        method: string,
        params: any,
        success: (data: any) => any,
        fail: (error: any) => any
    }

    export enum StoreTypes {
        ADD = 'add',
        DEL = 'delete',
        MOD = 'modify'
    }

    export interface StoreOptions {
        key: string,
        data: object,
        type: StoreOptions,
        noticeH5: boolean
    }
}