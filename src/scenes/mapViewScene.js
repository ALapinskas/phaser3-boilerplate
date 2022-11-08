import CONSTANTS from "../constants";

export class MapViewScene extends Phaser.Scene {
    constructor() {
        super(CONSTANTS.SCENES.MAP_VIEW_SCENE)
    }

    init() {
        console.log("map view scene");
    }

    preload() {
        this.keyPressed = { ArrowUp: false, KeyW: false, ArrowLeft: false, KeyA: false, ArrowRight: false, KeyD: false, ArrowDown: false, KeyS: false,
            Enter:false, KeyE:false };
        this.activeCar = undefined;
        this.cursors = undefined;
        this.startGameTitle = undefined;
        this.startGameOptions = undefined;
        this.playerName = undefined;
        this.cars = {};
        this.people = {};
        this.userInputText = { isActive: false };
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

        this.load.plugin('rexoutlinepipelineplugin', './lib/phaser3-rex-plugins/dist/rexoutlinepipelineplugin.min.js', true);
        this.load.plugin('rexcanvasinputplugin', './lib/phaser3-rex-plugins/dist/canvasinput-plugin.min.js', true);

        this.load.scenePlugin('rexuiplugin', './lib/phaser3-rex-plugins/dist/rexuiplugin.js', 'rexUI', 'rexUI');

        this.load.audio('startMenuSelect', '/assets/start_menu_select.mp3');

        this.scene.run(CONSTANTS.SCENES.CONTROLS_VIEW_SCENE);

        this.pressKeyActionPlayer = this.pressKeyActionPlayer.bind(this);
        this.removeKeyActionPlayer = this.removeKeyActionPlayer.bind(this);
    }

    create() {
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
        
        this.buildMap();
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
        
        var riverLayer = map.createLayer('river', tileset);

        this.riverLayerDimensions = {
            minWidth: null,
            minHeight: null,
            maxWidth: 0,
            maxHeight: 0
        };

        housesLayer.setCollisionByExclusion([-1]);
        riverLayer.setCollisionByExclusion([-1]);

        this.matter.world.convertTilemapLayer(housesLayer);
        this.matter.world.convertTilemapLayer(riverLayer);
    
        this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.cars["car"] = this.createCar(248, 500, 0, 0.9, 100, 'car');
        this.cars["car"].locked = true;
        this.cars["car2"] = this.createCar(535, 93, 90, 1.2, 500, 'car2');

        this.people["monica"] = this.createPerson(190, 450, "monica", 15);
        this.people["joe"] =  this.createPerson(130, 510, "joe", 51);
        
        this.pipelineInstance = this.plugins.get("rexoutlinepipelineplugin");

        this.createPlayer(200, 450);

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

    gameOver() {
        console.warn("game over");
    }

    pressKeyActionPlayer(event) {
        const code = event.code,
            keyPressed = this.keyPressed;

        keyPressed[code] = true;

        console.log(`Key code value: ${code}`);
        this.player.setRotation(0);
        if (keyPressed["ArrowUp"] || keyPressed["KeyW"]){
            this.player.thrustLeft(0.1);
            this.player.anims.play('up', true);
        }
        if (keyPressed["ArrowLeft"] || keyPressed["KeyA"]){
            this.player.thrustBack(0.1);
            this.player.anims.play('left', true);
        }
        if (keyPressed["ArrowRight"] || keyPressed["KeyD"]){
            this.player.thrust(0.1);
            this.player.anims.play('right', true);
        }
        if (keyPressed["ArrowDown"] || keyPressed["KeyS"]){
            
            this.player.thrustRight(0.1);
            this.player.anims.play('down', true);
        }
        if (keyPressed["Enter"] || keyPressed["KeyE"]) {
            
        }
    }

    removeKeyActionPlayer(event) {
        const code = event.code,
            keyPressed = this.keyPressed;
            
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

    destroyPlayer() {
        console.log("destroy");
        this.removePlayerListeners();
        this.player.destroy();
    }

    createPlayer(posX, posY) {
        console.log("setup player");
        this.player = this.createPerson(posX, posY);
        this.player.setStatic(false);
        this.setupPlayerListeners();
    }

    createPerson(posX, posY, name, frame) {
        const personBoundaryBox = '13 0 13 16 3 16 3 0',
            person = this.matter.add.sprite(posX, posY, 'dudes', frame, { shape: { type: 'fromVerts', verts: personBoundaryBox, flagInternal: true }});
        person.setMass(70);
        person.setFrictionAir(0.4);
        person.setStatic(true);

        return person;
    }

    createCar(x, y, angle, friction, mass, key) {
        let car = this.matter.add.sprite(x, y, key); 
        car.displayWidth = 16;
        car.displayHeight = 32;
        car.setMass(1000);
        car.setFrictionAir(0.4);
        car.speed = 0;
        car.setAngle(angle);
        car.setDepth(1);
        car.setStatic(true);

        return car;
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
}