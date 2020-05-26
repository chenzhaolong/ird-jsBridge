/**
 * @file rn端的jsBridge的api
 */
import {RnSide} from '../interface/rnSide';
import {H5Side} from "../interface/h5Side";
import {isBoolean, isFunction, getUID, getUID1} from "../utils/index";

export const RnSideApi = (function () {
    // webview对象
    let webview: any;

    // rn-side注册的方法
    let RnApiMap: {[key: string]: any} = {};

    // rn-side注册的回调
    const RnCallback: {[key: string]: any} = {};

    // rn-side注册的失败回调
    const RnCallbackFail: {[key: string]: any} = {};

    // 验证通过传递给h5的票据
    let tokenToH5 = '';

    // 记录cb的指针
    let rnCbId = 0;

    // 发送消息到h5端
    function sendData (params: any) {
        if (webview && webview.postMessage && typeof webview.postMessage === 'function') {
            const jsonParams = JSON.stringify(params);
            webview.postMessage(jsonParams);
        }
    }

    // 注册h5的回调函数
    function registerCb (success: (data: any) => {}, fail: any) {
        if (success && typeof success === 'function') {
            rnCbId += 1;
            const registerKey = getUID1(`rn_${rnCbId}_${Date.now()}`);
            RnCallback[registerKey] = success;
            if (fail && typeof fail === 'function') {
                RnCallbackFail[registerKey] = fail;
            }
            return registerKey
        }
        return ''
    }

    function invokeRnApi(method: string, callbackId: string, response: any) {
        const {params, token} = response;
        if (token === tokenToH5) {
            const fn = RnApiMap[method];
            if (fn && typeof fn === 'function') {
                const partialSend = (options: {isSuccess?: boolean, result?: any} = {}) => {
                    const json = {
                        type: H5Side.types.HCB,
                        callbackId,
                        response: {isSuccess: options.isSuccess, params: options.result}
                    };
                    sendData(json);
                };
                fn(params, partialSend)
            }
        } else {
            sendData({
                type: H5Side.types.ERROR,
                callbackId,
                response: 'token is wrong!'
            })
        }
    }

    function invokeRnCb(response: any, callbackId: string) {
        const {isSuccess, params} = response;
        if (callbackId) {
            const fn = isSuccess ? RnCallback[callbackId] : RnCallbackFail[callbackId];
            delete RnCallback[callbackId];
            delete RnCallbackFail[callbackId];
            fn && fn(params);
        }
    }

    return {
        /**
         * 初始化提供给h5页面调用的jsApi方法
         * @param api 注册的api方法集合
         */
        initWebview(refWebview: any, api: RnSide.ApiMap) {
            if (refWebview) {
                webview = refWebview;
            }
            if (api && typeof api === 'object') {
                RnApiMap = api;
            }
        },

        /**
         * jsBridge安全性校验
         * @param params h5-side传过来的校验参数
         */
        executeCheckSafety(params: RnSide.RnParams) {
            if (tokenToH5) {
                return;
            }
            const {type, response, callbackId} = params;
            if (type === RnSide.types.CHECKSAFETY) {
                const fn = RnApiMap['checkSafety'];
                const RnApiMapKeys = Object.keys(RnApiMap);
                if (fn && typeof fn === 'function') {
                    const partialSend = (options: {isSuccess?: boolean} = {}) => {
                        // tokenToH5 = md5(`rn_${Math.round(Math.random() * 1000)}_${Date.now()}`);
                        tokenToH5 = getUID();
                        const json = {
                            type: H5Side.types.SAFETY,
                            callbackId,
                            response: {
                                RnApiMapKeys: isBoolean(options.isSuccess) ? RnApiMapKeys : [],
                                token: isBoolean(options.isSuccess) ? tokenToH5 : '',
                                isSafe: isBoolean(options.isSuccess) && true
                            }
                        };
                        sendData(json);
                    };
                    fn(response, partialSend)
                } else {
                    // tokenToH5 = md5(`rn_${Math.round(Math.random() * 1000)}_${Date.now()}`);
                    tokenToH5 = getUID();
                    sendData({
                        type: H5Side.types.SAFETY,
                        callbackId,
                        response: {RnApiMapKeys, token: tokenToH5, isSafe: true}
                    })
                }
            }
        },

        /**
         * 调用h5-side的js方法
         * @param options 选项
         */
        invokeH5(options: RnSide.InvokeH5Params) {
            const {method, params, success, fail} = options;
            let json: H5Side.H5ReceiveParams = {
                type: H5Side.types.HAPI,
                response: params,
                method: method
            };
            const callbackId = registerCb(success, fail);
            if (callbackId) {
                json.callbackId = callbackId
            }
            sendData(json);
        },

        /**
         * 监听h5-side调用的方法
         * @param params 参数
         */
        listenH5(params: object) {
            let json;
            if (typeof params === 'string') {
                try {
                    json = JSON.parse(params);
                } catch (e) {
                    json = {}
                }
            }
            const {method, type, response, callbackId} = json;
            switch (type) {
                case RnSide.types.CHECKSAFETY:
                    this.executeCheckSafety(json);
                    break;
                case RnSide.types.RAPI:
                    invokeRnApi(method, callbackId, response);
                    break;
                case RnSide.types.RCB:
                    invokeRnCb(response, callbackId);
                    break;
                case RnSide.types.ERROR:
                    break;
            }
        }
    }
})();