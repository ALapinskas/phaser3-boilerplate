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

        this.load.audio('startMenuSelect', './assets/start_menu_select.mp3');
        this.load.scenePlugin('rexuiplugin', './lib/rexuiplugin.min.js', 'rexUI', 'rexUI');
        this.scene.run(CONSTANTS.SCENES.CONTROLS_VIEW_SCENE);
    }

    create() {
        let { width, height } = this.sys.game.canvas;
        window.addEventListener("resize", this.fixElementsPositions);

        this.textBg = this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, CONSTANTS.COLOR_PRIMARY)
        .setStrokeStyle(2, CONSTANTS.COLOR_LIGHT);
        this.text = this.rexUI.add.BBCodeText(0, 0, CONSTANTS.DUMMY_TEXTS[0], {
            //fixedWidth: 800,
            //fixedHeight: 200,
    
            fontSize: '20px',
            wrap: {
                mode: 'word',
                width: width - 60
            },
            maxLines: 3
        });
        this.textBox = this.rexUI.add.textBox({
            x: 0,
            y: 0,
            // anchor: undefined,
            // width: undefined,
            // height: undefined,
            background: this.textBg,

            text: this.text,

            //icon: this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, COLOR_DARK),
            orientation: 0,
        
            actionMask: false,
        
            space: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10,
        
                icon: 0,
                text: 0,
            },
        
            // page: { 
            //    maxLines: undefined,
            //    pageBreak: '\f\n',
            // },
            // typing: { 
            //    wrap: false,
            //    speed: 333,    
            // },
        
            // name: '',
            // draggable: false,
            // sizerEvents: false,
            // enableLayer: false,
        });

        this.textBox
        .setInteractive()
        .on('pointerdown', function () {
            console.log("clicked");
            this.start(CONSTANTS.DUMMY_TEXTS[1], 1);
        }, this.textBox)
        .on('pageend', function () {
            console.log("page end");
        });

        this.textBox.start(CONSTANTS.DUMMY_TEXTS[0], 1);

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
        this.textBox.setX(width/2);
        this.textBox.setY(150);
        this.text.setWrapWidth(width - 20);
    }
}