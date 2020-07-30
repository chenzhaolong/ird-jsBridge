/**
 * @file 事件发射器
 */
export class EventEmitter {
    constructor(eventName) {
        this.eventName = eventName;
    }
    dispatchEvent(data) {
        if (CustomEvent) {
            const event = new CustomEvent(this.eventName, { detail: data });
            window.dispatchEvent(event);
        }
    }
}
