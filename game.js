const W = window.innerWidth;
const H = window.innerHeight;

const GROUND_Y = H - 80;
const SKATER_START_Y = GROUND_Y - 35;

class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.body=scene.add.rectangle(x, y,40,60,0x000000, 0);
    scene.physics.add.existing(this.body);

    this.container=scene.add.container(x, y).setDepth(9);

    this.skaterSprite=scene.add.sprite(0,-35, 'skater_cruise').setScale(2);
    this.pushSprite=scene.add.sprite(0, -24, 'push').setScale(2).setVisible(false);

    this.boardSprite =scene.add.sprite(0,0,'board_cruise').setScale(2.5);

    this.boardContainer=scene.add.container(0,20,[
      this.boardSprite
    ]);

    this.ollieSprite=scene.add.sprite(0,-37, 'ollie').setScale(2).setVisible(false);
    this.olliePlayed=false;

    this.manualGrindSprite =scene.add.sprite(-10,-33, 'manual_grind').setScale(2).setVisible(false);



    this.container.add([
      this.boardContainer,
      this.skaterSprite,
      this.pushSprite,
      this.ollieSprite,
      this.manualGrindSprite,
    ]);
    

    this.onGround=false;
    this.isFlipping=false;
    this.recoveryCount=0;
    this.flipAngle=0;
    this.coyoteTime=180;
    this.coyoteTimer=0;
    this.isGrinding=false;
    this.lastAnim='skater_cruise'
  }
  

  update(cursors, isFlipping, flipAngle, velocityY, trickType, isManual, isGrinding,onGround) {
      this.container.x=Math.round(this.body.x);
      this.container.y=Math.round(this.body.y);
      //board animations
      if (isFlipping) {
        if (trickType==='heelflip'){
        this.boardSprite.play('heelflip',true);
        } else{
          this.boardSprite.play('kickflip',true);
        }
       } else if (isManual) {
        if (this.boardSprite.anims.currentAnim?.key !=='manual_start') {
          this.boardSprite.play('manual_start',true);
        }
        } else{
          this.boardContainer.angle=0;
          this.boardContainer.scaleX=1;
          this.boardSprite.play('cruise',true);
        }
          //skater animations
          if (isGrinding) {
            this.skaterSprite.setVisible(false);
            this.pushSprite.setVisible(false);
            this.ollieSprite.setVisible(false);
            this.manualGrindSprite.setVisible(true);
            this.manualGrindSprite.play('manual_grind',true);
          } else if(!onGround) {
            this.skaterSprite.setVisible(false);
            this.pushSprite.setVisible(false);
            this.manualGrindSprite.setVisible(false);
            this.manualGrindSprite.angle=0;
            this.ollieSprite.setVisible(true);
            if (!this.olliePlayed) {
              this.ollieSprite.play('ollie');
              this.olliePlayed=true;
            }
          } else if (isManual) {
            this.skaterSprite.setVisible(false);
            this.pushSprite.setVisible(false);
            this.ollieSprite.setVisible(false);
            this.manualGrindSprite.setVisible(true);
            this.manualGrindSprite.play('manual_grind',true);
            this.manualGrindSprite.angle=-8;
          } else {
            this.olliePlayed=false;
            this.ollieSprite.setVisible(false);
            this.manualGrindSprite.setVisible(false);
          if (!this.skaterSprite.anims.isPlaying && !this.pushSprite.anims.isPlaying) {
            if (this.lastAnim ==='push') {
              this.pushSprite.setVisible(false);
              this.skaterSprite.setVisible(true);
              this.skaterSprite.play('skater_cruise');
              this.lastAnim='skater_cruise';
            } else{
              this.skaterSprite.setVisible(false);
              this.pushSprite.setVisible(true);
              this.pushSprite.play('push');
              this.lastAnim='push'
            }
          } else if (this.lastAnim === 'push') {
            this.pushSprite.setVisible(true);
            this.skaterSprite.setVisible(false);
          } else {
            this.skaterSprite.setVisible(true);
            this.pushSprite.setVisible(false);
          }
       } 

       //container angle
       if (isGrinding) {
        this.container.angle=0;
       } else if (!onGround) {
        this.container.angle=Phaser.Math.Clamp(velocityY *0.04,-20,20);
       } else if (isManual) {
        this.container.angle=0;
       } else if (cursors.down.isDown) {
        this.container.angle=-12;
       } else {
        this.container.angle=0
       }
      }

      resetBoardAngle() {
        this.boardContainer.angle=0;
        this.boardContainer.scaleX=1;
      }

  }
  

//Menu
class MenuScene extends Phaser.Scene {
  constructor() {
     super({ key: 'MenuScene' }); }

