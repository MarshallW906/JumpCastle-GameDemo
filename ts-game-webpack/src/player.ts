import * as Babylon from "@babylonjs/core";
import * as Material from "@babylonjs/materials";
// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";

import * as MyTypes from './types'
import { SceneController } from './scene';
import { EventDispatcher } from "./event_dispatcher";
import { Enemy } from "./enemy";
import { Item } from "./item";
import { TeleportPoint } from "./game_map";


export class Player implements MyTypes.ObjectWithMeshEntity, MyTypes.Creature, MyTypes.Ticker, MyTypes.EventSubscriber {
    // interface Ticker
    tick_interval: number;
    tick(): void { }

    // interface Creature
    HP: number
    addHP(quantity: number): void { this.HP += quantity; }
    subtractHP(quantity: number): void { this.HP -= quantity; }

    SP: number
    SPRecoverSpeed: number
    addSP(quantity: number): void { this.SP += quantity; }
    subtractSP(quantity: number): void { this.SP -= quantity; }

    moveSpeed: number
    addMoveSpeed(quantity: number): void { this.moveSpeed += quantity; }
    subtractMoveSpeed(quantity: number): void { this.moveSpeed -= quantity; }

    attackDamage: number
    addAttackDamage(quantity: number): void { this.attackDamage += quantity; }
    subtractAttackDamage(quantity: number): void { this.attackDamage -= quantity; }

    attack(): void {
        SceneController.getInstance().bulletFactory.createNewBullet(
            this.attackDamage, this._playerMesh.position, this.currentDirection);
    }

    initProperties(): void {
        this.HP = 100;
        this.SP = 100;
        this.SPRecoverSpeed = 0;
        this.moveSpeed = 0.3;
        this.attackDamage = 30;
        this.gold = 0;
        this.soul = 0;

        this._curTeleportPointId = undefined;
        this._canTeleport = false;
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

        let that = this;
        this._gameScene.registerBeforeRender(() => {
            that.playerMesh.physicsImpostor.setAngularVelocity(Babylon.Vector3.Zero());
        })
    }
    destroyMesh(): void {
        if (this._playerMesh !== undefined) {
            this._playerMesh.dispose();
        }
    }

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

    registerBeforeRenderFuncs(): void {
        let that = this;
        this._gameScene.registerBeforeRender(() => {
            if (that.keyMapStates.get('a') || that.keyMapStates.get('A')) {
                console.log("A. Move to Left");
                that.move(MyTypes.MoveDirection.Left);
            }
            if (that.keyMapStates.get('d') || that.keyMapStates.get('D')) {
                console.log("D. Move to Right");
                that.move(MyTypes.MoveDirection.Right);
            }
        })
    }

    // --------------------
    // Player

    init(): void {
        this.initProperties();
        this.initMesh();
        this.registerKeyboardActions();
        this.registerBeforeRenderFuncs();
        this.registerEventHandler();
    }

    gold: number;
    addGold(quantity: number): void { this.gold += quantity; }

    soul: number;
    addSoul(quantity: number): void { this.soul += quantity; }

    items: MyTypes.ItemCollection;

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
            // console.log(that._playerMesh.physicsImpostor.getLinearVelocity());
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

    currentDirection: MyTypes.MoveDirection;
    /**
     * Currently Left means to add position.x, Right means to subtract position.x.
     * Might change the camera settings to "Left = subtract, Right = add"
     * @param direction 
     */
    move(direction: MyTypes.MoveDirection): void {
        switch (direction) {
            case MyTypes.MoveDirection.Left:
                // move to left
                this._playerMesh.translate(Babylon.Axis.X, this.moveSpeed, Babylon.Space.WORLD);
                this.currentDirection = MyTypes.MoveDirection.Left;
                break;
            case MyTypes.MoveDirection.Right:
                // move to right
                this._playerMesh.translate(Babylon.Axis.X, this.moveSpeed * -1, Babylon.Space.WORLD);
                this.currentDirection = MyTypes.MoveDirection.Right;
                break;
        }
    }

    // teleport
    _canTeleport: boolean;
    get canTeleport(): boolean { return this._canTeleport; }
    _curTeleportPointId: number | undefined;

