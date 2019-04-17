import * as BabylonGUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";

import { GUIMode } from './types';

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
        // create all of the buttons, panels, textlabels, progressBar, HP/SP bar, and the game logo
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

    // buttons
    private buttonStart: BabylonGUI.Button;
    private buttonRestart: BabylonGUI.Button;
    private buttonMute: BabylonGUI.Button;
    private buttonReturnToTitle: BabylonGUI.Button;

    private textlabelGameOver: any; // maybe BabylonGUI.TextBlock
    private textlabelWin: any; // same as textlabel of GameOver

    private progressBarLoading: any; // progressBar?
    private logoGameTitle: any; // maybe image?

    private HPbar: any; // use something to simulate HP bar
    private SPbar: any; // same as HP bar;

    private textlabelGold: any; // maybe BabylonGUI.TextBlock?
    private textlabelSoul: any; // same as Gold label

    private itemList: any; // something like an item list?
    private buffList: any; // same as itemList

    private panelGameOver: any; // maybe something like a panel
    private panelWin: any; // same as panelGameOver
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