/**
 * @file h5端的jsBridge的api类型
 */
export var H5Side;
(function (H5Side) {
    let types;
    (function (types) {
        types["SAFETY"] = "safety";
        types["ERROR"] = "error";
        types["HCB"] = "hcb";
        types["HAPI"] = "hapi";
        // SESSIONSTORE = 'sessionStore'
    })(types = H5Side.types || (H5Side.types = {}));
    let InitiatorType;
    (function (InitiatorType) {
        InitiatorType["ALL"] = "all";
        InitiatorType["IMG"] = "img";
        InitiatorType["LINK"] = "link";
        InitiatorType["IFRAME"] = "iframe";
        InitiatorType["SCRIPT"] = "script";
        InitiatorType["CSS"] = "css";
        InitiatorType["XHR"] = "xmlhttprequest";
        InitiatorType["NAV"] = "navigation";
    })(InitiatorType = H5Side.InitiatorType || (H5Side.InitiatorType = {}));
    let Debug;
    (function (Debug) {
        Debug["AJAX"] = "ajax";
        Debug["CONSOLE"] = "console";
    })(Debug = H5Side.Debug || (H5Side.Debug = {}));
    let XHREvent;
    (function (XHREvent) {
        XHREvent["AJAX_ABORT"] = "ajaxAbort";
        XHREvent["AJAX_ERROR"] = "ajaxError";
        XHREvent["AJAX_LOAD"] = "ajaxLoad";
        XHREvent["AJAX_LOAD_START"] = "ajaxLoadStart";
        XHREvent["AJAX_PROGRESS"] = "ajaxProgress";
        XHREvent["AJAX_TIMEOUT"] = "ajaxTimeout";
        XHREvent["AJAX_LOAD_END"] = "ajaxLoadEnd";
        XHREvent["AJAX_READY_STATE_CHANGE"] = "ajaxReadyStateChange";
    })(XHREvent = H5Side.XHREvent || (H5Side.XHREvent = {}));
})(H5Side || (H5Side = {}));
