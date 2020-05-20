/**
 * @file h5端的jsBridge的api类型
 */

export namespace H5Side {
    // src-side的api格式
    export type ApiMap = {[key: string]: (params: any, send: (data: any) => any) => any}

    export type invoke = (data?: any) => any

    export type listen = (data?: any) => any

    export enum types {
        SAFETY = 'safety', // 校验安全性
        ERROR = 'error', // 错误
        HCB = 'hcb', // 执行H5的cb
        HAPI = 'hapi' // 执行H5的api
    }

    export interface H5ReceiveParams {
        type: types,
        callbackId?: string,
        response: any,
        method?: string
    }

    export interface InvokeRnparams {
        method: string,
        params: any,
        success: (data: any) => any,
        fail: (error: any) => any
    }
}