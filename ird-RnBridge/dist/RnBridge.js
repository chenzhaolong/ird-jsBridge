(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.RnBridge = {}));
}(this, (function (exports) { 'use strict';

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
     * @file ird-jsBridge 常量
     */
    const Doc = document || null;
    const Win = window || null;

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
     * @file h5端的jsBridge的api
     */

    const md5 = require('md5');

    const H5SideApi = function () {
      // h5-side注册的方法
      let h5ApiMap = {}; // h5-side注册的回调

      let h5Callback = {}; // h5-side注册的失败回调

      let h5CallbackFail = {}; // rn-side传过来的api

      let RnApiMap = []; // 初始化时rn验证通过返回的票据

      let tokenFromRn = ''; // 记录cb的指针

      let h5CbId = 0; // 错误处理

      let errorHandle; // 监听

      function listenEvent() {
        if (Doc) {
          Doc.addEventListener('message', params => {
            let parseData;

            try {
              parseData = JSON.parse(params);
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
          fn(params);
        }
      }

      function invokeH5Api(method, response, callbackId) {
        const fn = h5ApiMap[method];

        const partialSend = (isSuccess, result) => {
          let json = {
            type: RnSide.types.RCB,
            callbackId,
            response: {
              isSuccess,
              params: result
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
          h5CbId += 1;
          const registerKey = md5(`h5_${h5CbId}_${Date.now()}`);
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
          } else {
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
          const {
            method,
            params,
            success,
            fail
          } = options;

          if (!caniuse(method)) {
            return;
          }

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
    }();

    /**
     * @file rn端的jsBridge的api
     */

    const md5$1 = require('md5');

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
          rnCbId += 1;
          const registerKey = md5$1(`rn_${rnCbId}_${Date.now()}`);
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
            const partialSend = (isSuccess, result) => {
              const json = {
                type: H5Side.types.HCB,
                callbackId,
                response: {
                  isSuccess,
                  params: result
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
          fn(params);
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
              const partialSend = isSuccess => {
                tokenToH5 = md5$1(`rn_${Math.round(Math.random() * 1000)}_${Date.now()}`);
                const json = {
                  type: H5Side.types.SAFETY,
                  callbackId,
                  response: {
                    RnApiMapKeys,
                    token: isBoolean(isSuccess) ? tokenToH5 : '',
                    isSafe: typeof isSuccess === 'boolean' ? isSuccess : true
                  }
                };
                sendData(json);
              };

              fn(response, partialSend);
            } else {
              tokenToH5 = md5$1(`rn_${Math.round(Math.random() * 1000)}_${Date.now()}`);
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

    const pkg = require('./package.json');

    const RnJsBridge = {
      version: pkg.version,

      switchMode(options) {
        const {
          mode
        } = options;
        const self = this;

        if (mode === 'rn') {
          if (Object.keys(RnJsBridge).length === 2) {
            Object.keys(RnSideApi).forEach(key => {
              // @ts-ignore
              self[key] = RnSideApi[key];
            });
          }
        } else if (mode === 'h5') {
          // @ts-ignore
          if (!window.RnJsBridge) {
            // @ts-ignore
            window.RnJsBridge = H5SideApi;
          }
        }
      }

    };

    exports.RnJsBridge = RnJsBridge;

    Object.defineProperty(exports, '__esModule', { value: true });

})));