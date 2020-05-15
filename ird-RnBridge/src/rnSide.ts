/**
 * @file rn端的jsBridge的api
 */
import {RnSide} from '../interface/rnSide';

// rn-side注册的方法
const RnApiMap = {};

// rn-side注册的回调
const RnCallback = {};

// 验证通过传递给h5的票据
const tokenToH5 = '';

export default {
    /**
     * 初始化提供给h5页面调用的jsApi方法
     * @param api 注册的api方法集合
     */
    initWebview(api: RnSide.ApiMap) {
    },

    /**
     * jsBridge安全性校验
     * @param params h5-side传过来的校验参数
     */
    executeCheckSafty(params: object) {
    },

    /**
     * 调用h5-side的js方法
     * @param method 方法名
     * @param params 参数
     * @param cb 回调函数
     */
    invokeH5(method: string, params: any, cb: (data?: any) => any) {
    },

    /**
     * 监听h5-side调用的方法
     * @param params 参数
     */
    listenH5(params: object) {
    }
}