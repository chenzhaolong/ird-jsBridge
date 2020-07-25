/**
 * @file rn端的jsBridge的api类型
 */
export declare namespace RnSide {
    type ApiMap = {
        [key: string]: (params: any, send: (data: any) => any) => any;
    };
    enum types {
        CHECKSAFETY = "checkSafety",
        ERROR = "error",
        RCB = "rcb",
        RAPI = "rapi"
    }
    interface RnParams {
        type: types;
        callbackId?: string;
        response: any;
        method?: string;
    }
    interface InvokeH5Params {
        method: string;
        params: any;
        success?: (data: any) => any;
        fail?: (error: any) => any;
    }
    enum StoreTypes {
        ADD = "add",
        DEL = "delete",
        MOD = "modify"
    }
    interface StoreOptions {
        key: string;
        data: object;
        type: StoreOptions;
        noticeH5: boolean;
    }
}
