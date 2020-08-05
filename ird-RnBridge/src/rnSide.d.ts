/**
 * @file rn端的jsBridge的api
 */
import { RnSide } from '../interface/rnSide';
export declare const RnSideApi: {
    /**
     * 初始化提供给h5页面调用的jsApi方法
     * @param api 注册的api方法集合
     */
    initWebview(refWebview: any, api: RnSide.ApiMap): void;
    /**
     * jsBridge安全性校验
     * @param params h5-side传过来的校验参数
     */
    executeCheckSafety(params: RnSide.RnParams): void;
    /**
     * 调用h5-side的js方法
     * @param options 选项
     */
    invokeH5(options: RnSide.InvokeH5Params): void;
    /**
     * 监听h5-side调用的方法
     * @param params 参数
     */
    listenH5(params: object): void;
    /**
     * 监听H5的性能数据
     * @param cb 回调函数
     **/
    listenPerformance(cb: (data: object) => void): void;
    /**
     * 监听H5请求资源的性能数据
     * @param cb 回调函数
     */
    listenTypePerformance(cb: (data: object) => void): void;
    /**
     * 储存数据
     */
    sessionStore(options: RnSide.StoreOptions): void;
    /**
     * 清除储存的数据
     */
    clearSessionStore(key: string): void;
    /**
     * 是否有该储存数据
     */
    hasSessionStoreByKey(key: string): boolean;
    /**
     * 监听h5发布的ajax请求
     * todo: 暂时先hold住
     */
    listenAjax(): void;
    listenConsole(): void;
};
