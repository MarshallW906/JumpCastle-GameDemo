import * as Babylon from "@babylonjs/core";
// import * as Material from "@babylonjs/materials";

import * as _ from "lodash";

// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";
import { SceneController } from "./scene";
import * as MyTypes from "./types";
import { Buff } from "./buff";
import { EventDispatcher } from "./event_dispatcher";
import { Enemy } from "./enemy";

class MapBlock implements MyTypes.EventPublisher {
    /**
     * 
     * @param id 
     * @param name 
     * @param mapBlockInfo 
     */
    constructor(id: number, name: string, mapBlockInfo: MyTypes.MapBlockInfo) {
        this._id = id;
        this._name = name;
        this._type = mapBlockInfo.type;
        this.initMesh({ width: mapBlockInfo.length, height: 0.2, depth: 10 }, mapBlockInfo.location);
        if (mapBlockInfo.type & MyTypes.MapBlockType.Plain) {
            this.initAttributes(mapBlockInfo.attributes);
        }
        this.initEventDetector();

        // create corresponding MapBlockEdge
        let location = mapBlockInfo.location;
        let mapBlockEdgeLeft: Babylon.Vector3 = new Babylon.Vector3(location.x + 0.5 * mapBlockInfo.length, location.y, location.z);
        let mapBlockEdgeRight: Babylon.Vector3 = new Babylon.Vector3(location.x - 0.5 * mapBlockInfo.length, location.y, location.z);
        SceneController.getInstance().mapBlockEdgeFactory.createNewMapBlockEdge(mapBlockEdgeLeft);
        SceneController.getInstance().mapBlockEdgeFactory.createNewMapBlockEdge(mapBlockEdgeRight);
    }

    private _id: number;
    get id(): number { return this._id; }
    private _name: string;
    get name(): string { return this._name; }

    private _mesh: Babylon.Mesh;

    // interface ObjectWithMeshEntity
    // now initMesh might need some params, so this interface might be changed

    initMesh(size: MyTypes.MapBlockSize, location: Babylon.Vector3): void {
        if (location.z != 0) {
            throw Error("MapBlock location.z is not 0 !");
        }
        let gameScene = SceneController.getInstance().gameScene;
        this._mesh = Babylon.MeshBuilder.CreateBox(this._name, size, gameScene);
        this._mesh.physicsImpostor = new Babylon.PhysicsImpostor(this._mesh, Babylon.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0, friction: 0 }, gameScene);
        this._mesh.position = location;

        if (this._type == MyTypes.MapBlockType.Plain) return;

        if (this._type & MyTypes.MapBlockType.Trap) {
            console.log(this._name, "is also a Trap. Currently not implemented yet..");
        }
        if (this._type & MyTypes.MapBlockType.Modifier) {
            console.log(this._name, "is also a Trap. Currently not implemented yet..");
        }
    }

    destroyMesh(): void {
        if (this._mesh !== undefined) {
            this._mesh.dispose();
        }
    };

    // other attributes
    private _type: number; // Plain, Trap, Modifier, (or combination of these types, use |(or) )
    private _damage: number;
    private _modifiers: Array<Buff>;

    initAttributes(blockAttributes: MyTypes.MapBlockAttributes): void {
        if (this._type & MyTypes.MapBlockType.Trap) {
            this._damage = blockAttributes.damagePerSecond;
        }
        if (this._type & MyTypes.MapBlockType.Modifier) {
            this._modifiers = blockAttributes.buffs;
        }
    }

    initEventDetector(): void {
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
                console.log("MapBlock collide with Player, OnIntersectionEnterTrigger");
                EventDispatcher.getInstance().receiveEvent(MyTypes.EventType.MapBlockCollideWithPlayer, {
                    object: that,
                    message: "MapBlock Collide With Player"
                });
            })
        );
    }

    // static functions

    /**
     * the return type is a MapBlockInfo (interface)
     */
    static getPlainMapBlockInfo(length: number, location: Babylon.Vector3): MyTypes.MapBlockInfo {
        return {
            type: MyTypes.MapBlockType.Plain,
            length: length,
            location: location,
            attributes: {}
        }
    }

    static createSimpleBoxImposter(mesh: any): Babylon.PhysicsImpostor {
        return new Babylon.PhysicsImpostor(mesh, Babylon.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0, friction: 0 }, SceneController.getInstance().gameScene);
    }
}

export class GameMap implements MyTypes.EventSubscriber {
    private _gameScene = SceneController.getInstance().gameScene;
    private _mapBlockList: Array<MapBlock>;
    private _mapInfo: Array<MyTypes.MapBlockInfo>;