    teleportToPreviousPortal(): void {
        if (!this._canTeleport) return;
        if (this._curTeleportPointId == undefined) return;

        let teleportUnlocked = SceneController.getInstance().gameMap.teleportPointsUnlocked;
        let nextTeleportId = this._curTeleportPointId;

        for (let i = this._curTeleportPointId - 1; i >= 0; --i) {
            if (teleportUnlocked[i]) {
                nextTeleportId = i;
                break;
            }
        }
        if (nextTeleportId != this._curTeleportPointId) {
            this._playerMesh.position = SceneController.getInstance().gameMap.teleportPoint[nextTeleportId].mesh.position;
        }
    }
    teleportToNextPortal(): void {
        if (!this._canTeleport) return;
        if (this._curTeleportPointId == undefined) return;

        let teleportUnlocked = SceneController.getInstance().gameMap.teleportPointsUnlocked;
        let nextTeleportId = this._curTeleportPointId;

        for (let i = this._curTeleportPointId + 1; i < teleportUnlocked.length; ++i) {
            if (teleportUnlocked[i]) {
                nextTeleportId = i;
                break;
            }
        }

        if (nextTeleportId != this._curTeleportPointId) {
            this._playerMesh.position = SceneController.getInstance().gameMap.teleportPoint[nextTeleportId].mesh.position;
        }
    }

    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.MapBlockCollideWithPlayer, Player.getFnOnCollideWithNormalMapBlock(this));
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.EnemyCollideWithPlayer, Player.getFnOnCollideWithEnemy(this));
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.EnemyDead, Player.getFnOnEnemyDead(this));
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.ItemCollideWithPlayer, Player.getFnOnCollideWithItem(this));
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.PlayerEnterTeleportPoint, Player.getFnOnPlayerEnterTeleportPoint(this));
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.PlayerExitTeleportPoint, Player.getFnOnPlayerExitTeleportPoint(this));
    }

    // event handler
    static getFnOnCollideWithEnemy(player: Player): MyTypes.EventHandler {
        return <MyTypes.EventHandler>((eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            if (player != SceneController.getInstance().player) return;

            player.subtractHP((<Enemy>eventMessage.object).attackDamage);
            console.log("Player current HP:", player.HP);
        });
    }

    static getFnOnCollideWithNormalMapBlock(player: Player) {
        return <MyTypes.EventHandler>((eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            console.log("Event handler from player: Mapblock collide with player")
            if (player != SceneController.getInstance().player) return;

            player.resetJumpState();
        })
    }

    static getFnOnCollideWithItem(player: Player): MyTypes.EventHandler {
        return <MyTypes.EventHandler>((eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            if (player != SceneController.getInstance().player) return;

            let item = <Item>(eventMessage.object);
            switch (item.type) {
                case MyTypes.ItemType.HPRecovery:
                    player.addHP(item.quantity);
                    console.log("current Player HP,", player.HP);
                    break;
                case MyTypes.ItemType.SPRecovery:
                    player.addSP(item.quantity);
                    console.log("current Player SP,", player.SP);
                    break;
                case MyTypes.ItemType.SoulBall:
                    player.addSoul(item.quantity);
                    console.log("current Player Soul", player.soul);
                    break;
            }

        });
    }

    static getFnOnEnemyDead(player: Player) {
        return <MyTypes.EventHandler>((eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            if (player != SceneController.getInstance().player) return;

            player.gold += eventMessage.object.gold;
            console.log("player current gold", player.gold);
            // player.items, concat with eventMessage.object.items
        })
    }

    static getFnOnPlayerEnterTeleportPoint(player: Player): MyTypes.EventHandler {
        return <MyTypes.EventHandler>((eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            console.log("Player. OnPlayerEnterTeleportPoint");
            if (player != SceneController.getInstance().player) return;

            player._canTeleport = true;
            player._curTeleportPointId = (<TeleportPoint>eventMessage.object).id;
            console.log("Player.canTeleport = true");
        })
    }

    static getFnOnPlayerExitTeleportPoint(player: Player): MyTypes.EventHandler {
        return <MyTypes.EventHandler>((eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            if (player != SceneController.getInstance().player) return;

            player._canTeleport = false;
            player._curTeleportPointId = undefined;
            console.log("Player.canTeleport = false");
        })
    }
}
