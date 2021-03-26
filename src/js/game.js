'use strict';

var highScore = 0;

class mainGame extends Phaser.Scene {
    static VELOCITY = 200;

    // Game Objects
    cursors = null;
    player = null;
    playerShoots = null;
    enemys = null;
    scoreText = null;

    // Game Variables
    frames = 0;
    enemyCreate = 5;
    score = 0;

    constructor(){
        super("mainGame");
    }

    destroyEnemy(shoot, enemy) {
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`)

        shoot.destroy()
        enemy.destroy()
    }

    gameOver(player, enemy) {
        highScore = this.score > highScore 
            ? this.score 
            : highScore;

        this.scene.start("mainGame");
    }

    preload () {
        // Background Image
        this.load.image('background', 'src/assets/background.png');

        // Ship Sprites
        this.load.spritesheet('ship', 'src/assets/ship.png', 
            { frameWidth: 16, frameHeight: 24, })
        this.load.spritesheet('laser', 'src/assets/laser.png', 
            { frameWidth: 16, frameHeight: 16, })

        // Enemy Sprites
        this.load.spritesheet('enemy-small', 'src/assets/enemy-small.png', 
            { frameWidth: 16, frameHeight: 16, })
        this.load.spritesheet('enemy-big', 'src/assets/enemy-big.png', 
            { frameWidth: 32, frameHeight: 32, })
    }

    create () {
        this.score = 0;

        // Background
        this.add.image(315, 340, 'background').setScale(2.5);

        //Player
        this.player = this.physics.add.sprite(315, 600, 'ship').setScale(2.5);
        this.player.setCollideWorldBounds(true);
        this.playerShoots = this.physics.add.group();

        //Enemys
        this.enemys = this.physics.add.group();

        // Animations
        //      Player
        this.anims.create({
            key: 'playerIdle',
            frames: this.anims.generateFrameNumbers('ship', 
                { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
            yoyo: true,
        });
        this.player.play('playerIdle')
        //      Laser
        this.anims.create({
            key: 'laser',
            frames: this.anims.generateFrameNumbers('laser',
                { start: 2, end: 3 }),
            frameRate: 10,
            repeat: -1,
            yoyo: true,
        });
        //      Enemys
        this.anims.create({
            key: 'enemy-small',
            frames: this.anims.generateFrameNumbers('enemy-small',
                { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1,
            yoyo: true,
        });
        this.anims.create({
            key: 'enemy-big',
            frames: this.anims.generateFrameNumbers('enemy-big',
                { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1,
            yoyo: true,
        });

        // Event Input
        this.cursors = this.input.keyboard.createCursorKeys();

        // TODO: Colision entre enemigos

        // Events
        this.physics.add.overlap(this.playerShoots, this.enemys,
            this.destroyEnemy, null, this);
        this.physics.add.collider(this.player, this.enemys, this.gameOver,
            null, this);

        // Texts
        this.scoreText = this.add.text(16, 16, 'Score: 0',
            { fontSize: '32px', fill: '#FFF', });
        this.add.text(16, 40, `High Score: ${highScore}`,
            { fontSize: '32px', fill: '#FFF', });
    }

    update () {
        // Player Movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-mainGame.VELOCITY);
            this.player.setVelocityY(0);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(mainGame.VELOCITY);
            this.player.setVelocityY(0);
        } else if (this.cursors.up.isDown) {
            this.player.setVelocityX(0);
            this.player.setVelocityY(-mainGame.VELOCITY);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityX(0);
            this.player.setVelocityY(mainGame.VELOCITY);
        } else {  
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
        }

        // Player Shoot
        if (this.cursors.space.isDown) {
            if (this.playerShoots.countActive() < 4) {
                var shoot = this.playerShoots.create(this.player.x,
                    this.player.y - 50, 'laser').setScale(2.5);
                shoot.setVelocity(0, -(mainGame.VELOCITY * 1.25));
                shoot.play('laser');
            }
        }

        // Destroy un-hit Shoots
        var shootsArr = this.playerShoots.children.getArray();
        var shoot;
        for (var i = 0; i < shootsArr.length; i++) {
            shoot = shootsArr[i];
            if (shoot.y < 0) {
                shoot.destroy();
            }
        }

        // Create Enemys
        this.frames += 1;
        if (this.frames >= this.enemyCreate) {
            var enemyKey = this.enemyCreate % 2 == 0 
                ? 'enemy-small' 
                : 'enemy-big';
            var x = Phaser.Math.Between(50, 580);
            var y = Phaser.Math.Between(50, (config.width / 2));
            var enemy = this.enemys.create(x, y,
                enemyKey).setScale(2.5);
            enemy.setCollideWorldBounds(true);
            var velocityX = x > (config.width / 2)
                ? Phaser.Math.Between(-200, 0)
                : Phaser.Math.Between(0, 200);
            enemy.setVelocity(velocityX,
                mainGame.VELOCITY * 1.5);
            enemy.play(enemyKey);

            this.frames = 0;
            this.enemyCreate = Phaser.Math.Between(5, 15);
        }

        // Destroy un-hit Enemys
        var enemysArr = this.enemys.children.getArray();
        var enemy;
        for (var i = 0; i < enemysArr.length; i++) {
            enemy = enemysArr[i];
            if (enemy.y > config.height - 50) {
                enemy.destroy();
            }
        }
    }
}

var config = {
  type: Phaser.AUTO,
  width: 630,
  height: 680,
  physics: {
    default: 'arcade',
  },
  scene: [
    mainGame
  ],
};

var game = new Phaser.Game(config);
