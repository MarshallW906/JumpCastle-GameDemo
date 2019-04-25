import { Vector3 } from "@babylonjs/core";

import { Buff } from "./buff";
import { EventDispatcher } from "./event_dispatcher";

// Types: Enum
export enum EnemyType { }
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

// Event
export enum EventType {
    ItemCollideWithPlayer,
    BulletCollideWithEnemy,
    EnemyCollideWithPlayer,
    MapBlockCollideWithPlayer,
}

export type EventMessage = {
    object: any,
    message: string
}

export type EventHandler = (eventType: EventType, eventMessage: EventMessage) => void;


export interface EventPublisher {
    initEventDetector(): void;
}

export interface EventSubscriber { // think it might needs to be changed
    registerEventHandler(): void;
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
export enum ItemType { SoulBall, HPRecovery, SPRecovery }

export type ItemCollection = Map<ItemType, number>;

export interface ItemInfo {
    type: ItemType,
    quantity: number,
    price?: number
}

// Move
export enum MoveDirection { Left, Right };

// MapBLock
export namespace MapBlockType {
    export let Plain = 0x00000000;
    export let Trap = 0x00000001;
    export let Modifier = 0x00000010;
    export let TrapAndModifier = Trap | Modifier;
}

export interface MapBlockSize {
    width: number,
    height: number,
    depth: number
}

export interface MapBlockAttributes {
    /**
     * applicable if the mapBlock is a trap.
     */
    damagePerSecond?: number,

    /**
     * applicable if the mapBlock is a modifier.
     */
    buffs?: Array<Buff>;
}

export interface MapBlockInfo {
    type: number;
    length: number;
    location: Vector3;
    attributes?: MapBlockAttributes;
}
