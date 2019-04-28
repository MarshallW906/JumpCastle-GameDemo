import * as BabylonGUI from "@babylonjs/gui";
import * as Babylon from "@babylonjs/core";
import * as _ from "lodash";

import * as MyTypes from './types';
import { SceneController } from "./scene";
import { EventDispatcher } from "./event_dispatcher";

/**
 * GUI may use another camera, which only captures the GUI elements.
 */
export class GUIController implements MyTypes.EventSubscriber {
    // -----------singleton-------------
    private static _instance: GUIController = new GUIController();

    constructor() {
        if (GUIController._instance) {
            throw new Error("Error: Instantiation failed: Use GUIController.getInstance() instead of new.");
        }
        GUIController._instance = this;
    }

    public static getInstance(): GUIController {
        return GUIController._instance;
    }
    // ---------------------------------

    init(): void {
        // initialize "AdvanceDynamicTexture"
        this.advancedTexture = BabylonGUI.AdvancedDynamicTexture.CreateFullscreenUI("JumpCastleGUI");

        this.initProgressBarLoading();
        this.initLogoGameTitle();

        this.initButtonStart();
        this.initButtonRestart();
        this.initButtonMute();
        this.initButtonReturnToTitle();

        this.initTextblockGameOver();
        this.initTextblockGold();
        this.initTextblockSoul();
        this.initTextblockWin();

        this.initHPBar();
        this.initSPBar();
        this.initItemList();
        this.initBuffList();

        this.initGUIElementsGameRuntime();

        this.composeGUItest();

        this.registerEventHandler();
    }

    refreshAllGUI(): void {
        let player = SceneController.getInstance().player;
        this.UpdateHPBar(player.HP);
        this.UpdateSPBar(player.SP);
        this.UpdateGold(player.gold);
        this.UpdateSoul(player.soul);
        this.UpdateItemList(player.items);
        // this.UpdateBuffList(player.buffs)
    }

    private composeGUItest(): void {
        // this.advancedTexture.addControl(this.logoGameTitle);
        this.advancedTexture.addControl(this.buttonMute);

        this.guiElementsGameRuntime.forEach((guiElement) => {
            if (guiElement !== undefined) {
                this.advancedTexture.addControl(<BabylonGUI.Control>guiElement);
            }
        });

    }

    Loading(): void {
        this.hideCurrentGUI();
        this.currentGUIMode = MyTypes.GUIMode.Loading;

        // display loading GUI
        // this.advancedTexture.addControl(this.progressBarLoading);
        this.advancedTexture.addControl(this.logoGameTitle)

        SceneController.getInstance().switchToFreeCamera();
        SceneController.getInstance().gameStatus = MyTypes.GameStatus.Loading;
    }
    Title(): void {
        this.hideCurrentGUI();
        this.currentGUIMode = MyTypes.GUIMode.Title;

        // display Title GUI
        this.advancedTexture.addControl(this.logoGameTitle);
        this.advancedTexture.addControl(this.buttonStart);

        SceneController.getInstance().switchToFreeCamera();
        SceneController.getInstance().gameStatus = MyTypes.GameStatus.Title;
    }
    GameRuntime(): void {
        this.hideCurrentGUI();
        this.currentGUIMode = MyTypes.GUIMode.GameRuntime;

        // display GameRuntime GUI
        this.guiElementsGameRuntime.forEach((guiElement) => {
            if (guiElement !== undefined) {
                this.advancedTexture.addControl(guiElement);
            }
        })
        SceneController.getInstance().switchToFollowCamera();
        SceneController.getInstance().gameStatus = MyTypes.GameStatus.GameRuntime;
    }
    GameOver(): void {
        // no need to hideGUI()
        this.hideCurrentGUI();
        this.currentGUIMode = MyTypes.GUIMode.GameOver;

        // display GameOver GUI
        this.advancedTexture.addControl(this.textblockGameOver);
        this.advancedTexture.addControl(this.buttonReturnToTitle);
        this.advancedTexture.addControl(this.buttonRestart);

        SceneController.getInstance().switchToFreeCamera();
        SceneController.getInstance().gameStatus = MyTypes.GameStatus.GameOver;
    }
    Win(): void {
        // no need to hideGUI()
        this.hideCurrentGUI();
        this.currentGUIMode = MyTypes.GUIMode.Win;

        // display Win GUI
        this.advancedTexture.addControl(this.textblockWin);
        this.advancedTexture.addControl(this.buttonReturnToTitle);
        this.advancedTexture.addControl(this.buttonRestart);

        SceneController.getInstance().switchToFreeCamera();
        SceneController.getInstance().gameStatus = MyTypes.GameStatus.Win;
    }

