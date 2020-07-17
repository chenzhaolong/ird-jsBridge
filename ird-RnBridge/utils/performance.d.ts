/**
 * @file 获取h5的性能指数，传递给rn
 */
import { H5Side } from '../interface/h5Side';
export declare function getPerformance(bridgeTime: H5Side.BridgeTime): {
    DNS: {
        desc: string;
        consuming: number;
    };
    TCP: {
        desc: string;
        consuming: number;
    };
    REQUEST: {
        desc: string;
        consuming: number;
    };
    DOM: {
        desc: string;
        consuming: number;
    };
    WHITE_SCREEN: {
        desc: string;
        consuming: number;
    };
    DOM_READY: {
        desc: string;
        consuming: number;
    };
    ONLOAD: {
        desc: string;
        consuming: number;
    };
    FIRST_SCREEN_FINISHED: {
        desc: string;
        consuming: number;
    };
    BUILD_BRIDGE_TIME: {
        desc: string;
        consuming: number;
    };
};
