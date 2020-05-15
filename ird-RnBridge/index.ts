/**
 * @file ird-JSBridge的api入口
 */
import { JsBridgeRn } from './src';

const RnJsBridge = {
    switchMode(options) {
        const {mode} = options;
        const self = this;
        if (mode === 'rn') {
            const RnSideApi = JsBridgeRn.RnSideApi;
            Object.keys(RnSideApi).forEach((key: string) => {
                self[key] = RnSideApi[key];
            })
        } else if (mode === 'h5') {
            const H5SideApi = JsBridgeRn.H5SideApi;
            Object.keys(H5SideApi).forEach((key: string) => {
                self[key] = H5SideApi[key];
            })
        }
    }
};

export default RnJsBridge