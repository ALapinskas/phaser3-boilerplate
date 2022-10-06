var score = 0;
var map, buildings, river;
var scoreText;
var dudes = [];
var cursors;
var maxCarSpeed = 1;
const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;
const COLOR_STROKE = 0xdddddd;

class MainScene extends Phaser.Scene {

    preload() {
        this.keyPressed = { ArrowUp: false, KeyW: false, ArrowLeft: false, KeyA: false, ArrowRight: false, KeyD: false, ArrowDown: false, KeyS: false,
            Enter:false, KeyE:false };
        this.activeCar;
        this.cars = {};
        this.objectivesComplete = {sitInACar: false, driveAround: false, leaveCar: false};
        this.load.image({
            key: 'tiles',
            url: 'images/sity-2d/Tilemap/tilemap_packed.png',
          });
        this.load.tilemapTiledJSON('map', 'images/sity-2d/Tilemap/city.json');
        this.load.spritesheet('dudes', 'images/sity-2d/Tilemap/dudes.png', { frameWidth: 16, frameHeight: 16 });
        this.load.image('car', 'images/racingpack/PNG/Cars/car_black_1.png');
        this.load.image('car2', 'images/racingpack/PNG/Cars/car_red_4.png');
        //this.load.spritesheet('teacher', 'images/teacher_sprite_cut.jpg', { frameWidth: 82, frameHeight: 32 });
        this.load.spritesheet('teacher', 'images/teacher_sprite.png', { frameWidth: 342, frameHeight: 522 });

        this.load.plugin('rexoutlinepipelineplugin', './node_modules/phaser3-rex-plugins/dist/rexoutlinepipelineplugin.min.js', true);

        this.load.scenePlugin('rexuiplugin', './node_modules/phaser3-rex-plugins/dist/rexuiplugin.js', 'rexUI', 'rexUI');

        this.load.audio('startEngine1', './assets/engine_start.mp3');
        this.load.audio('carRearMove', './assets/car_rearmove.mp3');

        this.teacherTexts = [
            {
                "active": true,
                "text": "Hello student! My name is Monica, i'll be you teacher today! Press any key, or click to continue..."
            },
            {
                "active": false,
                "text": "This is your character. To move use w,a,d,s, or arrow buttons on your keyboard.\nComplete objectives on the right to finish the exercise. Press any key, or click to continue..."
            }
        ];

        this.pressKeyActionPlayer = this.pressKeyActionPlayer.bind(this);
        this.removeKeyActionPlayer = this.removeKeyActionPlayer.bind(this);
        this.pressKeyActionCar = this.pressKeyActionCar.bind(this);
        this.removeKeyActionCar = this.removeKeyActionCar.bind(this);
    }

