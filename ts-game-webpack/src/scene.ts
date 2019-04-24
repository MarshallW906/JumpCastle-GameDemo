import * as Babylon from '@babylonjs/core';

import { Player } from './player';
import { GUIController } from './gui';
import { EventDispatcher } from './event_dispatcher';
import { GameMap } from './game_map';
import { ItemFactory } from './item';
import { BulletFactory } from './bullet';
import { EventType } from './types';
import { EnemyFactory } from './enemy';

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
    private _gameScene: Babylon.Scene;
    get gameScene(): Babylon.Scene { return this._gameScene; }

    private _followCamera: Babylon.FollowCamera;
    get followCamera(): Babylon.FollowCamera { return this._followCamera; }
    private _physicsPlugin: any;

    private _player: Player;
    get player(): Player { return this._player; }
    private _gameMap: GameMap;
    private _itemFactory: ItemFactory;
    get itemFactory(): ItemFactory { return this._itemFactory; }
    private _bulletFactory: BulletFactory;
    get bulletFactory(): BulletFactory { return this._bulletFactory; }
    private _enemyFactory: EnemyFactory;
    get enemyFactory(): EnemyFactory { return this._enemyFactory; }

    private _eventDispatcher: EventDispatcher;

    initAll(): void {
        // canvas, engine, scene
        this.initCanvasAndEngine();
        this.initSceneAndCamera();

        this.initEventDispatcher();

        // game elements
        this.initGUI();
        this.initPlayer(); // also registered keyboard inputs
        this.initMap();
        this.initItem();
        this.initBulletFactory();
        this.initEnemy();
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

        this._followCamera = new Babylon.FollowCamera('followCamera1', new Babylon.Vector3(0, 5, -10), this._gameScene);
        this._followCamera.attachControl(this._gameCanvas, true);
        this._followCamera.radius = 20;
        this._followCamera.noRotationConstraint = true;
        this._followCamera.heightOffset = 0;

        // this._followCamera.mode = Babylon.Camera.ORTHOGRAPHIC_CAMERA; // try ortho?

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
        this._player.init();
        this._followCamera.lockedTarget = this.player.playerMesh;
    }

    initMap(): void {
        this._gameMap = new GameMap();
        this._gameMap.initMap();
        this._gameMap.test();
    }

    initEnemy(): void {

    }

    initItem(): void {
        this._itemFactory = new ItemFactory();
        this._itemFactory.test();
    }

    initBulletFactory(): void {
        this._bulletFactory = new BulletFactory();
        this._bulletFactory.test();
    }

    initEventDispatcher(): void {
        this._eventDispatcher = EventDispatcher.getInstance();
        this._eventDispatcher.init();

        this._eventDispatcher.test();
        this._eventDispatcher.registerEventType(EventType.ItemCollideWithPlayer);
    }
}