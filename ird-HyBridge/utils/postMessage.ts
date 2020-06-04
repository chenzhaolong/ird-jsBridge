/**
 * @file 发起跨端请求
 */
import { isIos, isWkWebview} from './ua';
import { BridgeScheme } from '../interface/constans';

function sendForAndroid(json: string) {
    // @ts-ignore
    if (BridgeScheme.androidScheme && window[BridgeScheme.androidScheme]) {
        // @ts-ignore
        window[BridgeScheme.androidScheme](json);
    }
}

function sendForUI(json: string) {
    if (BridgeScheme.uiScheme) {
        let iframe: any = document.createElement('iframe');
        let url = BridgeScheme.uiScheme.indexOf('?') === -1 ? `${BridgeScheme.uiScheme}?` : BridgeScheme.uiScheme;
        iframe.src = `${url}json=${json}`;
        iframe.style.display = 'none';
        document.documentElement.appendChild(iframe);
        setTimeout(() => {
            document.documentElement.removeChild(iframe);
            iframe = null;
        }, 0)
    }
}

function sendForWk(json: string) {
    if (BridgeScheme.wkScheme) {
        // @ts-ignore
        window.webkit.messageHandlers[BridgeScheme.wkScheme].postMessage(json);
    }
}

export function postMessage (obj: string | object) {
    const json = typeof obj === 'object' ? JSON.stringify(obj) : obj;
    if (isIos()) {
        if (isWkWebview()) {
            sendForWk(json);
        } else {
            sendForUI(json);
        }
    } else {
        sendForAndroid(json);
    }
}