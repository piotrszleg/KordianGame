 var Scene = function(screenplay, score){
	this.screenplay=screenplay;

	return this;
}

var Level = function(duration=10, func, scene, boss=false){
	this.duration=duration;
	this.func=func;
	this.scene=scene;
	this.boss=boss;

	return this;
}

var LevelsController = function(){
	var characterMap={
		"Ty" : "",
		"Caryca" : "img/misa.png",
		"Car" : "img/suoh.png",
		"Strażnik" : "img/suoh.png",
	};

	this.scenes=[];
	// parse scenes from html tags
	Array.from(document.getElementsByTagName("screenplay")).forEach(function(el){
		var scene=[];
		var lines=el.innerHTML.trim().split("\n");
		for(var l=0; l<lines.length; l++){
			scene[l]=lines[l].split(": ");
			if(scene[l].length==1){// no ": " in line, so there is no specified speaker
				scene[l][1]=scene[l][0];
				scene[l][0]="";
			} else {
				scene[l][0]+=":";
			}
			scene[l][0]=scene[l][0].trim();
			scene[l][1]=scene[l][1].trim();
		}
		this.scenes[el.id]=scene;
	}.bind(this));


	/*this.question=function(question, answers, correct){
		this.paused=true;
		this.frozen=true;
		var questionText=this.add(new Text(this.width/2,this.height/2-150, question, "25px Arial"));
		questionText.centered=true;
		var questionButtons=[];
		for(var i=0; i<answers.length; i++){
			questionButtons[i]=this.add(new Button(this.width/2,this.height/2-80+i*50, answers[i], function(i){
				if(i==correct){
					this.frozen=false;
					this.paused=true;
					this.score++;
				} else {
					this.gameOver=true;
				}
				this.remove(questionText);
				questionButtons.forEach(function(b){this.remove(b)}.bind(this));
			}.bind(this, i)));
			questionButtons[i].height=40;
		}
	}
	this.randomQuestion=function(){
		this.question("Gdzie urodził się Juliusz Słowacki?", [
			"we Lwowie",
			"w Wilnie",
			"w Nowogródku",
			"w Krzemieńcu "], 3);
	}*/

	this.levels=[
		new Level(0, function(){this.background.src="img/góry.png";}, this.scenes["Na górze"]),
		new Level(15, function(){this.obstaclesSpeed+=0.2;this.spawnDelay-=50;this.background.src="img/polana.jpg";}, undefined),
		new Level(15, function(){
			this.obstaclesSpeed+=0.2;
			this.spawnDelay-=100;
			this.background.src="img/miasto.png";
			this.fallingObstacles=true;
			this.background.scale.setxy(0.52);
		}, this.scenes["Spisek"]),
		new Level(30, function(){
			this.obstaclesSpeed+=0.1;
			this.spawnDelay-=70;
			this.background.src="img/zamek.png";
			this.background.scale.setxy(0.56);
		}, this.scenes["Strażnik"]),
		new Level(40, function(){this.obstaclesSpeed+=0.1;this.spawnDelay-=70;}, this.scenes["Zona"]),
		new Level(50, function(){
			this.background.src="img/zamek.png";
			this.background.scale.setxy(0.56);
			this.add(new Boss(this.width-70, this.height/2+150));
			this.add(new Boss(this.width-70, this.height/2-150)).src="img/imaginacja.png";
			this.spawnDelay=10000;
			this.spawn=function(){
				this.add(new Heart(this.width/2*Math.random(), this.height/4+this.height/2*Math.random()));
			}
		}, this.scenes["Sypialnia"], true),
		new Level(3, function(){}, this.scenes["Koniec"]),
	];
	this.levelIndex=0;

	// message displayed on screen
	this.add(new Text(10,30, "Następna poziom za:", "20px Arial"));
	this.nextSceneText=this.add(new Text(10,80, "", "50px Arial"));

	this.jumpToLevel=function(level){
		this.levelIndex=level;
		this.score=this.levels[this.levelIndex].duration;
	}

	this.updateLevels=function(){
		if(this.levelIndex<this.levels.length && !this.gameOver){
			if(this.score>=this.levels[this.levelIndex].duration){
				if(this.levels[this.levelIndex].scene!==undefined){
					this.showScene(this.levels[this.levelIndex].scene);
				}
				if(this.levels[this.levelIndex].func!==undefined){
					this.levels[this.levelIndex].func.call(this);
				}
				this.levelIndex++;
				this.score=0;
			} else {
				//if(this.score==Math.floor(this.levels[this.levelIndex].duration/2))this.randomQuestion();
				this.nextSceneText.text=this.levels[this.levelIndex].duration-this.score;
			}
		} else if(this.levelIndex>=this.levels.length){// end of the game
			this.paused=true;
			this.frozen=true;
			for(var i=this.objects.length-1; i>=0; i--){
				if(this.objects[i].obstacle){
					this.remove(this.objects[i]);
				}
			}
		}
	}
	this.updates.push(this.updateLevels.bind(this));

	this.showScene=function(scene){	
		this.paused=true;
		this.frozen=true;

		var character=this.add(new Sprite(-50, this.height, ""));
		character.offset=new Vector(0, 1);
		character.scale.x=character.scale.y=0.6;

		var background=this.add(new Box(0 ,this.height*0.7, this.width, this.height));
		background.color="#FFFFFFCC"

		var nameText=this.add(new Text(20,this.height-145, "", "25px Arial"));
		var statementText=this.add(new Text(20,this.height-105, "", "20px Arial"));
		var typer=this.add(new Typer(statementText, 10));

		var i=0;
		function show(){
			nameText.text=scene[i][0];
			character.src=characterMap[scene[i][0]];
			typer.type(scene[i][1]);
			
		}
		show();
		var updateScene=function(){
			if(this.mouseDown){
				if(!this.clicked){
					if(i<scene.length-1){
						i++;
						show();
					} else {
						this.updates.splice(this.updates.indexOf(updateScene), 1);
						this.remove(nameText);
						this.remove(statementText);
						this.remove(character);
						this.remove(background);
						this.paused=false;
						this.frozen=false;
					}
				}
				this.clicked=true;
			} else {
				this.clicked=false;
			}
		}.bind(this);
		this.updates.push(updateScene);
	}

	this.choiceBox=function(question, answers, resolve){// resolve function will be called with a number of choosen option as an argument
		var questionText=this.add(new Text(this.width/2-60,this.height/2-50, question, "25px Arial"));
		var spacing=60;
		for(var i=0; i<answers.length; i++){
			this.add(new Button(this.width/2,this.height/2+i*spacing, answers[i], resolve.bind(this, i)));
		}
	}

	return this;
}