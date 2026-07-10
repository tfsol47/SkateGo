const W = window.innerWidth;
const H = window.innerHeight;

const GROUND_Y = H - 80;
const SKATER_START_Y = GROUND_Y - 35;
class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.body=scene.add.rectangle(x,y,40,60, 0x000000,0);
    scene.physics.add.existing(this.body);
//REPLACE SOON
    this.container=scene.add.container(x, y).setDepth(9).setDepth(9).setVisible(true);

    this.bodySprite=scene.add.rectangle(0, -25, 24, 30, 0xffffff);
    this.headSprite = scene.add.circle(0, -45, 12, 0xffd700);

    this.leftLeg=scene.add.rectangle(-6, 0, 8, 20, 0xffffff);
    this.rightLeg=scene.add.rectangle(6, 0, 8, 20, 0xffffff);

    this.boardSprite=scene.add.rectangle(0, 0, 44, 8, 0xff6600);
    this.leftWheel=scene.add.circle(-14, 6, 5, 0x333333);
    this.rightWheel=scene.add.circle(14, 6, 5, 0x333333);

    this.boardContainer=scene.add.container(0, 20, [
      this.boardSprite,
      this.leftWheel,
      this.rightWheel
    ]);

    this.container.add([
      this.bodySprite,
      this.headSprite,
      this.leftLeg,
      this.rightLeg,
      this.boardContainer
    ]);
    

    this.onGround=false;
    this.wasOnGround=false;
    this.isFlipping=false;
    this.flipAngle=0;

    this.coyoteTime=180;
    this.coyoteTimer=0;

    this.jumpForce=800;

    this.speed=250;

    this.isGrinding=false;
    this.combo=0;
  

  }
  

  update(cursors, isFlipping, flipAngle, velocityY) {
      this.container.x=Math.round(this.body.x);
      this.container.y=Math.round(this.body.y);

      if (isFlipping) {
        this.container.angle=0;
        this.boardContainer.scaleX =1;
        this.boardContainer.angle=flipAngle;
        } else{
          this.boardContainer.angle =0;
          this.boardContainer.scaleX=1;
        
       } 

       if (!this.onGround) {
        this.container.angle=Phaser.Math.Clamp(velocityY * 0.04, -20, 20);
      } else if (cursors.down.isDown) {
        this.container.angle =8;
      } else{
        this.container.angle=-4;
      }
    }
  
    
    resetBoardAngle() {
      this.boardContainer.angle =0;
    }
  }
  

