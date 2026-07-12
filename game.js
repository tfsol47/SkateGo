const W = window.innerWidth;
const H = window.innerHeight;

const GROUND_Y = H - 80;
const SKATER_START_Y = GROUND_Y - 35;

class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.body=scene.add.rectangle(x, y,40,60,0x000000, 0);
    scene.physics.add.existing(this.body);

//REMEMEBER TO SWAP FOR ACTUAL SPRITES
    this.container=scene.add.container(x, y).setDepth(9);

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
    this.recoveryCount=0;
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
        this.container.angle =12; //Powersliding tilt
      } else{
        this.container.angle=-4;//cruising tilt
      }
    }
  
    
    resetBoardAngle() {
      this.boardContainer.angle =0;
    }
  }
  

//Menu
class MenuScene extends Phaser.Scene {
  constructor() {
     super({ key: 'MenuScene' }); }

  create() {
    this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0, 0);
    
    if (!this.registry.has('highscore')) {
      this.registry.set('highscore', 0);
    }

    this.add.text(W / 2, H * 0.2, 'SKATE GO', {
      fontSize: '48px', fill: '#ffffff', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.35, 'CHOOSE YOUR CITY', {
      fontSize: '20px', fill: '#a1a1a1', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);

    //Night city
    const nightBtn = this.add.rectangle(W / 2 - 200, H * 0.55, 320, 80, 0x1a1a2e).setInteractive();
    this.add.text(W / 2 - 200, H * 0.55, 'NIGHT CITY', {
      fontSize: '18px', fill: '#00ffff', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);

    //sunset suburb
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

    this.add.text(W / 2, H * 0.8, 'SPACE / ARROW UP = JUMP          K = KICKFLIP\n ARROW DOWN = POWERSLIDE  H = HEELFLIP  S = SHOVE IT', {
      fontSize: '12px', fill: '#555555', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);
  }

}

//GAME SCENE
class GameScene extends Phaser.Scene {
  constructor() {
   super({ key: 'GameScene' });
  
  }
  init(data) {
   this.theme = data.theme || 'night'; 
  }

  create() {
    const theme = this.theme;

    let C;
    if (theme === 'night') {
      C= {
        skyTop:0x04040f,
        skyMid:0x0a0a2a,
        skyBot:0x0d1235,
        buildFar:0x0c0c22,
        buildNear:0x161630,
        winFar:0x00ffff,
        winNear:0x44ffff,
        ground:0x00cc00,
        groundDark:0x005500,
        obstacle:0xff0044,
        hudColor:'#00ffff',
      };
    } else {
      C= {
        skyTop:0x0a0000,
        skyMid:0xcc2200,
        skyBot:0xff7700,
        buildFar:0x120800,
        buildNear:0x1e0e00,
        winFar:0xffaa00,
        winNear:0xffcc44,
        ground:0xaa5500,
        groundDark:0x552200,
        obstacle:0x8b0000,
        hudColor:'#ffaa00',
      };
    }

    //GRADIENT SKY (fixed) 
    const skyGfx = this.add.graphics().setScrollFactor(0).setDepth(0);
    skyGfx.fillGradientStyle(C.skyTop,C.skyTop, C.skyBot,C.skyBot, 1,1,1,1);
    skyGfx.fillRect(0,0,W,H);

    //STARS (night only)
    if (theme === 'night') {
      const starGfx = this.add.graphics().setScrollFactor(0).setDepth(1);
      for (let i = 0; i < 150; i++) {
        const sx = Phaser.Math.Between(0, W);
        const sy = Phaser.Math.Between(0, H * 0.75);
        starGfx.fillStyle(0xffffff, Math.random() * 0.7 + 0.3);
        starGfx.fillRect(sx, sy, Math.random() < 0.15 ? 2 : 1, Math.random() < 0.15 ? 2 : 1);
      }
    }

    //MOON/SUN 
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

    //FAR BUILDINGS (fixed to camera) 
    const FAR_BUILDING_COUNT=200;
    const FAR_SPACING=120;
    const totalFarWidth=(FAR_BUILDING_COUNT*FAR_SPACING) +500;
    this.farGfx = this.add.graphics().setScrollFactor(0.1).setDepth(3);
    this.farGfx.fillStyle(C.buildFar);
    this.farGfx.fillRect(0, GROUND_Y - 10, totalFarWidth,10);
    for (let i = 0; i < FAR_BUILDING_COUNT; i++) {
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

    //NEAR BUILDINGS (fixed to camera) 
    const NEAR_BUILDING_COUNT=150;
    const NEAR_SPACING=180;
    const totalNearWidth=(NEAR_BUILDING_COUNT*NEAR_SPACING) +600;

    this.nearGfx = this.add.graphics().setScrollFactor(0.3).setDepth(4);
    this.nearGfx.fillStyle(C.buildNear);
    this.nearGfx.fillRect(0, GROUND_Y - 6,totalNearWidth, 6);
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

    // GROUND 
    const ground = this.physics.add.staticGroup();
    for (let i = 0; i < 2000; i++) {
      const tile = this.add.rectangle(i * 200 + 100, GROUND_Y, 200, 8, C.ground).setDepth(5);
      ground.add(tile);
    }
    const gDetail = this.add.graphics().setDepth(5);
    for (let i = 0; i < 2000; i++) {
      gDetail.fillStyle(C.groundDark);
      gDetail.fillRect(i * 200 + 10, GROUND_Y + 4, 160, 2);
    }

    //SKATER (still thinking of name)
    this.player =new Player(this, 100, SKATER_START_Y);
    this.skater=this.player.body;

    this.speedLines = this.add.graphics().setDepth(6);

    //Dust when landing
    const px=this.make.graphics({x:0, y:0, add:false});
    px.fillStyle(0xffffff);
    px.fillRect(0, 0, 4, 4);
    px.generateTexture('white_particle', 4, 4);
    px.destroy();

    //spark texture when grinding
    const sparkPx=this.make.graphics({x:0,y:0,add:false});
    sparkPx.fillStyle(0xffaa00);
    sparkPx.fillRect(0,0,3,3);
    sparkPx.generateTexture('spark', 3,3);
    sparkPx.destroy();

    this.sparks=this.add.particles(0,0,'spark',{
      speed:{min:50,max:150}, angle:{min:200, max:340}, lifespan:300, quantity:0, scale: {start:1, end:0},
      alpha: {start:1, end:0}
    }).setDepth(10);
    
    
    this.dust = this.add.particles(0, 0, 'white_particle',{
      speed: {min: 80, max:220 },
      angle: {min:150, max:210},
      lifespan:500,
      quantity: 0,
      scale: {start: 1.2, end: 0},
      alpha: {start: 0.9, end: 0}

    }).setDepth(10);

    this.physics.add.collider(this.skater, ground);

    //Obstacles
    this.obstacles = this.physics.add.staticGroup();
    this.physics.add.collider(this.skater, this.obstacles, hitObstacle, null, this);
    this.nextObstacleX = 700;
    this.alive = true;
    this.obstacleColor = C.obstacle;

    this.rails=this.physics.add.staticGroup();
    this.nextRailX=1200;
    this.isGrinding=false;
    this.grindCooldown=0;
    this.grindScore=0;
    this.physics.add.overlap(this.skater,this.rails,startGrind,null, this);


    //Controls
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

    //Hud
    this.activeTrickTexts=0;
    this.landedClean=true;
    this.comboTimer=0;
    this.comboTimerMax=2250;
    this.combo=0;

    this.comboText = this.add.text(W/2, H*0.15, '', {
      fontSize: '20px',
      fill: '#ff6600',
      fontFamily:'"Press Start 2P"'
    }).setDepth(25).setScrollFactor(0).setOrigin(0.5);
    this.comboBarBg=this.add.rectangle(W/2, H*0.12, 200, 8, 0x333333).setScrollFactor(0).setDepth(25).setVisible(false);
    this.comboBar=this.add.rectangle(W/2-100, H*0.12, 200, 8,0xff6600).setScrollFactor(0).setDepth(26).setOrigin(0,0.5).setVisible(false);
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
      fontSize: '16px', fill: '#ffffff', fontFamily: '"Press Start 2P"'
    }).setScrollFactor(0).setDepth(20);

    this.speedText = this.add.text(16, 44, 'SPEED: 1', {
      fontSize: '16px', fill: C.hudColor, fontFamily: '"Press Start 2P"'
    }).setScrollFactor(0).setDepth(20);
    this.highScore=this.registry.get('highscore');

    //Camera
    this.cameras.main.startFollow(this.skater, true, 0.1, 0.1);
    this.cameras.main.setFollowOffset(-W * 0.18, 0);
  }

  update(time, delta) {
    if (!this.alive) return;
    if (this.grindCooldown>0) {
      this.grindCooldown-=this.game.loop.delta;
    }

    if (this.recoveryActive) {
      this.recoveryTimer -= delta;
      if (this.recoveryTimer <= 0) {
        this.recoveryActive=false;
        this.recoveryText.destroy();
        this.recoveryBar.destroy();
        this.recoveryFill.destroy();
        this.input.keyboard.off('keydown-SPACE', this.handleRecoveryInput, this);
        hitObstacle.call(this);
      }
    }

    const body = this.skater.body;
    this.onGround = body.blocked.down;

    //landings
    if (!this.wasOnGround && this.onGround) {
      if(this.isFlipping && !this.landedClean) {
        this.startRecovery();
      } else{
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
  }
      if (this.combo >0) {
        this.comboTimer-= this.game.loop.delta;
        const progress=Math.max(this.comboTimer/this.comboTimerMax,0);
        this.comboBar.width=200* progress;
        this.comboBarBg.setVisible(true);
        this.comboBar.setVisible(true);
        if (this.comboTimer <=0) {
        this.comboBarBg.setVisible(false);
        this.comboBar.setVisible(false);
      }
    } else {
      this.comboBarBg.setVisible(false);
      this.comboBar.setVisible(false);
    }
  

    this.wasOnGround = this.onGround;

    if (this.onGround) {
      this.coyoteTimer = this.coyoteTime;
    } else {
      this.coyoteTimer -= this.game.loop.delta;
    }

    const baseSpeed = Math.min(250 + Math.floor(this.score / 100) * 15, 600);

    if(this.recoveryActive){
      this.skateSpeed=30;
    } else if (this.cursors.down.isDown && this.onGround) {
  this.skateSpeed = Math.max(80, (this.skateSpeed || baseSpeed) * 0.985);
} else {
  this.skateSpeed = baseSpeed;
}

body.setVelocityX(this.skateSpeed);

    // Jump only once when the key is first pressed
if (
    (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.space)) && 
    this.coyoteTimer > 0 &&
    !this.recoveryActive) {
    body.setVelocityY(-750);
    this.coyoteTimer = 0;
}

// Cut the jump short if the player lets go early
if (body.velocity.y < 0 && !(this.cursors.up.isDown || this.cursors.space.isDown)) {
  body.setVelocityY(body.velocity.y *0.6);
}
//gravity multiplier
//keep 1.04 for now may change later
  if (body.velocity.y >0) {
    body.setVelocityY(body.velocity.y * 1.04);
}

    //grinding
    if (this.isGrinding) {
      this.skater.y=this.currentRail.y-34;
      this.skater.body.setVelocityY(0);
      this.grindScore += 1;
      this.score+=0.5;
      this.sparks.emitParticleAt(this.skater.x,this.skater.y+30,3);

    //jump out grind
    if(Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      this.isGrinding=false;
      this.skater.body.setAllowGravity(true);
      this.skater.body.setVelocityY(-700);
      this.showTrickText('50-50 GRIND', Math.floor(this.grindScore));
      this.grindCooldown=500;
      this.grindScore=0;
      this.comboText.setText('');
      

    }

    //fell off the end of rail
    if (this.skater.x > this.currentRail.x+100) {
      this.isGrinding=false;
      this.skater.body.setAllowGravity(true);
      this.showTrickText('50-50 GRIND', Math.floor(this.grindScore));
      this.grindCooldown=500;
      this.grindScore=0;
      this.comboText.setText('');
     
    }
  }
    //trick inputs
    if (!this.onGround && !this.isFlipping) {
      const kickHeld= this.kickflipKey.isDown;
      const heelHeld= this.heelflipKey.isDown;
      const shoveitHeld= this.shoveitKey.isDown;

      if (kickHeld){
        this.isFlipping=true;
        this.flipAngle=0;
        this.currentTrick='kickflip';
        this.landedClean=false;
      } else if (heelHeld) {
        this.isFlipping=true;
        this.flipAngle=0;
        this.currentTrick='heelflip';
        this.landedClean=false;
      } else if (shoveitHeld) {
      this.isFlipping=true;
      this.flipAngle=0;
      this.currentTrick='shoveit';
      this.landedClean=false;
    }
  }
    //flip rotations
    if (this.isFlipping) {
      this.flipAngle += 1.1* delta;
      const displayAngle=this.currentTrick==='heelflip' ?-this.flipAngle : this.flipAngle;
      const targetAngle= 360;

      this.player.update(this.cursors, true, displayAngle, body.velocity.y);

      if (this.flipAngle >= targetAngle) {
        this.isFlipping = false;
        this.flipAngle  = 0;
        this.player.resetBoardAngle();
        this.landedClean=true;

        const trickNames= {kickflip: 'KICKFLIP', heelflip: 'HEELFLIP', shoveit: 'POP SHUV'};
        const trickPoints= {kickflip: 50, heelflip:50, shoveit:40};

        this.combo+=1;
        this.comboTimer=this.comboTimerMax;
        const name=trickNames[this.currentTrick];
        const pts =trickPoints[this.currentTrick] * this.combo;

        this.showTrickText(name,pts);
        this.score += pts;
        this.currentTrick=null;
        this.comboText.setText('COMBO x' + this.combo);
      }
    } else {
      this.player.update(this.cursors, false, 0, body.velocity.y);
    }

    // spawn obstacles
    if (this.skater.x + 500 > this.nextObstacleX) {
      const h = Phaser.Math.Between(30, 70);
      const obs = this.add.rectangle(this.nextObstacleX, GROUND_Y - h / 2,30, h, this.obstacleColor).setDepth(7);
      this.physics.add.existing(obs, true);
      this.obstacles.add(obs);
      this.nextObstacleX += Phaser.Math.Between(500, 900);
    }

    if (this.skater.x+600 > this.nextRailX) {
      const rail=this.add.rectangle(this.nextRailX, GROUND_Y-80, 200,8,0x888888).setDepth(7);
      this.physics.add.existing(rail,true);
      this.rails.add(rail);
      this.nextRailX+=Phaser.Math.Between(800,1400);
    }

    this.score += 1;
    this.scoreText.setText('SCORE: ' + Math.floor(this.score / 10));
    this.speedText.setText('SPEED: ' + (Math.floor(this.score / 100) + 1));
  }

//RECOVERY
startRecovery() {
  this.skater.body.setVelocityX(80);
  this.skateSpeed=80;
  this.recoveryActive=true;
  this.recoveryPressesNeeded=5 + this.recoveryCount *2;
  this.recoveryPresses=0;
  this.recoveryTimer=2000;
  this.recoveryCount+=1;

  this.recoveryBar=this.add.rectangle(W/2,H*0.55,200,20,0x333333).setDepth(30).setScrollFactor(0);
  this.recoveryFill=this.add.rectangle(W/2-100, H*0.55, 0,20,0x00ff00).setDepth(31).setScrollFactor(0).setOrigin(0,0.5);

  this.recoveryText=this.add.text(W/2,H*0.5, 'MASH SPACE TO RECOVER', {
    fontSize: '14px',
    fill: '#ff0000',
    fontFamily: '"Press Start 2P"'
  }).setDepth(30).setScrollFactor(0).setOrigin(0.5);

  this.input.keyboard.on('keydown-SPACE', this.handleRecoveryInput, this);
}



handleRecoveryInput() {
  if (!this.recoveryActive) return;

  this.recoveryPresses +=1;
  const progress=this.recoveryPresses/this.recoveryPressesNeeded;
  this.recoveryFill.width=200*Math.min(progress, 1);

  if (this.recoveryPresses >= this.recoveryPressesNeeded) {
    this.recoveryActive=false;
    this.recoveryText.destroy();
    this.recoveryBar.destroy();
    this.recoveryFill.destroy();
    this.input.keyboard.off('keydown-SPACE', this.handleRecoveryInput, this);
    this.skateSpeed=250;

    const recovered= this.add.text(W/2, H*0.5, 'RECOVERED', {
      fontSize: '20px',
      fill: '#00ff00',
      fontFamily: '"Press Start 2P"'
    }).setDepth(30).setScrollFactor(0).setOrigin(0.5);

    this.tweens.add({
      targets: recovered,
      alpha: 0,
      duration: 500,
      delay: 800,
      onComplete:() => recovered.destroy()
    });
  } 
}

showTrickText(text, points) {
  const offsetY=this.activeTrickTexts *30;
  this.activeTrickTexts+=1;

  //change text color based on combo multiplier later
  const tx=this.add.text(W/2,H *0.35 - offsetY, text + ' +' +points, {
    fontSize: '14px', fill: '#ffff00', fontFamily: '"Press Start 2P"'
  }).setDepth(25).setScrollFactor(0).setOrigin(0.5);

  this.tweens.add({
    targets:tx,
    y: H*0.25,
    alpha:0,
    duration: 500,
    delay:800,
    ease: 'Quad.easeOut',
    onComplete: ()=> {
      this.activeTrickTexts-=1;
      tx.destroy();
      }
    });
  }
}

//HIT OBSTACLE (change in the future)
function hitObstacle() {
  this.alive = false;
  this.recoveryCount=0;
  this.skater.body.setVelocityX(0);

  this.add.text(W / 2, H * 0.35, 'FAILED!', {
    fontSize: '48px', fill: '#ff0000', fontFamily: '"Press Start 2P"'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(30);
  const finalScore =Math.floor(this.score/10);
  if(Math.floor(this.score/10) > this.highScore) {
    this.highScore=Math.floor(this.score/10);
  }
  this.add.text(W / 2, H * 0.5, 'SCORE: ' + Math.floor(this.score / 10), {
    fontSize: '24px', fill: '#ffffff', fontFamily: '"Press Start 2P"'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(30);

  this.add.text(W/2, H*0.58, 'BEST: ' + this.highScore, {
    fontSize: '18px', fill: '#ffff00', fontFamily: '"Press Start 2P"'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(30);

  this.add.text(W / 2, H * 0.62, 'returning to menu...', {
    fontSize: '14px', fill: '#aaaaaa', fontFamily: '"Press Start 2P"'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(30);

  this.time.delayedCall(2500, () => this.scene.start('MenuScene'));
}

function startGrind(skater,rail) {
  if (this.isGrinding) return;
  if (this.grindCooldown>0) return;
  this.isGrinding=true;
  this.currentRail=rail;
  skater.body.velocityY=0;
  skater.body.setAllowGravity(false);
  skater.y=rail.y-34;
}

// PHASER CONFIG
const config = {
  type: Phaser.AUTO,
  width:  window.innerWidth,
  height: window.innerHeight,
  pixelArt:true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1500 }, debug: false }
  },
  scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(config);