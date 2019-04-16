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

    private eventHandlers: Map<EventType, Array<EventHandler>> = new Map<EventType, Array<EventHandler>>();

    private searchEventType(eventType: EventType): boolean {
        return false;
    }
    private dispatchEvent(eventType: EventType, eventMessage: EventMessage) { }

    /**
     * add new EventType to Dispatcher.
     * call this func when game is initialized.
     * @param eventType 
     */
    public registerEventType(eventType: EventType): void { }

    public addEventHandler(eventType: EventType, eventHandler: EventHandler): void { }
    public receiveEvent(eventType: EventType, eventMessage: EventMessage): void { }

    public test(): void {
        console.log("test eventhandler");
    }
}