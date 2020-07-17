/**
 * @file rn端的jsBridge的api
 */
import { RnSide } from '../interface/rnSide';
import { H5Side } from "../interface/h5Side";
import { isBoolean, isFunction, getUID, getUID1 } from "../utils/index";
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
            // 超出极限，从零开始
            if (rnCbId >= Number.MAX_SAFE_INTEGER) {
                rnCbId = 0;
            }
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
                const partialSend = (options = {}) => {
                    const json = {
                        type: H5Side.types.HCB,
                        callbackId,
                        response: { isSuccess: options.isSuccess, params: options.result }
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
        const { isSuccess, params, token } = response;
        if (callbackId && token === tokenToH5) {
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
                    const partialSend = (options = {}) => {
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
        },
        /**
         * 监听H5的性能数据
         * @param cb 回调函数
         **/
        listenPerformance(cb) {
            if (!RnApiMap['performanceCb'] && isFunction(cb)) {
                RnApiMap['performanceCb'] = cb;
            }
        }
    };
})();
