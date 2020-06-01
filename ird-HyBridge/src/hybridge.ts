/**
 * @file 主体部分
 */
import { TypeJS, TypeNA } from '../interface/constans';
import { postMessage } from '../utils/postMessage';

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
    let _cbCollection: {[key: string]: any} = {};

    // 提供给na调用的js方法
    let _jsCollection: {[key: string]: any} = {};

    // 上一次调用的时间
    let _lastTimeForInvoke: number = Date.now();

    return {
        init() {},
        register() {},
        listen() {},
        emit() {},
        invoke() {},
        getInfo() {},
        extends() {},
        error() {},
        debug() {},
        invokeByNative() {},
        invokeJs() {

        }
    }
})();
