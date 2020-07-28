/**
 * @file 事件发射器
 */

export class EventEmitter {
    private readonly eventName: string;

    constructor(eventName: string) {
        this.eventName = eventName;
    }

    dispatchEvent(data: any) {
        if (CustomEvent) {
            const event = new CustomEvent(this.eventName, {detail: data});
            window.dispatchEvent(event);
        }
    }
}