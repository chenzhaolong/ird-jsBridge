/**
 * @file 工具类
 */

/**
 * 生成唯一值
 */
export function getUID (): string { // 获取唯一值
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

/**
 * 生成唯一值
 */
export function getUID1 (cbId: string): string { // 获取唯一值
    return `xxx-yyy-${cbId}`.replace(/[xy]/g, function(c) {
        let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

export function isArray (array: any): boolean {
    return Object.prototype.toString.call(array)== '[object Array]';

}

export function isFunction(fn: any): boolean {
    return typeof fn === 'function';
}