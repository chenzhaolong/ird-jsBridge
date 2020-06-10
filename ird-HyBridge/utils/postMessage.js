/**
 * @file 发起跨端请求
 */
import { isIos, isWkWebview } from './ua';
import { BridgeScheme } from '../interface/constans';
function sendForAndroid(json) {
    // @ts-ignore
    if (BridgeScheme.androidScheme && window[BridgeScheme.androidScheme]) {
        // @ts-ignore
        window[BridgeScheme.androidScheme](json);
    }
    else {
        throw new Error('android scheme can not be empty, please use HyBridge.injectScheme init android scheme');
    }
}
function sendForUI(json) {
    if (BridgeScheme.uiScheme) {
        let iframe = document.createElement('iframe');
        let url = BridgeScheme.uiScheme.indexOf('?') === -1 ? `${BridgeScheme.uiScheme}?` : BridgeScheme.uiScheme;
        iframe.src = `${url}json=${json}`;
        iframe.style.display = 'none';
        document.documentElement.appendChild(iframe);
        setTimeout(() => {
            document.documentElement.removeChild(iframe);
            iframe = null;
        }, 0);
    }
    else {
        throw new Error('uiwebview scheme can not be empty, please use HyBridge.injectScheme init uiwebview scheme');
    }
}
function sendForWk(json) {
    if (BridgeScheme.wkScheme) {
        // @ts-ignore
        window.webkit.messageHandlers[BridgeScheme.wkScheme].postMessage(json);
    }
    else {
        throw new Error('wkwebview scheme can not be empty, please use HyBridge.injectScheme init wkwebview scheme');
    }
}
export function postMessage(obj) {
    const json = typeof obj === 'object' ? JSON.stringify(obj) : obj;
    if (isIos()) {
        if (isWkWebview()) {
            sendForWk(json);
        }
        else {
            sendForUI(json);
        }
    }
    else {
        sendForAndroid(json);
    }
}
