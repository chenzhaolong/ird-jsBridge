/**
 * @file 入口文件
 */
import { Options } from './HyBridge';
export declare enum TypeNA {
    CHECKSAFETY = "checkSafety",
    NA = "na",
    NACB = "naCb"
}
export declare enum TypeJS {
    SAFETY = "safety",
    JSCB = "jsCb"
}
export declare const UA: string;
export declare function injectScheme(options: Options): void;
export declare const BridgeScheme: {
    uiScheme: string;
    wkScheme: string;
    androidScheme: string;
};
