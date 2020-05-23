/**
 * @file ird-JSBridge的api入口
 */
import { H5SideApi } from './src/h5Side';
import { RnSideApi } from './src/rnSide';
export const RnJsBridge = {
    version: '1.0.0',
    switchMode(options) {
        const { mode } = options;
        const self = this;
        if (mode === 'rn') {
            if (Object.keys(RnJsBridge).length === 2) {
                Object.keys(RnSideApi).forEach((key) => {
                    // @ts-ignore
                    self[key] = RnSideApi[key];
                });
            }
        }
        else if (mode === 'h5') {
            // @ts-ignore
            if (!window.RnJsBridge) {
                // @ts-ignore
                window.RnJsBridge = H5SideApi;
            }
        }
    }
};
