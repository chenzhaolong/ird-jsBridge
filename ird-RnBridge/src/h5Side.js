/**
 * @file h5端的jsBridge的api
 * todo: 1）添加钩子函数
 */
import { H5Side } from '../interface/h5Side';
import { RnSide } from '../interface/rnSide';
import { getUID1, isBoolean, isFunction } from '../utils/index';
import { getInitiatorPerformance, getPerformance } from '../utils/performance';
// import {CustomEvent} from '../utils/customEvent';
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
    // 临时消费队列
    let consumeQueue = [];
    // 桥梁建立时间
    let bridgeTime = { startTime: 0, endTime: 0 };
    let RnApiWhiteList = ['performanceCb', 'performanceTypeCb', 'getSessionStore'];
    // 异步等待postMessage重定义成功
    function awaitPostMessage() {
        let queue = [];
        // @ts-ignore
        let isReactNativePostMessageReady = !!window.originalPostMessage;
        let currentPostMessage = (message) => {
            message = JSON.parse(message);
            // 不需要token
            if (message.type === RnSide.types.CHECKSAFETY) {
                if (queue.length > 0) {
                    queue.shift();
                }
                queue.push(message);
            }
            else {
                // 需要token，兜底用，正常不会走到这里
                consumeQueue.push(message);
            }
        };
        const sendQueue = () => {
            while (queue.length > 0) {
                sendData(queue.shift());
            }
        };
        if (!isReactNativePostMessageReady) {
            Object.defineProperty(window, 'postMessage', {
                configurable: true,
                enumerable: true,
                get() {
                    return currentPostMessage;
                },
                set(fn) {
                    isReactNativePostMessageReady = true;
                    currentPostMessage = fn;
                    setTimeout(sendQueue, 0);
                }
            });
        }
    }
    /**
     * https://github.com/facebook/react-native/issues/11594
     */
    function sendData(data) {
        if (window) {
            const params = JSON.stringify(data);
            // @ts-ignore
            window.postMessage(params);
        }
    }
    // 监听
    function listenEvent() {
        if (document) {
            // @ts-ignore
            document.addEventListener('message', (params) => {
                let parseData;
                try {
                    parseData = JSON.parse(params.data);
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
                    // case H5Side.types.SESSIONSTORE:
                    //     // @ts-ignore
                    //     const event = new CustomEvent('sessionStore');
                    //     event.initEvent();
                    //     event.dispatchEvent();
                    //     break;
                }
            });
            // // @ts-ignore
            // document.addEventListener('sessionStore', (event: {data: string}) => {
            //     let parseData;
            //     try {
            //         parseData = JSON.parse(event.data);
            //     } catch(e) {
            //         parseData = {};
            //     }
            //
            //     if (h5ApiMap['getSessionStoreH5']) {
            //         h5ApiMap['getSessionStoreH5'](parseData)
            //     }
            // })
        }
    }
    // 验证成功后初始化内部属性
    function initInnerPropertyAfterSuccess(response, callbackId) {
        if (isBoolean(response.isSafe)) {
            bridgeTime.endTime = Date.now(); // 只有建立桥梁才有结束时间
            RnApiMap = response.RnApiMapKeys;
            tokenFromRn = response.token;
            invokeCallback(callbackId, { isSuccess: true, params: '' });
            if (consumeQueue.length > 0) {
                consumeQueue.forEach((json) => {
                    // @ts-ignore
                    if (caniuse(json.method)) {
                        specialRnApiHandle(json);
                        // @ts-ignore
                        json.response.token = tokenFromRn;
                        sendData(json);
                    }
                });
                consumeQueue = [];
            }
        }
        else if (consumeQueue.length > 0) {
            consumeQueue = [];
        }
    }
    function specialRnApiHandle(json) {
        if (json.method === 'performanceCb') {
            json.response.params.BUILD_BRIDGE_TIME.consuming = bridgeTime.endTime - bridgeTime.startTime;
        }
    }
    // 调用H5Callback回调
    function invokeCallback(cbId, data) {
        const { isSuccess, params } = data;
        if (cbId) {
            const fn = isSuccess ? h5Callback[cbId] : h5CallbackFail[cbId];
            delete h5Callback[cbId];
            delete h5CallbackFail[cbId];
            fn && fn(params);
        }
    }
    function invokeH5Api(method, response, callbackId) {
        const fn = h5ApiMap[method];
        const partialSend = (options) => {
            let json = {
                type: RnSide.types.RCB,
                callbackId,
                response: { isSuccess: options.isSuccess, params: options.result, token: tokenFromRn }
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
            // 超出极限，从零开始
            if (h5CbId >= Number.MAX_SAFE_INTEGER) {
                h5CbId = 0;
            }
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
    function caniuse(method) {
        if (RnApiWhiteList.indexOf(method) !== -1) {
            return true;
        }
        return RnApiMap.indexOf(method) !== -1;
    }
    // 是否验证成功
    function isCheckSuccess() {
        // @ts-ignore
        return tokenFromRn && RnApiMap.length > 0 && true;
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
        checkSafety(params, success) {
            bridgeTime.startTime = Date.now();
            listenEvent();
            const registerKey = registerCb(success, '');
            const data = {
                type: RnSide.types.CHECKSAFETY,
                response: params
            };
            if (registerKey) {
                data.callbackId = registerKey;
            }
            awaitPostMessage();
            sendData(data);
        },
        /**
         * 调用rn-side的js方法
         * @param options 参数
         */
        invokeRN(options) {
            const { method, params, success, fail } = options;
            let json = {
                type: RnSide.types.RAPI,
                response: { params, token: tokenFromRn },
                method
            };
            const registerKey = registerCb(success, fail);
            if (registerKey) {
                json.callbackId = registerKey;
            }
            if (isCheckSuccess()) {
                if (caniuse(method)) {
                    sendData(json);
                }
            }
            else {
                consumeQueue.push(json);
            }
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
            if (!window.RnBridge[method]) {
                // @ts-ignore
                window.RnBridge[method] = cb;
            }
        },
        /**
         * 发送H5的性能参数
         */
        sendPerformance() {
            const { startTime, endTime } = bridgeTime;
            const performance = getPerformance();
            performance['BUILD_BRIDGE_TIME'] = {
                desc: 'bridge通信成功的耗时',
                consuming: isCheckSuccess() ? endTime - startTime : 0
            };
            let json = {
                type: RnSide.types.RAPI,
                response: { params: performance, token: tokenFromRn },
                method: 'performanceCb'
            };
            if (isCheckSuccess()) {
                sendData(json);
            }
            else {
                consumeQueue.push(json);
            }
        },
        /**
         * 发送各种资源性能参数
         */
        sendPerformanceByType(type = H5Side.InitiatorType.ALL) {
            const performance = getInitiatorPerformance(type);
            let json = {
                type: RnSide.types.RAPI,
                response: { params: performance, token: tokenFromRn },
                method: 'performanceTypeCb'
            };
            if (isCheckSuccess()) {
                sendData(json);
            }
            else {
                consumeQueue.push(json);
            }
        },
        HttpType: H5Side.InitiatorType,
        getSessionStore(keys, cb) {
            if (!keys) {
                throw new Error('key can not be undefined');
            }
            this.invokeRN({
                method: 'getSessionStore',
                params: keys,
                success: cb
            });
        },
        getSessionStoreAsync(key, cb) {
            let apiName = `getSessionStoreH5-${key}`;
            if (!h5ApiMap[apiName]) {
                h5ApiMap[apiName] = cb;
            }
        }
    };
})();
