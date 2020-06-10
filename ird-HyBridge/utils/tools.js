/**
 * @file 工具类
 */
/**
 * 生成唯一值
 */
export function getUID1(cbId) {
    return `xxx-yyy-${cbId}`.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
export function isArray(array) {
    return Object.prototype.toString.call(array) == '[object Array]';
}
export function isFunction(fn) {
    return typeof fn === 'function';
}
export function isObject(obj) {
    return typeof obj === 'object';
}
