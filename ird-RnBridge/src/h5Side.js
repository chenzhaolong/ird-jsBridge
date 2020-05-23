/**
 * @file h5端的jsBridge的api
 */
import { H5Side } from '../interface/h5Side';
import { RnSide } from '../interface/rnSide';
import { Doc, Win } from '../constant/index';
import { isBoolean, isFunction, getUID1 } from '../utils/index';
export const H5SideApi = (function () {
    // h5-side注册的方法
    let h5ApiMap = {};
    // h5-side注册的回调
    let h5Callback = {};
    // h5-side注册的失败回调
    let h5CallbackFail = {};
    // rn-side传过来的api
    let RnApiMap = [];
    // 初始化时rn验证通过返回的票据
    let tokenFromRn = '';
    // 记录cb的指针
    let h5CbId = 0;
    // 错误处理
    let errorHandle;
    // 监听
    function listenEvent() {
        if (Doc) {
            Doc.addEventListener('message', (params) => {
                let parseData;
                try {
                    parseData = JSON.parse(params);
                }
                catch (e) {
                    parseData = { type: H5Side.types.ERROR, response: 'parse params error， check the params' };
                }
                const { type, callbackId = '', response, method = '' } = parseData;
                switch (type) {
                    case H5Side.types.SAFETY:
                        initInnerPropertyAfterSuccess(response, callbackId);
                        break;
                    case H5Side.types.HCB:
                        invokeCallback(callbackId, response);
                        break;
                    case H5Side.types.HAPI:
                        invokeH5Api(method, response, callbackId);
                        break;
                    case H5Side.types.ERROR:
                        if (h5Callback[callbackId]) {
                            delete h5Callback[callbackId];
                        }
                        if (isFunction(errorHandle)) {
                            errorHandle(response);
                        }
                        break;
                }
            });
        }
    }
    // 验证成功后初始化内部属性
    function initInnerPropertyAfterSuccess(response, callbackId) {
        if (isBoolean(response.isSafe)) {
            RnApiMap = response.RnApiMapKeys;
            tokenFromRn = response.token;
            invokeCallback(callbackId, { isSuccess: true, params: '' });
        }
    }
    // 调用H5Callback回调
    function invokeCallback(cbId, data) {
        const { isSuccess, params } = data;
        if (cbId) {
            const fn = isSuccess ? h5Callback[cbId] : h5CallbackFail[cbId];
            delete h5Callback[cbId];
            delete h5CallbackFail[cbId];
            fn(params);
        }
    }
    function invokeH5Api(method, response, callbackId) {
        const fn = h5ApiMap[method];
        const partialSend = (isSuccess, result) => {
            let json = {
                type: RnSide.types.RCB,
                callbackId,
                response: { isSuccess, params: result }
            };
            sendData(json);
        };
        if (isFunction(fn)) {
            fn(response, partialSend);
        }
    }
    // 注册h5的回调函数
    function registerCb(success, fail) {
        if (success && typeof success === 'function') {
            h5CbId += 1;
            // const registerKey = md5(`h5_${h5CbId}_${Date.now()}`);
            const registerKey = getUID1(`h5_${h5CbId}_${Date.now()}`);
            h5Callback[registerKey] = success;
            if (fail && typeof fail === 'function') {
                h5CallbackFail[registerKey] = fail;
            }
            return registerKey;
        }
        return '';
    }
    function sendData(data) {
        if (Win) {
            const params = JSON.stringify(data);
            Win.postMessage(params);
        }
    }
    function caniuse(method) {
        return RnApiMap.indexOf(method) !== -1;
    }
    return {
        /**
         * 初始化提供给rn端调用的jsApi方法
         * @param api 注册的api方法集合
         */
        initH5(api) {
            if (Object.keys(h5ApiMap).length > 0) {
                h5ApiMap = Object.assign({}, h5ApiMap, api);
            }
            else {
                h5ApiMap = api;
            }
        },
        /**
         * jsBridge安全性校验
         * @param params src-side传过来的校验参数
         */
        checkSafty(params, success) {
            listenEvent();
            const registerKey = registerCb(success, '');
            const data = {
                type: RnSide.types.CHECKSAFETY,
                response: params
            };
            if (registerKey) {
                data.callbackId = registerKey;
            }
            sendData(data);
        },
        /**
         * 调用rn-side的js方法
         * @param options 参数
         */
        invokeRN(options) {
            const { method, params, success, fail } = options;
            if (!caniuse(method)) {
                return;
            }
            let json = {
                type: RnSide.types.RAPI,
                response: { params, token: tokenFromRn },
                method
            };
            const registerKey = registerCb(success, fail);
            if (registerKey) {
                json.callbackId = registerKey;
            }
            sendData(json);
        },
        /**
         * 监听rn-side调用的方法
         * @param cb 参数
         */
        listenRN(method, cb) {
            if (!h5ApiMap[method]) {
                h5ApiMap[method] = cb;
            }
        },
        /**
         * 扩展h5-side的jsb的方法
         */
        extends(method, cb) {
            // @ts-ignore
            if (!window.RnJsBridge[method]) {
                // @ts-ignore
                window.RnJsBridge[method] = cb;
            }
        }
    };
})();
