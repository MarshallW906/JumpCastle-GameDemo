import * as Babylon from "@babylonjs/core";
// import * as Material from "@babylonjs/materials";

// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";
import { SceneController } from "./scene";
import { ObjectWithMeshEntity, NoReturnValFunc, MapBlockType } from "./types";

export class MapBlock {
    /**
     * 
     * @param length : will be used as "width" of a new Box Mesh
     * @param location : y is always 0, so only needs position.x & position.z
     */
    constructor(id: number, name: string, type: number, length: number, location: Babylon.Vector3) {
        this._id = id;
        this._name = name;
        this._type = type;
        this.initMesh({ width: length, height: 0.2, depth: 10 }, location);
    }

    private _id: number;
    get id(): number { return this._id; }
    private _name: string;
    get name(): string { return this._name; }

    private _mesh: Babylon.Mesh;
    // interface ObjectWithMeshEntity
    // now initMesh might need some params, so this interface might be changed
    initMesh(size: { width: number, height: number, depth: number }, location: Babylon.Vector3): void {
        if (location.z != 0) {
            throw Error("MapBlock location.z is not 0 !");
        }
        this._mesh = Babylon.MeshBuilder.CreateBox(this._name, size, SceneController.getInstance().gameScene);
    }

    destroy: NoReturnValFunc;

    // other attributes
    private _type: number; // Plain, Trap, Modifier, (or combination of these types, use |(or) )
    private _damage: number;
    // private _modifiers: Array<Buff>;
}

export class GameMap {
    private _gameScene: any = SceneController.getInstance().gameScene;

    test(): void {
        console.log("gamemap test");
        let ground = Babylon.Mesh.CreateGround("ground1", 10, 10, 10, this._gameScene);
        ground.physicsImpostor = new Babylon.PhysicsImpostor(ground, Babylon.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0, friction: 0 }, this._gameScene);


        let testground = Babylon.MeshBuilder.CreateBox("testground1", { width: 10, height: 0.2, depth: 10 }, this._gameScene);
        testground.physicsImpostor = new Babylon.PhysicsImpostor(testground, Babylon.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0, friction: 0 }, this._gameScene);
        testground.position.y = 5;
    }
}