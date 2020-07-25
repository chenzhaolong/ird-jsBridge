(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.RnBridge = factory());
}(this, (function () { 'use strict';

    /**
     * @file h5端的jsBridge的api类型
     */
    var H5Side;

    (function (H5Side) {
      let types;

      (function (types) {
        types["SAFETY"] = "safety";
        types["ERROR"] = "error";
        types["HCB"] = "hcb";
        types["HAPI"] = "hapi"; // SESSIONSTORE = 'sessionStore'
      })(types = H5Side.types || (H5Side.types = {}));

      let InitiatorType;

      (function (InitiatorType) {
        InitiatorType["ALL"] = "all";
        InitiatorType["IMG"] = "img";
        InitiatorType["LINK"] = "link";
        InitiatorType["IFRAME"] = "iframe";
        InitiatorType["SCRIPT"] = "script";
        InitiatorType["CSS"] = "css";
        InitiatorType["XHR"] = "xmlhttprequest";
        InitiatorType["NAV"] = "navigation";
      })(InitiatorType = H5Side.InitiatorType || (H5Side.InitiatorType = {}));
    })(H5Side || (H5Side = {}));

    /**
     * @file rn端的jsBridge的api类型
     */
    var RnSide;

    (function (RnSide) {
      let types;

      (function (types) {
        types["CHECKSAFETY"] = "checkSafety";
        types["ERROR"] = "error";
        types["RCB"] = "rcb";
        types["RAPI"] = "rapi"; // 执行rn的api
      })(types = RnSide.types || (RnSide.types = {}));

      let StoreTypes;

      (function (StoreTypes) {
        StoreTypes["ADD"] = "add";
        StoreTypes["DEL"] = "delete";
        StoreTypes["MOD"] = "modify";
      })(StoreTypes = RnSide.StoreTypes || (RnSide.StoreTypes = {}));
    })(RnSide || (RnSide = {}));

    /**
     * @file 工具库
     */

    /**
     * 判断布尔类型
     * @param params
     */
    function isBoolean(params) {
      return typeof params === 'boolean' && params;
    }
    /**
     * 判断是否为函数
     * @param fn
     */

    function isFunction(fn) {
      return typeof fn === 'function';
    }
    /**
     * 判断是否为字符串
     * @param str
     */

    function isString(str) {
      return str && typeof str === 'string';
    }
    /**
     * 生成唯一值
     */

    function getUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    }
    /**
     * 生成唯一值
     */

    function getUID1(cbId) {
      return `xxx-yyy-${cbId}`.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    }

    /**
     * @file 获取h5的性能指数，传递给rn
     */
    function getPerformance() {
      const {
        timing
      } = window.performance;
      return {
        DNS: {
          desc: 'DNS查询耗时',
          consuming: timing.domainLookupEnd - timing.domainLookupStart
        },
        TCP: {
          desc: 'TCP链接耗时',
          consuming: timing.connectEnd - timing.connectStart
        },
        REQUEST: {
          desc: '请求耗时',
          consuming: timing.responseEnd - timing.responseStart
        },
        DOM: {
          desc: '解析dom树耗时',
          consuming: timing.domComplete - timing.domInteractive
        },
        WHITE_SCREEN: {
          desc: '白屏时间',
          consuming: timing.domLoading - timing.navigationStart
        },
        DOM_READY: {
          desc: 'dom ready时间',
          consuming: timing.domContentLoadedEventEnd - timing.navigationStart
        },
        ONLOAD: {
          desc: 'onload时间',
          consuming: timing.loadEventEnd - timing.navigationStart
        },
        FIRST_SCREEN_FINISHED: {
          desc: '首屏完成的时间',
          consuming: timing.domContentLoadedEventStart - timing.navigationStart
        }
      };
    }
    function getInitiatorPerformance(type) {
      const resource = window.performance.getEntries();

      if (type === H5Side.InitiatorType.ALL) {
        let data = {};
        resource.forEach(item => {
          if (data[item.entryType]) {
            data[item.entryType].push({
              name: item.name,
              startTime: item.startTime,
              duration: item.duration
            });
          } else {
            data[item.entryType] = [];
            data[item.entryType].push({
              name: item.name,
              startTime: item.startTime,
              duration: item.duration
            });
          }
        });
        return data;
      } else {
        let data = resource.filter(item => {
          return item.entryType === type;
        }).map(item1 => {
          return {
            name: item1.name,
            startTime: item1.startTime,
            duration: item1.duration
          };
        });
        let result = {};
        result[type] = data;
        return result;
      }
    }

    /**
     * @file h5端的jsBridge的api
     * todo: 1）添加钩子函数
     */

    const H5SideApi = function () {
      // h5-side注册的方法
      let h5ApiMap = {}; // h5-side注册的回调

      let h5Callback = {}; // h5-side注册的失败回调

      let h5CallbackFail = {}; // rn-side传过来的api

      let RnApiMap = []; // 初始化时rn验证通过返回的票据

      let tokenFromRn = ''; // 记录cb的指针

      let h5CbId = 0; // 错误处理

      let errorHandle; // 临时消费队列

      let consumeQueue = []; // 桥梁建立时间

      let bridgeTime = {
        startTime: 0,
        endTime: 0
      };
      let RnApiWhiteList = ['performanceCb', 'performanceTypeCb', 'getSessionStore']; // 异步等待postMessage重定义成功

      function awaitPostMessage() {
        let queue = []; // @ts-ignore

        let isReactNativePostMessageReady = !!window.originalPostMessage;

        let currentPostMessage = message => {
          message = JSON.parse(message); // 不需要token

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
          const params = JSON.stringify(data); // @ts-ignore

          window.postMessage(params);
        }
      } // 监听


      function listenEvent() {
        if (document) {
          // @ts-ignore
          document.addEventListener('message', params => {
            let parseData;

            try {
              parseData = JSON.parse(params.data);
            } catch (e) {
              parseData = {
                type: H5Side.types.ERROR,
                response: 'parse params error， check the params'
              };
            }

            const {
              type,
              callbackId = '',
              response,
              method = ''
            } = parseData;

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
                  errorHandle();
                }

                break;
              // case H5Side.types.SESSIONSTORE:
              //     // @ts-ignore
              //     const event = new CustomEvent('sessionStore');
              //     event.initEvent();
              //     event.dispatchEvent();
              //     break;
            }
          }); // // @ts-ignore
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
      } // 验证成功后初始化内部属性


      function initInnerPropertyAfterSuccess(response, callbackId) {
        if (isBoolean(response.isSafe)) {
          bridgeTime.endTime = Date.now(); // 只有建立桥梁才有结束时间

          RnApiMap = response.RnApiMapKeys;
          tokenFromRn = response.token;
          invokeCallback(callbackId, {
            isSuccess: true,
            params: ''
          });

          if (consumeQueue.length > 0) {
            consumeQueue.forEach(json => {
              // @ts-ignore
              if (caniuse(json.method)) {
                specialRnApiHandle(json); // @ts-ignore

                json.response.token = tokenFromRn;
                sendData(json);
              }
            });
            consumeQueue = [];
          }
        } else if (consumeQueue.length > 0) {
          consumeQueue = [];
        }
      }

      function specialRnApiHandle(json) {
        if (json.method === 'performanceCb') {
          json.response.params.BUILD_BRIDGE_TIME.consuming = bridgeTime.endTime - bridgeTime.startTime;
        }
      } // 调用H5Callback回调


      function invokeCallback(cbId, data) {
        const {
          isSuccess,
          params
        } = data;

        if (cbId) {
          const fn = isSuccess ? h5Callback[cbId] : h5CallbackFail[cbId];
          delete h5Callback[cbId];
          delete h5CallbackFail[cbId];
          fn && fn(params);
        }
      }

      function invokeH5Api(method, response, callbackId) {
        const fn = h5ApiMap[method];

        const partialSend = options => {
          let json = {
            type: RnSide.types.RCB,
            callbackId,
            response: {
              isSuccess: options.isSuccess,
              params: options.result,
              token: tokenFromRn
            }
          };
          sendData(json);
        };

        if (isFunction(fn)) {
          fn(response, partialSend);
        }
      } // 注册h5的回调函数


      function registerCb(success, fail) {
        if (success && typeof success === 'function') {
          // 超出极限，从零开始
          if (h5CbId >= Number.MAX_SAFE_INTEGER) {
            h5CbId = 0;
          }

          h5CbId += 1; // const registerKey = md5(`h5_${h5CbId}_${Date.now()}`);

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
      } // 是否验证成功


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
          } else {
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
          const {
            method,
            params,
            success,
            fail
          } = options;
          let json = {
            type: RnSide.types.RAPI,
            response: {
              params,
              token: tokenFromRn
            },
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
          } else {
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
          const {
            startTime,
            endTime
          } = bridgeTime;
          const performance = getPerformance();
          performance['BUILD_BRIDGE_TIME'] = {
            desc: 'bridge通信成功的耗时',
            consuming: isCheckSuccess() ? endTime - startTime : 0
          };
          let json = {
            type: RnSide.types.RAPI,
            response: {
              params: performance,
              token: tokenFromRn
            },
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
        sendPerformanceByType(type = H5Side.InitiatorType.ALL) {
          const performance = getInitiatorPerformance(type);
          let json = {
            type: RnSide.types.RAPI,
            response: {
              params: performance,
              token: tokenFromRn
            },
            method: 'performanceTypeCb'
          };

          if (isCheckSuccess()) {
            sendData(json);
          } else {
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
    }();

    /**
     * @file webview储存数据
     */
    class Store {
      constructor() {
        this.cache = {};
      }

      add(key, data) {
        if (this.cache[key]) {
          console.warn(`the key ${key} is exist in the store, please change the type when use sessionStore.`);
          return false;
        }

        this.cache[key] = data;
        return true;
      }

      del(key) {
        if (this.cache[key]) {
          this.cache[key] = null;
          return delete this.cache[key];
        }

        console.warn(`the key ${key} has been delete yet.`);
        return true;
      }

      modify(key, data) {
        if (this.cache[key]) {
          this.cache[key] = data;
          return true;
        }

        console.warn(`the key ${key} has not existed in the store, so can not modify.`);
        return false;
      }

      get(key) {
        if (Object.keys(this.cache).indexOf(key) === -1) {
          return '';
        }

        return this.cache[key];
      }

      clear(key) {
        if (!key) {
          this.cache = {};
        } else if (Object.keys(this.cache).indexOf(key) !== -1) {
          this.cache[key] = {};
        } else {
          console.warn(`the key ${key} has not exist in the store`);
        }
      }

    }

    const getStoreInstance = function () {
      let instance = null;
      return function () {
        if (instance) {
          return instance;
        } else {
          instance = new Store();
          return instance;
        }
      };
    }();

    /**
     * @file rn端的jsBridge的api
     */
    const RnSideApi = function () {
      // webview对象
      let webview; // rn-side注册的方法

      let RnApiMap = {}; // rn-side注册的回调

      const RnCallback = {}; // rn-side注册的失败回调

      const RnCallbackFail = {}; // 验证通过传递给h5的票据

      let tokenToH5 = ''; // 记录cb的指针

      let rnCbId = 0; // 发送消息到h5端

      function sendData(params) {
        if (webview && webview.postMessage && typeof webview.postMessage === 'function') {
          const jsonParams = JSON.stringify(params);
          webview.postMessage(jsonParams);
        }
      } // 注册h5的回调函数


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
        const {
          params,
          token
        } = response;

        if (token === tokenToH5) {
          const fn = RnApiMap[method];

          if (fn && typeof fn === 'function') {
            const partialSend = (options = {}) => {
              const json = {
                type: H5Side.types.HCB,
                callbackId,
                response: {
                  isSuccess: options.isSuccess,
                  params: options.result
                }
              };
              sendData(json);
            };

            fn(params, partialSend);
          }
        } else {
          sendData({
            type: H5Side.types.ERROR,
            callbackId,
            response: 'token is wrong!'
          });
        }
      }

      function invokeRnCb(response, callbackId) {
        const {
          isSuccess,
          params,
          token
        } = response;

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

          const {
            type,
            response,
            callbackId
          } = params;

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
            } else {
              // tokenToH5 = md5(`rn_${Math.round(Math.random() * 1000)}_${Date.now()}`);
              tokenToH5 = getUID();
              sendData({
                type: H5Side.types.SAFETY,
                callbackId,
                response: {
                  RnApiMapKeys,
                  token: tokenToH5,
                  isSafe: true
                }
              });
            }
          }
        },

        /**
         * 调用h5-side的js方法
         * @param options 选项
         */
        invokeH5(options) {
          const {
            method,
            params,
            success,
            fail
          } = options;
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
            } catch (e) {
              json = {};
            }
          }

          const {
            method,
            type,
            response,
            callbackId
          } = json;

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
          const {
            key,
            data,
            type = '',
            noticeH5
          } = options;

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
              isStore = store.del(key, data);
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
                params.forEach(key => {
                  target[key] = store.get(key);
                });
                send({
                  isSuccess: true,
                  result: target
                });
              };
            } // 主动触发H5调用


            if (noticeH5) {
              if (tokenToH5) {
                this.invokeH5({
                  method: `getSessionStoreH5-${key}`,
                  params: data
                });
              } else {
                console.warn('bridge is still not to build, if you must do send, you can set the noticeH5 true.');
              }
            }
          } else {
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
        }

      };
    }();

    /**
     * @file ird-JSBridge的api入口
     */
    var index = {
      version: '1.0.8',

      switchMode(options) {
        const {
          mode
        } = options;
        const self = this;

        if (mode === 'rn') {
          if (Object.keys(self).length === 2) {
            Object.keys(RnSideApi).forEach(key => {
              // @ts-ignore
              self[key] = RnSideApi[key];
            });
          }
        } else if (mode === 'h5') {
          // @ts-ignore
          if (!window.RnBridge) {
            // @ts-ignore
            window.RnBridge = H5SideApi; // @ts-ignore
          } else if (typeof window.RnBridge === 'object' && Object.keys(window.RnBridge).length < 3) {
            // @ts-ignore
            window.RnBridge = Object.assign({}, window.RnBridge, H5SideApi);
          }
        }
      }

    };

    return index;

})));
