import * as Babylon from "@babylonjs/core";
import * as Material from "@babylonjs/materials";
// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";

import { Creature, Ticker, EventHandler, ItemCollection, NoReturnValFunc, ObjectWithMeshEntity } from './types'
import { SceneController } from './scene';

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
    private _playerMesh: any;
    get playerMesh(): any { return this._playerMesh; }
    private normalGridMaterial: any;
    private _gameScene: any = SceneController.getInstance().gameScene;
    initMesh(): void {
        this._playerMesh = Babylon.MeshBuilder.CreateSphere("Player", {}, this._gameScene);
        this.normalGridMaterial = new Material.GridMaterial("PlayerGridMaterial", this._gameScene);
        this._playerMesh.material = this.normalGridMaterial;
        this._playerMesh.physicsImpostor = new Babylon.PhysicsImpostor(this._playerMesh, Babylon.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, this._gameScene);
    }
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
