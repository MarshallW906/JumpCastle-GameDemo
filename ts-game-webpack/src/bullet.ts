import * as Babylon from "@babylonjs/core";
import * as _ from "lodash";

import { SceneController } from "./scene";

export class Bullet {
    private _id: number;
    get id(): number { return this._id; }
    private _name: string;
    private _damage: number;

    private _mesh: Babylon.Mesh;

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
}

export class BulletFactory {
    private _bullets: Array<Bullet>;

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
    destroyBullet(bulletId: number) {
        delete this._bullets[bulletId];
    }
}