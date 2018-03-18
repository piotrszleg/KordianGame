var Game = new (function(){
	this.score=0;
	GraphicsEngine.call(this, "game-canvas");// 'this' is instance of GraphicsEngine displayed on element with id "game-canvas"
	
	this.background=this.add(new Sprite(this.width/2,this.height/2, ""));
	this.background.scale.x=this.background.scale.y=0.5;

	LevelsController.call(this);
	
	this.player=new Player(this.width/2,this.height/2);
	this.add(this.player);

	this.obstaclesSpeed=0.4;

	this.spawnDelay=700;
    this.spawnTimer=0;
	this.spawnObstacles=true;
	this.fallingObstacles=false;

	//music
	this.music.add("music/cdorian.wav");
    this.music.add("music/cos_do_tego_kordiana.wav");
	this.music.add("music/csharpharmonicminor.wav");
    this.music.play();

    this.deathSound=new Audio("music/chopin_funeral.wav");
	this.deathSound.loop=true;

    // Tests unit, test can be enabled by uncommenting its name
    var tests=new Set([
    	//"no obstacles",
    	//"dialogue",
    	//"boss",
    	//"no music",
    	//"immortality",
    ]);

    // tests implementations
    if(tests.has("no obstacles")){
    	spawnObstacles=false;
    }
    if(tests.has("dialogue")){
    	this.jumpToLevel(2);
    }
    if(tests.has("boss")){
    	this.jumpToLevel(5);
    }
    if(tests.has("no music")){
    	this.music.pause();
    	this.music.queue=[];
    	this.deathSound.volume=0;
    }
    if(tests.has("immortality")){
    	this.player=new Vector(-100, -100);
    }

    // controls shown when player looses the game
    this.restartText=this.add(new Text(this.width/2-60,this.height/2-50, "Przegrałeś", "25px Arial"));
	this.restartButton=this.add(new Button(this.width/2,this.height/2, "restart", function(){
		this.restartText.disabled=true;
		this.restartButton.disabled=true;

		for(var i=this.objects.length-1; i>=0; i--){
			if(this.objects[i].obstacle){
				this.remove(this.objects[i]);
			}
		}
		this.score=0;
		this.gameOver=false;
		this.paused=false;
		this.deathSound.currentTime=0;
		this.deathSound.pause();
		this.music.play();
	}.bind(this)));
	// disable these controls by default
	this.restartText.disabled=true;
	this.restartButton.disabled=true;

    this.spawn=function(){
    	if(Math.random()>0.1 || !this.fallingObstacles){
			this.add(new Obstacle(this.width+10, 10+Math.random()*(this.height-10), this.obstaclesSpeed)).scale.setxy(1.5);// obstacle falling from the sky
		} else{
			var fallingObstacle=this.add(new Obstacle(this.width/2+Math.random()*this.width/2, 0, this.obstaclesSpeed/2));// normal obstacle
			fallingObstacle.src="img/fortepian.png";
			fallingObstacle.direction.y=1
		}
	}

	this.main=function(){
		if(this.gameOver){
			this.music.pause();
			this.deathSound.play();

			this.paused=true;
			this.restartText.disabled=false;
			this.restartButton.disabled=false;
		} else {
			if(!this.paused&&this.spawnObstacles){
				this.spawnTimer+=this.time.delta;
				if(this.spawnTimer>=this.spawnDelay){
					this.spawn();
					this.spawnTimer=0;
				}
			}
		}
	}.bind(this);
	this.updates.push(this.main);

	addEventListener("keydown", function(e){// pauses/unpauses the game when space button is pressed
		if(e.keyCode==32 && !this.frozen){
			// how to scare normies away in two lines of code:
			this.paused=!this.paused;
			this.paused?this.music.pause():this.music.play();
		}
	}.bind(this), false);

	return this;
})();