/**
 * @file webview储存数据
 */

class Store {
    private cache: {[key: string]: any};

    constructor() {
        this.cache = {};
    }

    add(key: string, data: any): boolean {
        if (this.cache[key]) {
            console.warn(`the key ${key} is exist in the store, please change the type when use sessionStore.`);
            return false;
        }
        this.cache[key] = data;
        return true;
    }

    del(key: string): boolean {
        if (this.cache[key]) {
            this.cache[key] = null;
            return delete this.cache[key];
        }
        console.warn(`the key ${key} has been delete yet.`);
        return true;
    }

    modify(key: string, data: any): boolean {
        if (this.cache[key]) {
            this.cache[key] = data;
            return true;
        }
        console.warn(`the key ${key} has not existed in the store, so can not modify.`);
        return false;
    }

    get(key: string): any {
        return this.cache[key];
    }

    clear() {
        this.cache = {};
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