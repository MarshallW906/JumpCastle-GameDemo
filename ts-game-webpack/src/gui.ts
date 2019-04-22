import * as BabylonGUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";

import { GUIMode, ItemCollection } from './types';
import { SceneController } from "./scene";

/**
 * GUI may use another camera, which only captures the GUI elements.
 * But currently I don't know how to do it.
 * Some warnings emerged when enable the panels.
 * needs checks.
 */
export class GUIController {
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

        this.initPanelGameOver();
        this.initPanelWin();
        this.initPanelGameRuntime();

        this.composeGUItest();
    }

    private composeGUItest(): void {
        // this.advancedTexture.addControl(this.logoGameTitle);
        this.advancedTexture.addControl(this.buttonMute);

        this.panelGameOver.addControl(this.textblockGameOver);

        this.panelWin.addControl(this.textblockWin);

        this.panelGameRuntime.addControl(this.HPbar);
        this.panelGameRuntime.addControl(this.SPbar);
        this.panelGameRuntime.addControl(this.textblockGold);
        this.panelGameRuntime.addControl(this.textblockSoul);
        this.panelGameRuntime.addControl(this.itemList);
        this.panelGameRuntime.addControl(this.buffList);

        this.advancedTexture.addControl(this.panelGameRuntime);
        this.advancedTexture.addControl(this.panelWin);
        this.advancedTexture.addControl(this.panelGameOver);
    }

    test(): void {
        console.log('test guicontroller func');
        this.panelWin.addControl(this.textblockGold);
    }

    Loading(): void {
        this.hideCurrentGUI();
        this.currentGUIMode = GUIMode.Loading;

        // display loading GUI
        // this.progressBarLoading.isVisible = true;
        this.logoGameTitle.isVisible = true;
    }
    Title(): void {
        this.hideCurrentGUI();
        this.currentGUIMode = GUIMode.Title;

        // display Title GUI
        this.logoGameTitle.isVisible = true;
        this.buttonStart.isVisible = true;
        this.advancedTexture.addControl(this.buttonStart);
    }
    GameRuntime(): void {
        this.hideCurrentGUI();
        this.currentGUIMode = GUIMode.GameRuntime;

        // display GameRuntime GUI
        this.panelGameRuntime.isVisible = true;
    }
    GameOver(): void {
        // no need to hideGUI()
        // this.hideCurrentGUI();
        this.currentGUIMode = GUIMode.GameOver;

        // display GameOver GUI
        this.panelGameOver.isVisible = true;
        this.buttonReturnToTitle.isVisible = true;
        this.buttonRestart.isVisible = true;
    }
    Win(): void {
        // no need to hideGUI()
        // this.hideCurrentGUI();
        this.currentGUIMode = GUIMode.Win;

        // display Win GUI
        this.panelWin.isVisible = true;
        this.buttonReturnToTitle.isVisible = true;
        this.buttonRestart.isVisible = true;
    }

    HideAll(): void {
        this.hideCurrentGUI();
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
    }

    UpdateHPBar(curHP: number): void { }

    UpdateSPBar(curSP: number): void { }

    UpdateGold(curGold: number): void { }

    UpdateSoul(curSoul: number): void { }

    UpdateItemList(curItemList: ItemCollection): void { }

    UpdateBuffList(curBuffList: any): void { }

    // Loading, Title, GameRuntime, GameOver, Win
    private currentGUIMode: GUIMode = GUIMode.HideAll;
    private hideCurrentGUI() {
        // hide all buttons, text labels, logos except ButtonMute(never needs to be hidden)

        this.logoGameTitle.isVisible = false;
        // this.progressBarLoading.isVisible = false;
        this.panelGameOver.isVisible = false; // textblockGameOver
        this.panelWin.isVisible = false;      // textblockWin
        this.panelGameRuntime.isVisible = false; // HP&SP bar, Gold, Soul, Item&Buff List

        this.buttonStart.isVisible = false;
        this.buttonRestart.isVisible = false;
        this.buttonReturnToTitle.isVisible = false;

        // set currentGUIMode to "HideAll"
        this.currentGUIMode = GUIMode.HideAll;
    }

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
        this.buttonStart.onPointerUpObservable.add(this.onClickedButtonStart)
        // this.buttonStart.left = '0';
        this.buttonStart.top = '100';
        this.buttonStart.isVisible = true;
    }
    private initButtonRestart(): void {
        this.buttonRestart = BabylonGUI.Button.CreateSimpleButton("Restart", "Restart");
        this.buttonRestart.width = '200px';
        this.buttonRestart.height = '40px';
        this.buttonRestart.color = 'black';
        this.buttonRestart.cornerRadius = 0;
        this.buttonRestart.background = 'yellow';
        this.buttonRestart.onPointerUpObservable.add(this.onClickedButtonRestart);
        // this.buttonRetart.left = '0';
        this.buttonRestart.top = '150px';
        this.buttonRestart.isVisible = true;
    }
    private initButtonMute(): void {
        this.buttonMute = BabylonGUI.Button.CreateSimpleButton("Mute/UnMute", "M");
        this.buttonMute.cornerRadius = 90;
        this.buttonMute.width = '20px';
        this.buttonMute.height = '20px';
        this.buttonMute.color = 'black';
        this.buttonMute.background = 'yellow';
        this.buttonMute.onPointerUpObservable.add(this.onClickedButtonMute);
        this.buttonMute.left = '300px';
        this.buttonMute.top = '-200px';
        this.buttonMute.isVisible = true;
    }
    private initButtonReturnToTitle(): void {
        this.buttonReturnToTitle = BabylonGUI.Button.CreateSimpleButton("ReturnToTitle", "Return To Title");
        this.buttonReturnToTitle.cornerRadius = 0;
        this.buttonReturnToTitle.width = '200px';
        this.buttonReturnToTitle.height = '40px';
        this.buttonReturnToTitle.color = 'black';
        this.buttonReturnToTitle.background = 'yellow';
        this.buttonReturnToTitle.onPointerUpObservable.add(this.onClickedButtonReturnToTitle);
        // this.buttonReturnToTitle.left = '0';
        this.buttonReturnToTitle.top = '200px';
        this.buttonReturnToTitle.isVisible = true;
    }

    private textblockGameOver: any; // maybe BabylonGUI.TextBlock
    private textblockWin: any; // same as textlabel of GameOver

    private initTextblockGameOver(): void {
        this.textblockGameOver = new BabylonGUI.TextBlock();
        this.textblockGameOver.text = 'Game Over';
        this.textblockGameOver.color = 'white';
        this.textblockGameOver.fontSize = 24;
        // this.textblockGameOver.top = '-150px';
        // this.textblockGameOver.left = '20px';

    }
    private initTextblockWin(): void {
        this.textblockWin = new BabylonGUI.TextBlock();
        this.textblockWin.text = 'Win';
        this.textblockWin.color = 'black';
        this.textblockWin.fontSize = 24;
        this.textblockWin.top = '-100px';
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

    private HPbar: any; // use something to simulate HP bar
    private SPbar: any; // same as HP bar;
    private initHPBar(): void { }
    private initSPBar(): void { }

    private textblockGold: any; // maybe BabylonGUI.TextBlock?
    private textblockSoul: any; // same as Gold label
    private initTextblockGold(): void {
        this.textblockGold = new BabylonGUI.TextBlock();
        this.textblockGold.text = 'G: 0';
        this.textblockGold.color = 'white';
        this.textblockGold.fontSize = 24;
        // this.textblockGold.top = '-100px';
        // this.textblockGold.left = '-200px'
    }
    private initTextblockSoul(): void {
        this.textblockSoul = new BabylonGUI.TextBlock();
        this.textblockSoul.text = 'S: 0';
        this.textblockSoul.color = 'white';
        this.textblockSoul.fontSize = 24;
        // this.textblockSoul.top = '-150px';
        // this.textblockSoul.left = '-200px'
    }

    private itemList: any; // something like an item list?
    private buffList: any; // same as itemList
    private initItemList(): void { }
    private initBuffList(): void { }

    private panelGameOver: any; // maybe something like a panel
    private panelWin: any; // same as panelGameOver
    private panelGameRuntime: any; // same as above
    private initPanelGameOver(): void {
        this.panelGameOver = new BabylonGUI.StackPanel("GameOver");
        this.panelGameOver.background = 'red';
        this.panelGameOver.left = '20%';
        this.panelGameOver.width = '30%';
        this.panelGameOver.height = '40%';
    }
    private initPanelWin(): void {
        this.panelWin = new BabylonGUI.StackPanel("Win");
        this.panelWin.background = 'red';
        this.panelWin.left = '-20%';
        this.panelWin.width = '30%';
        this.panelWin.height = '40%';
    }
    private initPanelGameRuntime(): void {
        this.panelGameRuntime = new BabylonGUI.StackPanel("GameRuntime");
        // this.panelWin.background = '';  background transparent, no filling color.
        // this.panelGameRuntime.width = '100%'; default to 100%.
        this.panelGameRuntime.width = '90%';
        this.panelGameRuntime.height = '90%';
        this.panelGameRuntime.background = 'blue';
        this.panelGameRuntime.alpha = 0.5;
        this.panelGameRuntime.isVisible = true;
        this.panelGameRuntime.zIndex = -1;
    }

    private onClickedButtonStart(): void {
        console.log('buttonStart clicked');
        // start game
    }
    private onClickedButtonRestart(): void {
        console.log('buttonRestart clicked');
        // restart
    }

    private onClickedButtonMute(): void {
        console.log('buttonMute clicked');
        // mute/unmute
    }
    private onClickedButtonReturnToTitle(): void {
        console.log('buttonReturnToTitle clicked');
        // return to title
    }
}


// loading scene test
export class MyLoadingScreen implements BABYLON.ILoadingScreen {
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