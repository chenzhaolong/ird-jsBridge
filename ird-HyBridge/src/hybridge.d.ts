/**
 * @file 主体部分
 */
import { injectScheme } from '../interface/constans';
import { InvokeOptions } from "../interface/HyBridge";
export declare const _Hybridge: {
    version: string;
    injectScheme: typeof injectScheme;
    init(params: any, cb: () => {}): void;
    invokeByNative(json: any): void;
    invoke(options: InvokeOptions): false | undefined;
    registerAll(array: object): void;
    register(methodName: string, cb: () => any): void;
    invokeJs(options: any): void;
    listen(event: string, cb: (data: any) => void): void;
    emit(event: string, data: any): void;
    remove(event: string): void;
    extends(method: string, cb: (params: any) => any): void;
};
