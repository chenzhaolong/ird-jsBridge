export var TypeNA;
(function (TypeNA) {
    TypeNA["CHECKSAFETY"] = "checkSafety";
    TypeNA["NA"] = "na";
    TypeNA["NACB"] = "naCb";
})(TypeNA || (TypeNA = {}));
export var TypeJS;
(function (TypeJS) {
    TypeJS["SAFETY"] = "safety";
    TypeJS["JSCB"] = "jsCb";
})(TypeJS || (TypeJS = {}));
export const UA = window.navigator.userAgent || '';
const _BridgeScheme = {
    uiScheme: '',
    wkScheme: '',
    androidScheme: ''
};
export function injectScheme(options) {
    const { ui, wk, android } = options;
    if (!_BridgeScheme.uiScheme) {
        _BridgeScheme.uiScheme = ui;
    }
    if (!_BridgeScheme.wkScheme) {
        _BridgeScheme.wkScheme = wk;
    }
    if (!_BridgeScheme.androidScheme) {
        _BridgeScheme.androidScheme = android;
    }
}
export const BridgeScheme = _BridgeScheme;
