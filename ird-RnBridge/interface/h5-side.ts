/**
 * @file h5端的jsBridge的api类型
 */

export namespace H5Side {
    // src-side的api格式
    export type ApiMap = {[key: string]: (params: any, send: (data: any) => any) => any}

    export type invoke = (data?: any) => any

    export type listen = (data?: any) => any
}