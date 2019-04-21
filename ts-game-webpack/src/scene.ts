import * as Babylon from '@babylonjs/core';
import * as Material from "@babylonjs/materials";
// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import "@babylonjs/core/Meshes/meshBuilder";

import * as CANNON from 'cannon';

import { Player } from './player';
import { GUIController } from './gui';
import { EventDispatcher } from './event_dispatcher';
import { GameMap } from './game_map';

export class SceneController {
    // -----------singleton-------------
    private static _instance: SceneController = new SceneController();

    constructor() {
        if (SceneController._instance) {
            throw new Error("Error: Instantiation failed: Use GUIController.getInstance() instead of new.");
        }
        SceneController._instance = this;
    }

    public static getInstance(): SceneController {
        return SceneController._instance;
    }
    // ---------------------------------

    private _gameCanvas: HTMLCanvasElement;
    private _gameEngine: Babylon.Engine;
    private _gameScene: any;
    get gameScene(): any { return this._gameScene; }

    private _followCamera: any;
    get followCamera(): any { return this._followCamera; }
    private _physicsPlugin: any;

    private _player: Player;
    get player(): Player { return this._player; }
    private _gameMap: GameMap;

    private _eventDispatcher: EventDispatcher = EventDispatcher.getInstance();

    initAll(): void {
        // canvas, engine, scene
        this.initCanvasAndEngine();
        this.initSceneAndCamera();

        // game elements
        this.initGUI();
        this.initPlayer();
        this.initMap();
        this.initItem();
        this.initEnemy();

        this.initEventDispatcher();
    }

    initCanvasAndEngine(): void {
        this._gameCanvas = document.createElement('canvas');
        this._gameCanvas.id = 'babylonCanvas'
        this._gameCanvas.setAttribute('width', '800');
        this._gameCanvas.setAttribute('height', '600');
        document.body.appendChild(this._gameCanvas);

        this._gameEngine = new Babylon.Engine(this._gameCanvas);
        // custom loading screen
        // let loadingScreen = new GUI.MyLoadingScreen("custom loading screen ...");
        // engine.loadingScreen = loadingScreen;
        window.addEventListener("resize", () => {
            this._gameEngine.resize();
        });

        this._gameEngine.runRenderLoop(() => {
            this._gameScene.render();
        })
    }

    initSceneAndCamera(): void {
        this._gameScene = new Babylon.Scene(this._gameEngine);
        this._physicsPlugin = new Babylon.CannonJSPlugin();
        let gravityVector = new Babylon.Vector3(0, -9.81, 0);
        this._gameScene.enablePhysics(gravityVector, this._physicsPlugin);

        this._followCamera = new Babylon.FollowCamera('followCamera1', new Babylon.Vector3(0, 5, -100), this._gameScene);
        this._followCamera.attachControl(this._gameCanvas, true);
        this._followCamera.applyGravity = true;
        console.log(this._followCamera.globalPosition)
        console.log(this._followCamera.rotation);

        let light = new Babylon.HemisphericLight('hemisphericLight1', new Babylon.Vector3(0, 1, 0), this._gameScene);
        light.intensity = 0.7;
    }

    initGUI(): void {
        let guiController: GUIController = GUIController.getInstance();
        guiController.init();
        guiController.HideAll();
        // for test
        guiController.TestGUI();
    }

    initPlayer(): void {
        this._player = new Player();
        this._player.initMesh();
        this._followCamera.lockedTarget = this.player.playerMesh;
    }

    initMap(): void {
        this._gameMap = new GameMap();
        this._gameMap.test();
    }

    initEnemy(): void {

    }

    initItem(): void {

    }

    initEventDispatcher(): void {
        this._eventDispatcher.test();
    }
}