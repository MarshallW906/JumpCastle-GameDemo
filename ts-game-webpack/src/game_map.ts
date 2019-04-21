import * as Babylon from "@babylonjs/core";
import * as Material from "@babylonjs/materials";
// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";
import { SceneController } from "./scene";

export class MapBlock {

}

export class GameMap {
    private _gameScene: any = SceneController.getInstance().gameScene;

    test(): void {
        console.log("gamemap test");
        let ground = Babylon.Mesh.CreateGround("ground1", 6, 6, 2, this._gameScene);
        ground.physicsImpostor = new Babylon.PhysicsImpostor(ground, Babylon.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this._gameScene);
    }
}