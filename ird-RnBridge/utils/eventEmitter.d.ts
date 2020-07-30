/**
 * @file 事件发射器
 */
export declare class EventEmitter {
    private readonly eventName;
    constructor(eventName: string);
    dispatchEvent(data: any): void;
}
