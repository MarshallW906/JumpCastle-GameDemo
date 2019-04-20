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
        let plane1 = Babylon.MeshBuilder.CreatePlane("myPlane", { width: 5, height: 5 }, this._gameScene);
        plane1.position = new Babylon.Vector3(0, -10, 0);
        plane1.material = new Material.GridMaterial("planeMaterial", this._gameScene);
        plane1.physicsImpostor = new Babylon.PhysicsImpostor(plane1, Babylon.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, this._gameScene);
    }
}