    private _teleportPointInfo: Array<Babylon.Vector3>;
    private _teleportPointsUnlocked: Array<boolean>;
    get teleportPointsUnlocked(): Array<boolean> { return this._teleportPointsUnlocked; }
    private _teleportPoints: Array<TeleportPoint>;
    get teleportPoint(): Array<TeleportPoint> { return this._teleportPoints; }

    constructor() {
        this._mapBlockList = new Array<MapBlock>();
        this._mapInfo = new Array<MyTypes.MapBlockInfo>();

        this._teleportPointInfo = new Array<Babylon.Vector3>();
        this._teleportPointsUnlocked = new Array<boolean>();
        this._teleportPoints = new Array<TeleportPoint>();
    }

    private initMapInfo(): void {
        // plain MapBlocks
        this._mapInfo.push(MapBlock.getPlainMapBlockInfo(10, new Babylon.Vector3(15, 5, 0)));
        this._mapInfo.push(MapBlock.getPlainMapBlockInfo(10, Babylon.Vector3.Zero()));

        // Teleport Points
        this._teleportPointInfo.push(new Babylon.Vector3(2, 0.5, 0));
        this._teleportPointInfo.push(new Babylon.Vector3(15, 5.5, 0));
    };

    private createNewMapBlock(mapBlockInfo: MyTypes.MapBlockInfo): void {
        let blockTypeNameArray = new Array<string>();
        blockTypeNameArray.push("MapBlock");

        if (mapBlockInfo.type == MyTypes.MapBlockType.Plain) {
            blockTypeNameArray.push("Plain");
        } else {
            if (mapBlockInfo.type | MyTypes.MapBlockType.Trap) {
                blockTypeNameArray.push("Trap");
            }
            if (mapBlockInfo.type | MyTypes.MapBlockType.Modifier) {
                blockTypeNameArray.push("Modifier");
            }
        }
        blockTypeNameArray.push(this._mapBlockList.length.toString());

        let newBlockName = _.join(blockTypeNameArray, '-');
        this._mapBlockList.push(new MapBlock(this._mapBlockList.length, newBlockName, mapBlockInfo));
    }

    private createNewTeleportPoint(location: Babylon.Vector3): void {
        let newTeleportPointId = this._teleportPoints.length;
        let newTeleportPointName = _.join(["TeleportPoint", newTeleportPointId], '-');
        this._teleportPoints.push(new TeleportPoint(newTeleportPointId, newTeleportPointName, location));
    }

    private initCurrentMapBlocks(): void {
        this._mapInfo.forEach((mapBlockInfo: MyTypes.MapBlockInfo) => {
            this.createNewMapBlock(mapBlockInfo);
        });
    }

    private initTeleportPoints(): void {
        this._teleportPointInfo.forEach((location: Babylon.Vector3) => {
            this.createNewTeleportPoint(location);
        });
    }

    initMap(): void {
        this.initMapInfo();
        this.initCurrentMapBlocks();
        this.initTeleportPoints();

        this.registerEventHandler();
    }

    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.PlayerEnterTeleportPoint, GameMap.getFnOnPlayerEnterTeleportPoint(this));
    }

    static getFnOnPlayerEnterTeleportPoint(gameMap: GameMap): MyTypes.EventHandler {
        return (eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            let teleportPointId = (<TeleportPoint>eventMessage.object).id;
            gameMap.teleportPointsUnlocked[teleportPointId] = true;
        }
    }

    test(): void {
        console.log("gamemap test");
        let ground = Babylon.Mesh.CreateGround("ground1", 10, 10, 10, this._gameScene);
        ground.physicsImpostor = new Babylon.PhysicsImpostor(ground, Babylon.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0, friction: 0 }, this._gameScene);


        let testground = Babylon.MeshBuilder.CreateBox("testground1", { width: 10, height: 0.2, depth: 10 }, this._gameScene);
        testground.physicsImpostor = new Babylon.PhysicsImpostor(testground, Babylon.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0, friction: 0 }, this._gameScene);
        testground.position.y = 5;
    }
}

class MapBlockEdge {
    constructor(id: number, name: string, location: Babylon.Vector3) {
        this.initMesh(id, name, location);
    }

    _mesh: Babylon.Mesh;
    get mesh(): Babylon.Mesh { return this._mesh; }

    initMesh(id: number, name: string, location: Babylon.Vector3) {
        this._mesh = Babylon.MeshBuilder.CreateBox(name, { width: 1, height: 3, depth: 10 }, SceneController.getInstance().gameScene);
        this._mesh.isVisible = false;
        this._mesh.position = location;
    }
}

