/**
 * @file 获取h5的性能指数，传递给rn
 */
import {H5Side} from '../interface/h5Side';

export function getPerformance(): {[key: string]: any} {
    const {timing} = window.performance;
    return {
        DNS: {desc: 'DNS查询耗时', consuming: timing.domainLookupEnd - timing.domainLookupStart},
        TCP: {desc: 'TCP链接耗时', consuming: timing.connectEnd - timing.connectStart},
        REQUEST: {desc: '请求耗时', consuming: timing.responseEnd - timing.responseStart},
        DOM: {desc: '解析dom树耗时', consuming: timing.domComplete -timing.domInteractive},
        WHITE_SCREEN: {desc: '白屏时间', consuming: timing.domLoading - timing.navigationStart},
        DOM_READY: {desc: 'dom ready时间', consuming: timing.domContentLoadedEventEnd - timing.navigationStart},
        ONLOAD: {desc: 'onload时间', consuming: timing.loadEventEnd - timing.navigationStart},
        FIRST_SCREEN_FINISHED: {desc: '首屏完成的时间', consuming: timing.domContentLoadedEventStart - timing.navigationStart}
    }
}

export function getInitiatorPerformance (type: H5Side.InitiatorType) {
    const resource = window.performance.getEntries();
    if (type === H5Side.InitiatorType.ALL) {
        let data: {[key: string]: any} = {};
        resource.forEach((item: any) => {
            if (data[item.entryType]) {
                data[item.entryType].push({
                    name: item.name,
                    startTime: item.startTime,
                    duration: item.duration
                });
            } else {
                data[item.entryType] = [];
                data[item.entryType].push({
                    name: item.name,
                    startTime: item.startTime,
                    duration: item.duration
                });
            }
        });
        return data;
    } else {
        let data = resource.filter((item: any) => {
            return item.entryType === type;
        }).map((item1: any) => {
            return {name: item1.name, startTime: item1.startTime, duration: item1.duration};
        });
        let result: {[key: string]: any} = {};
        result[type] = data;
        return result;
    }
}