import { Creature, Ticker, EventHandler, ItemCollection, NoReturnValFunc, ObjectWithMeshEntity } from './types'

export class Player implements ObjectWithMeshEntity, Creature, Ticker {
    // interface Ticker
    tick_interval: number;
    tick(): void { }

    // interface Creature
    HP: number
    addHP(quantity: number): void { }
    subtractHP(quantity: number): void { }

    SP: number
    SPRecoverSpeed: number
    addSP(quantity: number): void { }
    subtractSP(quantity: number): void { }

    moveSpeed: number
    addMoveSpeed(quantity: number): void { }
    subtractMoveSpeed(quantity: number): void { }

    attackDamage: number
    addAttackDamage(quantity: number): void { }
    subtractAttackDamage(quantity: number): void { }
    attack(): void { }

    // interface ObjectWithMeshEntity
    initMesh: NoReturnValFunc;
    destroy: NoReturnValFunc;

    // --------------------
    // Player

    init(): void { }

    gold: number;
    addGold(quantity: number): void { this.gold += quantity; }

    soul: number;
    addSoul(quantity: number): void { this.soul += quantity; }

    items: ItemCollection;

    /**
     * Record teleport points.
     */
    teleportPointsUnlocked: Array<boolean>;

    // jump
    jump(): void { }
    firstJump: boolean;

    // event handler
    private onCollideWithMonster: EventHandler;
    private onCollideWithNormalMapBlock: EventHandler;
    private onCollideWithSpecialMapBlock: EventHandler;
    private onCollideWithItem: EventHandler;
    private onCollideWithSoulball: EventHandler;
    private onCollideWithTeleportPoint: EventHandler;
}
