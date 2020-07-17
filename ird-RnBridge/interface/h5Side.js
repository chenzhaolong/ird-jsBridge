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
        types["PERFORMANCE"] = "performance"; // 性能参数
    })(types = H5Side.types || (H5Side.types = {}));
})(H5Side || (H5Side = {}));
