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
import { Item } from "./item";

export class MapBlock implements MyTypes.EventPublisher {
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
        this._isVertical = mapBlockInfo.isVertical;
        if (this._isVertical !== undefined && this._isVertical == true) {
            this.initMesh({ width: 2.5, height: mapBlockInfo.length, depth: 10 }, mapBlockInfo.location)
        } else {
            this.initMesh({ width: mapBlockInfo.length, height: 1, depth: 10 }, mapBlockInfo.location);
        }
        if (mapBlockInfo.type !== MyTypes.MapBlockType.Plain) {
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
    private _isVertical: boolean | undefined;

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

        let material = new Babylon.StandardMaterial(_.join([this._name, "Material"], '-'), gameScene);

        if (this._type == MyTypes.MapBlockType.Plain) {
            material.diffuseColor = Babylon.Color3.Yellow();
        }

        // I didn't use a mixed color to represent a mixed type mapblock.
        // Will switch to another type of material.. which can mix different colors
        if (this._type & MyTypes.MapBlockType.Trap) {
            material.diffuseColor = Babylon.Color3.Red();
        }
        if (this._type & MyTypes.MapBlockType.Modifier) {
            material.diffuseColor = Babylon.Color3.Random();
        }
        this._mesh.material = material;
    }

    destroyMesh(): void {
        if (this._mesh !== undefined) {
            this._mesh.dispose();
        }
    };

    // other attributes
    private _type: number; // Plain, Trap, Modifier, (or combination of these types, use |(or) )
    get type(): number { return this._type; }
    private _damage: number;
    get damage(): number { return this._damage; }
    private _modifiers: Array<Buff> | undefined;
    get modifiers(): Array<Buff> { return this._modifiers; }

