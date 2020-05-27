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
        types["HAPI"] = "hapi"; // 执行H5的api
      })(types = H5Side.types || (H5Side.types = {}));
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
     * @file h5端的jsBridge的api
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

      let consumeQueue = []; // 监听

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
            }
          });
        }
      } // 验证成功后初始化内部属性


      function initInnerPropertyAfterSuccess(response, callbackId) {
        if (isBoolean(response.isSafe)) {
          RnApiMap = response.RnApiMapKeys;
          tokenFromRn = response.token;
          invokeCallback(callbackId, {
            isSuccess: true,
            params: ''
          });

          if (consumeQueue.length > 0) {
            consumeQueue.forEach(json => {
              // @ts-ignore
              json.response.token = tokenFromRn;
              sendData(json);
            });
            consumeQueue = [];
          }
        } else if (consumeQueue.length > 0) {
          consumeQueue = [];
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
              params: options.result
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

      function sendData(data) {
        if (window) {
          const params = JSON.stringify(data);
          setTimeout(() => {
            // @ts-ignore
            window.postMessage(params);
          }, 1000);
        }
      }

      function caniuse(method) {
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
          params
        } = response;

        if (callbackId) {
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
        }

      };
    }();

    /**
     * @file ird-JSBridge的api入口
     */
    var index = {
      version: '1.0.6',

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
