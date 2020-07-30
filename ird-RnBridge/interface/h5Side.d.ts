/**
 * @file h5端的jsBridge的api类型
 */
export declare namespace H5Side {
    type ApiMap = {
        [key: string]: (params: any, send: (data: any) => any) => any;
    };
    type invoke = (data?: any) => any;
    type listen = (data?: any) => any;
    enum types {
        SAFETY = "safety",
        ERROR = "error",
        HCB = "hcb",
        HAPI = "hapi"
    }
    interface H5ReceiveParams {
        type: types;
        callbackId?: string;
        response?: any;
        method?: string;
    }
    interface InvokeRnparams {
        method: string;
        params: any;
        success: (data: any) => any;
        fail?: (error: any) => any;
    }
    interface BridgeTime {
        startTime: number;
        endTime: number;
    }
    enum InitiatorType {
        ALL = "all",
        IMG = "img",
        LINK = "link",
        IFRAME = "iframe",
        SCRIPT = "script",
        CSS = "css",
        XHR = "xmlhttprequest",
        NAV = "navigation"
    }
    enum Debug {
        AJAX = "ajax",
        CONSOLE = "console"
    }
    enum XHREvent {
        AJAX_ABORT = "ajaxAbort",
        AJAX_ERROR = "ajaxError",
        AJAX_LOAD = "ajaxLoad",
        AJAX_LOAD_START = "ajaxLoadStart",
        AJAX_PROGRESS = "ajaxProgress",
        AJAX_TIMEOUT = "ajaxTimeout",
        AJAX_LOAD_END = "ajaxLoadEnd",
        AJAX_READY_STATE_CHANGE = "ajaxReadyStateChange"
    }
}