    initAttributes(blockAttributes: MyTypes.MapBlockAttributes): void {
        if (this._type & MyTypes.MapBlockType.Trap) {
            this._damage = blockAttributes.damage;
            console.log("a trap damage init")
        }
        if (this._type & MyTypes.MapBlockType.Modifier) {
            this._modifiers = blockAttributes.modifiers;
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
                if (SceneController.getInstance().gameStatus != MyTypes.GameStatus.GameRuntime) return;

                // console.log("MapBlock collide with Player, OnIntersectionEnterTrigger");
                EventDispatcher.getInstance().receiveEvent(MyTypes.EventType.PlayerEntersMapBlock, {
                    object: that,
                    message: "Player Enters a mapblock"
                });
            })
        );

        if (this._type & MyTypes.MapBlockType.Modifier) {
            this._mesh.actionManager.registerAction(
                new Babylon.ExecuteCodeAction({
                    trigger: Babylon.ActionManager.OnIntersectionExitTrigger,
                    parameter: {
                        mesh: SceneController.getInstance().player.playerMesh,
                        usePreciseIntersection: true
                    }
                }, (evt: Babylon.ActionEvent) => {
                    if (SceneController.getInstance().gameStatus != MyTypes.GameStatus.GameRuntime) return;

                    EventDispatcher.getInstance().receiveEvent(MyTypes.EventType.PlayerLeavesMapBlock, {
                        object: that,
                        message: "Player Leaves a mapblock"
                    })
                })
            );
        }
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

    private _destinationPointLocation: Babylon.Vector3;
    private _destinationPoint: DestinationPoint;

    private _itemInfo: Array<MyTypes.ItemInfo>
    get itemInfo(): Array<MyTypes.ItemInfo> { return this._itemInfo; }
    private _enemyInfoArray: Array<MyTypes.EnemyInfo>;
    get enemyInfoArray(): Array<MyTypes.EnemyInfo> { return this._enemyInfoArray; }


    constructor() {
        this._mapBlockList = new Array<MapBlock>();
        this._mapInfo = new Array<MyTypes.MapBlockInfo>();

        this._teleportPointInfo = new Array<Babylon.Vector3>();
        this._teleportPointsUnlocked = new Array<boolean>();
        this._teleportPoints = new Array<TeleportPoint>();

        this._itemInfo = new Array<MyTypes.ItemInfo>();
        this._enemyInfoArray = new Array<MyTypes.EnemyInfo>();
    }

    reset(): void {
        this._teleportPointsUnlocked = new Array<boolean>();
    }

    private initMapInfo(): void {
        // map: floor 1
        this._mapInfo.push(
            {
                type: MyTypes.MapBlockType.Plain,
                length: 25,
                location: new Babylon.Vector3(12.5, 0, 0),
                attributes: {}
            }, {
                type: MyTypes.MapBlockType.Trap,
                length: 15,
                location: new Babylon.Vector3(32.5, 0, 0),
                attributes: {
                    damage: 5
                }
            }, {
                type: MyTypes.MapBlockType.Plain,
                length: 30,
                location: new Babylon.Vector3(55, 0, 0),
                attributes: {}
            }, {
                type: MyTypes.MapBlockType.Modifier,
                length: 15,
                location: new Babylon.Vector3(77.5, 0, 0),
                attributes: {
                    modifiers: new Array<Buff>({
                        type: MyTypes.BuffType.DependOnMap,
                        propertyAffected: MyTypes.Property.MoveSpeed,
                        quantityToChange: -0.1
                    })
                }
            }, {
                type: MyTypes.MapBlockType.Plain,
                length: 15,
                location: new Babylon.Vector3(92.5, 0, 0),
                attributes: {}
            });

        // map: floor 2
        this._mapInfo.push(
            {
                type: MyTypes.MapBlockType.Trap,
                length: 40,
                location: new Babylon.Vector3(20, 12, 0),
                attributes: {
                    damage: 5
                }
            }, {
                type: MyTypes.MapBlockType.Trap,
                length: 20,
                location: new Babylon.Vector3(55, 12, 0),
                attributes: {
                    damage: 5
                }
            }, {
                type: MyTypes.MapBlockType.Plain,
                length: 30,
                location: new Babylon.Vector3(85, 12, 0),
                attributes: {}
            });

        // map: floor 3
        this._mapInfo.push(
            {
                type: MyTypes.MapBlockType.Plain,
                length: 40,
                location: new Babylon.Vector3(20, 24, 0),
                attributes: {}
            }, {
                type: MyTypes.MapBlockType.Plain,
                length: 25,
                location: new Babylon.Vector3(52.5, 24, 0),
                attributes: {}
            }, {
                type: MyTypes.MapBlockType.Modifier,
                length: 30,
                location: new Babylon.Vector3(85, 24, 0),
                attributes: {
                    modifiers: new Array<Buff>({
                        type: MyTypes.BuffType.DependOnMap,
                        propertyAffected: MyTypes.Property.MoveSpeed,
                        quantityToChange: -0.1
                    })
                }
            });

        // map: floor 4
        this._mapInfo.push(
            {
                type: MyTypes.MapBlockType.Modifier,
                length: 20,
                location: new Babylon.Vector3(10, 36, 0),
                attributes: {
                    modifiers: new Array<Buff>({
                        type: MyTypes.BuffType.DependOnMap,
                        propertyAffected: MyTypes.Property.MoveSpeed,
                        quantityToChange: -0.1
                    })
                }
            }, {
                type: MyTypes.MapBlockType.Modifier,
                length: 25,
                location: new Babylon.Vector3(32.5, 36, 0),
                attributes: {
                    modifiers: new Array<Buff>({
                        type: MyTypes.BuffType.DependOnMap,
                        propertyAffected: MyTypes.Property.AttackDamage,
                        quantityToChange: 10
                    })
                }
            }, {
                type: MyTypes.MapBlockType.Trap,
                length: 20,
                location: new Babylon.Vector3(55, 36, 0),
                attributes: {
                    damage: 5
                }
            }, {
                type: MyTypes.MapBlockType.Modifier,
                length: 30,
                location: new Babylon.Vector3(80, 36, 0),
                attributes: {
                    modifiers: new Array<Buff>({
                        type: MyTypes.BuffType.DependOnMap,
                        propertyAffected: MyTypes.Property.MoveSpeed,
                        quantityToChange: -0.1
                    })
                }
            });

        // map: floor 5
        this._mapInfo.push(
            {
                type: MyTypes.MapBlockType.Modifier,
                length: 20,
                location: new Babylon.Vector3(17.5, 48, 0),
                attributes: {
                    modifiers: new Array<Buff>(
                        {
                            type: MyTypes.BuffType.DependOnMap,
                            propertyAffected: MyTypes.Property.SPRecoverSpeed,
                            quantityToChange: 4
                        }, {
                            type: MyTypes.BuffType.DependOnMap,
                            propertyAffected: MyTypes.Property.HPRecoverSpeed,
                            quantityToChange: -4
                        }
                    )
                }
            }, {
                type: MyTypes.MapBlockType.Modifier,
                length: 20,
                location: new Babylon.Vector3(47.5, 48, 0),
                attributes: {
                    modifiers: new Array<Buff>(
                        {
                            type: MyTypes.BuffType.DependOnMap,
                            propertyAffected: MyTypes.Property.SPRecoverSpeed,
                            quantityToChange: -6
                        }, {
                            type: MyTypes.BuffType.DependOnMap,
                            propertyAffected: MyTypes.Property.HPRecoverSpeed,
                            quantityToChange: 4
                        }
                    )
                }
            }, {
                type: MyTypes.MapBlockType.Plain,
                length: 25,
                location: new Babylon.Vector3(87.5, 48, 0),
                attributes: {}
            });

        this._mapInfo.push(
            {
                type: MyTypes.MapBlockType.Plain,
                length: 100,
                location: new Babylon.Vector3(50, 60, 0),
                attributes: {},
                isVertical: false,
            }, {
                type: MyTypes.MapBlockType.Plain,
                length: 100,
                location: new Babylon.Vector3(50, -1, 0),
                attributes: {},
                isVertical: false,
            }, {
                type: MyTypes.MapBlockType.Plain,
                length: 60,
                location: new Babylon.Vector3(-1, 30, 0),
                attributes: {},
                isVertical: true,
            }, {
                type: MyTypes.MapBlockType.Plain,
                length: 60,
                location: new Babylon.Vector3(101, 30, 0),
                attributes: {},
                isVertical: true,
            }, { // the vertical wall upside the floor 4
                type: MyTypes.MapBlockType.Plain,
                length: 20,
                location: new Babylon.Vector3(67.5, 50, 0),
                attributes: {},
                isVertical: true,
            },
        );

        // map: teleport points, 3 in total
        this._teleportPointInfo.push(
            new Babylon.Vector3(12.5, 0.5, 0), // start point
            new Babylon.Vector3(5, 24.5, 0), // floor 3 at the shop
            new Babylon.Vector3(80, 48.5, 0), // near the destination point
        );

        this._destinationPointLocation = new Babylon.Vector3(95, 55, 0);
    };

    private initItemLocations(): void {
        this._itemInfo.push(
            // floor 1
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(5, 8, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(15, 8, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(25, 8, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(35, 8, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(45, 8, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(55, 8, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(65, 8, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(75, 8, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(85, 8, 0)),

            // floor 2
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(10, 20, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(20, 20, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(30, 20, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(50, 20, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(60, 20, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(80, 20, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(90, 20, 0)),

            // floor 3
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(47, 32, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(54, 32, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(80, 32, 0)),
            Item.getSoulBallItemInfo(10, new Babylon.Vector3(90, 32, 0)),

            // floor 4
            Item.getSoulBallItemInfo(20, new Babylon.Vector3(85, 44, 0)),
        );

        // other items
        this._itemInfo.push(
            {
                type: MyTypes.ItemType.AddSpRecoverSpeed,
                quantity: 2,
                price: 0,
                location: new Babylon.Vector3(95, 1, 0),
            }, {
                type: MyTypes.ItemType.AddAttackDamage,
                quantity: 10,
                price: 0,
                location: new Babylon.Vector3(95, 13, 0),
            }, {
                type: MyTypes.ItemType.AddMoveSpeed,
                quantity: 0.15,
                price: 0,
                location: new Babylon.Vector3(5, 13, 0),
            }, {
                type: MyTypes.ItemType.HPRecovery,
                quantity: 100,
                price: 0,
                location: new Babylon.Vector3(5, 56, 0),
            }, {
                type: MyTypes.ItemType.SPRecovery,
                quantity: 100,
                price: 0,
                location: new Babylon.Vector3(60, 56, 0),
            }
        );

        // items for sale
        this._itemInfo.push(
            {
                type: MyTypes.ItemType.AddAttackDamage,
                quantity: 10,
                price: 100,
                location: new Babylon.Vector3(10, 25, 0),
            }, {
                type: MyTypes.ItemType.AddSpRecoverSpeed,
                quantity: 4,
                price: 100,
                location: new Babylon.Vector3(20, 25, 0),
            }, {
                type: MyTypes.ItemType.HPRecovery,
                quantity: 50,
                price: 100,
                location: new Babylon.Vector3(30, 25, 0),
            }
        )
    }

    private initEnemyInfoArray(): void {
        this._enemyInfoArray.push(
            // floor 1
            {
                type: MyTypes.EnemyType.NormalSolider,
                location: new Babylon.Vector3(32.5, 1.5, 0),
            }, {
                type: MyTypes.EnemyType.NormalSolider,
                location: new Babylon.Vector3(50, 1.5, 0),
            }, {
                type: MyTypes.EnemyType.NormalSolider,
                location: new Babylon.Vector3(60, 1.5, 0),
            }, {
                type: MyTypes.EnemyType.NormalSolider,
                location: new Babylon.Vector3(80, 1.5, 0),
            }, {
                type: MyTypes.EnemyType.NormalSolider,
                location: new Babylon.Vector3(95, 1.5, 0),
            },
            // floor 2
            {
                type: MyTypes.EnemyType.NormalSolider,
                location: new Babylon.Vector3(20, 13.5, 0),
            }, {
                type: MyTypes.EnemyType.NormalSolider,
                location: new Babylon.Vector3(60, 13.5, 0),
            },
            // floor 3
            {
                type: MyTypes.EnemyType.NormalSolider,
                location: new Babylon.Vector3(50, 25.5, 0),
            }, {
                type: MyTypes.EnemyType.NormalSolider,
                location: new Babylon.Vector3(60, 25.5, 0),
            }, {
                type: MyTypes.EnemyType.NormalSolider,
                location: new Babylon.Vector3(85, 25.5, 0),
            },
            // floor 4
            {
                type: MyTypes.EnemyType.NormalSolider,
                location: new Babylon.Vector3(80, 37.5, 0),
            }, {
                type: MyTypes.EnemyType.NormalSolider,
                location: new Babylon.Vector3(90, 37.5, 0),
            },
            // boss at floor 4
            {
                type: MyTypes.EnemyType.NormalSolider,
                location: new Babylon.Vector3(20, 37.5, 0),
                isBoss: true
            },
        )
    }

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

    createDestinationPoint(): void {
        this._destinationPoint = new DestinationPoint("DestinationPoint", this._destinationPointLocation);
    }

    initMap(): void {
        this.initMapInfo();
        this.initCurrentMapBlocks();
        this.initTeleportPoints();
        this.createDestinationPoint();

        this.initItemLocations();
        this.initEnemyInfoArray();

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
            if (SceneController.getInstance().gameStatus != MyTypes.GameStatus.GameRuntime) return;

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
                if (SceneController.getInstance().gameStatus != MyTypes.GameStatus.GameRuntime) return;

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
                if (SceneController.getInstance().gameStatus != MyTypes.GameStatus.GameRuntime) return;

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

export class DestinationPoint implements MyTypes.EventPublisher {
    constructor(name: string, location: Babylon.Vector3) {
        this._name = name;

        this.initMesh(location);
        this.initEventDetector();
    }

    private _name: string;
    private _mesh: Babylon.Mesh;

    initMesh(location: Babylon.Vector3): void {
        let gameScene = SceneController.getInstance().gameScene;
        this._mesh = Babylon.Mesh.CreateSphere(this._name, 16, 5, gameScene);
        this._mesh.position = location;

        let material = new Babylon.StandardMaterial(_.join([this._name, "Material"], '-'), gameScene)
        material.diffuseColor = Babylon.Color3.Purple();
        this._mesh.material = material;
    }

    initEventDetector(): void {
        let that = this;
        let gameScene = SceneController.getInstance().gameScene;
        this._mesh.actionManager = new Babylon.ActionManager(gameScene);
        this._mesh.actionManager.registerAction(
            new Babylon.ExecuteCodeAction({
                trigger: Babylon.ActionManager.OnIntersectionEnterTrigger,
                parameter: {
                    mesh: SceneController.getInstance().player.playerMesh,
                    usePreciseIntersection: true
                }
            }, (evt: Babylon.ActionEvent) => {
                if (SceneController.getInstance().gameStatus != MyTypes.GameStatus.GameRuntime) return;

                EventDispatcher.getInstance().receiveEvent(MyTypes.EventType.PlayerEnterDestinationPoint, {
                    object: that,
                    message: "Player Enters the destination point",
                })
            })
        );
        this._mesh.actionManager.registerAction(
            new Babylon.ExecuteCodeAction({
                trigger: Babylon.ActionManager.OnIntersectionExitTrigger,
                parameter: {
                    mesh: SceneController.getInstance().player.playerMesh,
                    usePreciseIntersection: true
                }
            }, (evt: Babylon.ActionEvent) => {
                if (SceneController.getInstance().gameStatus != MyTypes.GameStatus.GameRuntime) return;

                EventDispatcher.getInstance().receiveEvent(MyTypes.EventType.PlayerExitDestinationPoint, {
                    object: that,
                    message: "Player Exits the destination point",
                })
            })
        );
    }
}
