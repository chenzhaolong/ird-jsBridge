(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.HyBridge = {}));
}(this, (function (exports) { 'use strict';

    var TypeNA;

    (function (TypeNA) {
      TypeNA["CHECKSAFETY"] = "checkSafety";
      TypeNA["NA"] = "na";
      TypeNA["NACB"] = "naCb";
    })(TypeNA || (TypeNA = {}));

    var TypeJS;

    (function (TypeJS) {
      TypeJS["SAFETY"] = "safety";
      TypeJS["JSCB"] = "jsCb";
    })(TypeJS || (TypeJS = {}));

    const UA = window.navigator.userAgent || '';
    const _BridgeScheme = {
      uiScheme: '',
      wkScheme: '',
      androidScheme: ''
    };
    function injectScheme(options) {
      const {
        ui,
        wk,
        android
      } = options;

      if (!_BridgeScheme.uiScheme) {
        _BridgeScheme.uiScheme = ui;
      }

      if (!_BridgeScheme.wkScheme) {
        _BridgeScheme.wkScheme = wk;
      }

      if (!_BridgeScheme.androidScheme) {
        _BridgeScheme.androidScheme = android;
      }
    }
    const BridgeScheme = _BridgeScheme;

    /**
     * @file 类型判断
     */
    /**
     * 是否为wkwebview
     */

    function isWkWebview() {
      if (isIos()) {
        // @ts-ignore
        return window.webkit && window.webkit.messageHandlers && true;
      }

      return false;
    }
    /**
     * 是否为ios侧
     */

    function isIos() {
      return /(iPhone|iPod|iPad)/.test(UA);
    }

    /**
     * @file 发起跨端请求
     */

    function sendForAndroid(json) {
      // @ts-ignore
      if (BridgeScheme.androidScheme && window[BridgeScheme.androidScheme]) {
        // @ts-ignore
        window[BridgeScheme.androidScheme](json);
      } else {
        throw new Error('android scheme can not be empty, please use HyBridge.injectScheme init android scheme');
      }
    }

    function sendForUI(json) {
      if (BridgeScheme.uiScheme) {
        let iframe = document.createElement('iframe');
        let url = BridgeScheme.uiScheme.indexOf('?') === -1 ? `${BridgeScheme.uiScheme}?` : BridgeScheme.uiScheme;
        iframe.src = `${url}json=${json}`;
        iframe.style.display = 'none';
        document.documentElement.appendChild(iframe);
        setTimeout(() => {
          document.documentElement.removeChild(iframe);
          iframe = null;
        }, 0);
      } else {
        throw new Error('uiwebview scheme can not be empty, please use HyBridge.injectScheme init uiwebview scheme');
      }
    }

    function sendForWk(json) {
      if (BridgeScheme.wkScheme) {
        // @ts-ignore
        window.webkit.messageHandlers[BridgeScheme.wkScheme].postMessage(json);
      } else {
        throw new Error('wkwebview scheme can not be empty, please use HyBridge.injectScheme init wkwebview scheme');
      }
    }

    function postMessage(obj) {
      const json = typeof obj === 'object' ? JSON.stringify(obj) : obj;

      if (isIos()) {
        if (isWkWebview()) {
          sendForWk(json);
        } else {
          sendForUI(json);
        }
      } else {
        sendForAndroid(json);
      }
    }

    /**
     * @file 工具类
     */

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
    function isArray(array) {
      return Object.prototype.toString.call(array) == '[object Array]';
    }
    function isFunction(fn) {
      return typeof fn === 'function';
    }
    function isObject(obj) {
      return typeof obj === 'object';
    }

    /**
     * @file 监听发布事件
     */

    function Hook() {
      // @ts-ignore
      this.events = {}; // @ts-ignore

      this.cache = {};
    } // @ts-ignore


    Hook.instance = null;

    Hook.prototype.listen = function (event, cb) {
      this.events[event] = cb;

      if (this.cache[event]) {
        const data = this.cache[event];
        delete this.cache[event];
        this.emit(event, data);
      }
    };

    Hook.prototype.emit = function (event, data) {
      const fn = this.events[event];

      if (fn) {
        isFunction(fn) && fn(data);
      } else {
        this.cache[event] = data;
      }
    };

    Hook.prototype.remove = function (event) {
      if (this.events[event]) {
        this.events[event] = null;
        delete this.events[event];
      }

      if (this.cache[event]) {
        this.cache[event] = null;
        delete this.cache[event];
      }
    };

    function createHook() {
      if (Hook.instance) {
        return Hook.instance;
      } else {
        // @ts-ignore
        Hook.instance = new Hook();
        return Hook.instance;
      }
    }

    /**
     * @file 主体部分
     */
    const _Hybridge = function () {
      // 初始化状态
      let initStatue = 'pending'; // 回调ID

      let _cbId = 0; // 临时js队列

      let _tmpQueueForJS = []; // 验证成功后回传的token

      let _naToken = ''; // 验证成功后返回的原生方法

      let _naMethods = []; // 注册回调函数

      let _cbSuccessCollection = {};
      let _cbFailCollection = {}; // 提供给na调用的js方法

      let _jsCollection = {}; // 上一次调用的时间

      let _lastTimeForInvoke = Date.now();

      let BETWEEN_INVOKE_TIME = 100;

      function registerCb(success, fail) {
        if (success && typeof success === 'function') {
          // 超出极限，从零开始
          if (_cbId >= Number.MAX_SAFE_INTEGER) {
            _cbId = 0;
          }

          _cbId += 1;
          const registerKey = getUID1(`hy_${_cbId}_${Date.now()}`);
          _cbSuccessCollection[registerKey] = success;

          if (fail && typeof fail === 'function') {
            _cbFailCollection[registerKey] = fail;
          }

          return registerKey;
        }

        return '';
      }

      function executeInit(response) {
        const {
          callbackId = '',
          result = [],
          token
        } = response;

        if (token) {
          _naToken = token;
          initStatue = 'success';
        } else {
          initStatue = 'fail';
          _tmpQueueForJS = [];
        }

        if (isArray(result)) {
          _naMethods = result;
        }

        if (token) {
          const fn = _cbSuccessCollection[callbackId];
          isFunction(fn) && fn();
        }

        if (_tmpQueueForJS.length > 0) {
          _tmpQueueForJS.forEach(json => {
            json.token = _naToken;
            proxyPostMessage(json);
          });

          _tmpQueueForJS = [];
        }
      }

      function executeJsCb(response) {
        const {
          result,
          callbackId,
          isSuccess
        } = response;
        const fn = isSuccess ? _cbSuccessCollection[callbackId] : _cbFailCollection[callbackId];
        delete _cbFailCollection[callbackId];
        delete _cbSuccessCollection[callbackId];
        isFunction(fn) && fn(result);
      }

      function canIUse(method) {
        return _naMethods.indexOf(method) !== -1;
      }

      function proxyPostMessage(data) {
        if (Date.now() - _lastTimeForInvoke < BETWEEN_INVOKE_TIME) {
          setTimeout(() => {
            proxyPostMessage(data);
          }, BETWEEN_INVOKE_TIME);
        } else {
          _lastTimeForInvoke = Date.now();
          postMessage(data);
        }
      }

      return {
        version: '1.0.0',
        // 注册hybridg通信的协议
        injectScheme: injectScheme,

        // 初始化
        init(params, cb) {
          if (typeof params === 'function' && !cb) {
            cb = params;
            params = {};
          }

          const host = window.location.hostname || '';
          const data = {
            type: TypeNA.CHECKSAFETY,
            params: Object.assign({
              host
            }, params)
          };
          const registerKey = registerCb(cb, '');

          if (registerKey) {
            data.callbackId = registerKey;
          }

          proxyPostMessage(data);
        },

        // 被原生调用
        invokeByNative(json) {
          let response;

          try {
            response = isObject(json) ? json : JSON.parse(json);
          } catch (e) {
            response = {};
          }

          if (response.type === TypeJS.SAFETY) {
            executeInit(response);
          } else if (response.type === TypeJS.JSCB) {
            executeJsCb(response);
          }
        },

        // 调用原生方法
        invoke(options) {
          const {
            methodName,
            params,
            success,
            fail
          } = options;

          if (initStatue === 'fail') {
            return false;
          }

          const json = {
            methodName: methodName,
            params: params,
            type: TypeNA.NA
          };
          const callbackId = registerCb(success, fail);

          if (callbackId) {
            json.callbackId = callbackId;
          }

          if (initStatue === 'success') {
            if (canIUse(methodName)) {
              json.token = _naToken;
              proxyPostMessage(json);
            }
          } else {
            _tmpQueueForJS.push(json);
          }
        },

        // 提供na调用的js方法
        registerAll(array) {
          if (Object.keys(_jsCollection).length > 0) {
            _jsCollection = Object.assign({}, _jsCollection, array);
          } else {
            _jsCollection = array;
          }
        },

        // 提供na调用的js方法
        register(methodName, cb) {
          if (!_jsCollection[methodName]) {
            _jsCollection[methodName] = cb;
          }
        },

        // 原生调用js
        invokeJs(options) {
          let request;

          try {
            request = isObject(options) ? options : JSON.parse(options);
          } catch (e) {
            request = {
              methodName: '',
              params: '',
              callbackId: ''
            };
          }

          const fn = _jsCollection[request.methodName];

          if (isFunction(fn) && initStatue === 'success') {
            const send = result => {
              const json = {
                params: result,
                type: TypeNA.NACB,
                callbackId: request.callbackId || '',
                token: _naToken
              };
              proxyPostMessage(json);
            };

            fn(request.params, send);
          }
        },

        // 监听原生发射的事件
        listen(event, cb) {
          const hook = createHook();
          hook.listen(event, cb);
        },

        // 发射事件
        emit(event, data) {
          const hook = createHook();
          hook.emit(event, data);
        },

        // 删除事件
        remove(event) {
          const hook = createHook();
          hook.remove(event);
        },

        // 扩展桥对象
        extends(method, cb) {
          // @ts-ignore
          if (!window.HyBridge[method]) {
            // @ts-ignore
            window.HyBridge[method] = cb;
          }
        }

      };
    }();

    /**
     * @file 入口文件
     */
    const HyBridge = function () {
      // @ts-ignore
      if (!window.HyBridge || Object.keys(window.HyBridge).length === 0) {
        // @ts-ignore
        window.HyBridge = _Hybridge;
      } // @ts-ignore


      return window.HyBridge;
    }();

    exports.HyBridge = HyBridge;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
