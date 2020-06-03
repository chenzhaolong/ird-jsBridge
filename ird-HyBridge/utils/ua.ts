/**
 * @file 类型判断
 */
import { UA } from '../interface/constans';

/**
 * 是否为安卓侧
 */
export function isAndroid (): boolean {
    return /(Android);?\s+([\d.]+)?/.test(UA)
}

/**
 * 是否为uiwebview
 */
export function isUiWebview (): boolean {
    if (isIos()) {
        return !isWkWebview();
    }
    return false;
}

/**
 * 是否为wkwebview
 */
export function isWkWebview (): boolean {
    if (isIos()) {
        // @ts-ignore
        return window.webkit && window.webkit.messageHandlers && true;
    }
    return false;
}

/**
 * 是否为ios侧
 */
export function isIos (): boolean {
    return /(iPhone|iPod|iPad)/.test( UA )
}