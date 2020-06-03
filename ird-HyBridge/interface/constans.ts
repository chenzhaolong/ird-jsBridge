/**
 * @file 入口文件
 */
import {Options} from './HyBridge';

export enum TypeNA {
    CHECKSAFETY = 'checkSafety'
}

export enum TypeJS {
    SAFETY = 'safety'
}

export const UA: string =  window.navigator.userAgent || '';

const _BridgeScheme = {
    uiScheme: '',
    wkScheme: '',
    androidScheme: ''
};

export function injectScheme(options: Options) {
    const {ui, wk, android} = options;
    if (!_BridgeScheme.uiScheme) {
        _BridgeScheme.uiScheme = ui;
    }
    if (!_BridgeScheme.wkScheme) {
        _BridgeScheme.wkScheme = wk;
    }
    if (!_BridgeScheme.androidScheme) {
        _BridgeScheme.androidScheme = android
    }
}

export const BridgeScheme = _BridgeScheme;