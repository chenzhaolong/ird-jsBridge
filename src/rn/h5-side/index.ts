/**
 * @file h5端的jsBridge的api
 */
import {H5Side} from '../../../interface/h5-side';

// h5-side注册的方法
const h5ApiMap = {};

// h5-side注册的回调
const H5Callback = {};

// rn-side传过来的api
const RnApiMap = [];

export default {
    /**
     * 初始化提供给rn端调用的jsApi方法
     * @param api 注册的api方法集合
     */
    initH5(api: H5Side.ApiMap) {
    },

    /**
     * jsBridge安全性校验
     * @param params rn-side传过来的校验参数
     */
    checkSafty(params: object) {
    },

    /**
     * 调用rn-side的js方法
     * @param method 方法名
     * @param params 参数
     * @param cb 回调函数
     */
    invokeRN(method: string, params: any, cb: (data?: any) => any) {
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