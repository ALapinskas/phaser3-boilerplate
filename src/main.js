import CONSTANTS from "./constants.js";

import { StartViewScene } from "./scenes/startViewScene.js";
import { MapViewScene } from "./scenes/mapViewScene.js";
import { OptionsViewScene } from "./scenes/optionsViewScene.js";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: StartViewScene,
    physics: {
        default: 'matter',
        matter: {
            debug: false,
            gravity: {
                x: 0,
                y: 0
            }
        }
    }
};

document.onreadystatechange = function () {
    if (document.readyState == "interactive") {
        var game = new Phaser.Game(config);
        game.scene.add(CONSTANTS.SCENES.MAP_VIEW_SCENE, MapViewScene);
        game.scene.add(CONSTANTS.SCENES.OPTIONS_VIEW_SCENE, OptionsViewScene);
    }
}