/**
 * @file ird-JSBridge的api入口
 */
import { H5SideApi } from './src/h5Side';
import { RnSideApi } from './src/rnSide';

const RnJsBridge = {
    switchMode(options) {
        const {mode} = options;
        const self = this;
        if (mode === 'rn') {
            if (Object.keys(RnJsBridge).length === 1) {
                Object.keys(RnSideApi).forEach((key: string)=> {
                    self[key] = RnSideApi[key]
                })
            }
        } else if (mode === 'h5') {
            // @ts-ignore
            if (!window.RnJsBridge) {
                // @ts-ignore
                window.RnJsBridge = H5SideApi
            }
        }
    }
};

export default RnJsBridge