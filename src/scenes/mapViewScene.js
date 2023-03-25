import CONSTANTS from "../constants.js";

export class MapViewScene extends Phaser.Scene {
    constructor() {
        super(CONSTANTS.SCENES.MAP_VIEW_SCENE)
    }

    init() {
    }

    preload() {
        this.keyPressed = { ArrowUp: false, KeyW: false, ArrowLeft: false, KeyA: false, ArrowRight: false, KeyD: false, ArrowDown: false, KeyS: false,
            Enter:false, KeyE:false };

        this.load.audio('startMenuSelect', '/assets/start_menu_select.mp3');

        this.scene.run(CONSTANTS.SCENES.CONTROLS_VIEW_SCENE);
    }

    create() {
        window.addEventListener("resize", this.fixElementsPositions);

        this.fixElementsPositions();
    }

    buildMap () {
        this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.matter.world.on("collisionstart", (event, bodyA, bodyB) => {
            try {
                console.log("collision");
                console.log("bodyA: ", bodyA);
                console.log("bodyB: ", bodyB);
            } catch (error) {
                console.error(error);
            }
        });
    }

    update() {
    
    }

    pressKeyActionPlayer(event) {
        const code = event.code,
            keyPressed = this.keyPressed;

        keyPressed[code] = true;

        if (keyPressed["ArrowUp"] || keyPressed["KeyW"]){
            console.log("move up");
        }
        if (keyPressed["ArrowLeft"] || keyPressed["KeyA"]){
            console.log("move left");
        }
        if (keyPressed["ArrowRight"] || keyPressed["KeyD"]){
            console.log("move right");
        }
        if (keyPressed["ArrowDown"] || keyPressed["KeyS"]){
            console.log("move down");
        }
        if (keyPressed["Enter"] || keyPressed["KeyE"]) {
            
        }
    }

    removeKeyActionPlayer(event) {
        const code = event.code,
            keyPressed = this.keyPressed;
            
        if (keyPressed["ArrowUp"] || keyPressed["KeyW"]) {
            
        }
        if (keyPressed["ArrowLeft"] || keyPressed["KeyA"]) {

        }
        if (keyPressed["ArrowRight"] || keyPressed["KeyD"]) {

        }
        if (keyPressed["ArrowDown"] || keyPressed["KeyS"]) {

        }
        keyPressed[code] = false;
    }

    resetAllKeys() {
        Object.keys(this.keyPressed).forEach((key) => this.keyPressed[key] = false);
    }

    setupPlayerListeners() {
        document.addEventListener('keydown', this.pressKeyActionPlayer);
        document.addEventListener('keyup', this.removeKeyActionPlayer);
    }

    removePlayerListeners() {
        document.removeEventListener('keydown', this.pressKeyActionPlayer);
        document.removeEventListener('keyup', this.removeKeyActionPlayer);
    }

    cleanUpScene = () => {
        window.removeEventListener('resize', this.fixElementsPositions);
    }

    fixElementsPositions = () => {
        let { width, height } = this.sys.game.canvas;
    }
}