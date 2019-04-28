import { Vector3, Size } from "@babylonjs/core";

import { Buff } from "./buff";

// Types: Enum
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
    GUIQuantityChange,

    ItemCollideWithPlayer,
    PlayerLeaveAnItem,
    ItemBePurchased,

    PlayerEntersMapBlock,
    PlayerLeavesMapBlock,
    BulletCollideWithEnemy,

    PlayerEnterTeleportPoint,
    PlayerExitTeleportPoint,

    PlayerEnterDestinationPoint,
    PlayerExitDestinationPoint,

    EnemyDead,
    EnemyCollideWithPlayer,
    EnemyReachesMapBlockEdge,
    EnemySeesPlayer,

    GameWin,
    GameOver,
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
}


/**
 * can use this form to unite different types of funcs:
 * type ddd = (ttt: string) => number;
 * initMesh: NoReturnValFunc | ddd;
 */
export interface ObjectWithMeshEntity {
    initMesh: NoReturnValFunc;
    destroyMesh: NoReturnValFunc;
}

/**
 * Those who needs to judge something every several seconds
 */
export interface Ticker {
    tick_interval: number;
    tick: NoReturnValFunc;
}

// Item
export enum ItemType {
    SoulBall,

    HPRecovery,
    SPRecovery,

    AddSpRecoverSpeed,
    AddAttackDamage,
    AddMoveSpeed,
}

export type ItemCollection = Map<ItemType, number>;

export interface ItemInfo {
    type: ItemType,
    quantity: number,
    price?: number,
    location: Vector3,
}

// Move
export enum MoveDirection { Left, Right };

// MapBLock
export namespace MapBlockType {
    export let Plain = 0x00000000;
    export let Trap = 0x00000001;
    export let Modifier = 0x00000010;
    // export let DestinationPoint = 0x10000000;
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
    damage?: number,

    /**
     * applicable if the mapBlock is a modifier.
     */
    modifiers?: Array<Buff>;
}

export interface MapBlockInfo {
    type: number;
    length: number;
    location: Vector3;
    attributes?: MapBlockAttributes;
    isVertical?: boolean;
}

// Enemy
export type EnemySize = MapBlockSize;
export enum EnemyType {
    NormalSolider,
}
export interface EnemyInfo {
    type: EnemyType,
    location: Vector3,

    isBoss?: boolean,
}
export interface EnemyProperties {
    maxHP: number,
    moveSpeed: number,
    attackDamage: number,
    gold: number,

    items: ItemCollection | undefined,
    size: EnemySize,
}

export enum Property {
    HP,
    HPRecoverSpeed,

    SP,
    SPRecoverSpeed,

    AttackDamage,
    MoveSpeed,
}
