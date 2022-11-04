import CONSTANTS from "./constants";
import { Person, Dialog, DialogInjectable, DialogSelectable, SelectableText } from "./person";

class MainScene extends Phaser.Scene {

    preload() {
        const soundVolumeValue = localStorage.getItem('soundVolume');
        this.keyPressed = { ArrowUp: false, KeyW: false, ArrowLeft: false, KeyA: false, ArrowRight: false, KeyD: false, ArrowDown: false, KeyS: false,
            Enter:false, KeyE:false };
        this.activeCar = undefined;
        this.cursors = undefined;
        this.startGameTitle = undefined;
        this.startGameOptions = undefined;
        this.playerName = undefined;
        this.cars = {};
        this.people = {};
        this.objectivesComplete = { sitInACar: false, driveAround: false, leaveCar: false };
        this.load.image({
            key: 'tiles',
            url: 'images/sity-2d/Tilemap/tilemap_packed.png',
          });
        this.load.tilemapTiledJSON('map', 'images/sity-2d/Tilemap/city.json');
        this.load.spritesheet('dudes', 'images/sity-2d/Tilemap/dudes.png', { frameWidth: 16, frameHeight: 16 });
        this.load.image('car', 'images/racingpack/PNG/Cars/car_black_1.png');
        this.load.image('car2', 'images/racingpack/PNG/Cars/car_red_4.png');
        this.load.image('checkImage', 'images/check.svg');
        //this.load.spritesheet('teacher', 'images/teacher_sprite_cut.jpg', { frameWidth: 82, frameHeight: 32 });
        this.load.spritesheet('teacher', 'images/teacher_sprite.png', { frameWidth: 342, frameHeight: 523 });

        this.load.plugin('rexoutlinepipelineplugin', './lib/phaser3-rex-plugins/dist/rexoutlinepipelineplugin.min.js', true);

        this.load.scenePlugin('rexuiplugin', './lib/phaser3-rex-plugins/dist/rexuiplugin.js', 'rexUI', 'rexUI');

        this.load.audio('startEngine1', './assets/engine_start.mp3');
        this.load.audio('carRearMove', './assets/car_rearmove.mp3');
        this.load.audio('carCrash', './assets/car_crash.mp3');
        this.load.audio('engineWork', '/assets/engine_work.mp3');
        this.load.audio('engineWork2', '/assets/engine_work2.mp3');
        this.load.audio('engineUp', '/assets/engine_up.mp3');
        this.load.audio('carLocked', '/assets/car_locked.mp3');
        this.load.audio('fallIntoWater', '/assets/large-falls-into-water.mp3');
        this.load.audio('startMenuSelect', '/assets/start_menu_select.mp3');
        this.soundVolumeValue = soundVolumeValue ? soundVolumeValue : CONSTANTS.DEFAULT_VOLUME_VALUE;
        this.sound.setVolume(this.soundVolumeValue); 

        this.gameOverText = "Oh no!!! You sinked. Now you will have to start from the beginning!";

        this.gameStarted = false;
        this.gameOvered = false;
        this.firstPartTasksFinished = false;
        this.allTasksAreComplete = false;
        this.activeSpeaker = undefined;
        this.isSettingPageActive = false;
        this.tasksTracker = [[false, false, false, false, false], [false, false, false, false]];
        this.pressKeyActionPlayer = this.pressKeyActionPlayer.bind(this);
        this.removeKeyActionPlayer = this.removeKeyActionPlayer.bind(this);
        this.pressKeyActionCar = this.pressKeyActionCar.bind(this);
        this.removeKeyActionCar = this.removeKeyActionCar.bind(this);

        this.pressKeyActionDialog = this.pressKeyActionDialog.bind(this);
        this.removeKeyActionDialog = this.removeKeyActionDialog.bind(this);
        this.clickActionDialog = this.clickActionDialog.bind(this);
    }

    create() {
        this.anims.create({
            key: 'teacher_talk',
            frames: this.anims.generateFrameNumbers('teacher', {start: 0, end: 0, frames:[1,0]}),
            frameRate: 6,
            repeat:15
        });
        this.anims.create({
            key: 'teacher_disappointed',
            frames: this.anims.generateFrameNumbers('teacher', {start: 0, end: 0, frames:[5,7]}),
            frameRate: 1,
            repeat:0
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dudes', { start: 0, end: 1, frames:[4,8] }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('dudes', {start: 0, end: 1, frames:[5,9]}),
            frameRate: 8,
            repeat:-1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dudes', {start: 0, end: 1, frames:[7,11]}),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('dudes', {start: 0, end: 1, frames:[6,10]}),
            frameRate: 8,
            repeat:-1
        });

        this.anims.create({
            key: 'standLeft',
            frames: [ { key: 'dudes', frame: 0 } ]
        });
        this.anims.create({
            key: 'standDown',
            frames: [ { key: 'dudes', frame: 1 } ]
        });
        this.anims.create({
            key: 'standUp',
            frames: [ { key: 'dudes', frame: 2 } ]
        });
        this.anims.create({
            key: 'standRight',
            frames: [ { key: 'dudes', frame: 3 } ]
        });

        this.startMenuSounds = {
            itemSelect: this.sound.add("startMenuSelect")
        }
        //dudes.push(this.add.existing(new Dude(this, 240, 290, 'walk', 'west', 10)));
        //dudes.push(this.add.existing(new Dude(this, 100, 380, 'walk', 'northWest', 20)));
        //dudes.push(this.add.existing(new Dude(this, 620, 140, 'walk', 'south', 30)));
        if (this.gameStarted) {
            this.buildMap();
        } else {
            this.renderBanner();
        }
    }

