/**
 * @file h5端的jsBridge的api
 * todo: 1）添加钩子函数
 */
import { H5Side } from '../interface/h5Side';
export declare const H5SideApi: {
    /**
     * 初始化提供给rn端调用的jsApi方法
     * @param api 注册的api方法集合
     */
    initH5(api: H5Side.ApiMap): void;
    /**
     * jsBridge安全性校验
     * @param params src-side传过来的校验参数
     */
    checkSafety(params: object, success: () => {}): void;
    /**
     * 调用rn-side的js方法
     * @param options 参数
     */
    invokeRN(options: H5Side.InvokeRnparams): void;
    /**
     * 监听rn-side调用的方法
     * @param cb 参数
     */
    listenRN(method: string, cb: (params?: any) => {}): void;
    /**
     * 扩展h5-side的jsb的方法
     */
    extends(method: string, cb: (params: any) => any): void;
    /**
     * 发送H5的性能参数
     */
    sendPerformance(): void;
    /**
     * 发送各种资源性能参数
     */
    sendPerformanceByType(type?: H5Side.InitiatorType): void;
    /**
     * 资源枚举
     */
    HttpType: typeof H5Side.InitiatorType;
    /**
     * Debug枚举
     */
    DebugType: typeof H5Side.Debug;
    /**
     * 获取制定的store
     */
    getSessionStore(keys: string[], cb: (data: object) => any): void;
    /**
     * 异步获取store
     */
    getSessionStoreAsync(key: string, cb: (data: object) => any): void;
    /**
     * 开启调试功能
     */
    debug(type: H5Side.Debug, isStop?: boolean): void;
};