    HideAll(): void {
        this.hideCurrentGUI();
    }

    // Loading, Title, GameRuntime, GameOver, Win
    private currentGUIMode: MyTypes.GUIMode = MyTypes.GUIMode.HideAll;
    private hideCurrentGUI() {
        // hide all buttons, text labels, logos except ButtonMute(never needs to be hidden)

        this.advancedTexture.removeControl(this.logoGameTitle);

        this.advancedTexture.removeControl(this.textblockGameOver);
        this.advancedTexture.removeControl(this.textblockWin);

        this.guiElementsGameRuntime.forEach((guiElement: any) => {
            if (guiElement !== undefined) {
                this.advancedTexture.removeControl(guiElement);
            }
        })

        this.advancedTexture.removeControl(this.buttonStart);
        this.advancedTexture.removeControl(this.buttonRestart);
        this.advancedTexture.removeControl(this.buttonReturnToTitle);

        // set currentGUIMode to "HideAll"
        this.currentGUIMode = MyTypes.GUIMode.HideAll;
    }

    TestGUI(): void {
        var that = this;
        function createTestButton(name: string, text: string, top: string, left: string, clickCallback: () => void): void {
            let newButton = BabylonGUI.Button.CreateSimpleButton(name, text);
            newButton.top = top;
            newButton.left = left;
            newButton.onPointerClickObservable.add(clickCallback);

            newButton.width = '20px';
            newButton.height = '20px';
            newButton.background = 'blue';
            newButton.color = 'white';
            that.advancedTexture.addControl(newButton);
        }

        createTestButton("ShowPlayerPosition", "P", '200px', '0', () => {
            console.log("player position", SceneController.getInstance().player.playerMesh.position);
        });
        createTestButton("ShowCameraPosition", "C", '200px', '20px', () => {
            console.log("camera global position", SceneController.getInstance().followCamera.globalPosition);
        });
        createTestButton("SwitchActiveCamera", "S", '200px', '-20px', () => {
            SceneController.getInstance().switchActiveCamera();
            console.log("Active camera switched to", SceneController.getInstance().gameScene.activeCamera.name);
        });
        createTestButton("SwitchActiveCamera", "D", '200px', '-40px', () => {
            SceneController.getInstance().player.getDamage(40);
        });

        createTestButton("ShowGameWinPanel", "T", '240px', '-40px', () => {
            that.Title();
        });
        createTestButton("ShowGameWinPanel", "R", '240px', '-20px', () => {
            that.GameRuntime();
        });
        createTestButton("ShowGameWinPanel", "W", '240px', '0', () => {
            that.Win();
        });
        createTestButton("ShowGameWinPanel", "O", '240px', '20px', () => {
            that.GameOver();
        });
        createTestButton("ShowGameWinPanel", "H", '240px', '40px', () => {
            that.HideAll();
        });

    }

    UpdateHPBar(curHP: number): void {
        this.HPbar.value = curHP;
    }

    UpdateSPBar(curSP: number): void {
        this.SPbar.value = curSP;
    }

    UpdateGold(curGold: number): void { this.textblockGold.text = _.join(["G:", curGold.toString()], ' '); }

    UpdateSoul(curSoul: number): void { this.textblockSoul.text = _.join(["S:", curSoul.toString()], ' '); }

    UpdateItemList(curItemList: MyTypes.ItemCollection): void { }

    UpdateBuffList(curBuffList: any): void { }

    // GUI 
    private advancedTexture: BabylonGUI.AdvancedDynamicTexture;

