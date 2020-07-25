/**
 * @file 工具库
 */
/**
 * 判断布尔类型
 * @param params
 */
export function isBoolean(params) {
    return typeof params === 'boolean' && params;
}
/**
 * 判断是否为函数
 * @param fn
 */
export function isFunction(fn) {
    return typeof fn === 'function';
}
/**
 * 判断是否为字符串
 * @param str
 */
export function isString(str) {
    return str && typeof str === 'string';
}
/**
 * 生成唯一值
 */
export function getUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
/**
 * 生成唯一值
 */
export function getUID1(cbId) {
    return `xxx-yyy-${cbId}`.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
