/**
 * @file rn端的jsBridge的api类型
 */
export var RnSide;
(function (RnSide) {
    let types;
    (function (types) {
        types["CHECKSAFETY"] = "checkSafety";
        types["ERROR"] = "error";
        types["RCB"] = "rcb";
        types["RAPI"] = "rapi"; // 执行rn的api
    })(types = RnSide.types || (RnSide.types = {}));
    let StoreTypes;
    (function (StoreTypes) {
        StoreTypes["ADD"] = "add";
        StoreTypes["DEL"] = "delete";
        StoreTypes["MOD"] = "modify";
    })(StoreTypes = RnSide.StoreTypes || (RnSide.StoreTypes = {}));
})(RnSide || (RnSide = {}));
