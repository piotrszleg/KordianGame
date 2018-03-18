var Player = function(x, y) {
    Sprite.call(this);
    this.x=x;
    this.y=y;
    this.size=20;

    this.src="img/gracz.png";
    this.super_draw=this.draw;
    this.draw=function(engine){
        if(!engine.paused){
            this.x=(this.x+engine.mousePosition.x)/2;
            this.y=(this.y+engine.mousePosition.y)/2;
        }
        this.super_draw(engine);
    }
    return this;
}

var Obstacle = function(x, y, speed) {
    Sprite.call(this);
    this.x=x;
    this.y=y;
    this.size=20;
    this.speed=speed;
    this.direction=new Vector(-1, 0);
    this.obstacle=true;
    this.value=1;

    this.src="img/chmura.png";
    this.super_draw=this.draw;
    this.draw=function(engine){
        if(!engine.paused){
            this.x+=this.direction.x*this.speed*engine.time.delta;
            this.y+=this.direction.y*this.speed*engine.time.delta;
        }
        if(!engine.gameOver && Vector.distance(this, engine.player)<this.size){
            engine.gameOver=true;
        }
        if(this.x<-this.size/2){
            engine.remove(this);
            engine.score+=this.value;
        }
        this.super_draw(engine);
    }
    return this;
}

var Heart = function(x, y, speed) {
    Sprite.call(this);
    this.x=x;
    this.y=y;
    this.obstacle=true;
    this.size=30;

    this.touched=false;
    this.enlargingSpeed=0.1;
    this.src="img/serce.png";
    this.scale.setxy(3);
    this.super_draw=this.draw;
    this.draw=function(engine){
        if(this.touched){
            this.scale.x+=this.enlargingSpeed*engine.time.delta;
            this.scale.y=this.scale.x;
            this.alpha=1.2-this.scale.x/100;
            if(this.scale.x>100){
                engine.remove(this);
                engine.score++;
            }
        } else{
            if(!engine.gameOver && Vector.distance(this, engine.player)<this.size && !engine.paused){
                this.touched=true;
            }
        }
        this.super_draw(engine);
    }
    return this;
}

var Boss = function(x, y, player) {
    Sprite.call(this);
    this.src="img/strach.png";
    this.scale.setxy(2);
    this.x=x;
    this.y=y;
    this.size=30;
    this.bulletsSpeed=0.4;
    this.shooting=false;
    this.shootingDelay=500;
    this.timer=0;

    this.floatingMagnitude=5;
    this.floatingSpeed=0.005;
    this.orginalY=this.y;

    this.shoot=function(engine){
        var bullet=engine.add(new Obstacle(this.x, this.y, this.bulletsSpeed));
        bullet.direction=Vector.normalized(new Vector(engine.player.x-this.x, engine.player.y-this.y));
        bullet.src="img/pocisk.png";
        bullet.value=0;
        bullet.scale.setxy(3);
    }

    this.super_draw=this.draw;
    this.draw=function(engine){
        if(!engine.paused){
            this.timer+=engine.time.delta;
            if(this.timer>this.shootingDelay){
                this.shoot(engine);
                this.shootingDelay-=this.shootingDelay/400;
                this.timer=0;
            }
            this.y=this.orginalY+this.floatingMagnitude*Math.sin(this.floatingSpeed*(engine.time.now));
        }
        this.super_draw(engine);
    }
    return this;
}