// MENU SCENE
class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }
  preload() {}

  create() {
    console.log('GameScene create started');
    const theme = this.theme;
    this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0, 0);


    this.add.text(W / 2, H * 0.2, 'SKATE GO', {
      fontSize: '48px', fill: '#ffffff', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.35, 'CHOOSE YOUR CITY', {
      fontSize: '20px', fill: '#a1a1a1', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);

    const nightBtn = this.add.rectangle(W / 2 - 200, H * 0.55, 320, 80, 0x1a1a2e).setInteractive();
    this.add.text(W / 2 - 200, H * 0.55, 'NIGHT CITY', {
      fontSize: '18px', fill: '#00ffff', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);

    const sunsetBtn = this.add.rectangle(W / 2 + 200, H * 0.55, 320, 80, 0x2d1b00).setInteractive();
    this.add.text(W / 2 + 200, H * 0.55, 'SUNSET\nSUBURB', {
      fontSize: '18px', fill: '#ff6600', fontFamily: '"Press Start 2P"', align: 'center'
    }).setOrigin(0.5);

    nightBtn.on('pointerover',  () => nightBtn.setFillStyle(0x2a2a4e));
    nightBtn.on('pointerout',   () => nightBtn.setFillStyle(0x1a1a2e));
    sunsetBtn.on('pointerover', () => sunsetBtn.setFillStyle(0x4d3b00));
    sunsetBtn.on('pointerout',  () => sunsetBtn.setFillStyle(0x2d1b00));
    nightBtn.on('pointerdown',  () => this.scene.start('GameScene', { theme: 'night' }));
    sunsetBtn.on('pointerdown', () => this.scene.start('GameScene', { theme: 'sunset' }));

    this.add.text(W / 2, H * 0.8, 'SPACE / ARROW UP = JUMP          K = KICKFLIP\n ARROW DOWN = POWERSLIDE', {
      fontSize: '12px', fill: '#555555', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);
  }

  update() {}
}

// GAME SCENE
class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }
  init(data) { this.theme = data.theme || 'night'; }
  preload() {}

  create() {
    const theme = this.theme;

    const C = {
      night: {
        skyTop:     0x04040f,
        skyMid:     0x0a0a2a,
        skyBot:     0x0d1235,
        buildFar:   0x0c0c22,
        buildNear:  0x161630,
        winFar:     0x00ffff,
        winNear:    0x44ffff,
        ground:     0x00cc00,
        groundDark: 0x005500,
        obstacle:   0xff0044,
        hudColor:   '#00ffff',
      },
      sunset: {
        skyTop:     0x0a0000,
        skyMid:     0xcc2200,
        skyBot:     0xff7700,
        buildFar:   0x120800,
        buildNear:  0x1e0e00,
        winFar:     0xffaa00,
        winNear:    0xffcc44,
        ground:     0xaa5500,
        groundDark: 0x552200,
        obstacle:   0x8b0000,
        hudColor:   '#ffaa00',
      }
    }[theme];

    // ---- GRADIENT SKY (fixed) ----
    const skyGfx = this.add.graphics().setScrollFactor(0).setDepth(0);
    const strips = 40;
    for (let i = 0; i < strips; i++) {
      const t = i / strips;
      let r, g, b;
      if (t < 0.5) {
        const t2 = t * 2;
        r = lerp(hexR(C.skyTop), hexR(C.skyMid), t2);
        g = lerp(hexG(C.skyTop), hexG(C.skyMid), t2);
        b = lerp(hexB(C.skyTop), hexB(C.skyMid), t2);
      } else {
        const t2 = (t - 0.5) * 2;
        r = lerp(hexR(C.skyMid), hexR(C.skyBot), t2);
        g = lerp(hexG(C.skyMid), hexG(C.skyBot), t2);
        b = lerp(hexB(C.skyMid), hexB(C.skyBot), t2);
      }
      const col = (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
      skyGfx.fillStyle(col);
      skyGfx.fillRect(0, i * (H / strips), W, Math.ceil(H / strips) + 1);
    }

    // ---- STARS (night only) ----
    if (theme === 'night') {
      const starGfx = this.add.graphics().setScrollFactor(0).setDepth(1);
      for (let i = 0; i < 150; i++) {
        const sx = Phaser.Math.Between(0, W);
        const sy = Phaser.Math.Between(0, H * 0.75);
        starGfx.fillStyle(0xffffff, Math.random() * 0.7 + 0.3);
        starGfx.fillRect(sx, sy, Math.random() < 0.15 ? 2 : 1, Math.random() < 0.15 ? 2 : 1);
      }
    }

    
    // ---- MOON / SUN ----
    const moonGfx = this.add.graphics().setScrollFactor(0).setDepth(2);
    if (theme === 'night') {
      moonGfx.fillStyle(0xffffdd);
      moonGfx.fillCircle(W * 0.78, H * 0.18, 44);
      moonGfx.fillStyle(C.skyMid);
      moonGfx.fillCircle(W * 0.78 + 18, H * 0.18 - 12, 36);
    } else {
      moonGfx.fillStyle(0xffee00, 0.15);
      moonGfx.fillCircle(W * 0.72, H * 0.2, 80);
      moonGfx.fillStyle(0xffdd00, 0.3);
      moonGfx.fillCircle(W * 0.72, H * 0.2, 60);
      moonGfx.fillStyle(0xffcc00);
      moonGfx.fillCircle(W * 0.72, H * 0.2, 44);
    }

    // ---- FAR BUILDINGS (fixed to camera) ----
    this.farGfx = this.add.graphics().setScrollFactor(0.1).setDepth(3);
    this.farGfx.fillStyle(C.buildFar);
    this.farGfx.fillRect(0, GROUND_Y - 10, 200 * 120 +200, 10);
    for (let i = 0; i < 200; i++) {
      const bx = i * 120 + Phaser.Math.Between(0, 40);
      const bh = Phaser.Math.Between(60, 160);
      const bw = Phaser.Math.Between(40, 90);
      const by = GROUND_Y - bh;
      this.farGfx.fillStyle(C.buildFar);
      this.farGfx.fillRect(bx, by, bw, bh);
      for (let wy = by + 8; wy < GROUND_Y - 8; wy += 18) {
        for (let wx = bx + 6; wx < bx + bw - 6; wx += 14) {
          if (Math.random() > 0.45) {
            this.farGfx.fillStyle(C.winFar, Math.random() * 0.8 + 0.2);
            this.farGfx.fillRect(wx, wy, 7, 9);
          }
        }
      }
    }

    // ---- NEAR BUILDINGS (fixed to camera) ----
    this.nearGfx = this.add.graphics().setScrollFactor(0.3).setDepth(4);
    this.nearGfx.fillStyle(C.buildNear);
    this.nearGfx.fillRect(0, GROUND_Y - 6, 150 * 180 +200, 6);
    for (let i = 0; i < 150; i++) {
      const bx = i * 180 + Phaser.Math.Between(0, 60);
      const bh = Phaser.Math.Between(100, 240);
      const bw = Phaser.Math.Between(60, 130);
      const by = GROUND_Y - bh;
      this.nearGfx.fillStyle(C.buildNear);
      this.nearGfx.fillRect(bx, by, bw, bh);
      for (let wy = by + 12; wy < GROUND_Y - 8; wy += 22) {
        for (let wx = bx + 8; wx < bx + bw - 8; wx += 18) {
          if (Math.random() > 0.35) {
            this.nearGfx.fillStyle(C.winNear, Math.random() * 0.9 + 0.1);
            this.nearGfx.fillRect(wx, wy, 9, 12);
          }
        }
      }
    }

    // ---- GROUND ----
    const ground = this.physics.add.staticGroup();
    for (let i = 0; i < 400; i++) {
      const tile = this.add.rectangle(i * 200 + 100, GROUND_Y, 200, 8, C.ground).setDepth(5);
      ground.add(tile);
    }
    const gDetail = this.add.graphics().setDepth(5);
    for (let i = 0; i < 400; i++) {
      gDetail.fillStyle(C.groundDark);
      gDetail.fillRect(i * 200 + 10, GROUND_Y + 4, 160, 2);
    }

    // ---- SKATER (still thinking of name)----
    this.player =new Player(this, 100, SKATER_START_Y);
    this.skater=this.player.body;
    this.skaterGfx = this.add.graphics().setDepth(9);
    this.boardGfx=this.add.graphics().setDepth(9);
    this.speedLines = this.add.graphics().setDepth(6);



    const px=this.make.graphics({x:0, y:0, add:false});
    px.fillStyle(0xffffff);
    px.fillRect(0, 0, 4, 4);
    px.generateTexture('white_particle', 4, 4);
    px.destroy();
    
    
    this.dust = this.add.particles(0, 0, 'white_particle',{
      speed: {min: 80, max:220 },
      angle: {min:150, max:210},
      lifespan:500,
      quantity: 0,
      scale: {start: 1.2, end: 0},
      alpha: {start: 0.9, end: 0}

    }).setDepth(10);

    this.physics.add.collider(this.skater, ground);

    // ---- OBSTACLES ----
    this.obstacles = this.physics.add.staticGroup();
    this.physics.add.collider(this.skater, this.obstacles, hitObstacle, null, this);
    this.nextObstacleX = 700;
    this.alive = true;
    this.obstacleColor = C.obstacle;
    this.rails = this.physics.add.staticGroup();

    const rail = this.add.rectangle(
      900,
      GROUND_Y - 90,
      220,
      8,
      0x888888
    ).setDepth(7);

    this.physics.add.existing(rail, true);
    this.rails.add(rail);

    // ---- INPUT ----
    this.cursors     = this.input.keyboard.createCursorKeys();
    this.kickflipKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.heelflipKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.shoveitKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.isFlipping  = false;
    this.flipAngle   = 0;
    this.onGround    = false;
    this.wasOnGround = true;

    this.coyoteTime = 100;
    this.coyoteTimer = 0;

    // ---- HUD ----
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
      fontSize: '16px', fill: '#ffffff', fontFamily: '"Press Start 2P"'
    }).setScrollFactor(0).setDepth(20);

    this.speedText = this.add.text(16, 44, 'SPEED: 1', {
      fontSize: '16px', fill: C.hudColor, fontFamily: '"Press Start 2P"'
    }).setScrollFactor(0).setDepth(20);

    // ---- CAMERA ----
    this.cameras.main.startFollow(this.skater, true, 0.1, 0.1);
    this.cameras.main.setFollowOffset(-W * 0.18, 0);
  }

  update() {
    if (!this.alive) return;

    const body = this.skater.body;
    this.onGround = body.blocked.down;

    if (!this.wasOnGround && this.onGround) {
      this.cameras.main.shake(60, 0.003);
      this.dust.explode(20, this.skater.x, this.skater.y + 30);

      this.tweens.add({
        targets: [this.player.container],
        scaleY: 0.7,
        scaleX: 1.3,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeOut'
      });
    }

    this.wasOnGround = this.onGround;

    if (this.onGround) {
      this.coyoteTimer = this.coyoteTime;
    } else {
      this.coyoteTimer -= this.game.loop.delta;
    }

    const baseSpeed = Math.min(250 + Math.floor(this.score / 100) * 15, 600);

if (this.cursors.down.isDown && this.onGround) {
  this.skateSpeed = Math.max(80, (this.skateSpeed || baseSpeed) * 0.985);
} else {
  this.skateSpeed = baseSpeed;
}

body.setVelocityX(this.skateSpeed);

    // Jump only once when the key is first pressed
if (
    (Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
     Phaser.Input.Keyboard.JustDown(this.cursors.space)) &&
    this.coyoteTimer > 0
) {
    body.setVelocityY(-750);
    this.coyoteTimer = 0;
}

// Cut the jump short if the player lets go early
if (body.velocity.y < 0 && !(this.cursors.up.isDown || this.cursors.space.isDown)) {
  body.setVelocityY(body.velocity.y *0.6);
}

  if (body.velocity.y >0) {
    body.setVelocityY(body.velocity.y * 1.04);
}

    if (!this.onGround && !this.isFlipping) {
      const kickJust= Phaser.Input.Keyboard.JustDown(this.kickflipKey);
      const heelJust= Phaser.Input.Keyboard.JustDown(this.heelflipKey);
      const shoveitJust= Phaser.Input.Keyboard.JustDown(this.shoveitKey);

      if (kickJust){
        this.isFlipping=true;
        this.flipAngle=0;
        this.currentTrick='kickflip';
      } else if (heelJust) {
        this.isFlipping=true;
        this.flipAngle=0;
        this.currentTrick='heelflip';
      } else if (shoveitJust) {
      this.isFlipping=true;
      this.flipAngle=0;
      this.currentTrick='shoveit';
    }
  }

    if (this.isFlipping) {
      this.flipAngle += 18;
      const displayAngle=this.currentTrick==='heelflip' ?-this.flipAngle : this.currentTrick==='shoveit' ? 0 : this.flipAngle;
      const targetAngle= this.currentTrick=== 'shoveit' ? 180:360;

      this.player.update(this.cursors, true, displayAngle, body.velocity.y, this.currentTrick);

      if (this.flipAngle >= targetAngle) {
        this.isFlipping = false;
        this.flipAngle  = 0;
        this.player.resetBoardAngle();
        this.score += this.currentTrick ==='shoveit' ? 40:50;
        this.currentTrick=null;
      }
    } else {
      this.player.update(this.cursors, false, 0, body.velocity.y, null);
    }

    // spawn obstacles
    if (this.skater.x + 500 > this.nextObstacleX) {
      const h = Phaser.Math.Between(30, 70);
      const obs = this.add.rectangle(
        this.nextObstacleX, GROUND_Y - h / 2,
        30, h, this.obstacleColor
      ).setDepth(7);
      this.physics.add.existing(obs, true);
      this.obstacles.add(obs);
      this.nextObstacleX += Phaser.Math.Between(500, 900);
    }

    this.score += 1;
    this.scoreText.setText('SCORE: ' + Math.floor(this.score / 10));
    this.speedText.setText('SPEED: ' + (Math.floor(this.score / 100) + 1));



    this.speedLines.clear();

    if(this.skatespeed > 280) {
      for (let i=0; i <12; i++){

        const x =this.skater.x - Phaser.Math.Between(50, 350);
        const y =this.skater.y - Phaser.Math.Between(-80, 40);
        const len = Phaser.Math.Between(20, 60);

        this.speedLines.lineStyle(2, 0xffffff, 0.35);
        this.speedLines.beginPath();
        this.speedLines.moveTo(x, y);
        this.speedLines.lineTo(x - len, y);
        this.speedLines.strokePath();

      }
    }
  }
}
// DRAW SKATER
function drawSkater(gfx, boardGfx, x, y, isCrouching, boardAngle) {
  gfx.clear();
  gfx.setPosition(Math.round(x), Math.round(y));
  boardGfx.setPosition(Math.round(x), Math.round(y));
  gfx.rotation= Phaser.Math.DegToRad(boardAngle * 0.25);

  const co = isCrouching ? 15 : 0;

  gfx.fillStyle(0xffffff);
  gfx.fillRect(-12, -60 + co, 24, 30);

  gfx.fillStyle(0xffd700);
  gfx.fillCircle(0, -75 + co, 14);

  gfx.fillStyle(0xffffff);
  const ll = isCrouching ? 10 : 30;
  gfx.fillRect(-12, -30 + co, 10, ll);
  gfx.fillRect(2,   -30 + co, 10, ll);

  boardGfx.clear();
  boardGfx.x     = x;
  boardGfx.y     = y;
  boardGfx.angle = boardAngle;

  boardGfx.fillStyle(0xff6600);
  boardGfx.fillRect(-22, 0, 44, 8);
  boardGfx.fillStyle(0x333333);
  boardGfx.fillCircle(-14, 10, 6);
  boardGfx.fillCircle(14,  10, 6);
}


