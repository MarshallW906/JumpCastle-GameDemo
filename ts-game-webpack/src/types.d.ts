
// general
export type NoReturnValFunc = () => void;

// event
export type EventType = string;

export type EventMessage = {
    object: any,
    message: string
}

export type EventHandler = (eventType: EventType, eventMessage: EventMessage) => void;

export interface EventPublisher {
    publishEventMessage(): void;
}

export interface EventSubscriber {
    subscribeEvent(eventType: EventType, eventMsg: EventMessage, eventHandler: EventHandler): void;
}

// GUI
export type GUIMode = string;
