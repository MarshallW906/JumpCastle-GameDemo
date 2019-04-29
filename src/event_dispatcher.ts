// import
import { EventType, EventMessage, EventHandler } from './types'

/**
 * Singleton Class. Use EventDispatcher.getInstance().
 */
export class EventDispatcher {
    // -----------singleton-------------
    private static _instance: EventDispatcher = new EventDispatcher();

    constructor() {
        if (EventDispatcher._instance) {
            throw new Error("Error: Instantiation failed: Use EventDispatcher.getInstance() instead of new.");
        }
        EventDispatcher._instance = this;
    }

    public static getInstance(): EventDispatcher {
        return EventDispatcher._instance;
    }
    // ---------------------------------

    init(): void {
        this.eventHandlers = new Map<EventType, Array<EventHandler>>();
    }

    private eventHandlers: Map<EventType, Array<EventHandler>>;

    private searchEventType(eventType: EventType): boolean {
        return !(this.eventHandlers.get(eventType) == undefined);
    }
    private dispatchEvent(eventType: EventType, eventMessage: EventMessage) {
        this.eventHandlers.get(eventType).forEach((eventHandler: EventHandler) => {
            eventHandler(eventType, eventMessage);
        });
    }

    /**
     * add new EventType to Dispatcher.
     * call this func when game is initialized.
     * @param eventType 
     */
    public registerEventType(eventType: EventType): void {
        if (!this.searchEventType(eventType)) {
            console.log("new eventType eventhandle[] initialized", eventType)
            this.eventHandlers.set(eventType, new Array<EventHandler>());
        }
    }

    public addEventHandler(eventType: EventType, eventHandler: EventHandler): void {
        this.eventHandlers.get(eventType).push(eventHandler);
    }

    public receiveEvent(eventType: EventType, eventMessage: EventMessage): void {
        if (!this.searchEventType(eventType)) {
            throw Error("This type of event hasn't been registered!");
        }
        this.dispatchEvent(eventType, eventMessage);
    }

    public test(): void {
        console.log("test eventhandler");
    }
}