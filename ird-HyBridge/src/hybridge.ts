/**
 * @file 主体部分
 */
import { TypeJS, TypeNA, injectScheme } from '../interface/constans';
import { postMessage } from '../utils/postMessage';
import {getUID1} from '../utils/tools';
import { InitResponse } from "../interface/HyBridge";
import {isArray, isFunction} from "../utils/tools";

export const _Hybridge = (function() {

    // 回调ID
    let _cbId: number = 0;

    // 临时js队列
    let _tmpQueueForJS: Array<any> = [];

    // 临时Na队列
    let _tmpQueueForNA: Array<any> = [];

    // 验证成功后回传的token
    let _naToken: string = '';

    // 验证成功后返回的原生方法
    let _naMethods: Array<string> = [];

    // 注册回调函数
    let _cbSuccessCollection: {[key: string]: any} = {};

    let _cbFailCollection: {[key: string]: any} = {};

    // 提供给na调用的js方法
    let _jsCollection: {[key: string]: any} = {};

    // 上一次调用的时间
    let _lastTimeForInvoke: number = Date.now();

    function registerCb (success: (data: any) => {}, fail: any) {
        if (success && typeof success === 'function') {
            // 超出极限，从零开始
            if (_cbId >= Number.MAX_SAFE_INTEGER) {
                _cbId = 0
            }
            _cbId += 1;
            const registerKey = getUID1(`hy_${_cbId}_${Date.now()}`);
            _cbSuccessCollection[registerKey] = success;
            if (fail && typeof fail === 'function') {
                _cbFailCollection[registerKey] = fail;
            }
            return registerKey
        }
        return ''
    }

    function executeInit (response: InitResponse) {
        const {callbackId = '', nativeMethods = [], token} = response;
        if (token) {
            _naToken = token;
        }
        if (isArray(nativeMethods)) {
            _naMethods = nativeMethods
        }
        if (token) {
            _naToken = token;
            const fn = _cbSuccessCollection[callbackId];
            isFunction(fn) && fn();
        }
        if (_tmpQueueForJS.length > 0) {
            if (token) {
                _tmpQueueForJS.forEach(json => {
                    json.token = _naToken;
                    postMessage(json);
                })
            } else {
                _tmpQueueForJS = [];
            }
        }
    }

    function canIUse (method: string): boolean {
        return _naMethods.indexOf(method) !== -1;
    }

    return {
        // 注册hybridg通信的协议
        injectScheme: injectScheme,

        // 初始化
        init(params: object, cb: () => {}) {
            const host = window.location.hostname || '';
            const data: any = {
                type: TypeNA.CHECKSAFETY,
                params: {host, ...params}
            };
            const registerKey = registerCb(cb, '');
            if (registerKey) {
                data.callbackId = registerKey;
            }
            postMessage(data);
        },

        invokeByNative(json: string) {
            let response: InitResponse;
            try {
                response = JSON.parse(json);
            } catch(e) {
                response = {}
            }
            if (response.type === TypeJS.SAFETY) {
                executeInit(response)
            } else if (response.type === TypeJS.JSCB) {

            }
        },

        register() {},
        listen() {},
        emit() {},
        invoke() {},
        extends() {},
        error() {},
        debug() {},

        invokeJs() {}
    }
})();
