/**
 * @file rn端的jsBridge的api类型
 */

export namespace RnSide {
    // src-side的api格式
    export type ApiMap = {[key: string]: (params: any, send: (data: any) => any) => any}
}