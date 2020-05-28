/**
 * @file 入口文件
 */

export const HyBridge = (function() {
    // @ts-ignore
    if (!window.HyBridge || Object.keys(window.HyBridge).length === 0) {
        // @ts-ignore
        window.HyBridge = {
            init() {},
            register() {},
            listen() {},
            emit() {},
            invoke() {},
            getInfo() {},
            extends() {},
            error() {},
            debug() {}
        };
    }
    // @ts-ignore
    return window.HyBridge;
})();