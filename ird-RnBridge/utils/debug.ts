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
            message: 'XMLHttpRequest is not be define in window, please check the config of platform.'
        });
        return;
    }
    // @ts-ignore
    const oldXHR = window.XMLHttpRequest;
    function newXHR () {
        const realXHR = new oldXHR();
        realXHR.addEventListener('abort', () => {
            EmitterHandler(H5Side.XHREvent.AJAX_ABORT, {
                message: `${realXHR.responseURL} is abort`,
                response: {url: realXHR.responseURL, status: realXHR.status}
            });
        }, false);

        realXHR.addEventListener('error', function (e: any) {
            EmitterHandler(H5Side.XHREvent.AJAX_ERROR, {
                message: `${realXHR.responseURL} is error`,
                response: {url: realXHR.responseURL, status: realXHR.status, errorMsg: e.message}
            });
        }, false);

        realXHR.addEventListener('timeout', function () {
            EmitterHandler(H5Side.XHREvent.AJAX_TIMEOUT, {
                message: `${realXHR.responseURL} is timeout`,
                response: {url: realXHR.responseURL, status: realXHR.status, timeout: realXHR.timeout}
            });
        }, false);

        realXHR.addEventListener('progress', function () {
            EmitterHandler(H5Side.XHREvent.AJAX_PROGRESS, {
                message: 'progress is success',
                response: {
                    url: realXHR.responseURL,
                    status: realXHR.status,
                    data: realXHR.response,
                    responseType: realXHR.responseType,
                    statusText: realXHR.statusText
                }
            });
        }, false);

        realXHR.addEventListener('readystatechange', function() {
            if (realXHR.readyState !== 4) {
                return
            }
            EmitterHandler(H5Side.XHREvent.AJAX_READY_STATE_CHANGE, {
                message: `${realXHR.responseURL} is success`,
                response: {
                    url: realXHR.responseURL,
                    status: realXHR.status,
                    data: realXHR.response,
                    responseType: realXHR.responseType,
                    statusText: realXHR.statusText,
                    headers: realXHR.getAllResponseHeaders()
                }
            });
        }, false);

        // realXHR.addEventListener('load', function () {
        //     EmitterHandler(H5Side.XHREvent.AJAX_LOAD, {});
        // }, false);
        // realXHR.addEventListener('loadstart', function () {
        //     EmitterHandler(H5Side.XHREvent.AJAX_LOAD_START, {});
        // }, false);
        // realXHR.addEventListener('loadend', function () {
        //     EmitterHandler(H5Side.XHREvent.AJAX_LOAD_END, {});
        // }, false);

        return realXHR;
    }

    // @ts-ignore
    const oldOpen = window.XMLHttpRequest.prototype.open;
    function newOpen (method: string, url: string, async: any, user: any, password: any) {
        // @ts-ignore
        this._tmpMethod = method;
        // @ts-ignore
        return oldOpen.apply(this, arguments);
    }

    // @ts-ignore
    const oldSend = window.XMLHttpRequest.prototype.send;
    function newSend (body: any) {
        // @ts-ignore
        this._tmpBody = body;
        // @ts-ignore
        return oldSend.apply(this, arguments);
    }

    // @ts-ignore
    window.XMLHttpRequest.prototype.open = newOpen;
    // @ts-ignore
    window.XMLHttpRequest.prototype.send = newSend;
    // @ts-ignore
    window.XMLHttpRequest = newXHR;
}

export function listenDebugAjax (send: (data: any) => void) {
    if (!window.addEventListener || !isFunction(window.addEventListener)) {
        return
    }
    // window.addEventListener(H5Side.XHREvent.AJAX_LOAD_START, (e: object) => {
    //     send(e)
    // });
    // window.addEventListener(H5Side.XHREvent.AJAX_LOAD, (e: object) => {
    //     send(e)
    // });
    // window.addEventListener(H5Side.XHREvent.AJAX_LOAD_END, (e: object) => {
    //     send(e)
    // });

    window.addEventListener(H5Side.XHREvent.AJAX_PROGRESS, (e: {[key: string]: any}) => {
        send({
            type: H5Side.XHREvent.AJAX_PROGRESS,
            content: e.detail
        })
    });

    window.addEventListener(H5Side.XHREvent.AJAX_READY_STATE_CHANGE, (e: {[key: string]: any}) => {
        send({
            type: H5Side.XHREvent.AJAX_READY_STATE_CHANGE,
            content: e.detail
        })
    });

    window.addEventListener(H5Side.XHREvent.AJAX_ABORT, (e: {[key: string]: any}) => {
        send({
            type: H5Side.XHREvent.AJAX_ABORT,
            content: e.detail
        })
    });

    window.addEventListener(H5Side.XHREvent.AJAX_ERROR, (e: {[key: string]: any}) => {
        send({
            type: H5Side.XHREvent.AJAX_ERROR,
            content: e.detail
        })
    });

    window.addEventListener(H5Side.XHREvent.AJAX_TIMEOUT, (e: {[key: string]: any}) => {
        send({
            type: H5Side.XHREvent.AJAX_TIMEOUT,
            content: e.detail
        })
    });

    window.addEventListener(H5Side.XHREvent.AJAX_WARN, (e: {[key: string]: any}) => {
        send({
            type: H5Side.XHREvent.AJAX_WARN,
            content: e.detail
        });
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