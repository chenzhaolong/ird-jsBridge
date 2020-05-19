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