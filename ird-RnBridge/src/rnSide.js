/**
 * @file rn端的jsBridge的api
 */
import { RnSide } from '../interface/rnSide';
import { H5Side } from "../interface/h5Side";
import { isBoolean, getUID, getUID1 } from "../utils/index";
export const RnSideApi = (function () {
    // webview对象
    let webview;
    // rn-side注册的方法
    let RnApiMap = {};
    // rn-side注册的回调
    const RnCallback = {};
    // rn-side注册的失败回调
    const RnCallbackFail = {};
    // 验证通过传递给h5的票据
    let tokenToH5 = '';
    // 记录cb的指针
    let rnCbId = 0;
    // 发送消息到h5端
    function sendData(params) {
        if (webview && webview.postMessage && typeof webview.postMessage === 'function') {
            const jsonParams = JSON.stringify(params);
            webview.postMessage(jsonParams);
        }
    }
    // 注册h5的回调函数
    function registerCb(success, fail) {
        if (success && typeof success === 'function') {
            rnCbId += 1;
            const registerKey = getUID1(`rn_${rnCbId}_${Date.now()}`);
            RnCallback[registerKey] = success;
            if (fail && typeof fail === 'function') {
                RnCallbackFail[registerKey] = fail;
            }
            return registerKey;
        }
        return '';
    }
    function invokeRnApi(method, callbackId, response) {
        const { params, token } = response;
        if (token === tokenToH5) {
            const fn = RnApiMap[method];
            if (fn && typeof fn === 'function') {
                const partialSend = (isSuccess, result) => {
                    const json = {
                        type: H5Side.types.HCB,
                        callbackId,
                        response: { isSuccess, params: result }
                    };
                    sendData(json);
                };
                fn(params, partialSend);
            }
        }
        else {
            sendData({
                type: H5Side.types.ERROR,
                callbackId,
                response: 'token is wrong!'
            });
        }
    }
    function invokeRnCb(response, callbackId) {
        const { isSuccess, params } = response;
        if (callbackId) {
            const fn = isSuccess ? RnCallback[callbackId] : RnCallbackFail[callbackId];
            delete RnCallback[callbackId];
            delete RnCallbackFail[callbackId];
            fn(params);
        }
    }
    return {
        /**
         * 初始化提供给h5页面调用的jsApi方法
         * @param api 注册的api方法集合
         */
        initWebview(refWebview, api) {
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
        executeCheckSafety(params) {
            if (tokenToH5) {
                return;
            }
            const { type, response, callbackId } = params;
            if (type === RnSide.types.CHECKSAFETY) {
                const fn = RnApiMap['checkSafety'];
                const RnApiMapKeys = Object.keys(RnApiMap);
                if (fn && typeof fn === 'function') {
                    const partialSend = (isSuccess) => {
                        // tokenToH5 = md5(`rn_${Math.round(Math.random() * 1000)}_${Date.now()}`);
                        tokenToH5 = getUID();
                        const json = {
                            type: H5Side.types.SAFETY,
                            callbackId,
                            response: {
                                RnApiMapKeys,
                                token: isBoolean(isSuccess) ? tokenToH5 : '',
                                isSafe: typeof isSuccess === 'boolean' ? isSuccess : true
                            }
                        };
                        sendData(json);
                    };
                    fn(response, partialSend);
                }
                else {
                    // tokenToH5 = md5(`rn_${Math.round(Math.random() * 1000)}_${Date.now()}`);
                    tokenToH5 = getUID();
                    sendData({
                        type: H5Side.types.SAFETY,
                        callbackId,
                        response: { RnApiMapKeys, token: tokenToH5, isSafe: true }
                    });
                }
            }
        },
        /**
         * 调用h5-side的js方法
         * @param options 选项
         */
        invokeH5(options) {
            const { method, params, success, fail } = options;
            let json = {
                type: H5Side.types.HAPI,
                response: params,
                method: method
            };
            const callbackId = registerCb(success, fail);
            if (callbackId) {
                json.callbackId = callbackId;
            }
            sendData(json);
        },
        /**
         * 监听h5-side调用的方法
         * @param params 参数
         */
        listenH5(params) {
            let json;
            if (typeof params === 'string') {
                try {
                    json = JSON.parse(params);
                }
                catch (e) {
                    json = {};
                }
            }
            const { method, type, response, callbackId } = json;
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
    };
})();
