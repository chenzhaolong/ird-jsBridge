/**
 * @file 监听发布事件
 */
import { isFunction } from "./tools";

function Hook () {
    // @ts-ignore
    this.events = {};
    // @ts-ignore
    this.cache = {};
}

// @ts-ignore
Hook.instance = null;

Hook.prototype.listen = function (event: string, cb: (data: any) => any) {
    this.events[event] = cb;
    if (this.cache[event]) {
        const data = this.cache[event];
        delete this.cache[event];
        this.emit(event, data);
    }
};

Hook.prototype.emit = function (event: string, data: any) {
    const fn = this.events[event];
    if (fn) {
        isFunction(fn) && fn(data);
    } else {
        this.cache[event] = data;
    }
};

Hook.prototype.remove = function (event: string) {
    if (this.events[event]) {
        this.events[event] = null;
        delete this.events[event]
    }
    if (this.cache[event]) {
        this.cache[event] = null;
        delete this.cache[event];
    }
};

export function createHook () {
    if (Hook.instance) {
        return Hook.instance;
    } else {
        // @ts-ignore
        Hook.instance = new Hook();
        return Hook.instance;
    }
}