  create() {
    const bgScale=H/324;

    this.clouds=this.add.tileSprite(0,0,W,H,'bg1').setOrigin(0,0).setDepth(0).setScale(2.5)
    this.add.image(W/2,H/2,'bg2').setDisplaySize(W,H).setDepth(0);
    this.add.image(W/2,H/2,'bg3').setDisplaySize(W,H).setDepth(0);
    this.add.image(W/2,H/2,'bg4').setDisplaySize(W,H).setDepth(0);
    this.add.image(W/2,H/2,'bg5').setDisplaySize(W,H).setDepth(0);

    this.add.image(W*0.25, H*0.838, 'staring').setScale(5).setDepth(4);

    //right panel menu
    const panelW= W*0.38;
    const panelX= W-panelW;
    this.add.rectangle(panelX,0, panelW, H, 0x000000,0.75).setOrigin(0,0).setDepth(5);

    const cx=panelX+panelW/2;


    this.add.text(cx, H * 0.1, 'SKATE GO', {
      fontSize: '32px', fill: '#ffffff', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(6);

    this.add.text(cx, H * 0.2, 'CHOOSE YOUR CITY', {
      fontSize: '13px', fill: '#ababab', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(6);

    //Night city
    const nightBtn = this.add.rectangle(cx, H*0.3, panelW * 0.75, 50, 0x1a1a2e).setInteractive().setDepth(6);
    this.add.text(cx, H* 0.3, 'NIGHT CITY', {
      fontSize: '14px', fill: '#00ffff', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(7);

    //sunset suburb
    const sunsetBtn = this.add.rectangle(cx, H* 0.36, panelW * 0.75, 50, 0x2d1b00).setInteractive().setDepth(6);
    this.add.text(cx, H* 0.36, 'SUNSET SUBURB', {
      fontSize: '14px', fill: '#f86300', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(7);

    nightBtn.on('pointerover',()=> nightBtn.setFillStyle(0x2a2a4e));
    nightBtn.on('pointerout',()=> nightBtn.setFillStyle(0x1a1a2e));
    sunsetBtn.on('pointerover',()=> sunsetBtn.setFillStyle(0x4d3b00));
    sunsetBtn.on('pointerout',()=> sunsetBtn.setFillStyle(0x2d1b00));

    nightBtn.on('pointerdown',() =>{
      this.cameras.main.fade(800,0,0,0);
      this.time.delayedCall(800,() => this.scene.start('GameScene', { theme: 'night' }));
    });
    sunsetBtn.on('pointerdown', () =>{
      this.cameras.main.fade(1200,0,0,0);
      this.time.delayedCall(1200,()=> this.scene.start('GameScene', { theme: 'sunset' }));
    });

    //leaderboard
    this.lbModes=['NORMAL','CHALLENGE','SCORE ATTACK'];
    this.lbTables=['scores','challenge_scores','scoreattack_scores'];
    this.lbIndex=0;

    const leftArrow= this.add.text(cx-120, H*0.62,'<',{fontSize:'13px',fill:'#ffffff',fontFamily:'"Press Start 2P"'}).setOrigin(0.5).setDepth(6).setInteractive();
    this.lbTitle=this.add.text(cx,H*0.62,'TOP 10',{fontSize:'11px',fill:'#ffff2a',fontFamily:'"Press Start 2P"'}).setOrigin(0.5).setDepth(6);
    const rightArrow=this.add.text(cx+120, H*0.62,'>',{fontSize:'13px',fill:'#ffffff',fontFamily:'"Press Start 2P"'}).setOrigin(0.5).setDepth(6).setInteractive();
    this.lbText =this.add.text(cx,H*0.74,'loading..',{fontSize:'10px',fill:'#c7c2c2',fontFamily:'"Press Start 2P"',align:'left',lineSpacing:8}).setOrigin(0.5).setDepth(6);

    leftArrow.on('pointerover',()=>leftArrow.setStyle({fill:'#ffff26'}));
    leftArrow.on('pointerout',()=>leftArrow.setStyle({fill:'#ffffff'}));
    rightArrow.on('pointerout',()=>rightArrow.setStyle({fill:'#ffff26'}));
    rightArrow.on('pointerout',()=>rightArrow.setStyle({fill:'#ffffff'}));

    leftArrow.on('pointerdown',()=>{
      this.lbIndex=(this.lbIndex-1 +this.lbModes.length)%this.lbModes.length;
      this.lbTitle.setText('TOP 10- '+this.lbModes[this.lbIndex]);
      this.lbText.setText('loading..');
      this.fetchLeaderboard(this.lbTables[this.lbIndex]);
    });

    rightArrow.on('pointerdown',()=>{
      this.lbIndex=(this.lbIndex+1)%this.lbModes.length;
      this.lbTitle.setText('TOP 10- '+this.lbModes[this.lbIndex]);
      this.lbText.setText('loading..');
      this.fetchLeaderboard(this.lbTables[this.lbIndex]);
    });

    const modesBtn= this.add.rectangle(cx, H*0.42,panelW*0.75, 50,0x1a0a2e).setInteractive().setDepth(6);
    this.add.text(cx,H*0.42, 'MODES',{fontSize:'14px',fill:'#ac09fd',fontFamily:'"Press Start 2P"'
    }).setOrigin(0.5).setDepth(7);

    modesBtn.on('pointerover',()=>modesBtn.setFillStyle(0x2a1a4e));
    modesBtn.on('pointerout',()=>modesBtn.setFillStyle(0x1a0a2e));
    modesBtn.on('pointerdown',()=>{this.cameras.main.fade(800,0,0,0);
      this.time.delayedCall(800,()=>this.scene.start('ModesScene'));
    });
    
    const tutorialBtn=this.add.rectangle(cx, H*0.48, panelW*0.75, 50, 0x0a2e0a).setInteractive().setDepth(6);
    this.add.text(cx,H*0.48,'HOW TO PLAY',{fontSize:'14px',fill:'#00ff00',fontFamily:'"Press Start 2P"'
    }).setOrigin(0.5).setDepth(7);
    tutorialBtn.on('pointerover',()=> tutorialBtn.setFillStyle(0x1a4e1a));
    tutorialBtn.on('pointerout',()=>tutorialBtn.setFillStyle(0x0a2e0a));
    tutorialBtn.on('pointerdown',()=>{this.cameras.main.fade(800,0,0,0);
      this.time.delayedCall(800,()=>this.scene.start('TutorialScene'));
    });

    const creditsBtn=this.add.rectangle(cx, H*0.535, panelW*0.75, 40, 0x111111).setInteractive().setDepth(6);
    this.add.text(cx, H*0.535, 'CREDITS', {
      fontSize:'12px', fill:'#a49b9b',fontFamily:'"Press Start 2P"'
    }).setOrigin(0.5).setDepth(7);

    creditsBtn.on('pointerover', ()=>creditsBtn.setFillStyle(0x222222));
    creditsBtn.on('pointerout',()=> creditsBtn.setFillStyle(0x111111));
    creditsBtn.on('pointerdown',()=> {
      this.creditsPanel.setVisible(!this.creditsVisible);
      this.creditsVisible=!this.creditsVisible;
    });

    this.creditsVisible=false;
    this.creditsPanel=this.add.text(cx, H*0.59, 'SKATE GO\n\n' +
    'GAME / SPRITES / ART\nVICENTE DELGADO\n\n' + 'BOARD SPRITES\nSOVIETSHNUCKUMS\nitch.io\n\n' +
    'MUSIC\nKAIBB\nitch.io\n\n' + 'CITY BG\nFREE GAME ASSESTS\nitch.io', {
      fontSize:'8px',fill:'#d9d1d1', fontFamily:'"Press Start 2P"', align:'center', lineSpacing:6,
      backgroundColor:'#000000', padding:{x:10,y:10}
    }).setOrigin(0.5,0).setDepth(8).setVisible(false);

    this.fetchLeaderboard();
    this.cameras.main.fadeIn(1200,0,0,0);
  }

  update() {
    this.clouds.tilePositionX +=0.02;
  }

preload() {
  this.load.image('bg1','bg1.png');
  this.load.image('bg2','bg2.png');
  this.load.image('bg3','bg3.png');
  this.load.image('bg4','bg4.png');
  this.load.image('bg5','bg5.png');
  this.load.image('staring', 'staring.png');
  this.load.image('trashcan', 'trashcan.png')

}

async fetchLeaderboard(table='scores') {
  const {data,error}=await db
  .from(table).select('name,score').order('score',{ascending: false}).limit(10);

  if(error || !data) {
    this.lbText.setText('failed to load');
    return;
  }

  if(data.length===0) {
    this.lbText.setText('no scores yet');
    return;
  }

  const lines=data.map((row,i) => `${i+1}. ${row.name.substring(0,10).padEnd(10)} ${row.score}`);
this.lbText.setText(lines.join('\n'));
}

}

//tutorial scene
class TutorialScene extends Phaser.Scene {
  constructor(){
    super({key:'TutorialScene'});
  }
  preload(){
    if (this.textures.exists('skater_cruise')) return;
    this.load.image('bg1','bg1.png');
    this.load.image('bg2','bg2.png');
    this.load.image('bg3','bg3.png');
    this.load.image('bg4','bg4.png');
    this.load.image('bg5','bg5.png');
    this.load.image('bench','bench.png');
    this.load.image('cone','cone.png');
    this.load.spritesheet('board_cruise','board_cruise.png',{frameWidth:30,frameHeight:7});
    this.load.spritesheet('heelflip','heelflip.png',{frameWidth:30,frameHeight:10});
    this.load.spritesheet('kickflip','kickflip.png',{frameWidth:30,frameHeight:10});
    this.load.spritesheet('manual','manual.png',{frameWidth:30,frameHeight:13});
    this.load.spritesheet('push','push.png',{frameWidth:48,frameHeight:61});
    this.load.spritesheet('skater_cruise','cruise.png',{frameWidth:30,frameHeight:56});
    this.load.spritesheet('ollie','ollie.png',{frameWidth:47,frameHeight:61});
    this.load.spritesheet('manual_grind','manual_grind.png',{frameWidth:42,frameHeight:57});
    this.load.audio('cruising','cruising.wav');
    this.load.audio('whoosh','whoosh.mp3');
    this.load.audio('grind','grind.ogg');
  }
  create(){
    this.bgScale=H/324;
    this.bg1=this.add.tileSprite(0,0,W/this.bgScale,324,'bg1').setOrigin(0,0).setScrollFactor(0).setDepth(0).setScale(this.bgScale);
    this.bg2=this.add.tileSprite(0,0,W/this.bgScale,324,'bg2').setOrigin(0,0).setScrollFactor(0).setDepth(1).setScale(this.bgScale);
    this.bg3=this.add.tileSprite(0,0,W/this.bgScale,324,'bg3').setOrigin(0,0).setScrollFactor(0).setDepth(2).setScale(this.bgScale);
    this.bg4=this.add.tileSprite(0,0,W/this.bgScale,324,'bg4').setOrigin(0,0).setScrollFactor(0).setDepth(3).setScale(this.bgScale);
    this.bg5=this.add.tileSprite(0,0,W/this.bgScale,324,'bg5').setOrigin(0,0).setScrollFactor(0).setDepth(4).setScale(this.bgScale);

    //ground
    const ground=this.physics.add.staticGroup();
    for(let i=0;i< 500;i++) {
      const tile= this.add.rectangle(i*200+ 100,GROUND_Y,200,8, 0x1a1a2e).setDepth(5);
      ground.add(tile);
    }
    //player
    this.player= new Player(this,100, SKATER_START_Y);
    this.skater=this.player.body;
    this.physics.add.collider(this.skater,ground);

    //Anims
    if (!this.anims.exists('cruise')) this.anims.create({key:'cruise',frames:this.anims.generateFrameNumbers('board_cruise',{start:0,end:6}),frameRate:12,repeat: -1});
    if (!this.anims.exists('heelflip')) this.anims.create({key:'heelflip',frames:this.anims.generateFrameNumbers('heelflip',{start:0,end:8}),frameRate:18,repeat: 0});
    if (!this.anims.exists('kickflip')) this.anims.create({key:'kickflip',frames:this.anims.generateFrameNumbers('kickflip',{start:0,end:8}),frameRate:18,repeat: 0});
    if (!this.anims.exists('manual_start')) this.anims.create({key:'manual_start',frames:this.anims.generateFrameNumbers('manual',{start:0,end:3}),frameRate:12,repeat: 0});
    if (!this.anims.exists('push')) this.anims.create({key:'push',frames:this.anims.generateFrameNumbers('push',{start:0,end:8}),frameRate:16,repeat: 0});
    if (!this.anims.exists('skater_cruise')) this.anims.create({key:'skater_cruise',frames:this.anims.generateFrameNumbers('skater_cruise',{start:0,end:2}),frameRate:8,repeat: 0});
    if (!this.anims.exists('ollie')) this.anims.create({key:'ollie',frames:this.anims.generateFrameNumbers('ollie',{start:0,end:8}),frameRate:18,repeat: 0});
    if (!this.anims.exists('manual_grind')) this.anims.create({key:'manual_grind',frames:this.anims.generateFrameNumbers('manual_grind',{start:0,end:6}),frameRate:12,repeat: 0});

    //cruising
    this.cruisingSound= this.sound.add('cruising',{loop:true, volume:0.2});
    this.cruisingSound.play();

    //controls
    this.cursors= this.input.keyboard.createCursorKeys();
    this.kickflipKey=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.heelflipKey=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.manualKey=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

    //obstacles
    this.tutCone= this.add.image(900,GROUND_Y-38,'cone').setDepth(7).setScale(1.5);
    this.physics.add.existing(this.tutCone,true);
    this.tutCone.body.setSize(22, 40);
    this.tutCone.body.setOffset(14,6);

    this.tutRail=this.add.image(1800, GROUND_Y- 46,'bench').setDepth(7).setScale(2);
    this.physics.add.existing(this.tutRail,true);
    this.tutRail.body.setSize(128, 46);
    this.tutRail.body.reset(1800,GROUND_Y -46);

    //grinding setup
    this.rails=this.physics.add.staticGroup();
    this.rails.add(this.tutRail);
    this.isGrinding =false;
    this.grindCooldown=0;
    this.grindScore=0;
    this.currentRail=null;
    this.physics.add.overlap(this.skater,this.rails, this.skaterGrind,null, this,);

    //sparks
    const sparkPx= this.make.graphics({x:0,y: 0, add:false});
    sparkPx.fillStyle(0xffaa00);
    sparkPx.fillRect(0,0,3,3);
    sparkPx.generateTexture('spark',3,3,);
    sparkPx.destroy();
    this.sparks= this.add.particles(0,0, 'spark',{
      speed:{min:50, max:150},angle:{min:200,max:340}, lifespan:300,quantity:0,scale: {start:1,end:0},alpha:{start:1,end:0}
    }).setDepth(10);

    //states
    this.skateSpeed= 250;
    this.onGround=false;
    this.wasOnGround=true;
    this.coyoteTime=100;
    this.coyoteTimer=0;
    this.isFlipping=false;
    this.flipAngle=0;
    this.isManual=false;
    this.manualScore=0;
    this.isPaused=false;
    this.tutStep=0;
    this.stepDone=false;
    this.slowDone=false;

    //prompt box
    this.promptBg=this.add.rectangle(W/2, H*0.25, 600,70, 0x000000,0.8).setScrollFactor(0).setDepth(20).setVisible(false);
    this.promptText= this.add.text(W/2, H*0.25, '',{fontSize:'14px',fill:'#fbf5f5',fontFamily:'"Press Start 2P"',align:'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(21).setVisible(false);

    this.flashText=this.add.text(W/2, H*0.4,'', {fontSize:'20px',fill:'#06f506', fontFamily:'"Press Start 2P"'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(21);

    //camera
    this.cameras.main.startFollow(this.player.body,true,0.1, 0.1);
    this.cameras.main.setFollowOffset(-W*0.18, 0);
    this.cameras.main.fadeIn(800,0,0,0);

    //welcome message
    this.showPrompt('WELCOME TO SKATE GO\n GET READY',2000,()=>{this.tutStep=1;});
  }
  showPrompt(text,duration, onDone){
    this.isPaused=true;
    this.promptText.setText(text).setVisible(true);
    if (duration) {this.time.delayedCall(duration,()=> {
      this.promptBg.setVisible(false);
      this.promptText.setVisible(false);
      this.isPaused=false;
      if (onDone) onDone();
    });}
  }
  waitForInput(text,onDone){this.isPaused=true;
    this.promptBg.setVisible(true);
    this.promptText.setText(text).setVisible(true);
    this.stepDone=false;
    this._waitCallback=onDone;
  }
  completeStep() {
    if (this.stepDone) return;
    this.stepDone=true;
    this.promptBg.setVisible(false);
    this.promptText.setVisible(false);
    this.isPaused=false;
    if (this._waitCallback) this._waitCallback();
    }
    flash(text,color) {this.flashText.setText(text).setStyle({fill:color||'#00ff00'});
    this.tweens.add({targets:this.flashText,alpha:0,duration: 400,delay:600, onComplete:()=> this.flashText.setAlpha(1).setText('')
    });
  }
  skaterGrind(skaterObj,rail){
    if (this.isGrinding) return;
    if (this.grindCooldown>0) return;
    if(this.skater.body.velocity.y<=0) return;
    if (this.skater.y>rail.y) return;
    if(this.grindSound) this.grindSound.stop();
    this.grindSound= this.sound.add('grind',{loop:true,volume: 0.3});
    this.grindSound.play();
    this.isGrinding=true;
    this.currentRail=rail;
    this.skater.body.setVelocityY(0);
    this.skater.body.setAllowGravity(false);
    this.skater.y=rail.y-(rail.height*rail.scaleY/2)-30;
  }
  update(time,delta){
    this.bg1.tilePositionX= this.skater.x*0.02/ this.bgScale;
    this.bg2.tilePositionX=this.skater.x*0.05/this.bgScale;
    this.bg3.tilePositionX= this.skater.x*0.01/this.bgScale;
    this.bg4.tilePositionX =this.skater.x*0.35/this.bgScale;
    const body = this.skater.body;
    console.log('tutStep',this.tutStep,this.skater.x);
    this.onGround=body.blocked.down;

    if(this.onGround){
      this.coyoteTimer= this.coyoteTime;
    }else{
      this.coyoteTimer-=delta;
    }
    if(this.isPaused){
      body.setVelocityX(0);
      //jump during prompts
      if ((Phaser.Input.Keyboard.JustDown(this.cursors.up)|| Phaser.Input.Keyboard.JustDown(this.cursors.space))&&this.coyoteTimer>0){
        body.setVelocityY(-750);
        this.coyoteTimer=0;
        this.completeStep();
      }
      if(body.velocity.y <0&&! (this.cursors.up.isDown|| this.cursors.space.isDown)){
        body.setVelocityY(body.velocity.y*0.6);
      }
      if (body.velocity.y> 0){body.setVelocityY(body.velocity.y*1.04);}
      if (this.manualKey.isDown&& this.onGround&&this.tutStep===10){this.isManual=true;
        this.completeStep();
      }
      if(this.manualKey.isDown&& this.onGround){
        this.isManual=true;
        this.completeStep();
      }
      if(this.cursors.down.isDown&&this.onGround){this.completeStep();}
      this.player.update(this.cursors, false,0,body.velocity.y, null,false,false, this.onGround);
      return;
    }
    //grinding
    if(this.isGrinding){this.skater.y=this.currentRail.y- (this.currentRail.height*this.currentRail.scaleY/2)-30;
      this.grindScore+=1;
      this.sparks.emitParticleAt(this.skater.x+20, this.skater.y+30, 10);
      this.sparks.emitParticleAt(this.skater.x-20, this.skater.y+30, 10);
    }
    if(this.currentRail && this.skater.x>this.currentRail.x+100){this.isGrinding=false;
      this.currentRail=null;
      this.skater.body.setAllowGravity(true);
      if (this.grindSound) this.grindSound.stop();
    }
    body.setVelocityX(this.skateSpeed);

    //jump
    if ((Phaser.Input.Keyboard.JustDown(this.cursors.up)|| Phaser.Input.Keyboard.JustDown(this.cursors.space))&& this.coyoteTimer>0){
      body.setVelocityY(-750);
      this.coyoteTimer=0;
      if(this.isGrinding) {
        this.isGrinding=false;
        this.currentRail=null;
        this.skater.body.setAllowGravity(true);
        if (this.grindSound) this.grindSound.stop();
      }
    }
    if (body.velocity.y<0&&! (this.cursors.up.isDown|| this.cursors.space.isDown)){
      body.setVelocityY(body.velocity.y*0.6);
    }
    if(body.velocity.y>0&&!this.isGrinding){
      body.setVelocityY(body.velocity.y*1.04);
    }

    //flip
    if(!this.onGround&&!this.isFlipping){if(this.kickflipKey.isDown){
      this.isFlipping= true;
      this.sound.play('whoosh',{volume:0.5});
      this.flipAngle=0;
      this.currentTrick='kickflip';
      this.player.olliePlayed=false;
    } else if(this.heelflipKey.isDown){
      this.isFlipping=true;
      this.sound.play('whoosh',{volume:0.5});
      this.flipAngle=0;
      this.currentTrick='heelflip';
      this.player.olliePlayed=false;
    }
  }

  if(this.isFlipping){
    this.flipAngle+=1.1* delta;
    const displayAngle=this.currentTrick==='heelflip'?-this.flipAngle: this.flipAngle;
    this.player.update(this.cursors,true, displayAngle,body.velocity.y, this.currentTrick,false, this.isGrinding, this.onGround);
    if (this.flipAngle>= 360){
      this.isFlipping=false;
      this.flipAngle=0;
      this.player.resetBoardAngle();
    }
  } else{
    this.player.update(this.cursors,false,0, body.velocity.y,null,this.isManual, this.isGrinding, this.onGround,);
  }
  //manual
  if (Phaser.Input.Keyboard.JustDown(this.manualKey)&& this.onGround &&this.tutStep!==11){
    this.isManual=true;
  }
  if (!this.manualKey.isDown|| !this.onGround){this.isManual=false;}

  //slowdown
  if(this.cursors.down.isDown&& this.onGround){this.skateSpeed= Math.max(80, this.skateSpeed*0.985);
  }else{
    this.skateSpeed=250;
  }

  //tutorial steps: step1, wait for jump
  if (this.tutStep===1 &&this.skater.x>750){
    this.tutStep=2;
    this.waitForInput('JUMP OVER THE CONE\n HOLD SPACE OR UP ARROW',()=>{
      this.tutStep=3;
    });
  }
  //step 2, detect jump
  if(this.tutStep===3&&!this.onGround&& !this.stepDone){
    this.completeStep();
  }

  //step 3, landed jump
  if(this.tutStep===3 && this.wasOnGround===false&& this.onGround){this.flash('PERFECT', '#25f125')
    this.tutStep=4;
  this.time.delayedCall(800,()=>{
    this.waitForInput('NOW TRICK MIDAIR\nK FOR KICKFLIP\n H FOR HEELFLIP',() =>{
      this.tutStep=5;
    });
  });
  }
  //step 4, wait for flip
  if(this.tutStep===5 && this.isFlipping && !this.stepDone){this.completeStep();}

  //step 5, landed trick
  if (this.tutStep===5&& this.wasOnGround===false&&this.onGround&&!this.isFlipping){
    this.flash('BEAUTIFUL LANDING', '#37ff00');
    this.tutStep=6;
    this.time.delayedCall(800,()=> {
      this.waitForInput('JUMP ON BENCH TO GRIND',()=>{
        this.tutStep=7;
      });
    });
  }
  //step 6, detect grind
  if (this.tutStep===7&&this.isGrinding){
    this.completeStep();
    this.flash('GRINDING','#ffaa00');
    this.time.delayedCall(1500,()=>{
    this.stepDone=false;
    this.tutStep=8;});
  }

  //step 7, manual prompt after grind
  if (this.tutStep===8&&!this.isGrinding&& this.onGround){this.tutStep=9;
    this.isPaused=true;
    this.promptBg.setVisible(true);
    this.promptText.setText('HOLD M FOR MANUAL').setVisible(true);
    this.time.delayedCall(1500,()=>{
      this.isPaused=false;
      this.tutStep=10;
    });
  }
  //step8 detect manual
  if (this.tutStep===10){
    if (this.manualKey.isDown&&this.onGround){
      this.isManual= true;
      this.promptBg.setVisible(false);
      this.promptText.setVisible(false);
      this.isPaused=false;
      this.flash('MANUAL','#ff6600');
      this.time.delayedCall(1000,()=>{
      this.tutStep=11;
      });
    }
  }
  //step 9 slow down
  if (this.tutStep===11){this.tutStep=12;
    this.isPaused=true;
    this.promptBg.setVisible(true);
    this.promptText.setText('HOLD DOWN ARROW TO SLOW DOWN').setVisible(true);
    this.time.delayedCall(500,()=>{
      this.isPaused=false;
      this.tutStep=13;
    });
  }
  //step 10 detect slow down
  if (this.tutStep=== 13){
    if (this.cursors.down.isDown&&this.onGround){
    this.promptBg.setVisible(false);
    this.promptText.setVisible(false);
    this.isPaused=false;
    this.flash('NICE','#00ffff');
    this.tutStep=14;
  }
}
  //step 11 final
  if(this.tutStep===14&&this.skater.x> 3200){
    this.tutStep=99;
    this.showPrompt("YOU LOOK READY\nTIME TO SKATE",2000, ()=>{
      this.cruisingSound.stop();
      this.cameras.main.fade(800,0,0,0);
      this.time.delayedCall(800,()=>this.scene.start('GameScene',{theme:'night'}));
    });
  }
  this.wasOnGround= this.onGround;
  }
}


//MODESSCENE
class ModesScene extends Phaser.Scene{
  constructor(){super({key:'ModesScene'});
  }
  preload(){
    this.load.image('bg1','bg1.png');
    this.load.image('bg2','bg2.png');
    this.load.image('bg3','bg3.png');
    this.load.image('bg4','bg4.png');
    this.load.image('bg5','bg5.png');
  }
  create(){this.bgScale=H/324;
    this.add.tileSprite(0,0,W/this.bgScale,324,'bg1').setOrigin(0,0).setDepth(0).setScale(this.bgScale);
    this.add.tileSprite(0,0,W/this.bgScale,324,'bg2').setOrigin(0,0).setDepth(1).setScale(this.bgScale);
    this.add.tileSprite(0,0,W/this.bgScale,324,'bg3').setOrigin(0,0).setDepth(2).setScale(this.bgScale);
    this.add.tileSprite(0,0,W/this.bgScale,324,'bg4').setOrigin(0,0).setDepth(3).setScale(this.bgScale);
    this.add.tileSprite(0,0,W/this.bgScale,324,'bg5').setOrigin(0,0).setDepth(4).setScale(this.bgScale);
    
    this.add.rectangle(0,0,W,H, 0x000000,0.25).setOrigin(0,0).setDepth(5);
    this.add.text(W/2, H*0.15,'SELECT MODE',{fontSize:'24px',fill:'#ffffff',fontFamily:'"Press Start 2P"'}).setOrigin(0.5).setDepth(6);

    //challenge mode btn
    const chalBtn= this.add.rectangle(W/2, H*0.38, 500,120,0x1a0a0a).setInteractive().setDepth(6);
    this.add.text(W/2, H*0.35,'CHALLENGE',{fontSize:'18px',fill:'#ff4444',fontFamily:'"Press Start 2P"'}).setOrigin(0.5).setDepth(7);
    this.add.text(W/2,H*0.42,'survive as long as possible',{fontSize:'9px',fill:'#aaa9a9',fontFamily:'"Press Start 2P"'}).setOrigin(0.5).setDepth(7);

    chalBtn.on('pointerover',()=>chalBtn.setFillStyle(0x2a1a1a));
    chalBtn.on('pointerout',()=> chalBtn.setFillStyle(0x1a0a0a));
    chalBtn.on('pointerdown',()=>{this.selectedMode='challenge';
      this.showThemePicker();
    });

    //score attack btn
    const saBtn=this.add.rectangle(W/2,H*0.62,500,120,0x0a1a0a).setInteractive().setDepth(6);
    this.add.text(W/2,H*0.59,'SCORE ATTACK',{fontSize:'18px',fill:'#12ff90',fontFamily:'"Press Start 2P"',}).setOrigin(0.5).setDepth(7);
    this.add.text(W/2,H*0.66, 'score as much as possible in 60s',{fontSize:'9px',fill:'#a7a7a7',fontFamily:'"Press Start 2P"'}).setOrigin(0.5).setDepth(7);

    saBtn.on('pointerover',()=>saBtn.setFillStyle(0x1a2a1a));
    saBtn.on('pointerout',()=> saBtn.setFillStyle(0x0a1a0a));
    saBtn.on('pointerdown',()=>{this.selectedMode='scoreattack';
      this.showThemePicker();
    });

    //back
    const backBtn= this.add.text(W/2,H*0.88, '< BACK',{fontSize:'12px',fill:'#949494',fontFamily:'"Press Start 2P"'}).setOrigin(0.5).setDepth(6).setInteractive();
    backBtn.on('pointerover',()=>backBtn.setStyle({fill:'#ffffff'}));
    backBtn.on('pointerout',()=>backBtn.setStyle({fill:'#a5a4a4'}));
    backBtn.on('pointerdown',()=>{this.cameras.main.fade(800,0,0,0);
      this.time.delayedCall(800,()=>this.scene.start('MenuScene'));
    });
    //theme pick
    this.themePicker= this.add.container(W/2,H/2).setDepth(20).setVisible(false);
    const pickerBg= this.add.rectangle(0,0,520,280,0x111111).setStrokeStyle(2,0xffffff)
    const pickerTitle= this.add.text(0,-100,'CHOOSE YOUR CITY',{fontSize:'14px',fill:'#ffffff',fontFamily:'"Press Start 2P"'}).setOrigin(0.5);

    const nightPick=this.add.rectangle(-120,0,200,80,0x1a1a2e).setInteractive();
    const nightTxt=this.add.text(-120,0,'NIGHT CITY',{fontSize:'12px',fill:'#00ffff',fontFamily:'"Press Start 2P"'}).setOrigin(0.5);

    const sunsetPick= this.add.rectangle(120,0,200,80,0x1a1a2e).setInteractive();
    const sunsetTxt=this.add.text(120,0,'SUNSET\nSUBURB',{fontSize:'12px',fill:'#f86300',fontFamily:'"Press Start 2P"',align:'center'}).setOrigin(0.5);
    
    const cancelTxt=this.add.text(0,110,'CANCEL',{fontSize:'10px',fill:'#a5a0a0',fontFamily:'"Press Start 2P"'}).setOrigin(0.5).setInteractive();
    nightPick.on('pointerover',()=>nightPick.setFillStyle(0x2a2a4e));
    nightPick.on('pointerout',()=>nightPick.setFillStyle(0x1a1a2e));
    sunsetPick.on('pointerover',()=>sunsetPick.setFillStyle(0x4d3b00));
    sunsetPick.on('pointerout',()=>sunsetPick.setFillStyle(0x2d1b00));
    nightPick.on('pointerdown',()=>this.startMode('night'));
    sunsetPick.on('pointerdown',()=>this.startMode('sunset'));
    cancelTxt.on('pointerdown',()=>this.themePicker.setVisible(false));

    this.themePicker.add([pickerBg,pickerTitle,nightPick, nightTxt,sunsetPick,sunsetTxt,cancelTxt]);
    this.cameras.main.fadeIn(800,0,0,0);
  }
  showThemePicker(){
    this.themePicker.setVisible(true);
  }
  startMode(theme){this.cameras.main.fade(800,0,0,0);
    this.time.delayedCall(800,()=>{
      this.scene.start('GameScene',{theme,mode:this.selectedMode});
    });
  }
}
//GAME SCENE
class GameScene extends Phaser.Scene {
  constructor() {
   super({ key: 'GameScene' });
  
  }
  init(data) {
   this.theme= data.theme || 'night'; 
   this.mode=data.mode||'normal';
  }

  preload() {
    this.load.image('bg1','bg1.png');
    this.load.image('bg2', 'bg2.png');
    this.load.image('bg3', 'bg3.png');
    this.load.image('bg4', 'bg4.png');
    this.load.image('bg5', 'bg5.png');

    this.load.image('sunset1', 'sunset1.png');
    this.load.image('sunset2', 'sunset2.png');
    this.load.image('sunset3', 'sunset3.png');
    this.load.image('sunset4', 'sunset4.png');
    this.load.image('sunset5', 'sunset5.png');

    //music catalog, kaibb on itch
    this.load.audio('amoeba','music/amoeba.mp3');
    this.load.audio('armillare', 'music/armillare.mp3');
    this.load.audio('botanica', 'music/botanica.mp3');
    this.load.audio('byrbot','music/byrbot.mp3');
    this.load.audio('endless','music/endless.mp3');
    this.load.audio('familiar_room', 'music/familiar_room.mp3');
    this.load.audio('featherfall' ,'music/featherfall.mp3');
    this.load.audio('forest_interior', 'music/forest_interior.mp3');
    this.load.audio('gill','music/gill.mp3');
    this.load.audio('glyph','music/glyph.mp3');
    this.load.audio('heart_garden','music/heart_garden.mp3');

    //board construct
    this.load.spritesheet('board_cruise', 'board_cruise.png', {
      frameWidth:30,
      frameHeight:7
    });
    this.load.spritesheet('heelflip', 'heelflip.png', {
      frameWidth:30,
      frameHeight:10

    });
    this.load.spritesheet('kickflip','kickflip.png',{
      frameWidth:30,
      frameHeight:10
    });
    this.load.spritesheet('manual', 'manual.png', {
      frameWidth:30,
      frameHeight:13
    });

    //game sound effects
    this.load.audio('cruising', 'cruising.wav');
    this.load.audio('death1','death1.ogg');
    this.load.audio('death2','death2.ogg');
    this.load.audio('grind','grind.ogg');
    this.load.audio('whoosh','whoosh.mp3');

    //obstacles/bench
    this.load.image('bench', 'bench.png');
    this.load.image('cone', 'cone.png');

    //skatersprite
    this.load.spritesheet('push','push.png', {
      frameWidth:48, frameHeight:61
    });
    this.load.spritesheet('skater_cruise','cruise.png',{
      frameWidth:30, frameHeight:56
    });

    this.load.spritesheet('ollie','ollie.png', {
      frameWidth:47, frameHeight:61
    });
    this.load.spritesheet('manual_grind', 'manual_grind.png', {
      frameWidth:42, frameHeight: 57
    });

    this.load.audio('gradeS', 'S.mp3');
    this.load.audio('gradeA','A.mp3');
    this.load.audio('gradeB','B.mp3');
    this.load.audio('gradeC','C.mp3');
    this.load.audio('gradeD','D.mp3');
    this.load.audio('gradeF','F.mp3');
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
        ground:0x1a1a2e,
        groundDark:0x0d0d1a,
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
        ground:0x2d1a00,
        groundDark:0x1a0d00,
        obstacle:0x8b0000,
        hudColor:'#ffaa00',
      };
    }
//New bg

    const bg1key=theme==='night' ? 'bg1':'sunset1';
    const bg2key=theme==='night' ? 'bg2':'sunset2';
    const bg3key=theme==='night' ? 'bg3':'sunset3';
    const bg4key=theme==='night' ? 'bg4':'sunset4';
    const bg5key=theme==='night' ? 'bg5':'sunset5';
    this.bgScale=H/324;

    this.bg1=this.add.tileSprite(0,0,W/this.bgScale,324, bg1key).setOrigin(0,0).setScrollFactor(0).setDepth(0).setScale(this.bgScale);
    this.bg2=this.add.tileSprite(0,0,W/this.bgScale,324, bg2key).setOrigin(0,0).setScrollFactor(0).setDepth(1).setScale(this.bgScale);
    this.bg3=this.add.tileSprite(0,0,W/this.bgScale,324, bg3key).setOrigin(0,0).setScrollFactor(0).setDepth(2).setScale(this.bgScale);
    this.bg4=this.add.tileSprite(0,0,W/this.bgScale,324, bg4key).setOrigin(0,0).setScrollFactor(0).setDepth(3).setScale(this.bgScale);
    this.bg5=this.add.tileSprite(0,0,W/this.bgScale,324, bg5key).setOrigin(0,0).setScrollFactor(0).setDepth(4).setScale(this.bgScale);



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

    //SKATER
    this.player =new Player(this, 100, SKATER_START_Y);
    this.skater=this.player.body;

//board cruising animation
  if (!this.anims.exists('cruise')) {
    this.anims.create({
      key:'cruise',
      frames:this.anims.generateFrameNumbers('board_cruise', {start:0, end:6}),
      frameRate:12, repeat:-1
      
    });
  }
  //heelflip animation
  if (!this.anims.exists('heelflip')) {
    this.anims.create({
      key: 'heelflip', frames:this.anims.generateFrameNumbers('heelflip',{start:0,end:8}),
      frameRate:18, repeat:0
    });
  }

  //kickflip animation
  if (!this.anims.exists('kickflip')) {
    this.anims.create({
      key:'kickflip', frames:this.anims.generateFrameNumbers('kickflip',{start:0, end:8}),
      frameRate:18,
      repeat:0
    })
  }

  //manual animation
  if (!this.anims.exists('manual_start')) {
    this.anims.create({
      key:'manual_start',frames:this.anims.generateFrameNumbers('manual',{start:0,end:3}),
      frameRate:12,
      repeat:0
    });

  }
  this.isManual=false;
  this.manualScore=0;

  //skater animations
  if(!this.anims.exists('push')) {
    this.anims.create({
      key:'push', frames:this.anims.generateFrameNumbers('push', {start:0,end:8}), frameRate:16, repeat:0
    });
  }

  if(!this.anims.exists('skater_cruise')) {
    this.anims.create({
      key:'skater_cruise', frames:this.anims.generateFrameNumbers('skater_cruise', {start:0,end:2}), frameRate:8, repeat:0
    });
  }

  if(!this.anims.exists ('ollie')) {
    this.anims.create({
      key:'ollie', frames:this.anims.generateFrameNumbers('ollie', {start:0,end:8}), frameRate:18, repeat:0
    });
  }

  if(!this.anims.exists ('manual_grind')) {
    this.anims.create({
      key:'manual_grind', frames:this.anims.generateFrameNumbers('manual_grind', {start:0,end:6}), frameRate:12, repeat:0
    });
  }


  //cruising sound effect
  this.cruisingSound=this.sound.add('cruising',{loop:true,volume:0.2});
  this.cruisingSound.play();

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
      lifespan:625,
      quantity: 0,
      scale: {start: 1.2, end: 0},
      alpha: {start: 0.9, end: 0}

    }).setDepth(10);

    const linePx=this.make.graphics({x:0,y:0,add: false});
    linePx.fillRect(0xffffff)
    linePx.fillRect(0,0,40,2);
    linePx.generateTexture('speedline',40,2);
    linePx.destroy();

    this.speedLines= this.add.particles(0,0,'speedline', {
      x:{min:0, max:W},y:{min:0, max:H},speedX:{min:-2000,max:-1500},
      speedY:0, lifespan:300, quantity:0,scale:{start:1,end:0.5}, alpha:{start:0,end:0},
    }).setScrollFactor(0).setDepth(15);

    this.speedGlow=this.add.graphics().setScrollFactor(0).setDepth(16);

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
    this.grindCooldown=200;
    this.grindScore=0;
    this.physics.add.overlap(this.skater,this.rails,startGrind,null, this);


    //Controls
    this.cursors= this.input.keyboard.createCursorKeys();
    this.kickflipKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.heelflipKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.manualKey=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M)
    

    this.recoveryActive=false;
    this.recoveryCount=0;
    this.recoveryPresses=0;
    this.recoveryPressesNeeded=5;
    this.isFlipping  = false;
    this.flipAngle   = 0;
    this.onGround    = false;
    this.wasOnGround = true;
    this.coyoteTime = 100;
    this.coyoteTimer = 0;
    //Music 
    this.musicTracks=[
      'amoeba', 'armillare','botanica','byrbot','endless','familiar_room',
      'featherfall','forest_interior','gill','glyph','heart_garden'

    ];

    //shuffle songs
    Phaser.Utils.Array.Shuffle(this.musicTracks);
    this.currentTrackIndex=0;
    this.playNextTrack();

    //Hud
    this.activeTrickTexts=0;
    this.landedClean=true;
    this.comboTimer=0;
    this.comboTimerMax=2250;
    this.combo=0;
    this.trickCounts={kickflip:0,heelflip:0};
    this.totalTricks=0;
    this.highestCombo=0;
    this.longestGrind=0;
    this.totalGrinds=0;
    this.playerName='ANONYMOUS';
    this.comboMultiplier=1;
    this.lastTrick=null;

    this.comboText = this.add.text(W/2, H*0.15, '', {
      fontSize: '20px',
      fill: '#ff6600',
      fontFamily:'"Press Start 2P"'
    }).setDepth(25).setScrollFactor(0).setOrigin(0.5);
    this.comboBarBg=this.add.rectangle(W/2, H*0.12, 200, 8, 0x333333).setScrollFactor(0).setDepth(25).setVisible(false);
    this.comboBar=this.add.rectangle(W/2-100, H*0.12, 200, 8,0xff6600).setScrollFactor(0).setDepth(26).setOrigin(0,0.5).setVisible(false);
    this.score= 0;
    this.survivalTime=0;
    this.scoreAttackTimer=60000;
    this.timerText=null;

    if (this.mode==='scoreattack'){this.timerText=this.add.text(W/2, 16,'TIME:60',{fontSize:'16px',fill:'#00ff88',fontFamily:'"Press Start 2P"'}).setScrollFactor(0).setDepth(20).setOrigin(0.5,0);}
    if (this.mode==='challenge'){this.timerText= this.add.text(W/2,16,'SURVIVAL:0s',{fontSize:'16px',fill:'#ff4444',fontFamily:'"Press Start 2P"'}).setScrollFactor(0).setDepth(20).setOrigin(0.5,0);
    this.obstacleInterval= Phaser.Math.Between(500,900);}
    this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
      fontSize: '16px', fill: '#ffffff', fontFamily: '"Press Start 2P"'
    }).setScrollFactor(0).setDepth(20);

    this.speedText = this.add.text(16, 44, 'SPEED: 1', {
      fontSize: '16px', fill: C.hudColor, fontFamily: '"Press Start 2P"'
    }).setScrollFactor(0).setDepth(20);
    this.highScore=parseInt(localStorage.getItem('highScore')) || 0;

    //Pause
    this.pauseKey= this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.isPaused=false;

    this.showControls=false;
    this.controlsBtn=this.add.text(W-16,16, '?', {
      fontSize:'27px', fill:'#ffffff', fontFamily:'"Press Start 2P"'
    }).setScrollFactor(0).setDepth(20).setOrigin(1,0).setInteractive();

    this.controlsPanel=this.add.text(W-16,40, 'SPACE/ARROW UP = jump\n(hold for higher jump)\nDOWN = slow down\nK = kickflip\nH = Heelflip\nM = manual\nESC = pause', {
      fontSize:'9px', fill:'#c0bfbf', fontFamily:'"Press Start 2P"', align:'right', lineSpacing:6,
      backgroundColor: '#000000', padding:{x:8, y:6}
    }).setScrollFactor(0).setDepth(20).setOrigin(1,0).setVisible(false);

    this.controlsBtn.on('pointerdown', () =>{
      this.showControls=!this.showControls;
      this.controlsPanel.setVisible(this.showControls);
      this.controlsBtn.setStyle({fill:this.showControls ? '#0bffff' : '#ffffff'});
    });

    this.boundRecovery=this.handleRecoveryInput.bind(this);
    this.input.keyboard.on('keydown-SPACE', this.boundRecovery);
    this.events.on('shutdown', ()=>{
    this.input.keyboard.off('keydown-SPACE', this.boundRecovery);
  });

    if (isTouchDevice()) this.createMobileButtons();
    this.mobileJumping=false;

    //Camera
    this.cameras.main.startFollow(this.skater, true, 0.1, 0.1);
    this.cameras.main.setFollowOffset(-W * 0.18, 0);
  }

  update(time, delta) {
    if (!this.alive) return;
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      if(this.isPaused) {
        this.isPaused=false;
        this.physics.resume();
        this.cruisingSound.resume();
        if (this.currentMusic) this.currentMusic.resume();
        this.pauseText.destroy();
      } else {
        this.isPaused=true;
        this.physics.pause();
        this.cruisingSound.pause();
        if (this.currentMusic) this.currentMusic.pause();
        this.pauseText=this.add.text(W/2,H/2, 'PAUSED\n\nPRESS ESC TO RESUME', {
          fontSize: '24px', fill: '#ffffff', fontFamily: '"Press Start 2P"', align:'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(50);
      }
    }

    if (this.isPaused) return;

    this.bg1.tilePositionX=this.skater.x *0.02/this.bgScale;
    this.bg2.tilePositionX=this.skater.x *0.05/this.bgScale;
    this.bg3.tilePositionX=this.skater.x *0.1/this.bgScale;
    this.bg4.tilePositionX=this.skater.x *0.2/this.bgScale;
    this.bg5.tilePositionX=this.skater.x *0.35/this.bgScale;

    if (this.grindCooldown>0) {
      this.grindCooldown-=this.game.loop.delta;
    }

    if (this.recoveryActive) {
      if (this.mobileMashBtn) {
        this.mobileMashBtn.setVisible(this.recoveryActive);
        this.mobileMashText.setVisible(this.recoveryActive);
      }
      this.recoveryTimer -= delta;
      if (this.recoveryTimer <= 0) {
        this.recoveryActive=false;
        this.recoveryText.destroy();
        this.recoveryBar.destroy();
        this.recoveryFill.destroy();
        this.input.keyboard.off('keydown-SPACE', this.boundRecovery,);
        hitObstacle.call(this);
      }
    }

    const body = this.skater.body;
    this.onGround = this.skater.body.blocked.down;

    //landings
    if (!this.wasOnGround && this.onGround) {
      if(this.isFlipping && !this.landedClean) {
        this.startRecovery();
      } else{
      this.cameras.main.shake(60, 0.003);
      this.dust.explode(20, this.skater.x, this.skater.y + 30);
      this.tweens.add({
        targets: [this.player.container],scaleY: 0.7,scaleX: 1.3,duration: 80,yoyo: true,ease: 'Quad.easeOut'
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
        this.combo=0;
        this.comboMultiplier=1;
        this.lastTrick=null;
        this.comboText.setText('');
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

    //mobile mapping
    const baseSpeed = Math.min(250 + Math.floor(this.score / 100) * 15, 1000);
    if (this.mobileJump) {
      this.mobileJump=false;
      if (this.onGround || this.coyoteTimer>0 || this.isGrinding) {
        this.skater.body.setVelocityY(-750);
        this.coyoteTimer=0;
        this.mobileJumping=true;
        this.time.delayedCall(400, ()=>this.mobileJumping=false);
      }
    }
    if (this.mobileFlip) {
      if (!this.onGround && !this.isFlipping) {
        this.isFlipping=true;
        this.sound.play('whoosh',{volume:0.5});
        this.flipAngle=0;
        this.currentTrick=this.mobileFlip;
        this.landedClean=false;
        this.player.olliePlayed=false;
      }
      this.mobileFlip=null;
    }
    if (this.mobileManual && this.onGround) {
        this.isManual=true;
    }
    if (this.mobileSlowing) {
      this.cursors.down.isDown=true;
    } else {
      this.cursors.down.isDown=false;
    }
    if (this.mobileMashBtn) {
      this.mobileMashBtn.setVisible(this.recoveryActive || false);
      this.mobileMashText.setVisible(this.recoveryActive || false);
    }

    
    if(Phaser.Input.Keyboard.JustDown(this.manualKey)&& this.onGround) {
      this.isManual=true;
      this.manualScore=0;
    }

    if(!this.manualKey.isDown || !this.onGround) {
      if (this.isManual && this.manualScore>0) {
        this.showTrickText('Manual', Math.floor(this.manualScore));
      }
      this.isManual=false;
    }
    if (this.isManual) {
      this.manualScore+=0.5;
    }

   if(this.recoveryActive){
      this.skateSpeed=30;
    } else if (this.cursors.down.isDown && this.onGround) {
      if (this.cursors.down.isDown && this.onGround && this.combo>0) {
        this.combo=0;
        this.comboMultiplier=1;
        this.lastTrick=null;
        this.comboText.setText('');
      }
  this.skateSpeed = Math.max(80, (this.skateSpeed || baseSpeed) * 0.985);
} else {
  this.skateSpeed = baseSpeed;
}

body.setVelocityX(this.skateSpeed);

    // Jump only once when the key is first pressed
if (
    (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.cursors.space)) && 
    (this.coyoteTimer > 0 || this.isGrinding) &&
    !this.recoveryActive) {
    body.setVelocityY(-750);
    this.coyoteTimer = 0;
    if (this.isGrinding) {
      this.isGrinding=false;
      this.currentRail=null;
      this.skater.body.setAllowGravity(true);
      this.skater.body.setVelocityY(-600);
      this.showTrickText('50-50 GRIND', Math.floor(this.grindScore));
      this.grindCooldown=200;
      this.grindScore=0;
      this.totalGrinds+=1;
      this.comboText.setText('');
      if (this.grindSound) this.grindSound.stop();
      this.player.olliePlayed=false;
      
    }
}

// Cut the jump short if the player lets go early
if (body.velocity.y < 0 && !(this.cursors.up.isDown || this.cursors.space.isDown || this.mobileJumping)) {
  body.setVelocityY(body.velocity.y *0.6);
}
//gravity multiplier
//keep 1.04, more floaty
  if (body.velocity.y >0 && !this.isGrinding) {
    body.setVelocityY(body.velocity.y * 1.04);
}

    //grinding
    if (this.isGrinding) {
      this.skater.y=this.currentRail.y- (this.currentRail.height*this.currentRail.scaleY/2)-30;
      this.grindScore += 1;
      if (this.grindScore> this.longestGrind) this.longestGrind=this.grindScore;
      this.score+=0.01;
      this.sparks.emitParticleAt(this.skater.x+20,this.skater.y+30,10);
      this.sparks.emitParticleAt(this.skater.x-20,this.skater.y+30,10);

    }

    //fell off the end of rail
    if (this.currentRail && this.skater.x > this.currentRail.x+100) {
      this.isGrinding=false;
      this.currentRail=null;
      this.skater.body.setAllowGravity(true);
      this.showTrickText('50-50 GRIND', Math.floor(this.grindScore));
      this.grindCooldown=200;
      this.grindScore=0;
      this.totalGrinds+=1;
      this.comboText.setText('');
     if (this.grindSound) this.grindSound.stop();
     this.player.olliePlayed=false;
    }
  
    //trick inputs
    if (!this.onGround && !this.isFlipping) {
      const kickHeld= this.kickflipKey.isDown;
      const heelHeld= this.heelflipKey.isDown;

      if (kickHeld){
        this.isFlipping=true;
        this.sound.play('whoosh',{volume:0.5 });
        this.flipAngle=0;
        this.currentTrick='kickflip';
        this.landedClean=false;
        this.player.olliePlayed=false;
      } else if (heelHeld) {
        this.isFlipping=true;
        this.sound.play('whoosh',{volume:0.5 });
        this.flipAngle=0;
        this.currentTrick='heelflip';
        this.landedClean=false;
        this.player.olliePlayed=false;
      }
  }
    //flip rotations
    if (this.isFlipping) {
      this.flipAngle += 1.1* delta;
      const displayAngle=this.currentTrick==='heelflip' ?-this.flipAngle : this.flipAngle;
      const targetAngle= 360;

      this.player.update(this.cursors, true, displayAngle, body.velocity.y, this.currentTrick,false, this.isGrinding,this.onGround,);

      if (this.flipAngle >= targetAngle) {
        this.isFlipping = false;
        this.flipAngle  = 0;
        this.player.resetBoardAngle();
        this.landedClean=true;

        const trickNames= {kickflip: 'KICKFLIP', heelflip: 'HEELFLIP'};
        const trickPoints= {kickflip: 10, heelflip:10};

        this.combo+=1;
        this.comboTimer=this.comboTimerMax;
        if (this.combo> this.highestCombo) this.highestCombo=this.combo;
        const name=trickNames[this.currentTrick];

        if (this.lastTrick===this.currentTrick) {
          const pts=trickPoints [this.currentTrick];
        this.showTrickText(name,pts);
        this.score+=pts;
        this.showTrickText('SAME TRICK, BOORINGG', -0);
        }else {
          this.comboMultiplier+=0.5;
          const pts=Math.floor(trickPoints[this.currentTrick]*this.comboMultiplier);
          this.showTrickText(name,pts);
          if (this.lastTrick!==null) {
            this.showTrickText('VARIETY BONUS +20', 20);
            this.score+=20;
          }
          this.score+=pts;
        }

        this.trickCounts[this.currentTrick]+=1;
        this.totalTricks+=1;
        this.lastTrick=this.currentTrick;
        this.currentTrick=null;
        this.comboText.setText('COMBO x'+this.combo+' ('+this.comboMultiplier+'x)');
      }
    } else {
      this.player.update(this.cursors, false, 0, body.velocity.y, null,this.isManual,this.isGrinding,this.onGround,);
    }

    // spawn obstacles
    if (this.skater.x + 1000 > this.nextObstacleX) {
      const obsX = this.nextObstacleX;
      const obs = this.add.image(obsX, GROUND_Y - 38,'cone').setDepth(7).setScale(1.5);
      this.physics.add.existing(obs, true);
      obs.body.setSize(22,40);
      obs.body.setOffset(14,6);
      this.obstacles.add(obs);
      if (this.mode==='challenge'){
        const secs=Math.floor(this.survivalTime/1000);
        this.nextObstacleX+=Math.max(200,Phaser.Math.Between(700,1100)-(secs*10));
      } else{
      this.nextObstacleX += Phaser.Math.Between(700, 1100);}
      if (Math.abs(this.nextObstacleX -this.nextRailX) <300) {
        this.nextObstacleX=this.nextRailX+400;
      }
    }

    if (this.skater.x+1200 > this.nextRailX) {
      const useTrashcan =Phaser.Math.Between(0,1)===1;
      const railImg= useTrashcan ? 'trashcan' : 'bench';
      const railY= useTrashcan ? GROUND_Y-48 : GROUND_Y-46;
      const railW= useTrashcan ? 44:128;
      const railH=useTrashcan ?10:46;
      const railScale=useTrashcan ? 1.5:2;

      const rail=this.add.image(this.nextRailX, railY, railImg).setDepth(7).setScale(railScale);
      this.physics.add.existing(rail,true);
      rail.body.setSize(railW, railH);
      rail.body.reset(this.nextRailX, railY);
      this.rails.add(rail);
      this.nextRailX+=Phaser.Math.Between(1200,2000);
      if (Math.abs(this.nextRailX -this.nextObstacleX) <300) {
        this.nextObstacleX=this.nextRailX+400;
      }

    }

    this.speedGlow.clear();
    const speedLevel=Math.floor(this.score/ 50) +1;
    if (speedLevel>=300) {
      const glowAlpha=Math.min((speedLevel-8)*0.015, 0.35);
      this.speedGlow.fillStyle(0xff0000, glowAlpha);
      this.speedGlow.fillRect(0,0,W,60);
      this.speedGlow.fillRect(0,H-60,W,60);
      this.speedGlow.fillRect(0,0,60,H);
      this.speedGlow.fillRect(W-60,0,60,H);
    }

    if (this.mode==='scoreattack'){this.scoreAttackTimer-=delta;
      const secsLeft=Math.ceil(this.scoreAttackTimer/1000);
      if (this.timerText) this.timerText.setText('TIME: '+secsLeft);
      if (secsLeft<=10) this.timerText.setStyle({fill:'#ff0000'});
      if (this.scoreAttackTimer<=0){this.scoreAttackTimer=0;
        this.alive=false;
        hitObstacle.call(this);
        return;
      }
    }
    if (this.mode==='challenge'){this.survivalTime+=delta;
      const secs=Math.floor(this.survivalTime/1000);
      if (this.timerText) this.timerText.setText('SURVIVAL: '+secs+'s');
      this.obstacleInterval= Math.max(200, (Phaser.Math.Between(500,900))-(secs*8));
    }
    this.score += 1;
    this.scoreText.setText('SCORE: ' + Math.floor(this.score / 10));
    this.speedText.setText('SPEED: ' + (Math.floor(this.score / 50) + 1));
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

playNextTrack() {
  if (this.currentMusic) {
    this.currentMusic.destroy();
  }
  const key = this.musicTracks[this.currentTrackIndex];
  this.currentMusic=this.sound.add(key, {volume:0.7});
  this.currentMusic.play();
  this.currentMusic.on('complete', ()=>{
    this.currentTrackIndex=(this.currentTrackIndex+1)% this.musicTracks.length;
    this.playNextTrack();
  });
}

showTrickText(text, points) {
  const offsetY=this.activeTrickTexts *30;
  this.activeTrickTexts+=1;

  //change text color based on combo multiplier later
  const tx=this.add.text(W/2,H *0.35 - offsetY, text + ' +' +points, {
    fontSize: '14px', fill: '#ffff00', fontFamily: '"Press Start 2P"'
  }).setDepth(25).setScrollFactor(0).setOrigin(0.5);

  this.tweens.add({targets:tx,y: H*0.25,alpha:0,duration: 500,delay:800,ease: 'Quad.easeOut',onComplete: ()=> {
      this.activeTrickTexts-=1;
      tx.destroy();
      }
    });
  }

  createMobileButtons() {
    const btnAlpha=1;
    const btnDepth=50;

    //slow down button
    const slowBtn=this.add.rectangle(80,H-80,120,80,0x222222, btnAlpha).setScrollFactor(0).setDepth(btnDepth).setInteractive();
    this.add.text(80,H-80, 'SLOW', {
      fontSize:'10px', fill:'#ffffff', fontFamily:'"Press Start 2P"'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(btnDepth+1);

    //jump button
    const jumpBtn= this.add.rectangle(W-80, H-120, 130, 100, 0x1a1a2e, btnAlpha).setScrollFactor(0).setDepth(btnDepth).setInteractive();
    this.add.text(W-80, H-120, 'JUMP', {
      fontSize:'10px', fill:'#04f9f9',fontFamily:'"Press Start 2P"'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(btnDepth+1);

    //flip button
    const flipBtn=this.add.rectangle(W-220, H-80,110,70,0x1a2e1a,btnAlpha).setScrollFactor(0).setDepth(btnDepth).setInteractive();
    this.add.text(W-220,H-80, 'FLIP', {
      fontSize:'10px', fill:'#0af50a',fontFamily:'"Press Start 2P"'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(btnDepth+1);

    //manual button
    const manualBtn=this.add.rectangle(W-360, H-80,110,70,0x2e1a00,btnAlpha).setScrollFactor(0).setDepth(btnDepth).setInteractive();
    this.add.text(W-360, H-80, 'MANUAL', {
      fontSize:'8px', fill:'#f86300', fontFamily:'"Press Start 2P"'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(btnDepth+1);

    //mash button
    this.mobileMashBtn=this.add.rectangle(W/2, H*0.7,200,80,0xff0000,0.7).setScrollFactor(0).setDepth(btnDepth).setInteractive().setVisible(false);
    this.mobileMashText=this.add.text(W/2,H*0.7, 'MASH', {
      fontSize:'16px', fill:'#ffffff', fontFamily:'"Press Start 2P"'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(btnDepth+1).setVisible(false);

    //button events
    slowBtn.on('pointerdown',()=>this.mobileSlowing=true);
    slowBtn.on('pointerup',()=>this.mobileSlowing=false);
    slowBtn.on('pointerout',()=>this.mobileSlowing=false);

    jumpBtn.on('pointerdown', ()=>this.mobileJump=true);

    flipBtn.on('pointerdown',()=> {
      this.mobileFlip=Math.random()<0.5 ? 'kickflip' :'heelflip';
    });

    manualBtn.on('pointerdown', ()=>this.mobileManual=true);
    manualBtn.on('pointerup', ()=>this.mobileManual=false);
    manualBtn.on('pointerout',()=>this.mobileManual)=false;

    this.mobileMashBtn.on('pointerdown',()=>this.handleRecoveryInput());

    this.mobileJump=false;
    this.mobileSlowing=false;
    this.mobileFlip=null;
    this.mobileManual=false;
  }

}

//HIT OBSTACLE
function hitObstacle() {
  if (!this.alive) return;
  this.alive=false;
  this.speedLines.stop();
  this.sparks.stop();
  this.dust.stop();
  this.cruisingSound.stop();
  if (this.currentMusic) this.currentMusic.pause();
  const deathSound= Phaser.Math.Between(1,2);
  this.sound.play('death'+ deathSound, {volume:0.075});
  this.recoveryCount=0;
  this.skater.body.setVelocityX(0);
  this.skater.body.setVelocityY(0);
  this.physics.pause();
  this.combo=0;
  this.comboMultiplier=1;

  const finalScore=Math.floor(this.score/10);
  const survivalSecs= Math.floor(this.survivalTime/1000);

  if(this.mode==='challenge'){if(survivalSecs>parseInt(localStorage.getItem('challengeBest')||0)){
    localStorage.setItem('challengeBest',survivalSecs);
  }} else if(this.mode==='scoreattack'){if (finalScore>parseInt(localStorage.getItem('scoreAttackBest')||0)){
    localStorage.setItem('scoreAttackBest',finalScore);
  }} else{
  if (finalScore>this.highScore) this.highScore=finalScore;
  localStorage.setItem('highScore', this.highScore);}

  //figure out fav trick
  const favTrick=this.trickCounts.kickflip >=this.trickCounts.heelflip ? 'KICKFLIP' :'HEELFLIP';
  const totalTricksDone=this.totalTricks;

  //final grade
  const scorePct=Math.min(finalScore/1500, 1)*40;
  const comboPct= Math.min(this.highestCombo/10,1)*25;
  const varietyPct= (this.trickCounts.kickflip> 0 && this.trickCounts.heelflip>0) ? 20:0;
  const grindPct=Math.min(this.longestGrind/200,1)*15;
  const total=scorePct+comboPct+varietyPct+grindPct;

  let grade;
  if (total>=95) grade='S';
  else if (total >=90) grade='A';
  else if (total>=80) grade= 'B';
  else if (total>=70) grade='C';
  else if (total>= 60) grade='D';
  else grade='F';
  const gradeColors={'S':'#a914ff', 'A':'#44b1ff', 'B':'#3ea300', 'C': '#ffed22', 'D': '#ff6f00', 'F': '#ff0000'};

  //overlay
  this.add.rectangle(0,0,W,H,0x000000, 0.85).setOrigin(0,0).setScrollFactor(0).setDepth(28);

  //report card
  const cardH= H*0.75;
  const cardY= H*0.12;
  const cardX=W/2;
  
  const card=this.add.container(cardX, H+cardH).setScrollFactor(0).setDepth(30);
  const cardBg= this.add.rectangle(0,0, Math.min(W*0.7, 500), cardH, 0x111111).setStrokeStyle(2, 0xffffff);
  const title= this.add.text(0, -cardH* 0.44, 'SKATE GO ACADEMY', {
    fontSize:'20px',fill:'#ffffff',fontFamily:'"Press Start 2P"'
  }).setOrigin(0.5);

  const studentText=this.add.text(0,-cardH*0.36, 'STUDENT: '+ this.playerName, {
    fontSize:'14px',fill:'#aba7a7',fontFamily:'"Press Start 2P"'
  }).setOrigin(0.5);
  const divider=this.add.rectangle(0,-cardH* 0.3, Math.min(W* 0.6,460),4,0x444444);

  const stats=this.mode==='challenge'?[{label:'SURVIVAL TIME',value:survivalSecs+'s'}, {label:'FAV TRICK',value:favTrick},
    {label:'TOTAL TRICKS',value:totalTricksDone},{label:'HIGHEST COMBO',value:'x'+this.highestCombo},
    {label:'LONGEST GRIND',value:Math.floor(this.longestGrind)},{label:'TOTAL GRINDS',value:this.totalGrinds},
  ]
  
  :[{label:'SCORE',value:finalScore}, {label:'FAV TRICK', value:favTrick},
    {label: 'TOTAL TRICKS', value:totalTricksDone}, {label: 'HIGHEST COMBO', value:'x'+ this.highestCombo},
    {label:'LONGEST GRIND',value:Math.floor(this.longestGrind)}, {label:'TOTAL GRINDS',value:this.totalGrinds},
  ];
  const statItems=[];
  stats.forEach((s,i)=> {const y= -cardH*0.2 +i*(cardH*0.09);
    const lbl= this.add.text(-Math.min(W*0.28, 200),y,s.label, {fontSize:'15px',fill:'#a3a1a1',fontFamily:'"Press Start 2P"'
  }).setOrigin(0,0.5);
  const val=this.add.text(Math.min(W*0.28, 200),y, String(s.value),{fontSize:'15px',fill:'#ffffff',fontFamily:'"Press Start 2P"'}).setOrigin(1,0.5);
  statItems.push(lbl,val);
});
const divider2=this.add.rectangle(0,cardH* 0.28,Math.min(W*0.6, 460),4,0x444444);
const gradeLabel= this.add.text(-Math.min(W*0.28,200),cardH*0.35, 'FINAL GRADE', {fontSize:'15px', fill:'#a8a5a5',fontFamily:'"Press Start 2P"'}).setOrigin(-.5,0.5);
const gradeVal=this.add.text(-Math.min(W*0.29,167),cardH*0.35, grade, {fontSize:'48px', fill:gradeColors[grade],fontFamily:'"Press Start 2P"'}).setOrigin(1,0.5);
card.add([cardBg,title, studentText,divider,divider2,gradeLabel, gradeVal, ...statItems]);

//slide in
this.tweens.add({
  targets:card, y:cardY+cardH/2, duration:600, ease:'Back.easeOut'
});
const finalGrade= grade;
this.time.delayedCall(300,()=>{
this.sound.play('grade' +grade,{volume:0.8});
});

//name input
const input=document.getElementById('player-name');
const btn= document.getElementById('submit-score');
const wrap=document.getElementById('name-input');
input.style.left=(W/2- 120)+'px';
input.style.top=(H* 0.88)+'px';
btn.style.left=(W/ 2+70)+'px';
btn.style.top= (H*0.88)+'px';
wrap.style.display='block';
input.value='';
input.focus();

const scene=this;

async function submitScore() {
  const name=input.value.trim().toUpperCase().substring(0,10);
  if(!name) return;
  scene.playerName=name;
  studentText.setText('STUDENT: ' +name);

  if(finalScore< 50){wrap.style.display='none';
    return;
  }
  wrap.style.display='none';
  let table='scores';
  let submitScore=finalScore;
  if (scene.mode==='challenge'){table='challenge_scores';submitScore=survivalSecs;}
  if (scene.mode==='scoreattack'){table='scoreattack_scores';}
  const {error}= await db.from(table).insert({name,score:finalScore});
  if (error) {scene.add.text(W/2, H*0.91, 'failed to submit :(', {fontSize:'10px',fill:'#ed0909',fontFamily:'"Press Start 2P"'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(31);
  }else {
    scene.add.text(W/2, H* 0.91, 'score submitted!!',{ fontSize:'10px',fill:'#10d410',fontFamily:'"Press Start 2P"'}).setOrigin(0.5).setScrollFactor(0).setDepth(31);
  }
  showContinue();
}

function showContinue() {wrap.style.display='none';
  const skipBtn=document.getElementById('skip-score');
  skipBtn.style.display='none';
  scene.add.text(W/2, H*0.93, 'PRESS ANY KEY TO CONTINUE', {fontSize:'10px',fill:'#fffbfb',fontFamily:'"Press Start 2P"'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(31);
  scene.input.keyboard.once('keydown',function() {
    scene.cameras.main.fade (1200,0,0,0);
    scene.time.delayedCall(1200, ()=> scene.scene.start('MenuScene'));
  });
}

btn.onclick=submitScore;
input.onkeydown= (e)=> {if(e.key==='Enter') submitScore();};
const skipBtn= document.getElementById('skip-score');
skipBtn.style.left=(W/2- 40)+'px';
skipBtn.style.top= (H*0.93) +'px';
skipBtn.style.display='block';
skipBtn.onclick= ()=> {
  scene.playName='ANONYMOUS';
  showContinue();
};
}

function startGrind(skater,rail) {
  if (this.isGrinding) return;
  if (this.grindCooldown>0) return;
  if (!rail) return;
  const vel= this.skater.body.velocity.y;
  if (vel<=0) return;
  if (this.skater.y>rail.y) return;
  if (this.grindSound) this.grindSound.stop();
  this.grindSound=this.sound.add('grind',{loop:true, volume:0.3});
  this.grindSound.play();
  this.isGrinding=true;
  this.currentRail=rail;
  this.skater.body.velocityY=0;
  this.skater.body.setAllowGravity(false);
  this.skater.y=rail.y -(rail.height *rail.scaleY/2)-30;
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
    arcade: { gravity: { y: 1500 }, debug: false, fixedStep:false}
  },
  scene: [MenuScene,TutorialScene,ModesScene, GameScene]
};

function isTouchDevice() {
  return ('ontouchstart' in window) || navigator.maxTouchPoints>0;
}

const game = new Phaser.Game(config);