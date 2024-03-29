import CONSTANTS from "./constants.js";

import { StartViewScene } from "./scenes/startViewScene.js";
import { MapViewScene } from "./scenes/mapViewScene.js";
import { OptionsViewScene } from "./scenes/optionsViewScene.js";
import { ControlsViewScene } from "./scenes/controlsViewScene.js";

const config = {
    type: Phaser.AUTO,
    scene: StartViewScene,
    scale: {
        mode: Phaser.Scale.RESIZE,
        min: {
            width: 390,
            height: 844
        },
        max: {
            width: 1920,
            height: 1080
        },
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
        default: 'matter',
        matter: {
            debug: false /*{
                showBody: true,
                showStaticBody: true
            }*/,
            gravity: false
        }
    }
};

document.onreadystatechange = function (event) {
    if (event.target.readyState == "interactive" || event.target.readyState === "complete") {
        var game = new Phaser.Game(config);
        game.scene.add(CONSTANTS.SCENES.MAP_VIEW_SCENE, MapViewScene);
        game.scene.add(CONSTANTS.SCENES.OPTIONS_VIEW_SCENE, OptionsViewScene);
        game.scene.add(CONSTANTS.SCENES.CONTROLS_VIEW_SCENE, ControlsViewScene);
    }
}