/**
 * @file ird-JSBridge的api入口
 */
import { H5SideApi } from './src/h5Side';
import { RnSideApi } from './src/rnSide';

export default {
    version: '1.0.0',

    switchMode(options: any) {
        const {mode} = options;
        const self: {[key: string]: any} = this;
        if (mode === 'rn') {
            if (Object.keys(self).length === 2) {
                Object.keys(RnSideApi).forEach((key: string)=> {
                    // @ts-ignore
                    self[key] = RnSideApi[key]
                })
            }
        } else if (mode === 'h5') {
            // @ts-ignore
            if (!window.RnBridge) {
                // @ts-ignore
                window.RnBridge = H5SideApi
                // @ts-ignore
            } else if (typeof window.RnBridge === 'object' && Object.keys(window.RnBridge).length < 3) {
                // @ts-ignore
                window.RnBridge = {...window.RnBridge, ...H5SideApi}
            }
        }
    }
};