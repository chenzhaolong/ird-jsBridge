/**
 * @file 入口文件
 */
import { _Hybridge } from "./hybridge";
export const HyBridge = (function () {
    // @ts-ignore
    if (!window.HyBridge || Object.keys(window.HyBridge).length === 0) {
        // @ts-ignore
        window.HyBridge = _Hybridge;
    }
    // @ts-ignore
    return window.HyBridge;
})();
