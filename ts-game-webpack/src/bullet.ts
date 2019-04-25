import * as Babylon from "@babylonjs/core";
import * as _ from "lodash";

import { SceneController } from "./scene";
import * as MyTypes from "./types";
import { EventDispatcher } from "./event_dispatcher";

export class Bullet implements MyTypes.EventSubscriber {
    private _id: number;
    get id(): number { return this._id; }
    private _name: string;
    private _damage: number;
    get damage(): number { return this._damage; }

    private _mesh: Babylon.Mesh;
    get mesh(): Babylon.Mesh { return this._mesh; }

    private _moveSpeed: number;

    private _moveDirection: MyTypes.MoveDirection;

    constructor(id: number, name: string, damage: number, location: Babylon.Vector3, moveDirection: MyTypes.MoveDirection) {
        this._id = id;
        this._name = name;
        this._damage = damage;
        this._moveDirection = moveDirection
        this._moveSpeed = 0.8;

        this.initMesh(location);
        this.registerEventHandler();
        this.setTimerSelfDestroy();
    }

    private initMesh(location: Babylon.Vector3) {
        this._mesh = Babylon.Mesh.CreateSphere(this._name, 16, 0.3, SceneController.getInstance().gameScene);
        // set collider
        // set color
        this._mesh.position = location;
    }

    animate(): void {
        this._mesh.translate(Babylon.Axis.X,
            this._moveDirection == MyTypes.MoveDirection.Left ? this._moveSpeed : -this._moveSpeed,
            Babylon.Space.WORLD);
    }

    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.BulletCollideWithEnemy, Bullet.getFnOnCollideWithEnemy(this));
    }

    setTimerSelfDestroy(): void {
        // destory this bullet 5s later
        let that = this;
        setTimeout(() => {
            if (that !== undefined && that._mesh !== undefined) {
                that._mesh.dispose();
            }
        }, 5000);
    }

    static getFnOnCollideWithEnemy(object: any) {
        return (eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            if (object == undefined) return;
            if (eventMessage.object.bullet.id == object.id) {
                // object.mesh.dispose();
                setTimeout(() => {
                    (<Bullet>object).mesh.dispose(); // might have some post-error
                }, 100);
            }
        }
    }
}

/**
 * registers a render func, which animates all the bullets
 */
export class BulletFactory implements MyTypes.EventPublisher, MyTypes.EventSubscriber {
    private _bullets: Array<Bullet>;
    get bullets(): Array<Bullet> { return this._bullets; }

    constructor() {
        this._bullets = new Array<Bullet>();

        this.initEventDetector();
        this.registerEventHandler();

        SceneController.getInstance().gameScene.registerBeforeRender(BulletFactory.getFnAnimateAllBullets(this));
    }

    test() {
        let player = SceneController.getInstance().player;
        this.createNewBullet(player.attackDamage, player.playerMesh.position.add(Babylon.Vector3.Left()), MyTypes.MoveDirection.Left);
    }

    createNewBullet(damage: number, location: Babylon.Vector3, moveDirection: MyTypes.MoveDirection): void {
        let newBulletId = this._bullets.length;
        let name = _.join(["Bullet", newBulletId.toString()], '-');
        this._bullets.push(new Bullet(newBulletId, name, damage, location, moveDirection));

        let that = this;
        setTimeout(() => {
            if (that.bullets[newBulletId] != undefined) {
                that.destroyBulletById(newBulletId);
            }
        }, 5050);
    }

    /**
     * This sets the _bullets[bulletId] to undefined. So the index incrementation will not be affected.
     * @param bulletId bullet's index in _bullets
     */
    destroyBulletById(bulletId: number) {
        delete this._bullets[bulletId];
    }

    static getFnAnimateAllBullets(object: BulletFactory): () => void {
        return () => {
            object._bullets.forEach((bullet) => {
                if (bullet !== undefined && bullet.mesh !== undefined) {
                    bullet.animate();
                }
            })
        }
    }

    initEventDetector(): void {
        let that = this;
        SceneController.getInstance().gameScene.registerBeforeRender(() => {
            let enemies = SceneController.getInstance().enemyFactory.enemies;
            that._bullets.forEach((bullet: Bullet) => {
                if (bullet == undefined) return;
                enemies.every((enemy) => {
                    if (enemy == undefined) return true;
                    if (bullet.mesh.intersectsMesh(enemy.mesh)) {
                        EventDispatcher.getInstance().receiveEvent(MyTypes.EventType.BulletCollideWithEnemy, {
                            object: {
                                bullet: bullet,
                                enemy: enemy
                            },
                            message: "Bullet Collide With Enemy"
                        });
                        return false;
                    }
                    return true;
                });
            });
        });
    }

    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.BulletCollideWithEnemy, BulletFactory.getFnOnBulletCollideWithEnemy(this));
    }

    static getFnOnBulletCollideWithEnemy(object: any): MyTypes.EventHandler {
        return function (eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) {
            console.log(eventType, eventMessage);
            let bulletId = eventMessage.object.bullet.id;
            setTimeout(() => {
                object.destroyBulletById(bulletId);
            }, 120);
        }
    }
}