    create() {
        this.anims.create({
            key: 'teacher_talk',
            frames: this.anims.generateFrameNumbers('teacher', {start: 0, end: 0, frames:[1,0]}),
            frameRate: 6,
            repeat:15
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
        //dudes.push(this.add.existing(new Dude(this, 240, 290, 'walk', 'west', 10)));
        //dudes.push(this.add.existing(new Dude(this, 100, 380, 'walk', 'northWest', 20)));
        //dudes.push(this.add.existing(new Dude(this, 620, 140, 'walk', 'south', 30)));
        this.buildMap();
        cursors = this.input.keyboard.createCursorKeys();
        //platforms = this.physics.add.staticGroup();
    
        //platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    
        //platforms.create(600, 400, 'ground');
        //platforms.create(50, 250, 'ground');
        //platforms.create(750, 220, 'ground');   
    }

    update() {
        console.log("update");
        if(this.activeCar) {
            let keyPressed = this.keyPressed,
                activeCarSprite = this.cars[this.activeCar],
                currentAngle = activeCarSprite.angle;
            if (keyPressed["ArrowUp"] || keyPressed["KeyW"]){
                if(activeCarSprite.speed < maxCarSpeed) {
                    activeCarSprite.speed += 0.005;
                }
                activeCarSprite.thrustLeft(activeCarSprite.speed);
            }
            
            if (keyPressed["ArrowDown"] || keyPressed["KeyS"]){
                activeCarSprite.thrustRight(0.3);
            }

            if ((keyPressed["ArrowUp"] || keyPressed["KeyW"]) && (keyPressed["ArrowLeft"] || keyPressed["KeyA"])) {
                activeCarSprite.setAngle(currentAngle - 3);
            }
            if ((keyPressed["ArrowUp"] || keyPressed["KeyW"]) && (keyPressed["ArrowRight"] || keyPressed["KeyD"])) {
                activeCarSprite.setAngle(currentAngle + 3);
            }
            if ((keyPressed["ArrowDown"] || keyPressed["KeyS"]) && (keyPressed["ArrowLeft"] || keyPressed["KeyA"])) {
                activeCarSprite.setAngle(currentAngle + 3);
            }
            if ((keyPressed["ArrowDown"] || keyPressed["KeyS"]) && (keyPressed["ArrowRight"] || keyPressed["KeyD"])) {
                activeCarSprite.setAngle(currentAngle - 3);
            }
        }
        if (this.player && this.player.active) {

        }
    }
    buildMap () {
        //buildings = scene.physics.add.staticGroup();
        //  Parse the data out of the map
        const map = this.make.tilemap({ key: 'map'});
    
        // add the tileset image we are using
        const tileset = map.addTilesetImage('tilemap_packed','tiles');
        
        // create the layers we want in the right order
        var background = map.createLayer('background', tileset);
    
        var housesLayer = map.createLayer('houses', tileset);
        //this.cars = map.createLayer('cars', tileset);
        map.createLayer('decorations', tileset); 
        map.createLayer('decorations2', tileset);
        var riverLayer = map.createLayer('river', tileset);
    
        housesLayer.setCollisionByExclusion([-1]);
        riverLayer.setCollisionByExclusion([-1]);

        housesLayer.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(housesLayer);

        this.cars["car"] = this.createCar(72, 100, 180, 0.9, 100, 'car');

        this.cars["car2"] = this.createCar(680, 93, 90, 1.2, 500, 'car2');
        
        //this.player.setCollideWorldBounds(true);
        housesLayer.setCollisionByProperty({ collides: true });
        this.matter.world.setBounds(0, 0, background.width, background.height);
        
        //this.matter.add.collider(this.player, housesLayer);
        //this.matter.add.collider(this.player, riverLayer);
        //this.matter.add.collider(this.player, this.cars);
    
        this.createPlayer(120, 80);

        this.helperText = this.rexUI.add.textBox({
            x: 400,
            y: 270,
            // anchor: undefined,
            width: 760,
            //height: 100,
        
            orientation: 0,
        
            background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, COLOR_PRIMARY)
                .setStrokeStyle(2, COLOR_LIGHT),

            //icon: this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, COLOR_DARK),
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

        //this.helperText.start("To move your character use w,a,d,s, or arrow buttons on your keyboard.\nTo take an action press e key, or Enter", 100);

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
        /*
        this.tasksSecond = this.rexUI.add.fixWidthButtons({
            x: 640,
            y: 515,
            buttons: [
                this.createCheckBox("Sit in a car"),
                this.createCheckBox("Drive around red building in the center"),
                this.createCheckBox("Park car on the park, leave the car")
                // ...
            ],
            // rtl: false,
            align: 0,
            click: {
                mode: 'pointerup',
                clickInterval: 100
            },
        }).layout();*/

        this.helperText.start(this.teacherTexts[0].text, 50);

        document.addEventListener('click', e => this.userClick(e));
    }

    createCheckBox(text) {
        const checkbox = this.rexUI.add.label({
            width:280,
            background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_PRIMARY).setStrokeStyle(2, COLOR_LIGHT),
            icon: this.add.circle(0, 0, 10).setStrokeStyle(1, COLOR_DARK),
            text: this.add.text(0, 0, text, {
                fontSize: 18,
                wordWrap: { width: 240 }
            }),
            space: {
                left: 10, right: 10, top: 10, bottom: 10,
                icon: 10
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
        if (this.isTeacherTalkActive()) {
            this.stepTeacherTalk();
            return;
        }
        this.checkTasksStatus();
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

    removeKeyActionPlayer(event) {
        const code = event.code,
            keyPressed = this.keyPressed;
        //if (code === "Space") {
        //    this.stopFireAction(); 
        //}
        console.log(code);
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

    pressKeyActionCar(event) {
        const code = event.code,
            keyPressed = this.keyPressed,
            activeCarSprite = this.cars[this.activeCar],
            currentAngle = activeCarSprite.angle;

        keyPressed[code] = true;
        console.log(`Key code value: ${code}`);
        if (this.isTeacherTalkActive()) {
            this.stepTeacherTalk();
            return;
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

    removeKeyActionCar(event) {
        const code = event.code,
            keyPressed = this.keyPressed;
        //if (code === "Space") {
        //    this.stopFireAction(); 
        //}
        console.log(code);
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
        }
        keyPressed[code] = false;
        if (keyPressed["KeyW"] === false) {
            this.cars[this.activeCar].speed = 0;
        }
    }

    sitInACar(closestCar) {
        this.destroyPlayer();
        this.setupCar(closestCar);
        console.log("sitInACar");
        this.tasksSecond.buttons[0].getElement("icon").setFillStyle(COLOR_LIGHT);
        this.objectivesComplete.sitInACar = true;
    }

    destroyPlayer() {
        console.log("destroy");
        document.removeEventListener('keydown', this.pressKeyActionPlayer);
        document.removeEventListener('keyup', this.removeKeyActionPlayer);
        console.log("destroy");
        this.player.destroy();
    }

    setupCar(closestCar) {
        this.cars[closestCar].audio.startEngine.play();
        this.activeCar = closestCar;
        console.log("setup moving on a car");
        document.addEventListener('keydown', this.pressKeyActionCar);
        document.addEventListener('keyup', this.removeKeyActionCar);
    }

    leaveCar() {
        console.log("get out of car");
        this.cars[this.activeCar].audio.startEngine.stop();
        this.activeCar = undefined;
        document.removeEventListener('keydown', this.pressKeyActionCar);
        document.removeEventListener('keyup', this.removeKeyActionCar);
    }

    createPlayer(posX, posY) {
        console.log("setup player");
        this.player = this.matter.add.sprite(posX, posY, 'dudes');
        this.player.setFrictionAir(0.6);
        this.player.setMass(1);
        //this.player.setDensity(0.01);
        document.addEventListener('keydown', this.pressKeyActionPlayer);
        document.addEventListener('keyup', this.removeKeyActionPlayer);
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
        car.audio = { 
            startEngine: this.sound.add("startEngine1"),
            rearMoveAudio: this.sound.add("carRearMove") }

        return car;
    }

    checkActionDistance(x, y) {
        const pipelineInstance = this.plugins.get('rexoutlinepipelineplugin');
        let minDistance;
        Object.keys(this.cars).forEach((carKey) => {
            let closestCar;
            const car = this.cars[carKey],
                currentDistance = Phaser.Math.Distance.Between(x, y, car.x, car.y);
            if (!minDistance || minDistance > currentDistance) {
                minDistance = currentDistance;
                closestCar = carKey;
            }
            if(closestCar && minDistance < 30) {
                if(!car.active) {
                    pipelineInstance.add(car, {thickness: 1});
                    car.active = true;
                }
            } else {
                car.active = false;
                pipelineInstance.remove(car);
            }
        });    
    }

    stepTeacherTalk() {
        const pipelineInstance = this.plugins.get('rexoutlinepipelineplugin');
        console.log("step teacher talk");
        if (this.teacherTexts[0].active) {
            this.teacherTexts[0].active = false;
            this.teacherTexts[1].active = true;
            this.helperText.start(this.teacherTexts[1].text, 50);
            this.helperText.childrenMap.icon.anims.restart(false, true)
            this.line = this.add.line(0,0,this.player.x+28,this.player.y+55,this.player.x + 80,this.player.y + 162, COLOR_STROKE);
            this.line.originX = 0;
            this.line.originY = 0;
            pipelineInstance.add(this.player, {thickness: 1});
        } else {
            this.teacherTexts[1].active = false;
            this.helperText.hide();
            this.line.destroy();
            pipelineInstance.remove(this.player);
            this.createHelpIcon();
        }
    }

    userClick(e) {
        console.log("user click");
        if (this.isTeacherTalkActive()) {
            this.stepTeacherTalk();
            return;
        }
    }

    isTeacherTalkActive() {
        console.log(this.teacherTexts.find(text => text.active === true));
        return !!(this.teacherTexts.find(text => text.active === true));
    }

    createHelpIcon() {
        const iconButton = this.rexUI.add.label({
            width: 30,
            background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, COLOR_PRIMARY).setStrokeStyle(2, COLOR_LIGHT),
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
            console.log("click");
            if (!this.helperText.visible) {
                this.teacherTexts[0].active = true;
                this.helperText.show();
            }
        });

        this.helpIcon.on("button.over", (btn, i, pointer, event) => {
            console.log("over");
            if (!this.helperText.visible)
                document.body.style.cursor = "pointer";
        });

        this.helpIcon.on("button.out", (btn, i, pointer, event) => {
            console.log("out");
            document.body.style.cursor = "auto";
        });
    }

    checkTasksStatus() {
        this.firstPartObjectivesComplete
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