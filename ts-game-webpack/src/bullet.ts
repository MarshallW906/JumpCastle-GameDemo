import * as Babylon from "@babylonjs/core";
import * as _ from "lodash";

import { SceneController } from "./scene";
import { EventSubscriber, EventPublisher, EventMessage, EventType, EventHandler } from "./types";
import { EventDispatcher } from "./event_dispatcher";

export class Bullet implements EventSubscriber {
    private _id: number;
    get id(): number { return this._id; }
    private _name: string;
    private _damage: number;
    get damage(): number { return this._damage; }

    private _mesh: Babylon.Mesh;
    get mesh(): Babylon.Mesh { return this._mesh; }

    constructor(id: number, name: string, damage: number, location: Babylon.Vector3) {
        this._id = id;
        this._name = name;
        this._damage = damage;

        this.initMesh(location);
    }

    private initMesh(location: Babylon.Vector3) {
        this._mesh = Babylon.Mesh.CreateSphere(this._name, 16, 0.3, SceneController.getInstance().gameScene);
        // set collider
        // set color
        this._mesh.position = location;
    }

    animate(): void { }

    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(EventType.BulletCollideWithEnemy, this.onCollideWithEnemy);
    }

    private onCollideWithEnemy(eventType: EventType, eventMessage: EventMessage): void {
        if (eventMessage.object.bullet.id == this._id) {
            this._mesh.dispose();
        }
    }
}

export class BulletFactory implements EventPublisher, EventSubscriber {
    private _bullets: Array<Bullet>;
    get bullets(): Array<Bullet> { return this._bullets; }

    constructor() {
        this._bullets = new Array<Bullet>();
    }

    test() {
        let player = SceneController.getInstance().player;
        this.createNewBullet(player.attackDamage, player.playerMesh.position.add(Babylon.Vector3.Left()));
    }

    createNewBullet(damage: number, location: Babylon.Vector3): void {
        let name = _.join(["Bullet", this._bullets.length.toString()], '-');
        this._bullets.push(new Bullet(this._bullets.length, name, damage, location));
    }

    /**
     * This sets the _bullets[bulletId] to undefined. So the index incrementation will not be affected.
     * @param bulletId bullet's index in _bullets
     */
    destroyBulletById(bulletId: number) {
        delete this._bullets[bulletId];
    }

    initEventDetector(): void {
        SceneController.getInstance().gameScene.registerBeforeRender(() => {
            let enemies = SceneController.getInstance().enemyFactory.enemies;
            this._bullets.forEach((bullet: Bullet) => {
                enemies.every((enemy) => {
                    if (bullet.mesh.intersectsMesh(enemy.mesh)) {
                        EventDispatcher.getInstance().receiveEvent(EventType.BulletCollideWithEnemy, {
                            object: {
                                bullet: bullet,
                                enemy: enemy
                            },
                            message: "Bullet Collide With Monster"
                        });
                        return false;
                    }
                });
            });
        });
    }

    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(EventType.BulletCollideWithEnemy, this.onBulletCollideWithEnemy);
    }

    private onBulletCollideWithEnemy(eventType: EventType, eventMessage: EventMessage) {
        console.log(eventType, eventMessage);

        this.destroyBulletById(eventMessage.object.enemy.id);
    }
}