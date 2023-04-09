import CONSTANTS from "../constants.js";

export class StartViewScene extends Phaser.Scene {
    constructor() {
        super(CONSTANTS.SCENES.START_VIEW_SCENE);
    }

    preload() {
        this.load.audio('startMenuSelect', './assets/start_menu_select.mp3');
        this.load.scenePlugin('rexuiplugin', './lib/rexuiplugin.min.js', 'rexUI', 'rexUI');
        //this.load.scenePlugin('rexuiplugin', 'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins@1.1.75/dist/rexuiplugin.min.js', 'rexUI', 'rexUI');
    }

    create() {
        const soundVolumeValue = localStorage.getItem('soundVolume') || CONSTANTS.DEFAULT_VOLUME_VALUE;
        this.sound.setVolume(soundVolumeValue);
        
        this.startMenuSounds = {
            itemSelect: this.sound.add("startMenuSelect")
        }
        
        this.startGameTitle = this.add.text(260, 260, "Game title", {
            fontSize: 32,
        });
        this.startGameButtons = this.rexUI.add.fixWidthButtons({
            x: 340,
            y: 350,
            buttons: [
                this.rexUI.add.label({
                    width: 30,
                    //background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, START_OPTIONS_COLOR).setStrokeStyle(2, START_OPTIONS_COLOR),
                    icon: this.add.circle(0, 0, 10).setStrokeStyle(1, CONSTANTS.COLOR_START_OPTIONS),
                    text: this.add.text(0, 0, "Start game", {
                        fontSize: 20,
                    }),
                    space: {
                        left: 10, right: 10, top: 10, bottom: 10,
                        icon: 10
                    },
                    align: 'left',
                    name: "play"
                }),
                this.rexUI.add.label({
                    width: 30,
                    //background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, START_OPTIONS_COLOR).setStrokeStyle(2, START_OPTIONS_COLOR),
                    icon: this.add.circle(0, 0, 10).setStrokeStyle(1, CONSTANTS.COLOR_START_OPTIONS),
                    text: this.add.text(0, 0, "Options", {
                        fontSize: 20,
                    }),
                    space: {
                        left: 10, right: 10, top: 10, bottom: 10,
                        icon: 10
                    },
                    align: 'left',
                    name: "options"
                })
                // ...
            ],
            // rtl: false,
            align: 0,
            click: {
                mode: 'pointerup',
                clickInterval: 100
            },
            space: {
                line: 3,
            }
        }).layout();

        this.startGameButtons.on("button.click", (btn, i, pointer, event) => {
            if (!this.startMenuSounds.itemSelect.isPlaying)
                this.startMenuSounds.itemSelect.play();
            if (btn.name === "play") {
                this.startGame();
                document.body.style.cursor = "auto";
            } else {
                this.openSettingPage();
            }
        });

        this.startGameButtons.on("button.over", (btn, i, pointer, event) => {
            btn.children[0].setFillStyle(CONSTANTS.COLOR_START_OPTIONS);
            btn.children[1].setStroke("#fff", 1);
            document.body.style.cursor = "pointer";       
           
        });

        this.startGameButtons.on("button.out", (btn, i, pointer, event) => {
            btn.children[0].setFillStyle();
            btn.children[1].setStroke("#fff", 0);
            document.body.style.cursor = "auto";
            if (this.startMenuSounds.itemSelect.isPlaying) { 
                this.startMenuSounds.itemSelect.stop();
            }
        });

        window.addEventListener("resize", this.fixElementsPositions);

        this.fixElementsPositions();
    }

    cleanUpScene = () => {
        document.removeEventListener('keydown', this.startGame);
        window.removeEventListener('resize', this.fixElementsPositions);
    }

    startGame = () => {
        this.cleanUpScene();
        this.scene.stop(CONSTANTS.SCENES.START_VIEW_SCENE);
        this.scene.start(CONSTANTS.SCENES.MAP_VIEW_SCENE);
    }

    openSettingPage() {
        this.cleanUpScene();
        this.scene.stop(CONSTANTS.SCENES.START_VIEW_SCENE);
        this.scene.start(CONSTANTS.SCENES.OPTIONS_VIEW_SCENE, CONSTANTS.SCENES.START_VIEW_SCENE);
    }
    
    fixElementsPositions = () => {
        let { width, height } = this.sys.game.canvas;
        this.startGameTitle.x = width/2 - this.startGameTitle.width/2;
        this.startGameTitle.y = height/3;
        this.startGameButtons.x = width/2;
        this.startGameButtons.y = height/3 + this.startGameTitle.height + 80;
    }
}