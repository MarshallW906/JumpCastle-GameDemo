import * as Babylon from "@babylonjs/core";
// import * as Material from "@babylonjs/materials";

import * as _ from "lodash";

// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";
import { SceneController } from "./scene";
import * as MyTypes from "./types";
import { Buff } from "./buff";
import { EventDispatcher } from "./event_dispatcher";

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
        this.initMesh({ width: mapBlockInfo.length, height: 0.2, depth: 10 }, mapBlockInfo.location);
        if (mapBlockInfo.type & MyTypes.MapBlockType.Plain) {
            this.initAttributes(mapBlockInfo.attributes);
        }
        this.initEventDetector();
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

export class GameMap {
    private _gameScene = SceneController.getInstance().gameScene;
    private _mapBlockList: Array<MapBlock>;
    private _mapInfo: Array<MyTypes.MapBlockInfo>;

    constructor() {
        this._mapBlockList = new Array<MapBlock>();
        this._mapInfo = new Array<MyTypes.MapBlockInfo>();
    }

    private initMapInfo(): void {
        this._mapInfo.push(MapBlock.getPlainMapBlockInfo(10, new Babylon.Vector3(15, 5, 0)));
        this._mapInfo.push(MapBlock.getPlainMapBlockInfo(10, Babylon.Vector3.Zero()));
    };

    private createNewMapBlock(mapBlockInfo: MyTypes.MapBlockInfo): void {
        console.log(mapBlockInfo);
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

    private initCurrentMapBlocks(): void {
        this._mapInfo.forEach((mapBlockInfo: MyTypes.MapBlockInfo) => {
            this.createNewMapBlock(mapBlockInfo);
        })
    }

    initMap(): void {
        this.initMapInfo();
        this.initCurrentMapBlocks();
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