    buildMap () {
        //buildings = scene.physics.add.staticGroup();
        this.cursors = this.input.keyboard.createCursorKeys(); 
        //  Parse the data out of the map
        const map = this.make.tilemap({ key: 'map'});
    
        // add the tileset image we are using
        const tileset = map.addTilesetImage('tilemap_packed','tiles');
        
        // create the layers we want in the right order
        var background = map.createLayer('background', tileset);
    
        var housesLayer = map.createLayer('houses', tileset);
        
        map.createLayer('decorations', tileset); 
        map.createLayer('decorations2', tileset);
        
        map.getObjectLayer('building_names').objects.forEach((objectLayer) => {
            this.add.text(objectLayer.x, objectLayer.y, objectLayer.text.text,  {color: objectLayer.text.color, stroke: objectLayer.text.color, strokeThickness: 1, backgroundColor: "#ccc"});
        });
        var riverLayer = map.createLayer('river', tileset);

        this.riverLayerDimensions = {
            minWidth: null,
            minHeight: null,
            maxWidth: 0,
            maxHeight: 0
        };

        housesLayer.setCollisionByExclusion([-1]);
        //housesLayer.setCollisionByProperty({ collides: true }); //doesn't works for some reasons
        //riverLayer.setCollisionByProperty({ collides: true }); //doesn't works for some reasons
        riverLayer.setCollisionByExclusion([-1]);

        this.matter.world.convertTilemapLayer(housesLayer);
        this.matter.world.convertTilemapLayer(riverLayer);
        //this.player.setCollideWorldBounds(true);
        this.matter.world.setBounds(0, 0, background.width, background.height);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        riverLayer.forEachTile((tile) => {
            if (tile.physics.matterBody) {
                tile.physics.matterBody.body.parts.forEach((part) => {
                    part.isSensor = true;
                });
                if (tile.pixelX > this.riverLayerDimensions.maxWidth) {
                    this.riverLayerDimensions.maxWidth = tile.pixelX;
                }
                if (tile.pixelY > this.riverLayerDimensions.maxHeight) {
                    this.riverLayerDimensions.maxHeight = tile.pixelY;
                }
                if (this.riverLayerDimensions.minWidth === null || tile.pixelX < this.riverLayerDimensions.minWidth) {
                    this.riverLayerDimensions.minWidth = tile.pixelX;
                }
                if (this.riverLayerDimensions.minHeight === null || tile.pixelY < this.riverLayerDimensions.minHeight) {
                    this.riverLayerDimensions.minHeight = tile.pixelY;
                }
            }
        });

        this.riverLayerDimensions.maxWidth += riverLayer.tilemap.tileWidth;
        this.riverLayerDimensions.maxHeight += riverLayer.tilemap.tileHeight;

        this.parkCheckpoint = this.add.rectangle(535, 125, 50, 30, CONSTANTS.COLOR_LIGHT, 0.6);
        const parkCheck = this.matter.add.gameObject(this.parkCheckpoint, { isSensor:true });
        parkCheck.setData("name", "parkCheckpoint");
        parkCheck.setDepth(0);

        this.cars["car"] = this.createCar(248, 500, 0, 0.9, 100, 'car');
        this.cars["car"].locked = true;
        //this.cars["car"] = this.createCar(520, 220, 0, 0.9, 100, 'car');
        this.cars["car2"] = this.createCar(535, 93, 90, 1.2, 500, 'car2');

        this.people["monica"] = this.createPerson(190, 450, "monica", 15);
        this.people["monica"].setDialogs([
            new DialogInjectable (
                "Hello student! My name is Monica, i'll be you teacher today! What is your name?",
                "My name is: ",
                "Please enter your name.",
                true
            ),
            new Dialog (
                "Nice to meet you! " + this.playerName + ". You will have to finish tasks to pass the exam, the current and done tasks will eb written in your diary, please click on the diary icon on the right bottom.\n"
            ),
            new Dialog (
                "Well done! Now you see the task list, finish all the tasks in the list to go further.\n"
            ),
            new Dialog (
                "When you come closer, the car become highlighted, this means you can interact with it. Press 'e' or 'Enter' to start interaction.\n"
            ),
            new Dialog (
                "Looks like the car is locked, go and talk to Joe, is is standing near the hospital entrance.\n"
            ),
            new Dialog (
                "Next tasks will be with driving the car. While you will be inside the car push 'w', or '↑' to gear up, 's', or '↓' to break, or move backward. While you're moving press 'a' or '←' to turn left, 'd' or '→' to turn right.\n"
            ),
            new Dialog (
                "Congratulation's you finished all the tasks! Exam is passed. You could check your marks in the dairy! Bye!!!\n"
            )
        ]);
        this.people["joe"] =  this.createPerson(130, 510, "joe", 51);
        this.people["joe"].setDialogs([
            new DialogSelectable(
                [
                    {
                        correct: true,
                        text: "Nice too meet you Joe, Monica said you can give me a key for the car?"
                    },
                    {
                        correct: false,
                        text: "Hi bro, said you Monica about the key for the car?"
                    }
                    
                ],
                [
                    {
                        correct: true,
                        text: "Yes, here you are",
                    },
                    {
                        correct: false,
                        text: "I'm not understand..."
                    }
                ],
                true
            )
        ]);
        
        this.pipelineInstance = this.plugins.get("rexoutlinepipelineplugin");
    
        this.createPlayer(200, 450);

        this.helperText = this.rexUI.add.textBox({
            x: 400,
            y: 270,
            // anchor: undefined,
            width: 760,
            //height: 100,
        
            orientation: 0,
        
            background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, CONSTANTS.COLOR_PRIMARY)
                .setStrokeStyle(2, CONSTANTS.COLOR_LIGHT),

            icon: this.matter.add.sprite(0, 0).play('teacher_talk').setScale(0.3, 0.3),
            iconMask: false,
            text: this.add.text(0, 0, "", {
                fontSize: '24px',
                maxLines: 8,
                color: '#fff',
                wordWrap: { width: 600 },
                padding: {
                    left: 20,
                }
            }),
            //action: actionGameObject,
            actionMask: false,
            //enableLayer: true,
            space: {
                left: 10,
                right: 5,
                top: 5,
                bottom: 2,
        
                icon: 0,
                text: 0,
            }
        });
        this.helperText.setDepth(3);

