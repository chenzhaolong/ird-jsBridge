/**
 * @file ird-JSBridge的api入口
 */
import { JsBridgeRn } from './src';

const RnJsBridge = {
    switchMode(options) {
        const {type} = options;
        const self = this;
        if (type === 'src-side') {
            const RnSideApi = JsBridgeRn.RnSideApi;
            Object.keys(RnSideApi).forEach((key: string) => {
                self[key] = RnSideApi[key];
            })
        } else if (type === 'h5-side') {
            const H5SideApi = JsBridgeRn.H5SideApi;
            Object.keys(H5SideApi).forEach((key: string) => {
                self[key] = H5SideApi[key];
            })
        }
    }
};

export default RnJsBridge