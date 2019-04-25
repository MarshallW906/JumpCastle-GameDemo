import * as Babylon from "@babylonjs/core";
import * as Material from "@babylonjs/materials";
// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";

import { Creature, Ticker, EventHandler, ItemCollection, NoReturnValFunc, ObjectWithMeshEntity, MoveDirection, EventType, EventMessage, EventSubscriber } from './types'
import { SceneController } from './scene';
import { EventDispatcher } from "./event_dispatcher";


export class Player implements ObjectWithMeshEntity, Creature, Ticker, EventSubscriber {
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

    initProperties(): void {
        this.HP = 100;
        this.SP = 100;
        this.SPRecoverSpeed = 0;
        this.moveSpeed = 0.3;
        this.attackDamage = 5;
    }

    // interface ObjectWithMeshEntity
    private _playerMesh: Babylon.Mesh;
    get playerMesh(): Babylon.Mesh { return this._playerMesh; }
    private normalGridMaterial: any;
    private _gameScene: Babylon.Scene = SceneController.getInstance().gameScene;

    initMesh(): void {
        // this._playerMesh = Babylon.MeshBuilder.CreateSphere("Player", {}, this._gameScene);
        // this.normalGridMaterial = new Material.GridMaterial("PlayerGridMaterial", this._gameScene);
        // this._playerMesh.material = this.normalGridMaterial;
        // this._playerMesh = Babylon.Mesh.CreateSphere("PlayerSphere", 8, 2, this._gameScene);
        this._playerMesh = Babylon.Mesh.CreateBox("PlayerBox", 1, this._gameScene);
        this._playerMesh.position.y = 3;
        this._playerMesh.physicsImpostor = new Babylon.PhysicsImpostor(this._playerMesh, Babylon.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0, friction: 0 }, this._gameScene);
    }
    destroy: NoReturnValFunc;

    private keyMapStates: Map<string, boolean>;
    private registerKeyboardActions(): void {
        // no need to register both the Upper&Lower case manually. Babylon handles it automatically.

        console.log('register keyborad inputs');
        this.keyMapStates = new Map<string, boolean>();
        this._gameScene.actionManager = new Babylon.ActionManager(this._gameScene);

        let that = this;
        function createKeyUpAndDownActions(keyName: string, callbackKeyDown: (evt: any) => void, callbackKeyUp: (evt: any) => void): void {
            createKeyUpAction(keyName, callbackKeyUp);
            createkeyDownAction(keyName, callbackKeyDown);
        }
        function createKeyUpAction(keyName: string, callback: (evt: any) => void): void {
            that._gameScene.actionManager.registerAction(
                new Babylon.ExecuteCodeAction({
                    trigger: Babylon.ActionManager.OnKeyUpTrigger,
                    parameter: keyName
                }, callback)
            );
        }
        function createkeyDownAction(keyName: string, callback: (evt: any) => void): void {
            that._gameScene.actionManager.registerAction(
                new Babylon.ExecuteCodeAction({
                    trigger: Babylon.ActionManager.OnKeyDownTrigger,
                    parameter: keyName
                }, callback)
            );
        }

        function changeKeyStateFunc(evt: any): void {
            // console.log("change key state", evt.sourceEvent.key);
            that.keyMapStates.set(<string>evt.sourceEvent.key, evt.sourceEvent.type == "keydown");
        }

        // A/D: Move to left/right
        createKeyUpAndDownActions('A', changeKeyStateFunc, changeKeyStateFunc);
        createKeyUpAndDownActions('D', changeKeyStateFunc, changeKeyStateFunc);

        // W/S: W+K = high jump, S+K = long(and rapid) jump
        createKeyUpAndDownActions('W', changeKeyStateFunc, changeKeyStateFunc);
        createKeyUpAndDownActions('S', changeKeyStateFunc, changeKeyStateFunc);

        // J: attack
        createKeyUpAction('J', (evt: any) => {
            console.log('J/j was pressed. Call player.attack().');
            that.attack();
        });

        // K: jump
        createKeyUpAction('K', (evt: any) => {
            console.log('K/k was pressed. Call player.jump().');
            that.jump();
        });

        // space: force shield. Makes the player invulnerable for 2 seconds.
        createKeyUpAction(' ', (evt: any) => {
            console.log('space was pressed. Call player.shield().');
            that.shield();
        })

        // F: purchase item.
        createKeyUpAction('F', (evt: any) => {
            console.log('F/f was pressed. Purchase Item.');
            // purchase Item
        });

        // R/T: move to previous/next teleport point (if applicable)
        createKeyUpAction('Q', (evt: any) => {
            console.log("Q/q was pressed. Call Player.teleportToPreviousPortal().");
            that.teleportToPreviousPortal();
        });
        createKeyUpAction('E', (evt: any) => {
            console.log("E/e was pressed. Call Player.teleportToNextPortal().");
            that.teleportToNextPortal();
        });
    }

    registerAfterRenderFuncs(): void {
        let that = this;
        this._gameScene.registerBeforeRender(() => {
            if (that.keyMapStates.get('a') || that.keyMapStates.get('A')) {
                console.log("A. Move to Left");
                that.move(MoveDirection.Left);
            }
            if (that.keyMapStates.get('d') || that.keyMapStates.get('D')) {
                console.log("D. Move to Right");
                that.move(MoveDirection.Right);
            }
        })
    }

    // --------------------
    // Player

    init(): void {
        this.initProperties();
        this.initMesh();
        this.registerKeyboardActions();
        this.registerAfterRenderFuncs();
        this.registerEventHandler();
    }

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
    jump(): void {
        let that = this;
        function performJump(): void {
            let velocity: Babylon.Vector3 = new Babylon.Vector3(0, 7, 0);
            if (that.keyMapStates.get('W') || that.keyMapStates.get('w')) {
                velocity.y += 3; // 10
            }
            if (that.keyMapStates.get('S') || that.keyMapStates.get('s')) {
                if (that.keyMapStates.get('a') || that.keyMapStates.get('A')) {
                    velocity.x += 3;
                }
                if (that.keyMapStates.get('d') || that.keyMapStates.get('D')) {
                    velocity.x += -3;
                }
            }
            that._playerMesh.physicsImpostor.setLinearVelocity(velocity);
            console.log(that._playerMesh.physicsImpostor.getLinearVelocity());
        }

        // performJump();

        // real jump() code
        if (this._firstJump && this._secondJump) {
            return;
        }
        if (!this._firstJump) {
            this._firstJump = true;
            performJump();
        } else if (!this._secondJump) { // when firstJump is true, test secondJump
            this._secondJump = true;
            performJump();
        }
        // */
    }
    private _firstJump: boolean;
    private _secondJump: boolean;
    resetJumpState(): void {
        this._firstJump = false;
        this._secondJump = false;
    }

    // shield
    shield(): void { }

    /**
     * Currently Left means to add position.x, Right means to subtract position.x.
     * Might change the camera settings to "Left = subtract, Right = add"
     * @param direction 
     */
    move(direction: MoveDirection): void {
        switch (direction) {
            case MoveDirection.Left:
                // move to left
                this._playerMesh.translate(Babylon.Axis.X, this.moveSpeed, Babylon.Space.WORLD);
                break;
            case MoveDirection.Right:
                // move to right
                this._playerMesh.translate(Babylon.Axis.X, this.moveSpeed * -1, Babylon.Space.WORLD);
                break;
        }
    }

    // teleport
    teleportToPreviousPortal(): void { }
    teleportToNextPortal(): void { }

    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(EventType.MapBlockCollideWithPlayer, Player.getFnOnCollideWithNormalMapBlock(this));
    }

    // event handler
    private onCollideWithMonster: EventHandler;
    static getFnOnCollideWithNormalMapBlock(object: any) {
        return (eventType: EventType, eventMessage: EventMessage) => {
            console.log("Event handler Mapblock collide with player")
            if (object != SceneController.getInstance().player) return;

            <Player>object.resetJumpState();
        }
    }
    // private onCollideWithSpecialMapBlock: EventHandler;
    private onCollideWithItem: EventHandler;
    private onCollideWithSoulball: EventHandler;
    private onCollideWithTeleportPoint: EventHandler;
}
