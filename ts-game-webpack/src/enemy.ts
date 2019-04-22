import { Creature, QuantityChangeFunc, QuantityChangeFuncNoOp, NoReturnValFunc, Ticker, ItemCollection, EventHandler, ObjectWithMeshEntity, NoReturnValFuncNoOp } from "./types";

export class Enemy implements ObjectWithMeshEntity, Creature, Ticker {
    // interface Ticker
    tick_interval: number;
    tick: NoReturnValFunc;

    // interface Creature
    HP: number;
    addHP: QuantityChangeFunc;
    subtractHP: QuantityChangeFunc;

    SP: number = 0;
    SPRecoverSpeed: number = 0;
    addSP: QuantityChangeFunc = QuantityChangeFuncNoOp;
    subtractSP: QuantityChangeFunc = QuantityChangeFuncNoOp;

    moveSpeed: number;
    addMoveSpeed: QuantityChangeFunc;
    subtractMoveSpeed: QuantityChangeFunc;

    attackDamage: number;
    addAttackDamage: QuantityChangeFunc;
    subtractAttackDamage: QuantityChangeFunc;
    attack: NoReturnValFunc = NoReturnValFuncNoOp;

    initProperties(): void {
        this.HP = 100;
        this.SP = 0;
        this.moveSpeed = 0.1;
        this.attackDamage = 5;
    }

    // interface ObjectWithMeshEntity
    initMesh: NoReturnValFunc;
    destroy: NoReturnValFunc;


    // --------------------
    // Monster
    gold: number;
    // dropGold()?
    items: ItemCollection;

    // event handler
    private onCollideWithBullets: EventHandler;
    // private onCollideWithSpecialMapBlock: EventHandler;
    // private onCollideWithNormalMapBlock: EventHandler;

}


export class EnemyFactory {

}