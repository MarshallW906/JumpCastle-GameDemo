import * as _ from 'lodash';

import * as BABYLON from '@babylonjs/core';

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { GridMaterial } from "@babylonjs/materials/grid";
// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";


import './css/style.css'
import * as GUI from './gui'

function component(): any {
    let element = document.createElement('div');
    // Lodash, now imported by this script
    element.innerHTML = _.join(['Hello', 'webpack'], ' ');
    element.classList.add('hello');
    return element
}
document.body.appendChild(<HTMLDivElement>component())

function initBabylon(): void {
    const canvas = document.createElement('canvas');
    canvas.id = 'babylonCanvas'
    canvas.setAttribute('width', '1024');
    canvas.setAttribute('height', '768');
    document.body.appendChild(<HTMLCanvasElement>canvas);

    const engine = new Engine(canvas);
    // let loadingScreen = new GUI.MyLoadingScreen("custom loading screen ...");
    // engine.loadingScreen = loadingScreen;
    window.addEventListener("resize", () => {
        engine.resize();
    })

    // engine.displayLoadingUI();
    // setTimeout(() => {
    //     BABYLON.SceneLoader.Load('', '', engine, (msg) => {
    //         alert('1');
    //     })
    // }, 5000);

    let scene = new Scene(engine);
    let camera = new FreeCamera('freeCamera1', new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);


    let light = new HemisphericLight('hemisphericLight1', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    let material = new GridMaterial("grid", scene);
    let sphere = Mesh.CreateSphere('sphere1', 16, 2, scene);
    sphere.position.y = 2;
    sphere.material = material;
    let ground = Mesh.CreateGround('ground1', 6, 6, 2, scene);
    ground.material = material;
    engine.runRenderLoop(() => {
        scene.render();
    });

    let guiController: any = new GUI.GUIController();
    guiController.test();
}

initBabylon();