/**
 * @file webview储存数据
 */

class Store {
    constructor() {

    }

    add() {

    }

    del() {

    }

    modify() {

    }

    get(key) {

    }

    clear() {

    }
}

export const getStoreInstance = (function () {
    let instance: any = null;
    return function() {
        if (instance) {
            return instance
        } else {
            instance = new Store();
            return instance
        }
    }
})();