export class MapBlockEdgeFactory implements MyTypes.EventPublisher {
    private _blockEdges: Array<MapBlockEdge>;
    get blockEdges(): Array<MapBlockEdge> { return this._blockEdges; }

    constructor() {
        this._blockEdges = new Array<MapBlockEdge>();

        this.initEventDetector();
    }

    createNewMapBlockEdge(location: Babylon.Vector3) {
        let id = this._blockEdges.length;
        let name = _.join(['MapBlockEdge', id.toString()], '-');
        this._blockEdges.push(new MapBlockEdge(id, name, location));
    }

    initEventDetector(): void {
        let that = this;
        SceneController.getInstance().gameScene.registerBeforeRender(() => {
            let enemies = SceneController.getInstance().enemyFactory.enemies;
            that._blockEdges.forEach((blockEdge: MapBlockEdge) => {
                if (blockEdge == undefined) return;
                enemies.forEach((enemy: Enemy) => {
                    if (enemy == undefined) return;

                    if (blockEdge.mesh.intersectsMesh(enemy.mesh)) {
                        EventDispatcher.getInstance().receiveEvent(MyTypes.EventType.EnemyReachesMapBlockEdge, {
                            object: enemy,
                            message: "An enemy reaches MapBlockEdge"
                        })
                    }
                });
            });
        });
    }
}

export class TeleportPoint implements MyTypes.EventPublisher, MyTypes.EventSubscriber {
    constructor(id: number, name: string, location: Babylon.Vector3) {
        this._id = id;
        this._name = name;

        this.initMesh(location);

        this.initEventDetector();
        this.registerEventHandler();
    }

    private _id: number;
    get id(): number { return this._id; }
    private _name: string;
    private _mesh: Babylon.Mesh;
    get mesh(): Babylon.Mesh { return this._mesh; }

    activated: boolean;

    initMesh(location: Babylon.Vector3) {
        this._mesh = Babylon.MeshBuilder.CreateBox(this._name, { width: 1.5, height: 1.5, depth: 5 }, SceneController.getInstance().gameScene);
        this._mesh.position = location;

        // this._mesh.isVisible = false;
    }

    initEventDetector(): void {
        let that = this;
        this._mesh.actionManager = new Babylon.ActionManager(SceneController.getInstance().gameScene);

        // player enter teleport point
        this._mesh.actionManager.registerAction(
            new Babylon.ExecuteCodeAction({
                trigger: Babylon.ActionManager.OnIntersectionEnterTrigger,
                parameter: {
                    mesh: SceneController.getInstance().player.playerMesh,
                    usePreciseIntersection: true
                }
            }, (evt: Babylon.ActionEvent) => {
                EventDispatcher.getInstance().receiveEvent(MyTypes.EventType.PlayerEnterTeleportPoint, {
                    object: that,
                    message: "Player enters a teleport point"
                });
            })
        );
        // player exit teleport point
        this._mesh.actionManager.registerAction(
            new Babylon.ExecuteCodeAction({
                trigger: Babylon.ActionManager.OnIntersectionExitTrigger,
                parameter: {
                    mesh: SceneController.getInstance().player.playerMesh,
                    usePreciseIntersection: true
                }
            }, (evt: Babylon.ActionEvent) => {
                EventDispatcher.getInstance().receiveEvent(MyTypes.EventType.PlayerExitTeleportPoint, {
                    object: that,
                    message: "Player exits a teleport point"
                })
            })
        );
    }

    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.PlayerEnterTeleportPoint, TeleportPoint.getFnOnPlayerEnter(this));
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.PlayerExitTeleportPoint, TeleportPoint.getFnOnPlayerExit(this));
    }

    static getFnOnPlayerEnter(teleportPoint: TeleportPoint): MyTypes.EventHandler {
        return (eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            let eventTeleportPoint = <TeleportPoint>eventMessage.object;
            if (eventTeleportPoint.id == teleportPoint.id) {
                if (!teleportPoint.activated) {
                    teleportPoint.activated = true;
                }
                // and may be a color change
            }
        }
    }

    static getFnOnPlayerExit(teleportPoint: TeleportPoint): MyTypes.EventHandler {
        return (eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            let eventTeleportPoint = <TeleportPoint>eventMessage.object;
            if (eventTeleportPoint.id == teleportPoint.id) {
                console.log(eventMessage.message);

                // maybe a color change
            }
        }
    }
}