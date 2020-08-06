/**
 * @file rn端的jsBridge的api
 */
import { RnSide } from '../interface/rnSide';
import { H5Side } from "../interface/h5Side";
import { getUID, getUID1, isBoolean, isFunction, isString } from "../utils/index";
import { getStoreInstance } from '../utils/store';
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
        },
        /**
         * 监听H5请求资源的性能数据
         * @param cb 回调函数
         */
        listenTypePerformance(cb) {
            if (!RnApiMap['performanceTypeCb'] && isFunction(cb)) {
                RnApiMap['performanceTypeCb'] = cb;
            }
        },
        /**
         * 储存数据
         */
        sessionStore(options) {
            const { key, data, type = '', noticeH5 } = options;
            if (!isString(key)) {
                console.warn('the value of key must be exist');
                return;
            }
            const store = getStoreInstance();
            let isStore;
            switch (type) {
                case RnSide.StoreTypes.ADD:
                    isStore = store.add(key, data);
                    break;
                case RnSide.StoreTypes.DEL:
                    isStore = store.del(key);
                    break;
                case RnSide.StoreTypes.MOD:
                    isStore = store.modify(key, data);
                    break;
                default:
                    isStore = store.add(key, data);
                    break;
            }
            if (isStore) {
                // 等待H5调用
                if (!RnApiMap['getSessionStore']) {
                    RnApiMap['getSessionStore'] = function (params, send) {
                        params = isString(params) ? [params] : params;
                        const store = getStoreInstance();
                        let target = {};
                        params.forEach((key) => {
                            target[key] = store.get(key);
                        });
                        send({ isSuccess: true, result: target });
                    };
                }
                // 主动触发H5调用
                if (noticeH5) {
                    if (tokenToH5) {
                        this.invokeH5({
                            method: `getSessionStoreH5-${key}`,
                            params: data
                        });
                    }
                    else {
                        console.warn('bridge is still not to build, if you must do send, you can set the noticeH5 true.');
                    }
                }
            }
            else {
                console.warn(`${key} in RnBridge has problem, maybe check the type of options.`);
            }
        },
        /**
         * 清除储存的数据
         */
        clearSessionStore(key) {
            const store = getStoreInstance();
            store.clear(key);
        },
        /**
         * 是否有该储存数据
         */
        hasSessionStoreByKey(key) {
            const store = getStoreInstance();
            return store.get(key) && true;
        },
        /**
         * 监听h5发布的ajax请求
         */
        listenAjax() {
            if (!RnApiMap['debugAjax']) {
                let count = 0;
                RnApiMap['debugAjax'] = (params) => {
                    const { type, content } = params;
                    count += 1;
                    switch (type) {
                        case H5Side.XHREvent.AJAX_WARN:
                            console.log(`%cRnBridge-Ajax${count}-warn:`, 'color: brown;background: #fffbe6;display: block;font-size: 13px', content.response.time, content.message);
                            break;
                        case H5Side.XHREvent.AJAX_ABORT:
                        case H5Side.XHREvent.AJAX_TIMEOUT:
                        case H5Side.XHREvent.AJAX_ERROR:
                            console.groupCollapsed(`%cRnBridge-Ajax${count}-error:`, 'color: red;background: #fff0f0;display: block;font-size: 13px', content.response.time, content.message);
                            console.log(content.response);
                            console.groupEnd();
                            break;
                        case H5Side.XHREvent.AJAX_PROGRESS:
                        case H5Side.XHREvent.AJAX_READY_STATE_CHANGE:
                            console.groupCollapsed(`%cRnBridge-Ajax${count}-success:`, 'color: white;background: #b4df53;display: block;font-size: 13px', content.response.time, content.message);
                            console.log(content.response);
                            console.groupEnd();
                            break;
                    }
                };
            }
        },
        listenConsole() {
            if (!RnApiMap['debugConsole']) {
                RnApiMap['debugConsole'] = (params) => {
                    const { type, content } = params;
                    // @ts-ignore
                    const print = console.log;
                    let array = [];
                    switch (type) {
                        case 'log':
                            array = [`%cRnBridge-${type}:`, 'color: white;background: #5496c7;display: block;font-size: 13px'].concat(content);
                            break;
                        case 'warn':
                            array = [`%cRnBridge-${type}:`, 'color: brown;background: #fffbe6;display: block;font-size: 13px'].concat(content);
                            break;
                        case 'error':
                            array = [`%cRnBridge-${type}:`, 'color: red;background: #fff0f0;display: block;font-size: 13px'].concat(content);
                            break;
                    }
                    print(...array);
                };
            }
        }
    };
})();
