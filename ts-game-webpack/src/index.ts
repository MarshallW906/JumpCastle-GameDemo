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


import './css/style.css';

import * as MyTypes from "./types";

import { EventDispatcher } from './event_dispatcher';
import { GUIController } from './gui';
import { Player } from './player';

function initBabylon(): void {
    const canvas = document.createElement('canvas');
    canvas.id = 'babylonCanvas'
    canvas.setAttribute('width', '800');
    canvas.setAttribute('height', '600');
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

    let guiController: GUIController = GUIController.getInstance();
    guiController.init();

    let eventDispatcher: EventDispatcher = <EventDispatcher>EventDispatcher.getInstance();
    eventDispatcher.test();
}

initBabylon();