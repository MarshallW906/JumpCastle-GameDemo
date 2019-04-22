import * as Babylon from "@babylonjs/core";
// import * as Material from "@babylonjs/materials";
// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";
import { SceneController } from "./scene";
import { ObjectWithMeshEntity, NoReturnValFunc } from "./types";

export class MapBlock {
    /**
     * 
     * @param length : will be used as "width" of a new Box Mesh
     * @param location : y is always 0, so only needs position.x & position.z
     */
    constructor(length: number, location: Babylon.Vector2) {

    }

    private _mesh: Babylon.Mesh;
    // interface ObjectWithMeshEntity
    // now initMesh might need some params, so this interface might be changed
    initMesh(location: Babylon.Vector3): void {

    }
    destroy: NoReturnValFunc;
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