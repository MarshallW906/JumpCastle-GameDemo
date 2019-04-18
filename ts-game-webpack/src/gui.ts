import * as BabylonGUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";

import { GUIMode } from './types';
import { Button, AdvancedDynamicTexture } from "@babylonjs/gui";

/**
 * GUI may use another camera, which only captures the GUI elements.
 * But currently I don't know how to do it.
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

        // create all of the buttons, panels, textlabels, progressBar, HP/SP bar, and the game logo
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
        this.advancedTexture.addControl(this.buttonStart);


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
        this.advancedTexture.addControl(this.buttonRestart);

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
        this.advancedTexture.addControl(this.buttonMute);

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
        this.advancedTexture.addControl(this.buttonReturnToTitle);

        this.textblockGameOver = new BabylonGUI.TextBlock();
        this.textblockGameOver.text = 'Game Over';
        this.textblockGameOver.color = 'black';
        this.textblockGameOver.fontSize = 24;
        this.textblockGameOver.top = '-150px';
        this.advancedTexture.addControl(this.textblockGameOver);

        this.textblockWin = new BabylonGUI.TextBlock();
        this.textblockWin.text = 'Win';
        this.textblockWin.color = 'black';
        this.textblockWin.fontSize = 24;
        this.textblockWin.top = '-100px';
        this.advancedTexture.addControl(this.textblockWin);

        this.textblockGold = new BabylonGUI.TextBlock();
        this.textblockGold.text = 'G: 0';
        this.textblockGold.color = 'black';
        this.textblockGold.fontSize = 24;
        this.textblockGold.top = '-100px';
        this.textblockGold.left = '-200px'
        this.advancedTexture.addControl(this.textblockGold);

        this.textblockSoul = new BabylonGUI.TextBlock();
        this.textblockSoul.text = 'S: 0';
        this.textblockSoul.color = 'black';
        this.textblockSoul.fontSize = 24;
        this.textblockSoul.top = '-150px';
        this.textblockSoul.left = '-200px'
        this.advancedTexture.addControl(this.textblockSoul);

    }

    test(): void {
        let advancedTexture = BabylonGUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");

        let button1 = BabylonGUI.Button.CreateSimpleButton("button1", "button1text");
        button1.width = "150px";
        button1.height = "40px";
        button1.color = "white";
        button1.cornerRadius = 20;
        button1.background = "red";
        button1.onPointerUpObservable.add(() => {
            alert("button1 click event");
        });
        advancedTexture.addControl(button1);
    }

    Loading(): void {
        this.hideCurrentGUI();
        this.currentGUIMode = GUIMode.Loading;

        // display loading GUI
    }
    Title(): void {
        this.hideCurrentGUI();
        this.currentGUIMode = GUIMode.Title;

        // display Title GUI
    }
    GameRuntime(): void {
        this.hideCurrentGUI();
        this.currentGUIMode = GUIMode.GameRuntime;

        // display GameRuntime GUI
    }
    GameOver(): void {
        // no need to hideGUI()
        // this.hideCurrentGUI();
        this.currentGUIMode = GUIMode.GameOver;

        // display GameOver GUI
    }
    Win(): void {
        // no need to hideGUI()
        // this.hideCurrentGUI();
        this.currentGUIMode = GUIMode.Win;

        // display Win GUI
    }

    // Loading, Title, GameRuntime, GameOver, Win
    private currentGUIMode: GUIMode = GUIMode.HideAll;
    private hideCurrentGUI() {
        // hide all buttons, text labels, logos

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

    private textblockGameOver: any; // maybe BabylonGUI.TextBlock
    private textblockWin: any; // same as textlabel of GameOver

    private progressBarLoading: any; // progressBar?
    private logoGameTitle: any; // maybe image?

    private HPbar: any; // use something to simulate HP bar
    private SPbar: any; // same as HP bar;

    private textblockGold: any; // maybe BabylonGUI.TextBlock?
    private textblockSoul: any; // same as Gold label

    private itemList: any; // something like an item list?
    private buffList: any; // same as itemList

    private panelGameOver: any; // maybe something like a panel
    private panelWin: any; // same as panelGameOver

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