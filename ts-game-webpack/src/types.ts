import { number } from "prop-types";

// Types: Enum
export enum ItemType { }
export enum MonsterType { }
export enum BuffType { Permanent, Time, DependOnMap }

// general func alias
export type NoReturnValFunc = () => void;
export function NoReturnValFuncNoOp(): void {
    console.log("The method called here actually does nothing.");
    console.log("Below is the object where this func is called.", this)
}
export type QuantityChangeFunc = (quantity: number) => void;
export function QuantityChangeFuncNoOp(quantity: number): void {
    console.log("The method called here actually does nothing.");
    console.log("Below is the object where this func is called.", this)
}

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

export interface EventSubscriber { // think it might needs to be changed
    subscribeEvent(eventType: EventType, eventMsg: EventMessage, eventHandler: EventHandler): void;
}

// GUI
export enum GUIMode { HideAll, Loading, Title, GameRuntime, GameOver, Win }

/**
 * All Creatures have HP, MoveSpeed and AttackDamage.
 */
export interface Creature {
    HP: number;
    addHP: QuantityChangeFunc;
    subtractHP: QuantityChangeFunc;

    SP: number;
    SPRecoverSpeed: number;
    addSP: QuantityChangeFunc;
    subtractSP: QuantityChangeFunc;

    moveSpeed: number;
    addMoveSpeed: QuantityChangeFunc;
    subtractMoveSpeed: QuantityChangeFunc;

    attackDamage: number;
    addAttackDamage: QuantityChangeFunc;
    subtractAttackDamage: QuantityChangeFunc;
    attack: NoReturnValFunc;

    initProperties: NoReturnValFunc;
}


/**
 * can use this form to unite different types of funcs:
 * type ddd = (ttt: string) => number;
 * initMesh: NoReturnValFunc | ddd;
 */
export interface ObjectWithMeshEntity {
    initMesh: NoReturnValFunc;
    destroy: NoReturnValFunc;
}

/**
 * Those who needs to judge something every several seconds
 */
export interface Ticker {
    tick_interval: number;
    tick: NoReturnValFunc;
}

// Item
export type ItemCollection = Map<ItemType, number>;

// Move
export enum MoveDirection { Left, Right };

// MapBLock
export namespace MapBlockType {
    export let Plain = 0x00000000;
    export let Trap = 0x00000001;
    export let Modifier = 0x00000010;
    export let TrapAndModifier = Trap | Modifier;
}
