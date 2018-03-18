var Time=function(){
    this.start=this.last=Date.now();
    this.delta=0;
    this.now=0;
    this.update=function(){
        this.now=Date.now();
        this.delta=Date.now()-this.last;
        this.last=Date.now();
    }
}

var Music=function(){
    this.queue=[];
    this.current=0;
    this.add=function(track_source){
        this.queue.push(new Audio(track_source));
    }
    this.play=function(){
        if(this.queue.length>0)
            this.queue[this.current].play();
    }
    this.pause=function(){
        if(this.queue.length>0)
            this.queue[this.current].pause();
    }
    this.update=function(){
        if(this.queue.length>0&&this.queue[this.current].ended==true){
            this.current++;
            if(this.current>=this.queue.length){
                this.current=0;
            }
            this.queue[this.current].play();
        }
    }
}

//Class managing drawing objects on canvas and input
var GraphicsEngine = function(canvas_id) {
	//rendering canvas
    this.canvas=document.getElementById(canvas_id);
    this.ctx = this.canvas.getContext("2d");
    this.width=this.canvas.width;
    this.height=this.canvas.height;
    // input
	this.mousePosition=new Vector(0,0);
	this.mouseDown=false;

    // objects list
    this.objects=[];
    this.add=function(object){
    	this.objects.push(object);
        return object;
    }
    this.remove=function(object){
        this.objects.splice(this.objects.indexOf(object), 1); 
    }

    // adding a function to this array will make it executed every 60 seconds
    this.updates=[];

    this.time=new Time();
    this.updates.push(this.time.update.bind(this.time));

    this.music=new Music();
    this.updates.push(this.music.update.bind(this.music));

    // update
    this.update=function(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);// clear canvas
        this.canvas.style.cursor="default";// reset cursor

        // call update functions
        for (var j = 0; j < this.updates.length; j++) {
            this.updates[j]();
        }

        // draw objects
    	for (var i = 0; i < this.objects.length; i++) {
            if(!this.objects[i].disabled){
    		  this.objects[i].draw(this);
            }
    	}
    }
    setInterval(this.update.bind(this), 1000/60);

    // events
	var _this=this;// remembers current this in events' scope
	this.mousemove=function(e) {
		var rect=e.currentTarget.getBoundingClientRect();
		_this.mousePosition=new Vector((e.clientX-rect.left)/rect.width*_this.width, (e.clientY-rect.top)/rect.height*_this.height);
	}
    this.mousedown=function(e) {
        _this.mouseDown=true;
    }
    this.mouseup=function(e) {
        _this.mouseDown=false;
    }
    this.canvas.addEventListener("mousemove", this.mousemove, false);
    this.canvas.addEventListener("mouseup", this.mouseup, false);
    this.canvas.addEventListener("mousedown", this.mousedown, false);
    
    return this;
}

var Box=function(x, y, w, h){
    this.x=x;
    this.y=y;
    this.w=w;
    this.h=h;
    this.color="white";

    this.draw=function(engine){
        engine.ctx.save();
        engine.ctx.fillStyle=this.color;
        engine.ctx.fillRect(this.x,this.y,this.w,this.h);
        engine.ctx.restore();
    }

    return this;
}

var Button = function(x, y, text, onClick) {
    this.x=x;
    this.y=y;
    this.width=100;
    this.height=50;
    this.text=text;
    this.onClick=onClick;
    this.clicked=false;

    this.draw=function(engine){
        engine.ctx.save();
        engine.ctx.strokeStyle="black";
        engine.ctx.lineWidth=2;

        if(Math.abs(this.x-engine.mousePosition.x)<this.width/2 && Math.abs(this.y-engine.mousePosition.y)<this.height/2){  
            engine.canvas.style.cursor="pointer";
            if(engine.mouseDown){
                engine.ctx.strokeStyle="#aaa";
                if(this.onClick!=undefined && !this.clicked){
                    this.onClick();
                    this.clicked=true;
                }
            } else{
                this.clicked=false;
            }
        }

        engine.ctx.textBaseline = 'middle';
        engine.ctx.textAlign="center";
        engine.ctx.fillText(this.text,this.x,this.y);
        engine.ctx.beginPath();
        engine.ctx.rect(this.x-this.width/2,this.y-this.height/2,this.width,this.height);
        engine.ctx.stroke();
        engine.ctx.restore();
    }
    return this;
}

var Typer = function(text, delay){
    this.text=text;
    this.delay=delay;
    this.toType="";
    this.counter=0;
    this.timer=0;

    this.type=function(toType){
        this.text.text="";
        this.toType=toType;
        this.counter=0;
    }
    this.draw=function(engine){
        if(this.counter<this.toType.length){
            if(this.timer>=this.delay){
                text.text+=this.toType[this.counter];
                this.counter++;
                this.timer=0;
            }else{
                this.timer+=engine.time.delta;
            }
        }
    }
}

var Text = function(x, y, text, font=""){
    this.x=x;
    this.y=y;
    this.text=text;
    this.font=font;
    this.alpha=1;
    this.centered=false;
    this.draw=function(engine){
        engine.ctx.save();
        if(this.centered){
            engine.ctx.textBaseline = 'middle';
            engine.ctx.textAlign="center";
        }
        engine.ctx.globalAlpha=this.alpha;
        if(this.font!=""){
            engine.ctx.font = this.font;
        }
        engine.ctx.fillText(this.text, this.x, this.y);
        engine.ctx.restore();
    }
    return this;
}

var Sprite = function(x, y, src){
    this.x=x;
    this.y=y;
    this.src=src;
    this.image=new Image();
    this.image.src=src;
    this.offset=new Vector(0.5, 0.5);
    this.scale=new Vector(1, 1);
    this.alpha=1;

    this.draw=function(engine){
        engine.ctx.save();
        if(this.image.src!=this.src){
            this.image.src=this.src;
        }
        engine.ctx.globalAlpha=this.alpha;
        engine.ctx.translate(this.x, this.y)
        engine.ctx.scale(this.scale.x, this.scale.y);
        engine.ctx.drawImage(this.image, -this.image.width*this.offset.x, -this.image.height*this.offset.y);
        engine.ctx.restore();
    }
    return this;
}

var Vector = function(x, y) {
    this.x=x;
    this.y=y;
    this.setxy=function(xy){
        this.x=this.y=xy;
    }
    return this;
}
Vector.distance=function(A, B){
    x=A.x-B.x;
    y=A.y-B.y;
    return Math.sqrt(x*x+y*y);
}
Vector.normalized=function(A){
    var l=Math.sqrt(A.x*A.x+A.y*A.y);
    A.x/=l;
    A.y/=l;
    return A;
}