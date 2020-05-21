/**
 * @file ird-JSBridge的api入口
 */
import { H5SideApi } from './src/h5Side';
import { RnSideApi } from './src/rnSide';
const pkg = require('./package.json');

const RnJsBridge = {
    version: pkg.version,

    switchMode(options: any) {
        const {mode} = options;
        const self: {[key: string]: any} = this;
        if (mode === 'rn') {
            if (Object.keys(RnJsBridge).length === 2) {
                Object.keys(RnSideApi).forEach((key: string)=> {
                    // @ts-ignore
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