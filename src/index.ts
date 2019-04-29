import './css/style.css';

import { SceneController } from './scene';

function initBabylon(): void {
    let sceneController: SceneController = SceneController.getInstance();
    sceneController.initAll();
}

initBabylon();