        this.tasksFirst = this.rexUI.add.fixWidthButtons({
            x: 640,
            y: 480,
            buttons: [
                this.createCheckBox("Move up (w, ↑)"),
                this.createCheckBox("Move down (s, ↓)"),
                this.createCheckBox("Move left, (a, ←)"),
                this.createCheckBox("Move right, (d, →)"),
                this.createCheckBox("Move closer to the black car"),
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
        this.helperText.hide();
        this.openSpeakDialog("monica");
        
        this.checkActionDistance(this.player.x, this.player.y);

        this.checkpoint1 = this.add.rectangle(230, 250, 120, 10);
        this.checkpoint2 = this.add.rectangle(380, 370, 10, 100);
        this.checkpoint3 = this.add.rectangle(470, 250, 80, 10);

        const firstCheck = this.matter.add.gameObject(this.checkpoint1, {isSensor:true});
        firstCheck.setData("name", "checkpoint1");
        const secondCheck = this.matter.add.gameObject(this.checkpoint2, {isSensor:true});
        secondCheck.setData("name", "checkpoint2");
        const thirdCheck = this.matter.add.gameObject(this.checkpoint3, {isSensor:true});
        thirdCheck.setData("name", "checkpoint3");

        this.checkpointsReached = [];

        this.matter.world.on("collisionstart", (event, bodyA, bodyB) => {
            try {
                const bodyBName = bodyB && bodyB.gameObject ? bodyB.gameObject.getData("name") : "wall",
                    bodyAType = bodyA.gameObject && bodyA.gameObject.texture && bodyA.gameObject.texture.key,
                    bodyALayerName = bodyA.gameObject && bodyA.gameObject.tile && bodyA.gameObject.tile.layer.name,
                    bodyBCar = bodyB.gameObject && bodyB.gameObject.texture && (bodyB.gameObject.texture.key === "car" || bodyB.gameObject.texture.key === "car2"),
                    bodyBType = bodyB.gameObject && bodyB.gameObject.texture && bodyB.gameObject.texture.key,
                    bodyACar = bodyAType && (bodyAType === "car" || bodyAType === "car2");
        
                if (bodyALayerName === "river" && bodyBCar) {
                    //console.log("depth: ", event.pairs[0].collision.depth);
                    //console.log("depth: ", event.pairs[0].collision);
                    const riverMinX = this.riverLayerDimensions.minWidth,
                        riverMinY = this.riverLayerDimensions.minHeight,
                        riverMaxX = this.riverLayerDimensions.maxWidth,
                        riverMaxY = this.riverLayerDimensions.maxHeight,
                        carPosX = bodyB.position.x,
                        carPosY = bodyB.position.y,
                        isCarDirectionForward = this.cars[this.activeCar].speed >= 0;
                    console.warn("be carful!");
                    const sinkWidth = 5;
                    if ((riverMinX - sinkWidth) < carPosX && (riverMaxX + sinkWidth) > carPosX && (riverMinY - sinkWidth) < carPosY && riverMaxY > carPosY) {
                        console.warn("sink!!!");
                        this.sinkCar();
                    }
                } else if ((bodyALayerName === "houses" || bodyACar) && bodyBCar && this.activeCar) {
                    this.cars[this.activeCar].speed = 0;
                    this.cars[this.activeCar].audio.engineUp.stop();
                    if (!this.cars[this.activeCar].audio.carCrash.isPlaying)
                        this.cars[this.activeCar].audio.carCrash.play();
                } else if (bodyBType && bodyBType === "dudes" && bodyACar){
                    console.warn("dude reached car");
                    return false;
                } else {
                    this.checkCheckpoints(bodyBName, bodyAType);
                }
            } catch (error) {
                console.error(error);
            }
        });
    }

    update() {
        if(this.activeCar && !this.activeSpeaker) {
            const keyPressed = this.keyPressed,
                activeCarSprite = this.cars[this.activeCar],
                currentAngle = activeCarSprite.angle;
            console.log("update car speed: ", activeCarSprite.speed);    
            if (keyPressed["KeyW"] || keyPressed["ArrowUp"]){
                if(activeCarSprite.speed < CONSTANTS.maxCarSpeed) {
                    activeCarSprite.speed += 0.004;
                }
                if (!activeCarSprite.audio.engineUp.isPlaying)
                    activeCarSprite.audio.engineUp.play();
            } else {
                if (activeCarSprite.audio.engineUp.isPlaying)
                    activeCarSprite.audio.engineUp.stop();
            }
            
            if (keyPressed["KeyS"] || keyPressed["ArrowDown"]){
                if (activeCarSprite.speed > CONSTANTS.maxCarBackwardSpeed) {
                    activeCarSprite.speed -= 0.01;
                }
            }

            if (!(keyPressed["KeyW"]) && !keyPressed["ArrowDown"]) {
                if (activeCarSprite.speed > 0) {
                    activeCarSprite.speed -= 0.002;
                } else if (activeCarSprite.speed < 0) {
                    activeCarSprite.speed += 0.001;
                }
            }
            activeCarSprite.speed = activeCarSprite.speed ? parseFloat(activeCarSprite.speed.toFixed(3)) : 0;

            if (activeCarSprite.speed !== 0 && (keyPressed["ArrowLeft"] || keyPressed["KeyA"])) {
                activeCarSprite.setAngle(currentAngle + 3);
            }
            if (activeCarSprite.speed !== 0 && (keyPressed["ArrowRight"] || keyPressed["KeyD"])) {
                activeCarSprite.setAngle(currentAngle - 3);
            }
            if (activeCarSprite.speed !== 0 && (keyPressed["ArrowLeft"] || keyPressed["KeyA"])) {
                
                activeCarSprite.setAngle(currentAngle - 3);
            }
            if (activeCarSprite.speed !== 0 && (keyPressed["ArrowRight"] || keyPressed["KeyD"])) {
                activeCarSprite.setAngle(currentAngle + 3);
            }

            if (activeCarSprite.speed >= 0) {
                activeCarSprite.thrustLeft(activeCarSprite.speed);
                activeCarSprite.audio.rearMoveAudio.stop();
            } else if (activeCarSprite.speed < 0) {
                activeCarSprite.thrustLeft(activeCarSprite.speed);
                if(!activeCarSprite.audio.rearMoveAudio.isPlaying)
                    activeCarSprite.audio.rearMoveAudio.play();
            }
        }
    }

    sinkCar() {
        const activeCar = this.cars[this.activeCar];

        activeCar.audio.engineWork.stop();
        activeCar.audio.engineUp.stop();
        activeCar.audio.rearMoveAudio.stop();
        activeCar.audio.fallIntoWater.play();
        activeCar.destroy();
        this.activeCar = undefined;
        this.gameOver();
    }

    gameOver() {
        console.warn("custom event for sink in a river");
        console.warn("game over");
        this.gameOverPopup = this.rexUI.add.textBox({
            x: 400,
            y: 270,
            // anchor: undefined,
            width: 760,
            //height: 100,
        
            orientation: 0,
        
            background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, CONSTANTS.COLOR_PRIMARY)
                .setStrokeStyle(2, CONSTANTS.COLOR_LIGHT),

            icon: this.matter.add.sprite(0, 0).play('teacher_disappointed').setScale(0.3, 0.3),
            iconMask: false,
            text: this.add.text(0, 0, "", {
                fontSize: '24px',
                maxLines: 8,
                color: '#fff',
                wordWrap: { width: 600 },
                padding: {
                    left: 20,
                }
            }),
            actionMask: false,
            //enableLayer: true,
            space: {
                left: 10,
                right: 5,
                top: 5,
                bottom: 2,
        
                icon: 0,
                text: 0,
            }
        });
        this.gameOverPopup.start(this.gameOverText, 50);
        this.gameOvered = true;
        this.gameOverPopup.setDepth(2);
        this.overlay = this.add.rectangle(0, 0, 1600, 1200, CONSTANTS.COLOR_LIGHT, 0.4);
        this.overlay.setDepth(1);
        document.addEventListener('click', e => window.location.reload());
        this.gameOverPopup.on('complete', () => {
            document.addEventListener('keydown', e => window.location.reload());
        });
    }

    startGame() {
        console.warn('staring the game');
        document.removeEventListener('keydown', this.startGame);
        this.gameStarted = true;
        this.startGameTitle.destroy();
        this.startGameOptions.destroy();
        this.buildMap(); 
    }

    renderBanner() {
        this.startGame = this.startGame.bind(this);
        this.startGameTitle = this.add.text(260, 260, "Interactive school", {
            fontSize: 32,
        });
        this.startGameOptions = this.rexUI.add.fixWidthButtons({
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

        this.startGameOptions.on("button.click", (btn, i, pointer, event) => {
            if (!this.startMenuSounds.itemSelect.isPlaying) { 
                this.startMenuSounds.itemSelect.play();
            }
            if (btn.name === "play") {
                this.startGame();
                document.body.style.cursor = "auto";
            } else {
                this.openSettingPage();
            }
        });

        this.startGameOptions.on("button.over", (btn, i, pointer, event) => {
            btn.children[0].setFillStyle(CONSTANTS.COLOR_START_OPTIONS);
            btn.children[1].setStroke("#fff", 1);
            document.body.style.cursor = "pointer";       
           
        });

        this.startGameOptions.on("button.out", (btn, i, pointer, event) => {
            btn.children[0].setFillStyle();
            btn.children[1].setStroke("#fff", 0);
            document.body.style.cursor = "auto";
            if (this.startMenuSounds.itemSelect.isPlaying) { 
                this.startMenuSounds.itemSelect.stop();
            }
        });
    }

    createCheckBox(text) {
        const checkbox = this.rexUI.add.label({
            width:280,
            background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, CONSTANTS.COLOR_PRIMARY).setStrokeStyle(2, CONSTANTS.COLOR_LIGHT),
            icon: this.add.container(0, 0, [
                this.add.circle(0, 0, 10).setStrokeStyle(1, CONSTANTS.COLOR_DARK),
                this.make.image({
                x:3,
                y:-5, 
                key: "checkImage",
                scale : {
                    x: 0.015,
                    y: 0.015
                },
                alpha:0
            }).setTintFill(CONSTANTS.COLOR_DONE)]),
            text: this.add.text(0, 0, text, {
                fontSize: 18,
                wordWrap: { width: 240 }
            }),
            space: {
                left: 20, right: 10, top: 10, bottom: 10,
                icon: 20
            },
            align: 'left',
            name: text
        });
        return checkbox;
    }

    pressKeyActionPlayer(event) {
        const code = event.code,
            keyPressed = this.keyPressed;

        keyPressed[code] = true;

        console.log(`Key code value: ${code}`);
        this.checkTasksStatus(keyPressed);

        if (!this.activeSpeaker) {
            if (keyPressed["ArrowUp"] || keyPressed["KeyW"]){
                this.player.setVelocityY(-1);

                this.player.anims.play('up', true);
            }
            if (keyPressed["ArrowLeft"] || keyPressed["KeyA"]){
                this.player.setVelocityX(-1);

                this.player.anims.play('left', true);
            }
            if (keyPressed["ArrowRight"] || keyPressed["KeyD"]){
                this.player.setVelocityX(1);

                this.player.anims.play('right', true);
            }
            if (keyPressed["ArrowDown"] || keyPressed["KeyS"]){
                
                this.player.setVelocityY(1);

                this.player.anims.play('down', true);
            }
            
            //if (keyPressed["Space"]) {
            //    this.startFireAction();
            //}
            if (this.player.angle !== 0) {
                this.player.setAngle(0);
            }
            if (keyPressed["Enter"] || keyPressed["KeyE"]) {
                let minDistance, closestCar;
                Object.keys(this.cars).forEach((carKey) => {
                    let currentDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.cars[carKey].x, this.cars[carKey].y);
                    if (!minDistance || currentDistance < minDistance) {
                        minDistance = currentDistance;
                        closestCar = carKey;
                    }
                });
                if(minDistance < 30) {
                    this.sitInACar(closestCar);
                } 
            } else {
                this.checkActionDistance(this.player.x, this.player.y); 
            }
        }
    }

    removeKeyActionPlayer(event) {
        const code = event.code,
            keyPressed = this.keyPressed;
            
        console.log(code);
        if (!this.activeSpeaker) {
            if (keyPressed["ArrowUp"] || keyPressed["KeyW"]){
                this.player.setVelocityY(0);

                this.player.anims.play('standUp');
            }
            if (keyPressed["ArrowLeft"] || keyPressed["KeyA"]){
                this.player.setVelocityX(0);

                this.player.anims.play('standLeft', true);
            }
            if (keyPressed["ArrowRight"] || keyPressed["KeyD"]){
                this.player.setVelocityX(0);

                this.player.anims.play('standRight', true);
            }
            if (keyPressed["ArrowDown"] || keyPressed["KeyS"]){
                
                this.player.setVelocityY(0);

                this.player.anims.play('standDown');
            }
            keyPressed[code] = false;
        }
    }

    pressKeyActionCar(event) {
        if (this.activeCar) {
            const code = event.code,
                keyPressed = this.keyPressed,
                activeCarSprite = this.cars[this.activeCar],
                currentAngle = activeCarSprite.angle;

            keyPressed[code] = true;
            console.log(`Key code value: ${code}`);
            if (this.firstPartTasksFinished && !this.allTasksAreComplete) {
                const carPosX = activeCarSprite.body.position.x,
                    carPosY = activeCarSprite.body.position.y,
                    checkpointX = this.parkCheckpoint.x,
                    checkpointY = this.parkCheckpoint.y,
                    carTopLeftPosX = carPosX + (activeCarSprite.width / 2),
                    carTopLeftPosY = carPosY,
                    checkpointTopLeftX = checkpointX + (this.parkCheckpoint.width / 2),
                    checkpointTopLeftY = checkpointY;
                if ((checkpointTopLeftX + 15 > carTopLeftPosX && carTopLeftPosX > checkpointTopLeftX) && 
                    (checkpointTopLeftY + 10 > carTopLeftPosY && carTopLeftPosY > checkpointTopLeftY)) {
                        console.warn("reached!!!");
                        //const checkSVG
                        this.setCheckButton(this.tasksSecond.buttons[2].getElement("icon"));
                        this.tasksTracker[1][2] = true;
                        if (this.isSecondPartTasksAreComplete()) {
                            this.completeSecondPartTasks();
                        };
                }
            }
            //if (keyPressed["Space"]) {
            //    this.startFireAction();
            //}
            if (keyPressed["Enter"] || keyPressed["KeyE"]) {
                // @ToDo: fix setup player based on currentAngle
                let posVertical = currentAngle > -45 && currentAngle < 45 || currentAngle > 135 || currentAngle < -135 ? true : false,
                    posX = posVertical ? activeCarSprite.x + 20 : activeCarSprite.x,
                    posY = posVertical ? activeCarSprite.y : activeCarSprite.y + 20;
                this.leaveCar();
                console.log(posVertical);
                console.log(currentAngle)
                this.createPlayer(posX, posY);
            }
        }
    }

    removeKeyActionCar(event) {
        const code = event.code,
            keyPressed = this.keyPressed;
        //if (code === "Space") {
        //    this.stopFireAction(); 
        //}
        /*
        if (keyPressed["ArrowUp"] || keyPressed["KeyW"]){
            //this.car.thrust(1)
        }
        if (keyPressed["ArrowLeft"] || keyPressed["KeyA"]){
            //this.car.setVelocityX(0);
        }
        if (keyPressed["ArrowRight"] || keyPressed["KeyD"]){
            //this.car.setVelocityX(0);
        }
        if (keyPressed["ArrowDown"] || keyPressed["KeyS"]){
            //this.car.setVelocityY(0);
        }*/
        keyPressed[code] = false;
    }

    pressKeyActionDialog(event) {
        this.switchDialogPage(event);
    }

    removeKeyActionDialog(event) {

    }

    clickActionDialog(event) {
        this.switchDialogPage(event);
    }

    switchDialogPage(event) {
        const code = event.code;
        console.log("switch dialog page");
        console.log(code);

        const activeDialog = this.people[this.activeSpeaker].getActiveDialog();
        if (activeDialog instanceof Dialog) {
            if (!activeDialog.user) {
                this.hideSpeakDialog();
            }
        } else if (activeDialog instanceof DialogInjectable) {
            this.createUserInputAnswer(activeDialog.input_text);
        } else if (activeDialog instanceof DialogSelectable) {
            this.createDialogSelectableAnswer()
        }
    }

    sitInACar(closestCar) {
        const activeCarSprite = this.cars[closestCar]; 
        if (!this.cars[closestCar].locked) {
            this.destroyPlayer();
            this.resetAllKeys();
            this.setupCar(closestCar);
            if (this.firstPartTasksFinished && !this.allTasksAreComplete) {
                this.setCheckButton(this.tasksSecond.buttons[0].getElement("icon"));
                this.tasksTracker[1][0] = true;
                this.objectivesComplete.sitInACar = true;
                if (this.isSecondPartTasksAreComplete()) {
                    this.completeSecondPartTasks();
                };
            }
        } else {
            if (!activeCarSprite.audio.carLocked.isPlaying)
                activeCarSprite.audio.carLocked.play();
        }
    }

    destroyPlayer() {
        console.log("destroy");
        this.removePlayerListeners();
        this.player.destroy();
    }

    setupCar(closestCar) {
        this.cars[closestCar].audio.startEngine.play();
        this.cars[closestCar].audio.engineWork.play();
        this.activeCar = closestCar;
        setupCarListeners();
    }

    leaveCar() {
        Object.keys(this.cars[this.activeCar].audio).forEach((key) => {
            this.cars[this.activeCar].audio[key].stop();
        });
        this.resetAllKeys();
        this.activeCar = undefined;
        if (this.firstPartTasksFinished && !this.allTasksAreComplete) {
            this.setCheckButton(this.tasksSecond.buttons[3].getElement("icon"));
            this.tasksTracker[1][3] = true;
            if (this.isSecondPartTasksAreComplete()) {
                this.completeSecondPartTasks();
            };
        }
        this.removeCarListeners();
    }

    createPlayer(posX, posY) {
        console.log("setup player");
        this.player = this.matter.add.sprite(posX, posY, 'dudes');
        this.player.setFrictionAir(0.6);
        this.player.setMass(1);
        this.setupPlayerListeners();
    }

    createPerson(posX, posY, name, frame) {
        const person = new Person(this.matter.world, posX, posY, 'dudes', frame);
        person.setFrictionAir(0.6);
        person.setMass(1);
        return person;
    }

    createCar(x, y, angle, friction, mass, key) {
        let car = this.matter.add.sprite(x, y, key); 
        car.displayWidth = 16;
        car.displayHeight = 32;
        car.speed = 0;
        car.setAngle(angle);
        car.setFrictionAir(0.9);
        car.setMass(mass);
        car.setDensity(0.1);
        car.setDepth(1);
        car.audio = { 
            startEngine: this.sound.add("startEngine1"),
            engineWork: this.sound.add("engineWork"),
            engineWork2: this.sound.add("engineWork2"),
            engineUp: this.sound.add("engineUp"),
            rearMoveAudio: this.sound.add("carRearMove"),
            carCrash: this.sound.add("carCrash"),
            fallIntoWater: this.sound.add("fallIntoWater"),
            carLocked: this.sound.add("carLocked")
        }

        return car;
    }

    checkActionDistance(x, y) {
        let minDistance;
        console.log("check action distance");
        Object.keys(this.cars).forEach((carKey) => {
            let closestCar;
            const car = this.cars[carKey],
                currentDistance = Phaser.Math.Distance.Between(x, y, car.x, car.y);
            if (!minDistance || minDistance > currentDistance) {
                minDistance = currentDistance;
                closestCar = carKey;
            }
            if(closestCar && minDistance < 30) {
                if(!car.highlighted) {
                    this.pipelineInstance.add(car, {thickness: 1});
                    car.highlighted = true;
                }
                if(!this.firstPartTasksFinished) {
                    this.setCheckButton(this.tasksFirst.buttons[4].getElement("icon"));
                    this.tasksTracker[0][4] = true;
                    if (this.isFirstPartTasksAreComplete()) {
                        this.completeFirstPartTasks();
                    };
                }
            } else {
                car.highlighted = false;
                this.pipelineInstance.remove(car);
            }
        });
        Object.keys(this.people).forEach((name) => {
            let closest;
            const person = this.people[name],
                currentDistance = Phaser.Math.Distance.Between(x, y, person.x, person.y);
            if (!minDistance || minDistance > currentDistance) {
                minDistance = currentDistance;
                closest = name;
            }
            if(closest && minDistance < 30) {
                if(!person.highlighted) {
                    this.pipelineInstance.add(person, {thickness: 1});
                    person.highlighted = true;
                }
            } else {
                person.highlighted = false;
                this.pipelineInstance.remove(person);
            }
        });
    }
    
    openSpeakDialog(characterName, isUserAction = false) {
        const speaker = this.people[characterName];
        const activeDialog = speaker.getActiveDialog();
        this.helperText.show();
        this.overlay = this.add.rectangle(0, 0, 1600, 1200, CONSTANTS.COLOR_LIGHT, 0.4);
        this.overlay.setDepth(1);
        this.helperText.childrenMap.icon.anims.restart(false, true);
        this.activeSpeaker = characterName;
        if (isUserAction === false || !activeDialog.user) {
            if (activeDialog.type === CONSTANTS.DIALOG_OPTIONS.CHOOSE_VARIANT) {

            } else {
                this.helperText.start(activeDialog.npc, 50);
            }
        } else {
            if (activeDialog.type === CONSTANTS.DIALOG_OPTIONS.CHOOSE_VARIANT) {
                 
            } else {
                this.helperText.start(activeDialog.user, 50);
            }
        }
        this.setupDialogListeners();
    }

    hideSpeakDialog() {
        //const activeTextIndex = this.getActiveTextIndex();
        //this.helpTexts[activeTextIndex].active = false;
        this.activeSpeaker = undefined;
        this.createHelpIcon();
        this.createSettingsIcon()
        this.overlay.destroy();
        this.resetAllKeys();
        if (this.pointer) {
            this.pointer.destroy();
            this.pipelineInstance.remove(this.player);
        }
        this.removeDialogListeners();
    }

    openSettingPage() {
        this.activeSpeaker = true;
        this.overlay = this.add.rectangle(0, 0, 1600, 1200, CONSTANTS.COLOR_START_OPTIONS_BG, 1);
        this.overlay.setDepth(1);

        this.soundLabel = this.add.text(150, 200, 'sound volume:').setDepth(2);
        this.soundVolume = this.rexUI.add.slider({
            x: 380,
            y: 210,
            width: 200,
            height: 20,
            orientation: 'x',

            track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, CONSTANTS.COLOR_DARK),
            indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, CONSTANTS.COLOR_PRIMARY),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, CONSTANTS.COLOR_PRIMARY),

            valuechangeCallback: (value) => {
                localStorage.setItem("soundVolume", value);
                this.soundVolumeValue = value;
                this.sound.setVolume(value); 
            },
            space: {
                top: 4,
                bottom: 4
            },
            input: 'click',
            value: this.soundVolumeValue
        }).layout().setDepth(2);

        this.settingsPageActions = this.rexUI.add.gridButtons({
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

        this.settingsPageActions.setDepth(2);

        this.settingsPageActions.on("button.click", (btn, i, pointer, event) => {
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

        this.settingsPageActions.on("button.over", (btn, i, pointer, event) => {
            btn.children[0].setStroke("#fff", 1);
            document.body.style.cursor = "pointer";
        });

        this.settingsPageActions.on("button.out", (btn, i, pointer, event) => {
            btn.children[0].setStroke(CONSTANTS.COLOR_START_OPTIONS, 0);
            document.body.style.cursor = "auto";
            if (this.startMenuSounds.itemSelect.isPlaying) { 
                this.startMenuSounds.itemSelect.stop();
            }
        });
        
        console.log("open settings page 2");
    }

    hideSettingPage() {
        this.activeSpeaker = false;
        this.soundLabel.destroy();
        this.soundVolume.destroy();
        this.overlay.destroy();
        this.settingsPageActions.destroy();
        console.log("hide settings page");
    }

    resetSettings() {
        localStorage.setItem("soundVolume", CONSTANTS.DEFAULT_VOLUME_VALUE);
        this.soundVolumeValue = CONSTANTS.DEFAULT_VOLUME_VALUE;
        this.soundVolume.setValue(CONSTANTS.DEFAULT_VOLUME_VALUE);
        this.sound.setVolume(CONSTANTS.DEFAULT_VOLUME_VALUE); 
    }

    addCharacterPointer() {
        this.pointer = this.add.polygon(50, 100, [this.player.x + 18, this.player.y, this.player.x + 50, this.player.y - 180, this.player.x + 150, this.player.y - 200], CONSTANTS.COLOR_PRIMARY);
        this.pointer.setStrokeStyle(2, CONSTANTS.COLOR_LIGHT);
        this.pointer.originX = 0;
        this.pointer.originY = 0;
        this.pointer.setDepth(2);
        this.pipelineInstance.add(this.player, {thickness: 1});
    }

    createHelpIcon() {
        const iconButton = this.rexUI.add.label({
            width: 30,
            background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, CONSTANTS.COLOR_PRIMARY).setStrokeStyle(2, CONSTANTS.COLOR_LIGHT),
            //icon: this.add.circle(0, 0, 10).setStrokeStyle(1, COLOR_DARK),
            text: this.add.text(0, 0, "?", {
                fontSize: 20,
            }),
            space: {
                left: 10, right: 10, top: 10, bottom: 10,
                icon: 10
            },
            align: 'left',
            name: "icon"
        });

        this.helpIcon = this.rexUI.add.fixWidthButtons({
            x: 40,
            y: 560,
            buttons: [
                iconButton,
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

        this.helpIcon.on("button.click", (btn, i, pointer, event) => {
            if (!this.helperText.visible && !this.gameOvered) {
                if (!this.firstPartTasksFinished) {
                    this.helpTexts[0].active = true;
                } else if (!this.allTasksAreComplete) {
                    this.helpTexts[2].active = true;
                } else {
                    this.helpTexts[4].active = true;
                }
                this.openSpeakDialog("monica");
            }
        });

        this.helpIcon.on("button.over", (btn, i, pointer, event) => {
            btn.backgroundChildren[0].setFillStyle(CONSTANTS.COLOR_LIGHT);
            if (!this.helperText.visible)
                document.body.style.cursor = "pointer";
        });

        this.helpIcon.on("button.out", (btn, i, pointer, event) => {
            btn.backgroundChildren[0].setFillStyle(CONSTANTS.COLOR_PRIMARY);
            document.body.style.cursor = "auto";
        });
    }

    createSettingsIcon() {
        const iconButton = this.rexUI.add.label({
            width: 30,
            background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, CONSTANTS.COLOR_PRIMARY).setStrokeStyle(2, CONSTANTS.COLOR_LIGHT),
            //icon: this.add.circle(0, 0, 10).setStrokeStyle(1, COLOR_DARK),
            text: this.add.text(0, 0, "⚙", {
                fontSize: 20,
            }),
            space: {
                left: 10, right: 10, top: 10, bottom: 10,
                icon: 10
            },
            align: 'left',
            name: "icon"
        });

        this.settingsIcon = this.rexUI.add.fixWidthButtons({
            x: 760,
            y: 40,
            buttons: [
                iconButton,
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

        this.settingsIcon.on("button.click", (btn, i, pointer, event) => {
            this.openSettingPage();
        });

        this.settingsIcon.on("button.over", (btn, i, pointer, event) => {
            btn.backgroundChildren[0].setFillStyle(CONSTANTS.COLOR_LIGHT);
            if (!this.helperText.visible)
                document.body.style.cursor = "pointer";
        });

        this.settingsIcon.on("button.out", (btn, i, pointer, event) => {
            btn.backgroundChildren[0].setFillStyle(CONSTANTS.COLOR_PRIMARY);
            document.body.style.cursor = "auto";
        });
    }

    checkTasksStatus(keyPressed) {
        console.log("check task status");
        if(!this.firstPartTasksFinished) {
            if (keyPressed["ArrowUp"] || keyPressed["KeyW"]) {
                this.setCheckButton(this.tasksFirst.buttons[0].getElement("icon"));
                this.tasksTracker[0][0] = true; 
            }
            if (keyPressed["ArrowLeft"] || keyPressed["KeyA"]) {
                this.setCheckButton(this.tasksFirst.buttons[2].getElement("icon"));
                this.tasksTracker[0][2] = true;
            }
            if (keyPressed["ArrowRight"] || keyPressed["KeyD"]) {
                this.setCheckButton(this.tasksFirst.buttons[3].getElement("icon"));
                this.tasksTracker[0][3] = true;
            }
            if (keyPressed["ArrowDown"] || keyPressed["KeyS"]) {
                this.setCheckButton(this.tasksFirst.buttons[1].getElement("icon"));
                this.tasksTracker[0][1] = true;
            }
            if (this.isFirstPartTasksAreComplete()) {
                this.completeFirstPartTasks();
            };
        }
    }

    isFirstPartTasksAreComplete() {
        if (!this.firstPartTasksFinished) {
            if (this.tasksTracker[0][0] && this.tasksTracker[0][1] && this.tasksTracker[0][2] && this.tasksTracker[0][3] && this.tasksTracker[0][4]) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    isSecondPartTasksAreComplete() {
        if (this.tasksTracker[1][0] && this.tasksTracker[1][1] && this.tasksTracker[1][2] && this.tasksTracker[1][3]) {
            return true;
        } else {
            return false;
        }
    }

    completeFirstPartTasks() {
        this.firstPartTasksFinished = true; 
        this.tasksFirst.destroy();
        this.helpTexts[2].active = true;
        this.openSpeakDialog("monica");
        this.tasksSecond = this.rexUI.add.fixWidthButtons({
            x: 640,
            y: 480,
            buttons: [
                this.createCheckBox("Sit in a car (e, Enter)"),
                this.createCheckBox("Drive around red building in the center"),
                this.createCheckBox("Park car near orange track on the parking"),
                this.createCheckBox("Leave the car (e, Enter)")
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
    }

    completeSecondPartTasks() {
        this.allTasksAreComplete = true;
        this.helpTexts[4].active = true;
        this.openSpeakDialog("monica");
        this.tasksSecond.destroy();
    }

    checkCheckpoints(bodyBName, bodyAType) {
        if (bodyBName === "checkpoint1" && bodyAType === "car") {
            this.checkpointsReached[0] = true; 
        } else if (bodyBName === "checkpoint1" && bodyAType !== "car") {
            console.warn("please get in the car!!!");
        }
        if (bodyBName === "checkpoint2" && bodyAType === "car") {
            this.checkpointsReached[1] = true;
        } else if (bodyBName === "checkpoint2" && bodyAType !== "car") {
            console.warn("please get in the car!!!");
        }
        if (bodyBName === "checkpoint3" && bodyAType === "car") {
            this.checkpointsReached[2] = true;
        } else if (bodyBName === "checkpoint3" && bodyAType !== "car") {
            console.warn("please get in the car!!!");
        }
        if (this.firstPartTasksFinished && !this.allTasksAreComplete && this.isAllCheckpointsReached()) {
            this.setCheckButton(this.tasksSecond.buttons[1].getElement("icon"));
            this.tasksTracker[1][1] = true;
            if (this.isSecondPartTasksAreComplete()) {
                this.completeSecondPartTasks();
            };
        }
    }

    isAllCheckpointsReached() {
        return this.checkpointsReached.filter(item => item === true).length === 3;
    }

    resetAllKeys() {
        Object.keys(this.keyPressed).forEach((key) => this.keyPressed[key] = false);
    }

    setCheckButton(container) {
        container.first.setFillStyle(CONSTANTS.COLOR_LIGHT);
        container.next.setAlpha(1);
    }

    setupPlayerListeners() {
        document.addEventListener('keydown', this.pressKeyActionPlayer);
        document.addEventListener('keyup', this.removeKeyActionPlayer);
    }

    removePlayerListeners() {
        document.removeEventListener('keydown', this.pressKeyActionPlayer);
        document.removeEventListener('keyup', this.removeKeyActionPlayer);
    }

    setupCarListeners() {
        document.addEventListener('keydown', this.pressKeyActionCar);
        document.addEventListener('keyup', this.removeKeyActionCar);
    }

    removeCarListeners() {
        document.removeEventListener('keydown', this.pressKeyActionCar);
        document.removeEventListener('keyup', this.removeKeyActionCar);
    }

    setupDialogListeners() {
        document.addEventListener('keydown', this.pressKeyActionDialog);
        document.addEventListener('keyup', this.removeKeyActionDialog);
        document.addEventListener("click tap", this.clickActionDialog);
    }

    removeDialogListeners() {
        document.removeEventListener('keydown', this.pressKeyActionDialog);
        document.removeEventListener('keyup', this.removeKeyActionDialog);
        document.addEventListener("click tap", this.clickActionDialog);
    }
}

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: MainScene,
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

var directions = {
    west: { offset: 0, x: -2, y: 0, opposite: 'east' },
    northWest: { offset: 32, x: -2, y: -1, opposite: 'southEast' },
    north: { offset: 64, x: 0, y: -2, opposite: 'south' },
    northEast: { offset: 96, x: 2, y: -1, opposite: 'southWest' },
    east: { offset: 128, x: 2, y: 0, opposite: 'west' },
    southEast: { offset: 160, x: 2, y: 1, opposite: 'northWest' },
    south: { offset: 192, x: 0, y: 2, opposite: 'north' },
    southWest: { offset: 224, x: -2, y: 1, opposite: 'northEast' }
};

var anims = {
    idle: {
        startFrame: 0,
        endFrame: 4,
        speed: 0.2
    },
    walk: {
        startFrame: 4,
        endFrame: 12,
        speed: 0.15
    },
    attack: {
        startFrame: 12,
        endFrame: 20,
        speed: 0.11
    },
    die: {
        startFrame: 20,
        endFrame: 28,
        speed: 0.2
    },
    shoot: {
        startFrame: 28,
        endFrame: 32,
        speed: 0.1
    }
};

document.onreadystatechange = function () {
    if (document.readyState == "interactive") {
        var game = new Phaser.Game(config);
    }
}

function reachBuilding() {
    console.log('11111');
}