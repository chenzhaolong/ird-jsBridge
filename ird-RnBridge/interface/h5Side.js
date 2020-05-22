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
        types["HAPI"] = "hapi"; // 执行H5的api
    })(types = H5Side.types || (H5Side.types = {}));
})(H5Side || (H5Side = {}));
