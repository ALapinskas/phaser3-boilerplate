import CONSTANTS from "../constants";

class DialogControlScene extends Phaser.Scene {
    constructor() {
        super({key: CONSTANTS.SCENES.DIALOG_CONTROL_SCENE})
    }

    preload() {
    }

    create() {
        console.log("its dialog control scene!!");
    }
}