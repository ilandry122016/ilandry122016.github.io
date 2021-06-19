//https://lab.ucode.com/lesson/3106
//HAVE TO DO A SUPER DIFFICULT CHALLENGE.
var SCREEN_W = 500;
var SCREEN_H = 340;
var game;
var emitters = [];
var boost = false;
var attempts = 1;
var zombies_dead=0;
var completed=false;
var bootState = {
   preload: function()
   {
        game.load.image('progressBar', 'assets/progressBar.png');
   },
   create: function()
   {
        game.stage.backgroundColor = "#00FFFF";   //would change this line to change the color of the background
        game.physics.startSystem(Phaser.Physics.ARCADE);//would change this line if using anything other than ARCADE
        if(!game.device.desktop)
        {
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            document.body.style.backgroundColor = '#00AEEF';
            game.scale.minWidth=320;
            game.scale.maxWidth=2560;
            game.scale.minHeight=320;
            game.scale.maxHeight=1600;
            game.scale.pageAlignHorizantally=true;
            game.scale.pageAlignVertically=true;
        }
        game.state.start('load');
   }
};

var loadState = {
   preload: function()
   {
        var progressBar = game.add.sprite(SCREEN_W/2, SCREEN_H/2, 'progressBar');
        progressBar.anchor.setTo(.5, .5);
        game.load.setPreloadSprite(progressBar);
        game.load.image('tileset', 'assets/tileset.png');
        game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('map2', 'assets/map1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('map3', 'assets/map3.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('map4', 'assets/map4.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.tilemap('map5', 'assets/map5.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('gameBG', 'assets/gameBG.png');
        game.load.image('geo', '220px-Star_of_life2.svg.png');
        game.load.image('pixel', 'assets/pixel.png');
        game.load.image('background', 'assets/geoBG.png');
        game.load.spritesheet('mute', 'assets/muteButton.png', 28, 22);
        game.load.audio('dead', ['assets/dead.mp3', 'assets/dead.ogg']);
        game.load.audio('jump', ['assets/jump.mp3', 'assets/jump.ogg']);
        game.load.audio('win',['assets/coin.mp3', 'assets/coin.mp3']);
        game.load.audio('hurt', 'assets/ouch.wav');
        game.load.audio('bottom hit', 'assets/ground-hit.wav');
        game.load.audio('mid hit', 'assets/pipe-hit.wav');
        game.load.audio('score', 'assets/score.wav');
        game.load.image('Zombie', '162px-Minecraft-Zombie.png');
        game.load.image('Ender Portal', 'ender portal.jpeg');
   },
   create: function()
   {
        game.state.start('menu');
   }
};

var menuState = {
   preload: function()
   {

   },
   create: function()
   {
       game.add.image(0, 0, 'background');
       var text;
       if(game.device.desktop)
       {
           text = "Press the Up Arrow Key to Start!\n開始するには上矢印キーを押してください！";
           var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
           upKey.onDown.addOnce(this.startGame, this);
       }
       else
       {
           text = "Tap the Screen to Start!\n画面をタップして開始！";
           game.input.onTap.addOnce(this.startGame, this);
       }
       var startLabel = game.add.text(SCREEN_W/2, SCREEN_H-80, text, {font: '20px Roboto', fill: '#00FFFF'});
       startLabel.anchor.setTo(.5, .5);
       game.add.tween(startLabel).to({angle: -5}, 500).to({angle:0}, 500).easing(Phaser.Easing.Bounce.InOut).start();
       if(completed)
       {
           this.scoreLabel=game.add.text(SCREEN_W/2, SCREEN_H/2, 'Completed in '+attempts+' attempts!', {font: '25px Roboto', fill: '#FFFFFF'});
           this.scoreLabel.anchor.setTo(.5, .5);
           this.kills=game.add.text(SCREEN_W/2, SCREEN_H/2+50, 'Killed '+zombies_dead+' zombies!', {font: '25px Roboto', fill: '#00FF00'});
           this.kills.anchor.setTo(.5, .5);
           completed=false;
           attempts=1;
       }
       this.muteButton=game.add.button(20, 20, 'mute', this.toggleSound, this);
       this.muteButton.input.useHandCursor=true;
       if(game.sound.mute){
           this.muteButton.frame=1;
       }
   },
   toggleSound: function()
   {
       game.sound.mute=!game.sound.mute;
       this.muteButton.frame=game.sound.mute? 1 : 0;
   },
   startGame: function()
   {
        //alert("You may notice that the game is sometimes slow or something disappears almost imediately.");
        game.state.start('play');
   }
};

var playState = {
   preload: function()
   {

   },
   create: function()
   {
      this.createWorld();
      game.add.text(SCREEN_W/2, SCREEN_H/2 - 80, 'Attempt ' +attempts, {font: '24px Roboto', fill: '#FFFFFF'});
      this.player = game.add.sprite(250, 170, 'geo');
      this.player.anchor.y=.5;
      this.player.anchor.x=.5;
      this.startPoint=new Phaser.Point(this.player.x, this.player.y);
      game.physics.arcade.enable(this.player);
      this.player.body.gravity.y = 2000;
      this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
      this.cursor = game.input.keyboard.createCursorKeys();
      this.emitter = game.add.emitter(this.player.x, this.player.y, 15);
      this.emitter.makeParticles('pixel');
      this.emitter.setYSpeed(0, -100);
      this.emitter.setXSpeed(0, -200);
      this.win_sound=game.add.audio('win');
      this.dead_sound=game.add.audio('dead');
      this.jump_sound=game.add.audio('jump');
      this.hurt_sound=game.add.audio('hurt');
      this.bottom_hit_sound=game.add.audio('bottom hit');
      this.score_sound=game.add.audio('score');
      this.mid_hit_sound=game.add.audio('mid hit');
      this.cursor=game.input.keyboard.createCursorKeys();
      this.zombies=game.add.group();
      this.zombies.enableBody=true;
      this.zombies.createMultiple(100, 'Zombie');
      game.time.events.loop(0, this.spawn_zombie, this);
      game.physics.arcade.enable(this.zombies);
      this.player.health=2000;
     this.restriction=game.add.text(this.ender_portal.x, this.ender_portal.y, 'You may not get in through\nthe ender portal now.\nYou need at least\n2000 zombie kills.', {font: '20px Roboto', fill:'#FF0000'});
     this.restriction.anchor.setTo(.5, .5);
      this.health=game.add.text(this.player.x, this.player.y, "Health: 2000", {font: '25px Roboto', fill: '#FFFFFF'});
      this.health.anchor.setTo(.5, .5);
      game.time.events.loop(100, function(){if(this.player.health<2000){this.player.health+=1}}, this);
      zombies_dead=0;
      this.dead_zombies=game.add.text(this.player.x, this.player.y+50, 'Killed zombies: ' +zombies_dead, {font: '25px Roboto', fill: '#00FF00'});
      this.dead_zombies.anchor.setTo(.5, .5);
      this.space_key=game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
   },
   update: function()
   {
     game.physics.arcade.collide(this.zombies, this.layer);
     game.physics.arcade.collide(this.player, this.layer);
     game.physics.arcade.collide(this.zombies, this.zombies, null, function(obj1,obj2){obj1.body.velocity.y-=5; return true;});
     if(zombies_dead>=2000){
         if(!this.restriction.alive){
             this.restriction.text='';
         }
        game.physics.arcade.overlap(this.player, this.ender_portal, this.win, null, this);
     }
     for(var i=0; i<this.zombies.children.length; i++){
         if(this.zombies.children[i]){
             if(this.zombies.children[i].y>=340 || this.zombies.children[i].y<0){
                 this.zombies.children[i].kill();
                 if(this.player.health<2000){
                 this.player.health+=1;
                 }
                 zombies_dead++;
             }
             var ray = new Phaser.Line(this.zombies.children[i].body.x-16,
                                       this.zombies.children[i].body.y,
                                       this.zombies.children[i].body.x+16,
                                       this.zombies.children[i].body.y);
             var tileHits = this.layer.getRayCastTiles(ray, 30, false, false);
             for(var j=0; j<tileHits.length; j++) {
                 if(tileHits[j].index!=-1)
                 {
                    if(tileHits[j].index == 1 || tileHits[j].index == 2 || tileHits[j].index == 0){
                        this.map.removeTile(tileHits[j].x, tileHits[j].y);
                        this.zombies.children[i].kill();
                        if(this.player.health<2000){
                        this.player.health+=1;
                        }
                        zombies_dead++;
                    }
                    else if(tileHits[j].index>=3 && this.zombies.children[i].body.onFloor()){
                        this.zombies.children[i].body.velocity.y=-500;
                    }
                 }
             }
         }
      if(this.zombies.children[i].x>this.player.x){
          this.zombies.children[i].body.velocity.x=-200;
      }else if(this.zombies.children[i].x<this.player.x){
          this.zombies.children[i].body.velocity.x=200;
      }else{
          this.zombies.children[i].body.velocity.x=0;
      }
      game.physics.arcade.overlap(this.player, this.zombies.children[i], function(){this.player.health-=1}, null, this);
     if(this.cursor.down.isDown){
         this.zombies.children[i].body.y+=5;
     }
     if(this.space_key.isDown){
         this.zombies.children[i].body.y-=5;
     }
     }
     this.movePlayer();
     if(this.emitter.alive)
     {
         this.emitter.forEachAlive(function(p)
         {
             p.scale.setTo(game.math.clamp(p.lifespan / 500, 0, 6));
             p.alpha = game.math.clamp(p.lifespan / 800, 0, 1);
         });
     }
     for(var k=0; k<emitters.length; k++)
      {
          var emitter2=emitters[k];
          emitter2.forEachAlive(function(p)
         {
             p.scale.setTo(game.math.clamp(p.lifespan / 500, 0, 6));
             p.alpha = game.math.clamp(p.lifespan / 800, 0, 1);
         });
      }
     if(this.player.y>game.height||this.player.health<=0){
        this.restart();
     }
   },
   createWorld: function()
   {
      
       level=game.rnd.integerInRange(1, 5);
     switch (level)
     {
         case 1:
             this.map=game.add.tilemap('map');
             game.stage.backgroundColor = "#00FFFF";
             break;
         case 2:
             this.map = game.add.tilemap('map2');
             game.stage.backgroundColor = "#00CC00";
             break;
         case 3:
             this.map = game.add.tilemap('map3');
             game.stage.backgroundColor = "#0000FF";
             break;
         case 4:
             this.map = game.add.tilemap('map4');
             game.stage.backgroundColor = '#FF0000';
             break;
         case 5:
             this.map = game.add.tilemap('map5');
             game.stage.backgroundColor = '#CCEEFF';
             break;
         default:
         attempts=1;
         game.state.start('menu');
     }
     this.bg = game.add.tileSprite(0, 0, 3200, game.height, 'gameBG');
     this.ender_portal=game.add.sprite(2971, 170,'Ender Portal');
     this.ender_portal.anchor.y=.5;
     game.physics.arcade.enable(this.ender_portal);
     this.map.addTilesetImage('tileset');
     this.layer = this.map.createLayer('Tile Layer 1');
     this.layer.resizeWorld();
     this.map.setCollisionBetween(0, 2, true);
     this.map.setCollisionBetween(3, 1000, true);
/*         for(var x=0; x<this.map.width; x++)
         {
            var tile=this.map.getTile(x,3);
            if(tile)
            {
               tile.index=2;
            }
         }
*/
     for(var y=0; y<this.map.height; y++)
     {
         for(var x=0; x<this.map.width; x++)
         {
            /*if(y==3)
            {
               this.map.putTile(1,x,y);
            }*/
             var tile = this.map.getTile(x,y);
             if(tile)
             {
                 if(tile.index == 4)
                 {
                     var tileSize = 32;
                     var worldX = tile.x*tileSize;
                     var worldY = tile.y*tileSize;
                     var emitter = game.add.emitter(worldX + (tileSize/2), worldY, 50);
                     emitter.makeParticles('pixel');
                     emitter.setYSpeed(-15,-50);
                     emitter.setXSpeed(-20, 20);
                     emitter.gravity = 100;
                     emitter.start(false, 1000, 10);
                     emitters.push(emitter);
                 }
             }
         }
     }
     
   },
   movePlayer: function()
   {
      if(this.cursor.right.isDown){
     this.player.body.velocity.x = 300;
     }else if(this.cursor.left.isDown && this.player.inCamera){
        this.player.body.velocity.x=-300;
     }else{
        this.player.body.velocity.x=0;
     }
     if(this.player.body.onFloor())
     {
       this.emitter.x = this.player.x - this.player.width/2;
       this.emitter.y = this.player.y + this.player.height/2;
       this.emitter.start(true, 500, 0, 0, 0);
       this.bottom_hit_sound.play();
       if(game.device.desktop)
       {
         if(this.cursor.up.isDown){
          this.jumpPlayer();
         }
       }
       else{
         game.input.onTap.addOnce(this.jumpPlayer, this);
       }
     }
     else{
         this.mid_hit_sound.play();
     }
     this.health.text='Health: '+this.player.health;
     this.health.x=this.player.x;
     this.dead_zombies.text='Killed zombies:'+zombies_dead;
     this.dead_zombies.x=this.player.x;
   },
   jumpPlayer: function()
   {
     if(this.player.alive)
     {
         var ray = new Phaser.Line(this.player.x, this.player.y, this.player.x, this.player.y+32);
         var tileHits = this.layer.getRayCastTiles(ray, 1, false, false);
         if(tileHits.length>0)
         {
             for(var i=0; i<tileHits.length; i++)
             {
                 if(tileHits[i].index == 4){
                     boost = true;
                 }
                 else if(tileHits[i].index !=4){
                     this.emitter.makeParticles('pixel');
                 }
             }
         }
     }
     game.add.tween(this.player).to({angle: 180}, 500).start();
     if(boost){
         this.player.body.velocity.y = -700;
         this.jump_sound.play();
     }
     else{
         this.player.body.velocity.y = -550;
         this.hurt_sound.play();
     }
     boost = false;
   },
   restart: function()
   {
       if(!this.player.alive){
           return;
       }
       this.player.kill();
       this.dead_sound.play();
       attempts++;
       game.time.events.add(90000, game.state.start('menu'), this);
   },
  spawn_zombie: function()
  {
      var zombie = this.zombies.getFirstDead();
      if(!zombie)
      {
          return;
      }
      zombie.anchor.y=0;
      zombie.reset(game.rnd.integerInRange(0, 2950), 30);
      zombie.body.gravity.y=2000;
      zombie.checkWorldbounds = true;
  },
  win: function(){
         this.player.kill();
         completed=true;
         this.score_sound.play();
         game.time.events.add(1000, game.state.start('menu'), this);
  }
};
game = new Phaser.Game(SCREEN_W, SCREEN_H, Phaser.AUTO, 'game');
/*game.global={
    score=0;
}*/
game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);
game.state.start('boot');