import CONSTANTS from "../constants.js";

export class OptionsViewScene extends Phaser.Scene {
    constructor() {
        super(CONSTANTS.SCENES.OPTIONS_VIEW_SCENE);
    }

    init(cameFrom) {
        this.cameFrom = cameFrom;
    }

    preload() {
        //this.load.scenePlugin('rexuiplugin', './lib/phaser3-rex-plugins/dist/rexuiplugin.js', 'rexUI', 'rexUI');
        this.load.scenePlugin('rexuiplugin', 'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins@1.1.75/dist/rexuiplugin.min.js', 'rexUI', 'rexUI');
    }

    create() {
        this.startMenuSounds = {
            itemSelect: this.sound.add("startMenuSelect")
        }
        this.activeSpeaker = true;
        this.overlay = this.add.rectangle(0, 0, 1600, 1200, CONSTANTS.COLOR_START_OPTIONS_BG, 1);
        this.overlay.setDepth(1);

        this.soundLabel = this.add.text(150, 200, 'sound volume:').setDepth(2);
        this.soundVolumeWidget = this.rexUI.add.slider({
            x: 380,
            y: 250,
            width: 200,
            height: 20,
            orientation: 'x',

            track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, CONSTANTS.COLOR_DARK),
            indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, CONSTANTS.COLOR_PRIMARY),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, CONSTANTS.COLOR_PRIMARY),

            valuechangeCallback: (value) => {
                localStorage.setItem("soundVolume", value);
                this.sound.setVolume(value); 
            },
            space: {
                top: 4,
                bottom: 4
            },
            input: 'click',
            value: this.sound.volume
        }).layout().setDepth(2);

        this.settingsPageButtons = this.rexUI.add.gridButtons({
            x: 340,
            y: 350,
            buttons: [
                [this.rexUI.add.label({
                    width: 30,
                    text: this.add.text(0, 0, "Back", {
                        fontSize: 20,
                        color: "#fff",
                    }),
                    space: {
                        left: 10, right: 10, top: 10, bottom: 10,
                        icon: 10
                    },
                    align: 'left',
                    name: "back"
                }),
                this.rexUI.add.label({
                    width: 30,
                    text: this.add.text(0, 0, "Set defaults", {
                        fontSize: 20,
                        color: "#fff",
                    }),
                    space: {
                        left: 10, right: 10, top: 10, bottom: 10,
                        icon: 10
                    },
                    align: 'left',
                    name: "defaults"
                })]
                // ...
            ],
            align: 0,
            click: {
                mode: 'pointerup',
                clickInterval: 100
            },
            space: {
                line: 3,
            }
        }).layout();

        this.settingsPageButtons.setDepth(2);

        this.settingsPageButtons.on("button.click", (btn, i, pointer, event) => {
            if (!this.startMenuSounds.itemSelect.isPlaying) { 
                this.startMenuSounds.itemSelect.play();
            }
            if (btn.name === "back") {
                this.hideSettingPage();
                document.body.style.cursor = "auto";
            } else if (btn.name === "defaults") {
                this.resetSettings();
            }
        });

        this.settingsPageButtons.on("button.over", (btn, i, pointer, event) => {
            btn.children[0].setStroke("#fff", 1);
            document.body.style.cursor = "pointer";
        });

        this.settingsPageButtons.on("button.out", (btn, i, pointer, event) => {
            btn.children[0].setStroke(CONSTANTS.COLOR_START_OPTIONS, 0);
            document.body.style.cursor = "auto";
            if (this.startMenuSounds.itemSelect.isPlaying) { 
                this.startMenuSounds.itemSelect.stop();
            }
        });

        window.addEventListener("resize", this.fixElementsPositions);

        this.fixElementsPositions();
    }

    resetSettings() {
        localStorage.setItem("soundVolume", CONSTANTS.DEFAULT_VOLUME_VALUE);
        this.soundVolumeWidget.setValue(CONSTANTS.DEFAULT_VOLUME_VALUE);
        this.sound.setVolume(CONSTANTS.DEFAULT_VOLUME_VALUE); 
    }

    hideSettingPage() {
        this.cleanUpScene();
        this.scene.stop(CONSTANTS.SCENES.OPTIONS_VIEW_SCENE);
        this.scene.run(this.cameFrom);
        if (this.cameFrom === CONSTANTS.SCENES.CONTROLS_VIEW_SCENE)
            this.scene.run(CONSTANTS.SCENES.MAP_VIEW_SCENE);
    }

    cleanUpScene = () => {
        window.removeEventListener('resize', this.fixElementsPositions);
    }

    fixElementsPositions = () => {
        let { width, height } = this.sys.game.canvas;
        this.soundLabel.x = width/2 - this.soundVolumeWidget.width/2 - 20;
        this.soundLabel.y = height/2 - 120;
        this.soundVolumeWidget.x = width/2 - 20;
        this.soundVolumeWidget.y = height/2 - 80;
        this.settingsPageButtons.x = width/2 - 20;
        this.settingsPageButtons.y = height/2;
    }
}