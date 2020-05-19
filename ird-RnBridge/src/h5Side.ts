/**
 * @file h5端的jsBridge的api
 */
import {H5Side} from '../interface/h5Side';
import {RnSide} from '../interface/rnSide';
import {Doc, Win} from '../../constant';
import { isBoolean, isFunction } from '../../utils';

const md5 = require('md5');

export const H5SideApi = (function() {
    // h5-side注册的方法
    let h5ApiMap = {};

    // h5-side注册的回调
    let h5Callback = {};

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
            Doc.addEventListener('message', (params: string) => {
                let parseData: H5Side.H5ReceiveParams;
                try {
                    parseData = JSON.parse(params);
                } catch(e) {
                    parseData = {type: H5Side.types.ERROR, response: 'parse params error， check the params'};
                }
                const {type, callbackId, response, method} = parseData;
                switch (type) {
                    case H5Side.types.SAFETY:
                        initInnerPropertyAfterSuccess(response, callbackId);
                        break;
                    case H5Side.types.ERROR:
                        if (h5Callback[callbackId]) {
                            delete h5Callback[callbackId];
                        }
                        if (isFunction(errorHandle)) {
                            errorHandle(response);
                        }
                        break;
                    case H5Side.types.HCB:
                        invokeCallback(callbackId, response);
                        break;
                    case H5Side.types.HAPI:
                        break;
                }
            })
        }
    }

    // 验证成功后初始化内部属性
    function initInnerPropertyAfterSuccess(response, callbackId) {
        if (isBoolean(response.isSafe)) {
            RnApiMap = response.RnApiMapKeys;
            tokenFromRn = response.token;
            invokeCallback(callbackId, '');
        }
    }

    // 调用H5Callback回调
    function invokeCallback (cbId, params) {
        if (cbId && h5Callback[cbId] && typeof h5Callback[cbId] === 'function') {
            const fn = h5Callback[cbId];
            delete h5Callback[cbId];
            fn(params);
        }
    }

    // 注册h5的回调函数
    function registerCb (cb) {
        if (cb && typeof cb === 'function') {
            h5CbId += 1;
            const registerKey = md5(`h5_${h5CbId}_${Date.now()}`);
            h5Callback[registerKey] = cb;
            return registerKey
        }
        return ''
    }

    function sendData(data) {
        if (Win) {
            const params = JSON.stringify(data);
            Win.postMessage(params);
        }
    }

    function caniuse (method: string): boolean {
        return RnApiMap.indexOf(method) !== -1;
    }

    return {
        /**
         * 初始化提供给rn端调用的jsApi方法
         * @param api 注册的api方法集合
         */
        initH5(api: H5Side.ApiMap) {
        },

        /**
         * jsBridge安全性校验
         * @param params src-side传过来的校验参数
         */
        checkSafty(params: object, cb) {
            listenEvent();
            const registerKey = registerCb(cb);
            const data: any = {
                type: RnSide.types.CHECKSAFETY,
                response: params
            };
            if (registerKey) {
                data.callbackId = registerKey
            }
            sendData(data);
        },

        /**
         * 调用rn-side的js方法
         * @param method 方法名
         * @param params 参数
         * @param cb 回调函数
         */
        invokeRN(method: string, params: any, cb: (data?: any) => any) {
            if (!caniuse(method)) {
                return;
            }
            let json: RnSide.RnParams = {
                type: RnSide.types.RAPI,
                response: {params, token: tokenFromRn},
                method
            };
            const registerKey = registerCb(cb);
            if (registerKey) {
                json.callbackId = registerKey
            }

            sendData(json);
        },

        /**
         * 监听rn-side调用的方法
         * @param params 参数
         */
        listenRN(params: object) {
        },

        /**
         * 扩展h5-side的jsb的方法
         */
        extends(method: string, cb: (invoke: H5Side.invoke, listen: H5Side.listen) => any) {
        }
    }
})();