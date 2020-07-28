/**
 * @file debug调试
 */
import {H5Side} from '../interface/h5Side';
import {isFunction} from './index';
import {EventEmitter} from './eventEmitter';

export function debugAjax() {
    // @ts-ignore
    const oldXHR = window.XMLHttpRequest;
    
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
}