    // buttons
    private buttonStart: BabylonGUI.Button;
    private buttonRestart: BabylonGUI.Button;
    private buttonMute: BabylonGUI.Button;
    private buttonReturnToTitle: BabylonGUI.Button;
    private initButtonStart(): void {
        this.buttonStart = BabylonGUI.Button.CreateSimpleButton("Start", "Start");
        this.buttonStart.width = '200px';
        this.buttonStart.height = '40px';
        this.buttonStart.color = 'black';
        this.buttonStart.cornerRadius = 0;
        this.buttonStart.background = 'yellow';
        this.buttonStart.onPointerUpObservable.add(GUIController.getFnOnClickedButtonStart());
        // this.buttonStart.left = '0';
        this.buttonStart.top = '100';
        // this.buttonStart.isVisible = true;
    }
    private initButtonRestart(): void {
        this.buttonRestart = BabylonGUI.Button.CreateSimpleButton("Restart", "Restart");
        this.buttonRestart.width = '200px';
        this.buttonRestart.height = '40px';
        this.buttonRestart.color = 'black';
        this.buttonRestart.cornerRadius = 0;
        this.buttonRestart.background = 'yellow';
        this.buttonRestart.onPointerUpObservable.add(GUIController.getFnOnClickedButtonRestart());
        // this.buttonRetart.left = '0';
        this.buttonRestart.top = '150px';
        // this.buttonRestart.isVisible = true;
    }
    private initButtonMute(): void {
        this.buttonMute = BabylonGUI.Button.CreateSimpleButton("Mute/UnMute", "M");
        this.buttonMute.cornerRadius = 90;
        this.buttonMute.width = '20px';
        this.buttonMute.height = '20px';
        this.buttonMute.color = 'black';
        this.buttonMute.background = 'yellow';
        this.buttonMute.onPointerUpObservable.add(GUIController.getFnOnClickedButtonMute());
        this.buttonMute.left = '350px';
        this.buttonMute.top = '-260px';
        this.buttonMute.zIndex = -1;
        // this.buttonMute.isVisible = true;
    }
    private initButtonReturnToTitle(): void {
        this.buttonReturnToTitle = BabylonGUI.Button.CreateSimpleButton("ReturnToTitle", "Return To Title");
        this.buttonReturnToTitle.cornerRadius = 0;
        this.buttonReturnToTitle.width = '200px';
        this.buttonReturnToTitle.height = '40px';
        this.buttonReturnToTitle.color = 'black';
        this.buttonReturnToTitle.background = 'yellow';
        this.buttonReturnToTitle.onPointerUpObservable.add(GUIController.getFnOnClickedButtonReturnToTitle());
        // this.buttonReturnToTitle.left = '0';
        this.buttonReturnToTitle.top = '200px';
        // this.buttonReturnToTitle.isVisible = true;
    }

    private textblockGameOver: BabylonGUI.TextBlock; // maybe BabylonGUI.TextBlock
    private textblockWin: BabylonGUI.TextBlock; // same as textlabel of GameOver

    private initTextblockGameOver(): void {
        this.textblockGameOver = new BabylonGUI.TextBlock();
        this.textblockGameOver.text = 'Game Over';
        this.textblockGameOver.color = 'white';
        this.textblockGameOver.fontSize = 40;
        this.textblockGameOver.width = '300px';
        this.textblockGameOver.height = '200px';
        this.textblockGameOver.top = '-150px';
        // this.textblockGameOver.left = '20px';
        this.textblockGameOver.zIndex = -1;

    }
    private initTextblockWin(): void {
        this.textblockWin = new BabylonGUI.TextBlock();
        this.textblockWin.text = 'Win';
        this.textblockWin.color = 'white';
        this.textblockWin.fontSize = 40;
        this.textblockWin.top = '-150px';
        this.textblockWin.width = '200px';
        this.textblockWin.height = '200px';
        this.textblockWin.zIndex = -1;
    }

    private progressBarLoading: any; // progressBar?
    private logoGameTitle: any; // maybe image?
    private initProgressBarLoading(): void { }
    private initLogoGameTitle(): void {
        // currently use a textblock...
        this.logoGameTitle = new BabylonGUI.TextBlock();
        this.logoGameTitle.text = "JumpCastle";
        this.logoGameTitle.fontSize = '48';
        this.logoGameTitle.top = '-200px';
    }

    private HPbar: BabylonGUI.Slider; // use something to simulate HP bar
    private SPbar: BabylonGUI.Slider; // same as HP bar;
    private initHPBar(): void {
        this.HPbar = new BabylonGUI.Slider();
        this.HPbar.minimum = 0;
        this.HPbar.maximum = 100;
        this.HPbar.value = 100;
        this.HPbar.height = "20px";
        this.HPbar.width = "200px";
        this.HPbar.displayThumb = false;
        this.HPbar.color = "yellow";
        this.HPbar.background = "red";
        this.HPbar.top = "-250px";
        this.HPbar.left = "-250px";
    }
    private initSPBar(): void {
        this.SPbar = new BabylonGUI.Slider();
        this.SPbar.minimum = 0;
        this.SPbar.maximum = 100;
        this.SPbar.value = 100;
        this.SPbar.height = "20px";
        this.SPbar.width = "160px";
        this.SPbar.displayThumb = false;
        this.SPbar.color = 'green';
        this.SPbar.background = "blue";
        this.SPbar.top = "-225px";
        this.SPbar.left = "-270px";
    }

