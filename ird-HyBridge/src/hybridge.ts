/**
 * @file 主体部分
 */
import { TypeJS, TypeNA, injectScheme } from '../interface/constans';
import { postMessage } from '../utils/postMessage';
import {getUID1} from '../utils/tools';
import { InitResponse, InvokeOptions, CbOptions, NaInvokeJs } from "../interface/HyBridge";
import {isArray, isFunction, isObject} from "../utils/tools";
import { createHook } from "../utils/event";

export const _Hybridge = (function() {
    // 初始化状态
    let initStatue: string = 'pending';

    // 回调ID
    let _cbId: number = 0;

    // 临时js队列
    let _tmpQueueForJS: Array<any> = [];

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

    function registerCb (success: (data: any) => void, fail: any) {
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
        const {callbackId = '', result = [], token} = response;
        if (token) {
            _naToken = token;
            initStatue = 'success';
        } else {
            initStatue = 'fail';
            _tmpQueueForJS = [];
        }
        if (isArray(result)) {
            _naMethods = result
        }
        if (token) {
            const fn = _cbSuccessCollection[callbackId];
            isFunction(fn) && fn();
        }
        if (_tmpQueueForJS.length > 0) {
            _tmpQueueForJS.forEach(json => {
                json.token = _naToken;
                postMessage(json);
            });
            _tmpQueueForJS = []
        }
    }

    function executeJsCb (response: any) {
        const {result, callbackId, isSuccess} = response;
        const fn = isSuccess ? _cbSuccessCollection[callbackId] : _cbFailCollection[callbackId];
        delete _cbFailCollection[callbackId];
        delete _cbSuccessCollection[callbackId];
        isFunction(fn) && fn (result);
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

        // 被原生调用
        invokeByNative(json: any) {
            let response: InitResponse | CbOptions;
            try {
                response = isObject(json) ? json : JSON.parse(json);
            } catch(e) {
                response = {}
            }
            if (response.type === TypeJS.SAFETY) {
                executeInit(response)
            } else if (response.type === TypeJS.JSCB) {
                executeJsCb(response)
            }
        },

        // 调用原生方法
        invoke(options: InvokeOptions) {
            const {methodName, params, success, fail} = options;
            if (initStatue === 'fail') {
                return false;
            }
            const json: any = {
                methodName: methodName,
                params: params,
                type: TypeNA.NA
            };
            const callbackId = registerCb(success, fail);
            if (callbackId) {
                json.callbackId = callbackId
            }
            if (initStatue === 'success') {
                if (canIUse(methodName)) {
                    json.token = _naToken;
                    postMessage(json);
                }
            } else {
                _tmpQueueForJS.push(json);
            }
        },

        // 提供na调用的js方法
        registerAll(array: object) {
          if (Object.keys(_jsCollection).length > 0) {
              _jsCollection = {..._jsCollection, ...array};
          } else {
              _jsCollection = array
          }
        },

        // 提供na调用的js方法
        register(methodName: string, cb: () => any) {
            if (!_jsCollection[methodName]) {
                _jsCollection[methodName] = cb;
            }
        },

        // 原生调用js
        invokeJs(options: any) {
            let request: NaInvokeJs;
            try {
                request = isObject(options) ? options : JSON.parse(options);
            } catch (e) {
                request = {methodName: '', params: '', callbackId: ''}
            }
            const fn = _jsCollection[request.methodName];
            if ( isFunction(fn) && initStatue === 'success') {
                const send = (result: any) => {
                    const json = {
                        params: result,
                        type: TypeNA.NACB,
                        callbackId: request.callbackId || ''
                    };
                    postMessage(json);
                };
                fn(request.params, send)
            }
        },

        // 监听原生发射的事件
        listen(event: string, cb: (data: any) => void) {
            const hook = createHook();
            hook.listen(event, cb);
        },

        // 发射事件
        emit(event: string, data: any) {
            const hook = createHook();
            hook.emit(event, data);
        },

        // 删除事件
        remove(event: string) {
            const hook = createHook();
            hook.remove(event);
        },

        // 扩展桥对象
        extends(method: string, cb: (params: any) => any) {
            // @ts-ignore
            if (!window.Hybridge[method]) {
                // @ts-ignore
                window.Hybridge[method] = cb
            }
        }
    }
})();
