import * as Babylon from "@babylonjs/core";
import * as _ from "lodash"

import * as MyTypes from "./types";
import { SceneController } from "./scene";
import { EventDispatcher } from "./event_dispatcher";
import { AutoRotationBehavior } from "@babylonjs/core";

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

    private _isBoss: boolean;
    get isBoss(): boolean { return this._isBoss; }

    constructor(id: number, name: string, enemyInfo: MyTypes.EnemyInfo) {
        this._id = id;
        this._name = name;

        this._isBoss = false;
        if (enemyInfo.isBoss != undefined) {
            this._isBoss = enemyInfo.isBoss;
        }
        this.initProperties(Enemy.getEnemyPropertiesByEnemyType(enemyInfo.type, this._isBoss));
        this.initMesh(enemyInfo.location);

        this.initEventDetector();
        this.registerEventHandler();
    }

    initProperties(properties: MyTypes.EnemyProperties): void {
        this.HP = properties.maxHP;
        this.moveSpeed = properties.moveSpeed;
        this.attackDamage = properties.attackDamage;
        this.gold = properties.gold;
        this._size = properties.size;
        this.items = properties.items;

        this.currentDirection = MyTypes.MoveDirection.Left;
    }

    private _id: number;
    get id(): number { return this._id; }
    private _name: string;
    private _mesh: Babylon.Mesh;
    get mesh(): Babylon.Mesh { return this._mesh; }

    private _size: MyTypes.EnemySize;

    initMesh(location: Babylon.Vector3): void {
        this._mesh = Babylon.MeshBuilder.CreateBox(this._name, this._size, SceneController.getInstance().gameScene);
        this._mesh.position = location;
    }

    destroyMesh(): void {
        if (this._mesh !== undefined) {
            this._mesh.dispose();
        }
    }

    animate(): void {
        this.move(this.currentDirection);
    }

    currentDirection: MyTypes.MoveDirection;

    move(direction: MyTypes.MoveDirection): void {
        switch (direction) {
            case MyTypes.MoveDirection.Left:
                // move to left
                this._mesh.translate(Babylon.Axis.X, this.moveSpeed, Babylon.Space.WORLD);
                break;
            case MyTypes.MoveDirection.Right:
                // move to right
                this._mesh.translate(Babylon.Axis.X, this.moveSpeed * -1, Babylon.Space.WORLD);
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

    static getEnemyPropertiesByEnemyType(enemyType: MyTypes.EnemyType, isBoss: boolean): MyTypes.EnemyProperties {
        switch (enemyType) {
            case MyTypes.EnemyType.NormalSolider:
                if (isBoss) {
                    return {
                        maxHP: 200,
                        moveSpeed: 0.15,
                        attackDamage: 10,
                        gold: 200,
                        items: undefined,
                        size: { width: 3, height: 3, depth: 3 },
                    }
                } else {
                    return {
                        maxHP: 100,
                        moveSpeed: 0.1,
                        attackDamage: 5,
                        gold: 25,
                        items: undefined,
                        size: { width: 0.5, height: 0.5, depth: 0.5 },
                    }
                }
            // break;
        }
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
                // console.log("enemy collide with player");
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
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.EnemyReachesMapBlockEdge, Enemy.getFnOnReachesMapBlockEdge(this));
    }

    // event handler
    static getFnOnCollideWithBullets(enemy: Enemy): MyTypes.EventHandler {
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

    static getFnOnReachesMapBlockEdge(enemy: Enemy): MyTypes.EventHandler {
        return (eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            if (enemy == undefined) return;
            if (enemy.id == eventMessage.object.id) {
                enemy.currentDirection = enemy.currentDirection == MyTypes.MoveDirection.Left ?
                    MyTypes.MoveDirection.Right : MyTypes.MoveDirection.Left;
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
        // this.createNewEnemy(new Babylon.Vector3(-4, 0.5, 0));
    }

    createNewEnemy(enemyInfo: MyTypes.EnemyInfo) {
        let newEnemyId = this._enemies.length;
        let newEnemyName = _.join(["Enemy", newEnemyId.toString()], '-');
        this._enemies.push(new Enemy(newEnemyId, newEnemyName, enemyInfo));
    }

    removeEnemyById(enemyId: number): void {
        delete (this._enemies[enemyId]);
    }

    createEnemiesByEnemyInfo(enemyInfoArray: Array<MyTypes.EnemyInfo>): void {
        enemyInfoArray.forEach((enemyInfo: MyTypes.EnemyInfo) => {
            this.createNewEnemy(enemyInfo);
        })
    }

    static getFnAnimateAllEnemies(enemyFactory: EnemyFactory): () => void {
        return () => {
            if (enemyFactory == undefined) return;

            enemyFactory.enemies.forEach((enemy) => {
                if (enemy !== undefined) {
                    enemy.animate();
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