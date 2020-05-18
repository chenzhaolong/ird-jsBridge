/**
 * @file rn端的jsBridge的api
 */
import {RnSide} from '../interface/rnSide';
import {H5Side} from "../interface/h5Side";
const md5 = require('md5');

export const RnSideApi = (function () {
    // webview对象
    let webview = '';

    // rn-side注册的方法
    const RnApiMap = {};

    // rn-side注册的回调
    const RnCallback = {};

    // 验证通过传递给h5的票据
    let tokenToH5 = '';

    // 发送消息到h5端
    function sendData (params) {
        const jsonParams = JSON.stringify(params);
        if (this.webview && this.webview.postMessage && this.webview.postMessage) {
            this.webview.postMessage(jsonParams);
        }
    }

    return {
        /**
         * 初始化提供给h5页面调用的jsApi方法
         * @param api 注册的api方法集合
         */
        initWebview(api: RnSide.ApiMap, webview) {
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
            tokenToH5 = md5(`rn_${Math.round(Math.random() * 1000)}_${Date.now()}`);
            if (type === RnSide.types.CHECKSAFETY) {
                const fn = RnApiMap['checkSafety'];
                const RnApiMapKeys = Object.keys(RnApiMap);
                if (fn && typeof fn === 'function') {
                    const partialSend = () => {
                        const json = {
                            type: H5Side.types.SAFETY,
                            callbackId,
                            response: {RnApiMapKeys, token: tokenToH5, isSafe: true}
                        };
                        sendData(json);
                    };
                    fn(response, partialSend)
                } else {
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
        }
    }
})();