    private textblockGold: BabylonGUI.TextBlock; // maybe BabylonGUI.TextBlock?
    private textblockSoul: BabylonGUI.TextBlock; // same as Gold label
    private initTextblockGold(): void {
        this.textblockGold = new BabylonGUI.TextBlock();
        this.textblockGold.text = 'G: 0';
        this.textblockGold.color = 'white';
        this.textblockGold.fontSize = 20;
        this.textblockGold.width = 0.2;
        this.textblockGold.height = "30px";
        this.textblockGold.top = '-250px';
        this.textblockGold.left = '-100px';

    }
    private initTextblockSoul(): void {
        this.textblockSoul = new BabylonGUI.TextBlock();
        this.textblockSoul.text = 'S: 0';
        this.textblockSoul.color = 'white';
        this.textblockSoul.fontSize = 20;
        this.textblockSoul.width = 0.2;
        this.textblockSoul.height = "40px";
        this.textblockSoul.top = '-220px';
        this.textblockSoul.left = '-100px'
    }

    private itemList: any; // something like an item list?
    private buffList: any; // same as itemList
    private initItemList(): void { }
    private initBuffList(): void { }

    private guiElementsGameRuntime: Array<any>; // same as above

    private initGUIElementsGameRuntime(): void {
        this.guiElementsGameRuntime = new Array<BabylonGUI.Control>();
        this.guiElementsGameRuntime.push(
            this.HPbar,
            this.SPbar,
            this.textblockGold,
            this.textblockSoul,
            this.itemList,
            this.buffList
        );
    }

    private static getFnOnClickedButtonStart(): () => void {
        let guiController = GUIController.getInstance();
        return () => {
            console.log('buttonStart clicked');
            // start game
            SceneController.getInstance().gameStart();
            guiController.GameRuntime();
        }
    }
    private static getFnOnClickedButtonRestart(): () => void {
        let guiController = GUIController.getInstance();
        return () => {
            console.log('buttonRestart clicked');
            // restart
            SceneController.getInstance().gameRestart();
            guiController.GameRuntime();
        }
    }

    private static getFnOnClickedButtonMute(): () => void {
        let guiController = GUIController.getInstance();
        return () => {
            console.log('buttonMute clicked');
            // mute/unmute
        }
    }
    private static getFnOnClickedButtonReturnToTitle(): () => void {
        let guiController = GUIController.getInstance();
        return () => {
            console.log('buttonReturnToTitle clicked');
            // return to title
            guiController.Title();
        }
    }

    registerEventHandler(): void {
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.GUIQuantityChange, GUIController.getFnOnGUIQuantityChange())
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.GameWin, GUIController.getFnOnGameWin())
        EventDispatcher.getInstance().addEventHandler(MyTypes.EventType.GameOver, GUIController.getFnOnGameOver())
    }

    private static getFnOnGUIQuantityChange(): MyTypes.EventHandler {
        let guiController = GUIController.getInstance();
        return <MyTypes.EventHandler>((eventType: MyTypes.EventType, eventMessage: MyTypes.EventMessage) => {
            let HUDtoChange: string = eventMessage.message;
            switch (HUDtoChange) {
                case "HP":
                    guiController.UpdateHPBar(eventMessage.object);
                    break;
                case "SP":
                    guiController.UpdateSPBar(eventMessage.object);
                    break;
                case "Gold":
                    guiController.UpdateGold(eventMessage.object);
                    break;
                case "Soul":
                    guiController.UpdateSoul(eventMessage.object);
                    break;
                case "ItemList":
                    guiController.UpdateItemList(eventMessage.object);
                    break;
                case "BuffList":
                    guiController.UpdateBuffList(eventMessage.object);
                    break;
            }
        })
    }

    private static getFnOnGameWin(): () => void {
        let guiController = GUIController.getInstance();
        return () => {
            guiController.Win();
        }
    }

    private static getFnOnGameOver(): () => void {
        let guiController = GUIController.getInstance();
        return () => {
            guiController.GameOver();
        }
    }
}


// loading scene test
export class MyLoadingScreen implements Babylon.ILoadingScreen {
    //optional, but needed due to interface definitions
    public loadingUIBackgroundColor: string;
    constructor(public loadingUIText: string) { }
    public displayLoadingUI() {
        alert(this.loadingUIText);
    }

    public hideLoadingUI() {
        alert("Loaded!");
    }
}