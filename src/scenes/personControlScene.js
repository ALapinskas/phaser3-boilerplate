import CONSTANTS from "../constants";

class PersonControlScene extends Phaser.Scene {
    constructor() {
        super({key: CONSTANTS.SCENES.PERSON_CONTROL_SCENE})
    }

    preload() {
    }

    create() {
        console.log("its person control scene!!");
    }
}