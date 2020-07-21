/**
 * @file 获取h5的性能指数，传递给rn
 */
import { H5Side } from '../interface/h5Side';
export declare function getPerformance(): {
    [key: string]: any;
};
export declare function getInitiatorPerformance(type: H5Side.InitiatorType): {
    [key: string]: any;
};
