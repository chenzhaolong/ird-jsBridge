/**
 * @file h5端的jsBridge的api
 * todo: 1）添加钩子函数
 */
import {H5Side} from '../interface/h5Side';
import {RnSide} from '../interface/rnSide';
import {getUID1, isBoolean, isFunction} from '../utils/index';
import {getInitiatorPerformance, getPerformance} from '../utils/performance';

export const H5SideApi = (function() {
    // h5-side注册的方法
    let h5ApiMap: any = {};

    // h5-side注册的回调
    let h5Callback: {[key: string]: any} = {};

    // h5-side注册的失败回调
    let h5CallbackFail: any = {};

    // rn-side传过来的api
    let RnApiMap: any[] = [];

    // 初始化时rn验证通过返回的票据
    let tokenFromRn = '';

    // 记录cb的指针
    let h5CbId = 0;

    // 错误处理
    let errorHandle: any;

    // 临时消费队列
    let consumeQueue: Array<any> = [];

    // 桥梁建立时间
    let bridgeTime: H5Side.BridgeTime = {startTime: 0, endTime: 0};

    let RnApiWhiteList = ['performanceCb', 'performanceTypeCb', 'getSessionStore'];

    // 异步等待postMessage重定义成功
    function awaitPostMessage () {
        let queue: Array<any> = [];
        // @ts-ignore
        let isReactNativePostMessageReady = !!window.originalPostMessage;

        let currentPostMessage = (message: any) => {
            message = JSON.parse(message);
            // 不需要token
            if (message.type === RnSide.types.CHECKSAFETY) {
                if (queue.length > 0) {
                    queue.shift();
                }
                queue.push(message);
            } else {
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
                get () {
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
    function sendData(data: any) {
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
            document.addEventListener('message', (params: {data: string}) => {
                let parseData: H5Side.H5ReceiveParams;
                try {
                    parseData = JSON.parse(params.data);
                } catch(e) {
                    parseData = {type: H5Side.types.ERROR, response: 'parse params error， check the params'};
                }
                const {type, callbackId = '', response, method = ''} = parseData;
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
    function initInnerPropertyAfterSuccess(response: any, callbackId: string) {
        if (isBoolean(response.isSafe)) {
            bridgeTime.endTime = Date.now(); // 只有建立桥梁才有结束时间
            RnApiMap = response.RnApiMapKeys;
            tokenFromRn = response.token;
            invokeCallback(callbackId, {isSuccess: true, params: ''});
            if (consumeQueue.length > 0) {
                consumeQueue.forEach((json: object) => {
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
        } else if (consumeQueue.length > 0) {
            consumeQueue = []
        }
    }

    function specialRnApiHandle (json: any) {
        if (json.method === 'performanceCb') {
            json.response.params.BUILD_BRIDGE_TIME.consuming = bridgeTime.endTime - bridgeTime.startTime;
        }
    }

    // 调用H5Callback回调
    function invokeCallback (cbId: string, data: any) {
        const {isSuccess, params} = data;
        if (cbId) {
            const fn = isSuccess ? h5Callback[cbId] : h5CallbackFail[cbId];
            delete h5Callback[cbId];
            delete h5CallbackFail[cbId];
            fn && fn(params);
        }
    }

    function invokeH5Api (method: string, response: any, callbackId: string) {
        const fn = h5ApiMap[method];
        const partialSend = (options: {isSuccess: boolean, result: any}) => {
            let json = {
                type: RnSide.types.RCB,
                callbackId,
                response: {isSuccess: options.isSuccess, params: options.result, token: tokenFromRn}
            };
            sendData(json);
        };
        if (isFunction(fn)) {
            fn(response, partialSend);
        }
    }

    // 注册h5的回调函数
    function registerCb (success: (data: any) => {}, fail: any) {
        if (success && typeof success === 'function') {
            // 超出极限，从零开始
            if (h5CbId >= Number.MAX_SAFE_INTEGER) {
                h5CbId = 0
            }
            h5CbId += 1;
            // const registerKey = md5(`h5_${h5CbId}_${Date.now()}`);
            const registerKey = getUID1(`h5_${h5CbId}_${Date.now()}`);
            h5Callback[registerKey] = success;
            if (fail && typeof fail === 'function') {
                h5CallbackFail[registerKey] = fail;
            }
            return registerKey
        }
        return ''
    }

    function caniuse (method: string): boolean {
        if (RnApiWhiteList.indexOf(method) !== -1) {
            return true;
        }
        return RnApiMap.indexOf(method) !== -1;
    }

    // 是否验证成功
    function isCheckSuccess (): boolean {
        // @ts-ignore
        return tokenFromRn && RnApiMap.length > 0 && true
    }

    return {
        /**
         * 初始化提供给rn端调用的jsApi方法
         * @param api 注册的api方法集合
         */
        initH5(api: H5Side.ApiMap) {
            if (Object.keys(h5ApiMap).length > 0) {
                h5ApiMap = {...h5ApiMap, ...api}
            } else{
                h5ApiMap = api
            }
        },

        /**
         * jsBridge安全性校验
         * @param params src-side传过来的校验参数
         */
        checkSafety(params: object, success: () => {}) {
            bridgeTime.startTime = Date.now();
            listenEvent();
            const registerKey = registerCb(success, '');
            const data: any = {
                type: RnSide.types.CHECKSAFETY,
                response: params
            };
            if (registerKey) {
                data.callbackId = registerKey
            }
            awaitPostMessage();
            sendData(data);
        },

        /**
         * 调用rn-side的js方法
         * @param options 参数
         */
        invokeRN(options: H5Side.InvokeRnparams) {
            const {method, params, success, fail} = options;
            let json: RnSide.RnParams = {
                type: RnSide.types.RAPI,
                response: {params, token: tokenFromRn},
                method
            };
            const registerKey = registerCb(success, fail);
            if (registerKey) {
                json.callbackId = registerKey
            }
            if (isCheckSuccess()) {
                if (caniuse(method)) {
                    sendData(json);
                }
            } else {
                consumeQueue.push(json);
            }
        },

        /**
         * 监听rn-side调用的方法
         * @param cb 参数
         */
        listenRN(method: string, cb: () => {}) {
            if (!h5ApiMap[method]) {
                h5ApiMap[method] = cb
            }
        },

        /**
         * 扩展h5-side的jsb的方法
         */
        extends(method: string, cb: (params: any) => any) {
            // @ts-ignore
            if (!window.RnBridge[method]) {
                // @ts-ignore
                window.RnBridge[method] = cb
            }
        },

        /**
         * 发送H5的性能参数
         */
        sendPerformance () {
            const {startTime, endTime} = bridgeTime;
            const performance = getPerformance();
            performance['BUILD_BRIDGE_TIME'] = {
                desc: 'bridge通信成功的耗时',
                consuming: isCheckSuccess() ? endTime - startTime : 0
            };
            let json = {
                type: RnSide.types.RAPI,
                response: {params: performance, token: tokenFromRn},
                method: 'performanceCb'
            };
            if (isCheckSuccess()) {
                sendData(json);
            } else {
                consumeQueue.push(json);
            }
        },

        /**
         * 发送各种资源性能参数
         */
        sendPerformanceByType (type: H5Side.InitiatorType = H5Side.InitiatorType.ALL) {
            const performance = getInitiatorPerformance(type);
            let json = {
                type: RnSide.types.RAPI,
                response: {params: performance, token: tokenFromRn},
                method: 'performanceTypeCb'
            };
            if (isCheckSuccess()) {
                sendData(json);
            } else {
                consumeQueue.push(json);
            }
        },

        HttpType: H5Side.InitiatorType,

        getSessionStore(keys: Array<string>, cb: (data: object) => any) {
            if (!keys) {
               throw new Error('key can not be undefined');
            }
            this.invokeRN({
                method: 'getSessionStore',
                params: keys,
                success: cb
            });
        },

        getSessionStoreAsync(key: string, cb: (data: object) => any) {
            let apiName = `getSessionStoreH5-${key}`;
            if (!h5ApiMap[apiName]) {
                h5ApiMap[apiName] = cb;
            }
        }
    }
})();