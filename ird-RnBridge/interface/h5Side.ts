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
        HAPI = 'hapi', // 执行H5的api
        // SESSIONSTORE = 'sessionStore'
    }

    export interface H5ReceiveParams {
        type: types,
        callbackId?: string,
        response?: any,
        method?: string
    }

    export interface InvokeRnparams {
        method: string,
        params: any,
        success: (data: any) => any,
        fail?: (error: any) => any
    }

    export interface BridgeTime {
        startTime: number,
        endTime: number
    }

    export enum InitiatorType {
        ALL = 'all',
        IMG = 'img',
        LINK = 'link',
        IFRAME = 'iframe',
        SCRIPT = 'script',
        CSS = 'css',
        XHR = 'xmlhttprequest',
        NAV = 'navigation'
    }

    export enum Debug {
        AJAX = 'ajax'
    }
    
    export enum XHREvent {
        AJAX_ABORT = 'ajaxAbort',
        AJAX_ERROR = 'ajaxError',
        AJAX_LOAD = 'ajaxLoad',
        AJAX_LOAD_START = 'ajaxLoadStart',
        AJAX_PROGRESS = 'ajaxProgress',
        AJAX_TIMEOUT = 'ajaxTimeout',
        AJAX_LOAD_END = 'ajaxLoadEnd',
        AJAX_READY_STATE_CHANGE = 'ajaxReadyStateChange'
    }
}