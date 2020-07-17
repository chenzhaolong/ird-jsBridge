/**
 * @file 获取h5的性能指数，传递给rn
 */
import {H5Side} from '../interface/h5Side';

export function getPerformance(bridgeTime: H5Side.BridgeTime) {
    const {timing} = window.performance;
    return {
        DNS: {desc: 'DNS查询耗时', consuming: timing.domainLookupEnd - timing.domainLookupStart},
        TCP: {desc: 'TCP链接耗时', consuming: timing.connectEnd - timing.connectStart},
        REQUEST: {desc: '请求耗时', consuming: timing.responseEnd - timing.responseStart},
        DOM: {desc: '解析dom树耗时', consuming: timing.domComplete -timing.domInteractive},
        WHITE_SCREEN: {desc: '白屏时间', consuming: timing.domLoading - timing.navigationStart},
        DOM_READY: {desc: 'dom ready时间', consuming: timing.domContentLoadedEventEnd - timing.navigationStart},
        ONLOAD: {desc: 'onload时间', consuming: timing.loadEventEnd - timing.navigationStart},
        FIRST_SCREEN_FINISHED: {desc: '首屏完成的时间', consuming: timing.domContentLoadedEventStart - timing.navigationStart},
        BUILD_BRIDGE_TIME: {desc: 'bridge通信成功的耗时', consuming: bridgeTime.endTime - bridgeTime.startTime}
    }
}