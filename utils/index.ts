/**
 * @file 工具库
 */

/**
 * 判断布尔类型
 * @param params
 */
export function isBoolean(params: any): boolean {
    return typeof params === 'boolean' && params;
}

/**
 * 判断是否为函数
 * @param fn
 */
export function isFunction(fn: any):boolean {
    return typeof fn === 'function';
}