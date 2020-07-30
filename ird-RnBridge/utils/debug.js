/**
 * @file debug调试
 */
import { H5Side } from '../interface/h5Side';
import { isFunction } from './index';
import { EventEmitter } from './eventEmitter';
export function debugAjax() {
    // @ts-ignore
    const oldXHR = window.XMLHttpRequest;
}
export function listenDebugAjax(send) {
    if (!window.addEventListener || !isFunction(window.addEventListener)) {
        return;
    }
    window.addEventListener(H5Side.XHREvent.AJAX_LOAD_START, (e) => {
        // todo:处理数据
        send(e);
    });
    window.addEventListener(H5Side.XHREvent.AJAX_LOAD, (e) => {
        // todo:处理数据
        send(e);
    });
    window.addEventListener(H5Side.XHREvent.AJAX_LOAD_END, (e) => {
        // todo:处理数据
        send(e);
    });
    window.addEventListener(H5Side.XHREvent.AJAX_PROGRESS, (e) => {
        // todo:处理数据
        send(e);
    });
    window.addEventListener(H5Side.XHREvent.AJAX_READY_STATE_CHANGE, (e) => {
        // todo:处理数据
        send(e);
    });
    window.addEventListener(H5Side.XHREvent.AJAX_ABORT, (e) => {
        // todo:处理数据
        send(e);
    });
    window.addEventListener(H5Side.XHREvent.AJAX_ERROR, (e) => {
        // todo:处理数据
        send(e);
    });
    window.addEventListener(H5Side.XHREvent.AJAX_TIMEOUT, (e) => {
        // todo:处理数据
        send(e);
    });
}
export function debugConsole() {
    const methodsList = ['log', 'error', 'warn'];
    methodsList.forEach((method) => {
        // @ts-ignore
        const originFn = console[method];
        // @ts-ignore
        console[method] = (...rest) => {
            const emitter = new EventEmitter('proxyConsole');
            emitter.dispatchEvent({
                type: method,
                content: rest
            });
            originFn(...rest);
        };
    });
}
export function listenDebugConsole(send) {
    if (!window.addEventListener || !isFunction(window.addEventListener)) {
        return;
    }
    window.addEventListener('proxyConsole', (e) => {
        let detail = e.detail;
        const { type, content } = e.detail;
        if (type === 'error' && content.length === 1 && content[0] instanceof Error) {
            const error = content[0];
            detail.content = [error.message];
        }
        send(detail);
    });
}
