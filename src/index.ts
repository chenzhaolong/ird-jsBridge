/**
 * @file ird-JSBridge的api入口
 */
import { JsBridgeRn } from './rn';

const IrdJsBridge = {
    switchMode(options) {
        const {isRn, type} = options;
        const self = this;
        if (isRn) {
            if (type === 'rn-side') {
                const RnSideApi = JsBridgeRn.RnSideApi;
                Object.keys(RnSideApi).forEach((key: string) => {
                    self[key] = RnSideApi[key];
                })
            } else {
                const H5SideApi = JsBridgeRn.H5SideApi;
                Object.keys(H5SideApi).forEach((key: string) => {
                    self[key] = H5SideApi[key];
                })
            }
        } else {

        }
    }
};

export default IrdJsBridge