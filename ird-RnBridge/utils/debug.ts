/**
 * @file debug调试
 */
import {H5Side} from '../interface/h5Side';
import {isFunction} from './index';
import {EventEmitter} from './eventEmitter';

export function debugAjax() {
    const EmitterHandler = (type: string, data: any) => {
        const emitter = new EventEmitter(type);
        emitter.dispatchEvent(data);
    };

    // @ts-ignore
    if (!window.XMLHttpRequest || typeof window.XMLHttpRequest !== 'function') {
        EmitterHandler(H5Side.XHREvent.AJAX_WARN, {
            response: 'XMLHttpRequest is not be define in window, please check the config of platform.'
        });
        return;
    }
    // @ts-ignore
    const oldXHR = window.XMLHttpRequest;
    const newXHR = () => {
        const realXHR = new oldXHR();
        realXHR.addEventListener('abort', () => {
            EmitterHandler(H5Side.XHREvent.AJAX_ABORT, {

            });
        }, false);

        realXHR.addEventListener('error', function () {
            EmitterHandler(H5Side.XHREvent.AJAX_ERROR, {

            });
        }, false);

        realXHR.addEventListener('load', function () {
            EmitterHandler(H5Side.XHREvent.AJAX_LOAD, {

            });
        }, false);

        realXHR.addEventListener('loadstart', function () {
            EmitterHandler(H5Side.XHREvent.AJAX_LOAD_START, {

            });
        }, false);

        realXHR.addEventListener('progress', function () {
            EmitterHandler(H5Side.XHREvent.AJAX_PROGRESS, {

            });
        }, false);

        realXHR.addEventListener('timeout', function () {
            EmitterHandler(H5Side.XHREvent.AJAX_TIMEOUT, {

            });
        }, false);

        realXHR.addEventListener('loadend', function () {
            EmitterHandler(H5Side.XHREvent.AJAX_LOAD_END, {

            });
        }, false);

        realXHR.addEventListener('readystatechange', function() {
            EmitterHandler(H5Side.XHREvent.AJAX_READY_STATE_CHANGE, {

            });
        }, false);

        return realXHR;
    };
    // @ts-ignore
    window.XMLHttpRequest = newXHR;
}

export function listenDebugAjax (send: (data: any) => void) {
    if (!window.addEventListener || !isFunction(window.addEventListener)) {
        return
    }
    window.addEventListener(H5Side.XHREvent.AJAX_LOAD_START, (e: object) => {
        // todo:处理数据
        send(e)
    });
    window.addEventListener(H5Side.XHREvent.AJAX_LOAD, (e: object) => {
        // todo:处理数据
        send(e)
    });
    window.addEventListener(H5Side.XHREvent.AJAX_LOAD_END, (e: object) => {
        // todo:处理数据
        send(e)
    });
    window.addEventListener(H5Side.XHREvent.AJAX_PROGRESS, (e: object) => {
        // todo:处理数据
        send(e)
    });
    window.addEventListener(H5Side.XHREvent.AJAX_READY_STATE_CHANGE, (e: object) => {
        // todo:处理数据
        send(e)
    });
    window.addEventListener(H5Side.XHREvent.AJAX_ABORT, (e: object) => {
        // todo:处理数据
        send(e)
    });
    window.addEventListener(H5Side.XHREvent.AJAX_ERROR, (e: object) => {
        // todo:处理数据
        send(e)
    });
    window.addEventListener(H5Side.XHREvent.AJAX_TIMEOUT, (e: object) => {
        // todo:处理数据
        send(e)
    });
    window.addEventListener(H5Side.XHREvent.AJAX_WARN, (e: object) => {
        send(e);
    })
}

export function debugConsole() {
    const methodsList = ['log', 'error', 'warn'];
    methodsList.forEach((method: string) => {
        // @ts-ignore
        const originFn = console[method];
        // @ts-ignore
        console[method] = (...rest: Array<any>) => {
            const emitter = new EventEmitter('proxyConsole');
            emitter.dispatchEvent({
                type: method,
                content: rest
            });
            originFn(...rest);
        }
    })
}

export function listenDebugConsole (send: (data: any) => void) {
    if (!window.addEventListener || !isFunction(window.addEventListener)) {
        return
    }

    window.addEventListener('proxyConsole', (e: any) => {
        let detail = e.detail;
        const {type, content} = e.detail;
        if (type === 'error' && content.length === 1 && content[0] instanceof Error) {
            const error = content[0];
            detail.content = [error.message];
        }
        send(detail)
    });
}