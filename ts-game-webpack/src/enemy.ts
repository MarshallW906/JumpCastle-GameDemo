import * as Babylon from "@babylonjs/core";
import * as _ from "lodash"

import * as MyTypes from "./types";
import { SceneController } from "./scene";
import { EventDispatcher } from "./event_dispatcher";

export class Enemy implements MyTypes.Creature, MyTypes.Ticker, MyTypes.EventPublisher, MyTypes.EventSubscriber {
    // interface Ticker
    tick_interval: number;
    tick: MyTypes.NoReturnValFunc;

    // interface Creature
    HP: number;
    addHP(quantity: number): void { this.HP += quantity; }
    subtractHP(quantity: number): void { this.HP -= quantity }

    SP: number = 0;
    SPRecoverSpeed: number = 0;
    addSP: MyTypes.QuantityChangeFunc = MyTypes.QuantityChangeFuncNoOp;
    subtractSP: MyTypes.QuantityChangeFunc = MyTypes.QuantityChangeFuncNoOp;

    moveSpeed: number;
    addMoveSpeed(quantity: number): void { this.moveSpeed += quantity; }
    subtractMoveSpeed(quantity: number): void { this.moveSpeed -= quantity; }

    attackDamage: number;
    addAttackDamage(quantity: number): void { this.attackDamage += quantity; }
    subtractAttackDamage(quantity: number): void { this.attackDamage -= quantity; }
    attack: MyTypes.NoReturnValFunc = MyTypes.NoReturnValFuncNoOp;

    constructor(id: number, name: string, location: Babylon.Vector3) {
        this._id = id;
        this._name = name;

        this.initProperties();
        this.initMesh(location);

        this.initEventDetector();
        this.registerEventHandler();
    }

    initProperties(): void {
        this.HP = 100;
        this.moveSpeed = 0.1;
        this.attackDamage = 5;
        this.gold = 20;
        this.currentDirection = MyTypes.MoveDirection.Left;
    }

    private _id: number;
    get id(): number { return this._id; }
    private _name: string;
    private _mesh: Babylon.Mesh;
    get mesh(): Babylon.Mesh { return this._mesh; }
    // interface ObjectWithMeshEntity
    initMesh(location: Babylon.Vector3): void {
        this._mesh = Babylon.MeshBuilder.CreateBox(this._name, { width: 0.5, height: 0.5, depth: 0.5 }, SceneController.getInstance().gameScene);
        this._mesh.position = location;
    }

    destroyMesh(): void {
        if (this._mesh !== undefined) {
            this._mesh.dispose();
        }
    }

    animate(): void {
        // judge move direction, then move
        this.move(this.currentDirection);
    }

    currentDirection: MyTypes.MoveDirection;

    move(direction: MyTypes.MoveDirection): void {
        switch (direction) {
            case MyTypes.MoveDirection.Left:
                // move to left
                this._mesh.translate(Babylon.Axis.X, this.moveSpeed, Babylon.Space.WORLD);
                this.currentDirection = MyTypes.MoveDirection.Left;
                break;
            case MyTypes.MoveDirection.Right:
                // move to right
                this._mesh.translate(Babylon.Axis.X, this.moveSpeed * -1, Babylon.Space.WORLD);
                this.currentDirection = MyTypes.MoveDirection.Right;
                break;
        }
    }

    // --------------------
    // Enemy
    gold: number;

    items: MyTypes.ItemCollection;

    /**
     * sends an event.
     */
    onDead(): void {
        EventDispatcher.getInstance().receiveEvent(MyTypes.EventType.EnemyDead, {
            object: this,
            message: "An enemy is dead"
        });
    }

    initEventDetector(): void {
        // collide with player
        let that = this;
        this._mesh.actionManager = new Babylon.ActionManager(SceneController.getInstance().gameScene);
        this._mesh.actionManager.registerAction(
            new Babylon.ExecuteCodeAction({
                trigger: Babylon.ActionManager.OnIntersectionEnterTrigger,
                parameter: {
                    mesh: SceneController.getInstance().player.playerMesh,
                    usePreciseIntersection: true
                }
            }, (evt: Babylon.ActionEvent) => {
                console.log("enemy collide with player");
                EventDispatcher.getInstance().receiveEvent(MyTypes.EventType.EnemyCollideWithPlayer, {
                    object: that,
                    message: "Enemy collide with Player"
                })
            })
        );

        // collide with special map block? (optional....)
    }
    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.BulletCollideWithEnemy, Enemy.getFnOnCollideWithBullets(this));
        // EventDispatcher.getInstance().addEventHandler
    }

    // event handler
    static getFnOnCollideWithBullets(object: any): MyTypes.EventHandler {
        let enemy = <Enemy>object;
        return (eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            if (enemy == undefined) return;

            if (enemy.id == eventMessage.object.enemy.id) {
                enemy.subtractHP(eventMessage.object.bullet.damage);
                // check if object is dead (HP <= 0)
                if (enemy.HP <= 0) {
                    // this enemy is dead
                    enemy.destroyMesh();
                    enemy.onDead();
                }
            }
        }
    }
    // private onCollideWithSpecialMapBlock: EventHandler;
    // private onCollideWithNormalMapBlock: EventHandler;
}


export class EnemyFactory implements MyTypes.EventSubscriber {
    private _enemies: Array<Enemy>;
    get enemies(): Array<Enemy> { return this._enemies; }

    constructor() {
        this._enemies = new Array<Enemy>();

        this.registerEventHandler();
        SceneController.getInstance().gameScene.registerBeforeRender(EnemyFactory.getFnAnimateAllEnemies(this));
    }

    test(): void {
        this.createNewEnemy(new Babylon.Vector3(-4, 0.5, 0));
    }

    createNewEnemy(location: Babylon.Vector3) {
        let newEnemyId = this._enemies.length;
        let newEnemyName = _.join(["Enemy", newEnemyId.toString()], '-');
        this._enemies.push(new Enemy(newEnemyId, newEnemyName, location));
    }

    removeEnemyById(enemyId: number): void {
        delete (this._enemies[enemyId]);
    }

    static getFnAnimateAllEnemies(enemyFactory: EnemyFactory): () => void {
        return () => {
            if (enemyFactory == undefined) return;

            enemyFactory.enemies.forEach((enemy) => {
                if (enemy !== undefined) {
                    // enemy.animate();
                }
            });
        }
    }

    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.EnemyDead, EnemyFactory.getFnOnEnemyDead(this));
    }

    static getFnOnEnemyDead(object: any): MyTypes.EventHandler {
        let enemyFactory = <EnemyFactory>object;
        return (eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            let enemyId = eventMessage.object.id;
            enemyFactory.removeEnemyById(enemyId);
            console.log("An enemy is removed from enemyFactory._enemies.", enemyId, enemyFactory.enemies[enemyId]);
        }
    }
}