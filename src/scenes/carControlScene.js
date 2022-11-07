import CONSTANTS from "../constants";

class CarControlScene extends Phaser.Scene {
    constructor() {
        super({key: CONSTANTS.SCENES.CAR_CONTROL_SCENE})
    }

    preload() {
    }

    create() {
        console.log("its car control scene!!");
    }
}