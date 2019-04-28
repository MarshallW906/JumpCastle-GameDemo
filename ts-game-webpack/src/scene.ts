import * as BABYLON from '@babylonjs/core';

import { Player } from './player';
import { GUIController } from './gui';
import { EventDispatcher } from './event_dispatcher';
import { GameMap, MapBlockEdgeFactory } from './game_map';
import { ItemFactory } from './item';
import { BulletFactory } from './bullet';
import { EventType, GameStatus } from './types';
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
    private _gameEngine: BABYLON.Engine;
    private _gameScene: BABYLON.Scene;
    get gameScene(): BABYLON.Scene { return this._gameScene; }

    private _followCamera: BABYLON.FollowCamera;
    get followCamera(): BABYLON.FollowCamera { return this._followCamera; }
    private _freeCamera: BABYLON.FreeCamera;

    private _guiController: GUIController;
    get guiController(): GUIController { return this._guiController; }

    private _player: Player;
    get player(): Player { return this._player; }
    private _gameMap: GameMap;
    get gameMap(): GameMap { return this._gameMap; }
    private _mapBlockEdgeFactory: MapBlockEdgeFactory;
    get mapBlockEdgeFactory(): MapBlockEdgeFactory { return this._mapBlockEdgeFactory; }
    private _itemFactory: ItemFactory;
    get itemFactory(): ItemFactory { return this._itemFactory; }
    private _bulletFactory: BulletFactory;
    get bulletFactory(): BulletFactory { return this._bulletFactory; }
    private _enemyFactory: EnemyFactory;
    get enemyFactory(): EnemyFactory { return this._enemyFactory; }

    private _eventDispatcher: EventDispatcher;

    gameStatus: GameStatus;

    initAll(): void {
        // canvas, engine, scene
        this.initCanvasAndEngine();
        this.initSceneAndCamera();

        this.initEventDispatcher();

        this.initGUI();

        this.initPlayer(); // also registered keyboard inputs
        this.initMap();

        this.initItemFactory();
        this.initEnemyFactory();
        this.initBulletFactory();
    }

    gameStart(): void {
        this.resetGame();

        this.initItems();
        this.initEnemies();

        this._guiController.refreshAllGUI();
    }

    private resetGame(): void {
        this._player.reset();

        this._gameMap.reset();
        this._itemFactory.reset();
        this._bulletFactory.reset();
        this._enemyFactory.reset();
    }

    gameRestart(): void {
        this.resetGame();

        this.gameStart();
        this._guiController.GameRuntime();
    }

    private initCanvasAndEngine(): void {
        this._gameCanvas = document.createElement('canvas');
        this._gameCanvas.id = 'babylonCanvas'
        this._gameCanvas.setAttribute('width', '800');
        this._gameCanvas.setAttribute('height', '600');
        document.body.appendChild(this._gameCanvas);

        this._gameEngine = new BABYLON.Engine(this._gameCanvas);
        // custom loading screen
        // let loadingScreen = new GUI.MyLoadingScreen("custom loading screen ...");
        // engine.loadingScreen = loadingScreen;
        window.addEventListener("resize", () => {
            this._gameEngine.resize();
        });

        this._gameEngine.runRenderLoop(() => {
            this._gameScene.render();
        });
    }

    private initSceneAndCamera(): void {
        this._gameScene = new BABYLON.Scene(this._gameEngine);
        let physicsPlugin = new BABYLON.CannonJSPlugin();
        let gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        this._gameScene.enablePhysics(gravityVector, physicsPlugin);

        this._followCamera = new BABYLON.FollowCamera('followCamera1', new BABYLON.Vector3(0, 5, -10), this._gameScene);
        this._followCamera.attachControl(this._gameCanvas, true);
        this._followCamera.radius = 80;
        this._followCamera.noRotationConstraint = true;
        this._followCamera.heightOffset = 0;

        // this._followCamera.mode = Babylon.Camera.ORTHOGRAPHIC_CAMERA; // try ortho?

        console.log(this._followCamera.globalPosition);
        console.log(this._followCamera.rotation);

        let light = new BABYLON.HemisphericLight('hemisphericLight1', new BABYLON.Vector3(0, 1, 0), this._gameScene);
        light.intensity = 0.7;

        this._freeCamera = new BABYLON.FreeCamera("FreeCamera1", new BABYLON.Vector3(100, 5, 0), this._gameScene);
        this._freeCamera.attachControl(this._gameCanvas, true);

        this._gameScene.activeCamera = this._freeCamera;
    }

    switchActiveCamera(): void {
        if (this._gameScene.activeCamera.name == this._followCamera.name) {
            this.switchToFreeCamera();
        } else {
            this.switchToFollowCamera();
        }
    }

    switchToFollowCamera(): void {
        if (this._gameScene.activeCamera.name != this._followCamera.name) {
            this._gameScene.activeCamera = this._followCamera;
        }
    }

    switchToFreeCamera(): void {
        if (this._gameScene.activeCamera.name != this._freeCamera.name) {
            this._gameScene.activeCamera = this._freeCamera;
        }
    }

    private initGUI(): void {
        this._guiController = GUIController.getInstance();
        this._guiController.init();
        this._guiController.HideAll();
        this._guiController.Title();
        // this._guiController.GameRuntime();
        // for test
        this._guiController.TestGUI();
    }

    private initPlayer(): void {
        this._player = new Player();
        this._player.init();
        this._followCamera.lockedTarget = this.player.playerMesh;
    }

    private initMap(): void {
        this._mapBlockEdgeFactory = new MapBlockEdgeFactory();

        this._gameMap = new GameMap();
        this._gameMap.initMap();
        // this._gameMap.test();
    }

    private initEnemyFactory(): void {
        this._enemyFactory = new EnemyFactory();
        // this._enemyFactory.test();
    }

    private initEnemies(): void {
        this._enemyFactory.createEnemiesByEnemyInfo(this._gameMap.enemyInfoArray);
    }

    private initItemFactory(): void {
        this._itemFactory = new ItemFactory();
    }

    private initItems(): void {
        this._itemFactory.createItemsByItemInfoCollection(this._gameMap.itemInfo);
    }

    private initBulletFactory(): void {
        this._bulletFactory = new BulletFactory();
    }

    private initEventDispatcher(): void {
        this._eventDispatcher = EventDispatcher.getInstance();
        this._eventDispatcher.init();

        this._eventDispatcher.registerEventType(EventType.ItemCollideWithPlayer);
        this._eventDispatcher.registerEventType(EventType.PlayerLeaveAnItem);
        this._eventDispatcher.registerEventType(EventType.ItemBePurchased);

        this._eventDispatcher.registerEventType(EventType.BulletCollideWithEnemy);
        this._eventDispatcher.registerEventType(EventType.EnemyCollideWithPlayer);

        this._eventDispatcher.registerEventType(EventType.PlayerEntersMapBlock);
        this._eventDispatcher.registerEventType(EventType.PlayerLeavesMapBlock);

        this._eventDispatcher.registerEventType(EventType.PlayerEnterTeleportPoint);
        this._eventDispatcher.registerEventType(EventType.PlayerExitTeleportPoint);

        this._eventDispatcher.registerEventType(EventType.PlayerEnterDestinationPoint);
        this._eventDispatcher.registerEventType(EventType.PlayerExitDestinationPoint);

        this._eventDispatcher.registerEventType(EventType.EnemyDead);
        this._eventDispatcher.registerEventType(EventType.GUIQuantityChange);
        this._eventDispatcher.registerEventType(EventType.EnemyReachesMapBlockEdge);
        this._eventDispatcher.registerEventType(EventType.EnemySeesPlayer);

        this._eventDispatcher.registerEventType(EventType.GameWin);
        this._eventDispatcher.registerEventType(EventType.GameOver);
    }
}