// HIT OBSTACLE (change in the future)
function hitObstacle() {
  this.alive = false;
  this.skater.body.setVelocityX(0);

  this.add.text(W / 2, H * 0.35, 'FAILED!', {
    fontSize: '48px', fill: '#ff0000', fontFamily: '"Press Start 2P"'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(30);

  this.add.text(W / 2, H * 0.5, 'SCORE: ' + Math.floor(this.score / 10), {
    fontSize: '24px', fill: '#ffffff', fontFamily: '"Press Start 2P"'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(30);

  this.add.text(W / 2, H * 0.62, 'returning to menu...', {
    fontSize: '14px', fill: '#aaaaaa', fontFamily: '"Press Start 2P"'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(30);

  this.time.delayedCall(2500, () => this.scene.start('MenuScene'));
}

// COLOR HELPERS
function lerp(a, b, t) { return a + (b - a) * t; }
function hexR(h) { return (h >> 16) & 0xff; }
function hexG(h) { return (h >> 8)  & 0xff; }
function hexB(h) { return  h        & 0xff; }

// PHASER CONFIG
const config = {
  type: Phaser.AUTO,
  width:  window.innerWidth,
  height: window.innerHeight,
 // zoom: Math.floor(Math.min(window.innerWidth / 480, window.innerHeight / 270)),
  pixelArt:true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1500 }, debug: false }
  },
  scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(config);