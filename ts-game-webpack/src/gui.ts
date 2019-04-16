import * as BabylonGUI from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";

export class GUIController {
    constructor() {

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

    init(): void { }
}


// loading scene 

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