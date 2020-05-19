/**
 * @file rn端的jsBridge的api
 */
import {RnSide} from '../interface/rnSide';
import {H5Side} from "../interface/h5Side";
const md5 = require('md5');

export const RnSideApi = (function () {
    // webview对象
    let webview;

    // rn-side注册的方法
    let RnApiMap = {};

    // rn-side注册的回调
    const RnCallback = {};

    // 验证通过传递给h5的票据
    let tokenToH5 = '';

    // 发送消息到h5端
    function sendData (params) {
        if (webview && webview.postMessage && typeof webview.postMessage === 'function') {
            const jsonParams = JSON.stringify(params);
            webview.postMessage(jsonParams);
        }
    }

    return {
        /**
         * 初始化提供给h5页面调用的jsApi方法
         * @param api 注册的api方法集合
         */
        initWebview(api: RnSide.ApiMap, refWebview) {
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
        executeCheckSafty(params: RnSide.RnParams) {
            if (tokenToH5) {
                return;
            }
            const {type, response, callbackId} = params;
            if (type === RnSide.types.CHECKSAFETY) {
                const fn = RnApiMap['checkSafety'];
                const RnApiMapKeys = Object.keys(RnApiMap);
                if (fn && typeof fn === 'function') {
                    const partialSend = (result) => {
                        tokenToH5 = md5(`rn_${Math.round(Math.random() * 1000)}_${Date.now()}`);
                        const json = {
                            type: H5Side.types.SAFETY,
                            callbackId,
                            response: {RnApiMapKeys, token: tokenToH5, isSafe: result || true}
                        };
                        sendData(json);
                    };
                    fn(response, partialSend)
                } else {
                    tokenToH5 = md5(`rn_${Math.round(Math.random() * 1000)}_${Date.now()}`);
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
         * @param method 方法名
         * @param params 参数
         * @param cb 回调函数
         */
        invokeH5(method: string, params: any, cb: (data?: any) => any) {
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
            if (type === RnSide.types.CHECKSAFETY) {
                this.executeCheckSafty(json)
            } else if (type === RnSide.types.RAPI) {
                const {params, token} = response;
                if (token === tokenToH5) {
                    const fn = RnApiMap[method];
                    if (fn && typeof fn === 'function') {
                        const partialSend = (result) => {
                            tokenToH5 = md5(`rn_${Math.round(Math.random() * 1000)}_${Date.now()}`);
                            const json = {
                                type: H5Side.types.HCB,
                                callbackId,
                                response: result
                            };
                            sendData(json);
                        };
                        fn(params, partialSend)
                    }
                } else {

                }
            }
        }
    }
})();