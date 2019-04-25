import * as Babylon from "@babylonjs/core";

import { Creature, QuantityChangeFunc, QuantityChangeFuncNoOp, NoReturnValFunc, Ticker, ItemCollection, EventHandler, ObjectWithMeshEntity, NoReturnValFuncNoOp, EventSubscriber, EventPublisher, EventType, EventMessage } from "./types";
import { SceneController } from "./scene";
import { EventDispatcher } from "./event_dispatcher";

export class Enemy implements ObjectWithMeshEntity, Creature, Ticker, EventPublisher, EventSubscriber {
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

    private _mesh: Babylon.Mesh;
    get mesh(): Babylon.Mesh { return this._mesh; }
    // interface ObjectWithMeshEntity
    initMesh: NoReturnValFunc;
    destroy: NoReturnValFunc;


    // --------------------
    // Monster
    private _id: number;
    get id(): number { return this._id; }
    gold: number;
    // dropGold()?
    items: ItemCollection;

    initEventDetector(): void {
        // collide with player
        this._mesh.actionManager = new Babylon.ActionManager(SceneController.getInstance().gameScene);
        this._mesh.actionManager.registerAction(
            new Babylon.ExecuteCodeAction({
                trigger: Babylon.ActionManager.OnIntersectionEnterTrigger,
                parameter: {
                    mesh: SceneController.getInstance().player.playerMesh,
                    usePreciseIntersection: true
                }
            }, (evt: Babylon.ActionEvent) => {
                EventDispatcher.getInstance().receiveEvent(EventType.EnemyCollideWithPlayer, {
                    object: this._mesh,
                    message: "Enemy collide with Player"
                })
            })
        );

        // collide with special map block? (optional....)
    }
    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(EventType.BulletCollideWithEnemy, Enemy.getFnOnCollideWithBullets(this));
        // EventDispatcher.getInstance().addEventHandler
    }

    // event handler
    static getFnOnCollideWithBullets(object: any): EventHandler {
        return (eventType: EventType, eventMessage: EventMessage) => {
            if (<Enemy>object.id == eventMessage.object.enemy.id) {
                <Enemy>object.subtractHP(eventMessage.object.bullet.damage);
                // check if object is dead (HP <= 0)
            }
        }
    }
    // private onCollideWithSpecialMapBlock: EventHandler;
    // private onCollideWithNormalMapBlock: EventHandler;

}


export class EnemyFactory implements EventSubscriber {
    private _enemies: Array<Enemy>;
    get enemies(): Array<Enemy> { return this._enemies; }

    constructor() {
        this._enemies = new Array<Enemy>();
    }

    registerEventHandler(): void {
        throw new Error("Method not implemented.");
    }
}