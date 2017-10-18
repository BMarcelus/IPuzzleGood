//Niborious
//Brian Dizon

GUIClickableTemplate = {
	clickable:true,// held:false, hovered:false,
	mouseDown:function(x,y){},
	mouseUp:function(x,y){},
	mouseMove:function(x,y){},
	mouseLeave:function(x,y){},
	contains:function(x,y){
		return x>=this.x*CANVAS_WIDTH&&x<=(this.x+this.w)*CANVAS_WIDTH&&
			   y>=this.y*CANVAS_HEIGHT&&y<=(this.y+this.h)*CANVAS_HEIGHT;
	},
}
function drawRoundedRect(canvas, x,y,w,h, roundRadius, options)
{
	if(!roundRadius)
	roundRadius = 10;

	canvas.beginPath();
	canvas.moveTo(x+roundRadius, y);
	canvas.lineTo(x+w-roundRadius, y);
	canvas.quadraticCurveTo(x+w,y,x+w,y+roundRadius);
	canvas.lineTo(x+w,y+h-roundRadius);
	canvas.quadraticCurveTo(x+w,y+h,x+w-roundRadius, y+h);
	canvas.lineTo(x+roundRadius, y+h);
	canvas.quadraticCurveTo(x,y+h, x, y+h-roundRadius);
	canvas.lineTo(x, y+roundRadius);
	canvas.quadraticCurveTo(x, y,x+roundRadius, y);
	canvas.fill();
	// canvas.stroke();
}
function buttonDraw(canvas)
{
	canvas.fillStyle = this.color;
	if(this.hovered)canvas.fillStyle=this.hoverColor;
	canvas.fillRect(this.x,this.y,this.w,this.h);
	this.label.draw(canvas);
}
function buttonPopDraw(canvas)
{
	if(!this.active)return;
	var padx = this.w/20;
	var starty=0;
	var bh = this.h*2/3;
	var basey = this.y+this.h/3;
	var w = CANVAS_WIDTH;
	var h = CANVAS_HEIGHT;
	canvas.fillStyle="black";
	canvas.fillRect(this.x*w,basey*h,this.w*w,bh*h);
	canvas.fillStyle="#009";
	if(this.hovered&&!this.held)canvas.fillStyle="#228";
	canvas.fillRect((this.x+padx)*w,(this.y+bh)*h,(this.w-padx*2)*w,(bh/3)*h);
	canvas.fillStyle="#00f";
	if(this.hovered&&!this.held)canvas.fillStyle="#44d";
	if(this.held)
	{
		starty+=this.h/6;
	}
	canvas.fillRect((this.x+padx)*w,(this.y+starty)*h, (this.w-padx*2)*w, bh*h);
	canvas.save();
	canvas.translate(0,starty*h);
	this.label.draw(canvas);
	canvas.restore();
}
function labelDraw(canvas)
{
	if(!this.active)return;
	canvas.fillStyle = this.color;
	this.fontSize=this.h*CANVAS_HEIGHT;
	canvas.font=this.fontSize+'px '+this.fontType;
	canvas.textAlign = "center";
	var w = CANVAS_WIDTH;
	var h = CANVAS_HEIGHT;
	canvas.fillText(this.title,this.x*w,(this.y*h+this.fontSize/4),this.w*w,this.h*h);
}
function labelSizedDraw(canvas,w,h)
{
	if(!this.active)return;

	if(!w)w=CANVAS_WIDTH;
	if(!h)h=CANVAS_HEIGHT;
	canvas.fillStyle = this.color;
	this.fontSize=Math.min(this.h*w,this.w/(this.title.length)*h*2);
	canvas.font=this.fontSize+'px '+this.fontType;
	canvas.textAlign = "center";
	canvas.fillText(this.title,this.x*w,((this.y)*h+this.fontSize*.4),this.w*w,this.h*h);
	// canvas.fillText(this.title,this.x*w,this.y*h,this.w*w,this.h*h);
}

function GUILabel(x,y,w,h,title,color,sized,fontSize,fontType)
{
	this.x=x;
	this.y=y;
	this.w=w;
	this.h=h;
	this.title=title;
	this.active=true;
	if(!color)color="black";
	this.color=color;
	if(!fontSize)fontSize=50;
	if(!fontType)fontType="Impact";
	this.font = fontSize+'px '+fontType;
	this.fontType=fontType;
	this.fontSize = fontSize;
	if(sized)this.draw=labelSizedDraw;
	else this.draw = labelDraw;
}

function GUIDynamicLabel(x,y,w,h,title,color,fontSize,fontType)
{
	this.x=x;
	this.y=y;
	this.w=w;
	this.h=h;
	this.title=title;
	this.active=true;
	if(!color)color="black";
	this.color=color;
	if(!fontSize)fontSize=50;
	if(!fontType)fontType="Impact";
	this.font = fontSize+'px '+fontType;
	this.fontType=fontType;
	this.fontSize = fontSize;
	this.doDraw = labelDraw;
	this.draw = function(canvas)
	{
		this.update();
		var sw = triangleSpriteSheet.mySpriteWidth;
		var sh = triangleSpriteSheet.mySpriteHeight;
		var x = (this.x-this.w/2)*CANVAS_WIDTH;
		var y = (this.y-this.h)*CANVAS_HEIGHT;
		var w = (this.w)*CANVAS_WIDTH;
		var h = this.h*CANVAS_HEIGHT*2;
		canvas.drawImage(triangleSpriteSheet, triangleSpriteSheet.flagIndex*sw,0*sh, sw,sh, x,y,w,h);
		this.doDraw(canvas);
	}
	this.update=function(){};
}





function GUIButton2(x,y,w,h,title,callback)
{
	this.x=x;
	this.y=y;
	this.w=w;
	this.h=h;
	this.callback=callback;
	this.color = 'blue';
	this.hoverColor = 'green';
	this.label = new GUILabel(x+w/2,y+h*5/12,w*.8,h*.7,title);
	this.active=true;
	this.mouseDown = function(x,y)
	{
		if(!this.active)return;
		this.held=true;
	}
	this.mouseUp = function(x,y)
	{
		if(!this.active)return;
		if(this.contains(x,y)&&this.held)
		this.callback(x,y);
		this.held=false;
	}
	this.draw = buttonPopDraw;
}

GUIButton2.prototype = GUIClickableTemplate;






function setGradient(canvas,x,y,height,color1,color2)
{
	var grd = canvas.createLinearGradient(x,y,x,y+height);
	grd.addColorStop(0,color1);
	grd.addColorStop(1,color2);
	canvas.fillStyle=grd;
}




function GUITimer(x,y,w,h,canvas)
{
	this.x=x;
	this.y=y;
	this.w=w;
	this.h=h;
	this.startTime;
	this.time;
	this.canvas=canvas;
	this.color = "black"
	this.label = new GUILabel(x+w/2,y+h*.6,w,h,"0","white");
	this.start();
}


GUITimer.prototype = {
	start:function(){
		this.startTime = new Date().getTime()/1000;
		var self=this;
		if(this.intervalId)clearInterval(this.intervalId);
		this.intervalId = setInterval(function(){
			self.update();
		},1000);
	},
	stop:function(){
		this.update();
		if(this.intervalId)clearInterval(this.intervalId);
	},
	resume:function()
	{
		this.startTime = new Date().getTime()/1000 - this.time;
		var self=this;
		if(this.intervalId)clearInterval(this.intervalId);
		this.intervalId = setInterval(function(){
			self.update();
		},1000);
	},
	update:function()
	{
		this.time = (new Date().getTime()/1000 - this.startTime);
		var seconds = Math.floor(this.time)%60;
		if(seconds<10)seconds="0"+seconds;
		this.label.title = Math.floor(this.time/60)+":"+seconds;
		this.draw();
	},
	setTime:function(){

	},
	getTime:function(){
		return this.time;
	},
	draw:function(canvas)
	{
		this.canvas.fillStyle=this.color;
		this.canvas.fillRect(this.x*CANVAS_WIDTH,this.y*CANVAS_HEIGHT,this.w*CANVAS_WIDTH,this.h*CANVAS_HEIGHT);
		
		this.label.draw(this.canvas);
	}
}


function GUITimer2(x,y,w,h)
{
	this.x=x;
	this.y=y;
	this.w=w;
	this.h=h;
	this.startTime;
	this.time;
	this.color = "black"
	this.label = new GUILabel(x+w/2,y+h*.6,w,h,"0","white");
	this.start();
}


GUITimer2.prototype = {
	start:function(){
		this.startTime = new Date().getTime()/1000;
		var self=this;
		if(this.intervalId)clearInterval(this.intervalId);
		this.intervalId = setInterval(function(){
			self.update();
		},1000);
	},
	stop:function(){
		this.update();
		if(this.intervalId)clearInterval(this.intervalId);
	},
	resume:function()
	{
		this.startTime = new Date().getTime()/1000 - this.time;
		var self=this;
		if(this.intervalId)clearInterval(this.intervalId);
		this.intervalId = setInterval(function(){
			self.update();
		},1000);
	},
	update:function()
	{
		this.time = (new Date().getTime()/1000 - this.startTime);
		var seconds = Math.floor(this.time)%60;
		if(seconds<10)seconds="0"+seconds;
		this.label.title = Math.floor(this.time/60)+":"+seconds;
		// this.draw();
	},
	setTime:function(){

	},
	getTime:function(){
		return this.time;
	},
	draw:function(canvas)
	{
		canvas.fillStyle=this.color;
		canvas.fillRect(this.x*CANVAS_WIDTH,this.y*CANVAS_HEIGHT,this.w*CANVAS_WIDTH,this.h*CANVAS_HEIGHT);
		
		this.label.draw(canvas);
	}
}


function GUIMedalDisplay(x,y,w,h,controller)
{
	this.x=x;
	this.y=y;
	this.w=w;
	this.h=h;
	this.nameLabel = new GUILabel(x+w/2,y+h/4,w*.9,h/2,"","#fff");
	this.descriptionLabel = new GUILabel(x+w/2,y+h*3/4,w*.9,h/2,"","#fff");
	this.color = "#333";
	this.active = false;
	this.displayTime = 3000;
	this.animationTime = 500;
	this.state=0;
	this.time=0;
	this.dt = 1000/60;
	this.controller=controller;
}

GUIMedalDisplay.prototype = {
	draw:function(canvas)
	{
		if(!this.active)return;
		var x = this.x*CANVAS_WIDTH;
		var y = this.y*CANVAS_HEIGHT;
		var w = this.w*CANVAS_WIDTH;
		var h = this.h*CANVAS_HEIGHT;
		var dy =0;
		if(this.state==0||this.state==2)
		{
			var dy =this.time/this.animationTime*h;
			if(this.state==0)dy=-h+dy;
			else dy=-dy;
		}
		dy=-dy;
		canvas.save();
		canvas.translate(0,dy);

		canvas.fillStyle=this.color;
		canvas.fillRect(x,y,w,h);
		this.nameLabel.draw(canvas);
		this.descriptionLabel.draw(canvas);

		canvas.restore();
	},
	displayLoop:function(canvas)
	{
		this.time+=this.dt;
		if(this.state==0&&this.time>=this.animationTime)
		{
			this.time=0;
			this.state=1;
		}
		else if(this.state==1&&this.time>=this.displayTime)
		{
			this.time=0;
			this.state=2;
		}
		else if(this.state==2&&this.time>=this.animationTime)
		{
			this.stopDisplay();
		}
		// this.controller.draw();
		// this.draw(canvas);
	},
	fixedUpdate:function()
	{
		if(this.active)this.displayLoop();
	},
	startDisplay:function(canvas, medal, image)
	{
		if(this.active)
		{
			this.stopDisplay();
		}
		this.nameLabel.title = "Medal Unlocked: "+medal.name;
		this.descriptionLabel.title = medal.description;
		this.active=true;
		var self= this;
		this.time=0;
		this.state=0;
		// this.intervalId = setInterval(function(){
		// 	self.displayLoop(canvas);
		// },this.dt);
	},
	stopDisplay:function()
	{
		this.active=false;
		// if(this.intervalId)
		// 	clearInterval(this.intervalId);
		this.time=0;
		this.state=0;
	}
}


function GUIRect(x,y,w,h,color)
{
	this.x=x;
	this.y=y;
	this.w=w;
	this.h=h;
	this.color = color;
	this.active=true;
}

GUIRect.prototype.draw = function(canvas)
{
	if(this.active==false)return;
	canvas.fillStyle=this.color;
	var x = this.x*CANVAS_WIDTH;
	var y = this.y*CANVAS_HEIGHT;
	var w = this.w*CANVAS_WIDTH;
	var h = this.h*CANVAS_HEIGHT;
	canvas.fillRect(x,y,w,h);
}




function createButtonSpriteSheet(w,h,button)
{
	// var w = 100;
	// var h = 50;
	var sprites = 3;
	var sheetElement = document.createElement("canvas");
	var tempCanvas = sheetElement.getContext("2d");
	sheetElement.mySpriteCount = sprites;
	sheetElement.mySpriteWidth = w;
	sheetElement.mySpriteHeight= h;
	sheetElement.width = w*sprites;
	sheetElement.height = h*sprites;
	
	var color = button.color;

	var roundRadius = h/3;
	var padx = h/40;
	var pady = padx;

	

	function styleDraw(x,lc){
		tempCanvas.save();
		setGradient(tempCanvas,x,0,h,"#fff","#999");
		drawRoundedRect(tempCanvas, x,0,w,h, roundRadius);
		tempCanvas.fillStyle=color;
		drawRoundedRect(tempCanvas, x+padx,pady, w-padx*2,h-pady*2,roundRadius);

		tempCanvas.globalAlpha = .5;
		tempCanvas.fillStyle="#fff";
		drawRoundedRect(tempCanvas, x+w/2,pady*2, w/3,h/10, h/20);
		tempCanvas.beginPath();
		tempCanvas.rect(x,h/2,w,h/2);
		tempCanvas.clip();
		setGradient(tempCanvas,x,h/4,h,color,"#000");
		tempCanvas.globalAlpha=.5;
		drawRoundedRect(tempCanvas, x+padx,pady,w-padx*2,h-pady*2, roundRadius);
		tempCanvas.restore();

		tempCanvas.save();
		tempCanvas.translate(x+w/2,0+h/2);
		// if(lc){button.label.color = "#fff";}
		button.label.draw(tempCanvas,1000,1000);
		tempCanvas.restore();
	}
	styleDraw(0);
	styleDraw(w,true);
	styleDraw(w+w);

	tempCanvas.save();
	tempCanvas.globalAlpha=.25;
	tempCanvas.fillStyle="#fff";
	drawRoundedRect(tempCanvas,w+padx,pady,w-padx*2,h-pady*2, roundRadius);
	tempCanvas.globalAlpha=.75;
	tempCanvas.fillStyle="#555";
	drawRoundedRect(tempCanvas,w*2+padx,pady,w-padx*2,h-pady*2,roundRadius);
	tempCanvas.restore();



	return sheetElement;
}

function shine(canvas, x,y,w,h, m,l)
{
	var d = x;
	// x=0;
	// w=l;
	canvas.save();
	canvas.globalCompositeOperation="source-atop";
	canvas.beginPath();
	canvas.moveTo(x,y);
	canvas.lineTo(x+w,y);
	canvas.lineTo(x+w+m,y+h);
	canvas.lineTo(x+m, y+h);
	canvas.closePath();
	canvas.fillStyle="#fff";

	// var grd = canvas.createLinearGradient(0,m,l,0);
	// grd.addColorStop(0,"rgba(255,255,255,.1)");
	// grd.addColorStop(.5,"rgba(255,255,255,255)");
	// grd.addColorStop(1,"rgba(255,255,255,.1)");
	// canvas.fillStyle=grd;

	canvas.globalAlpha=.7;
	// canvas.fillRect(0,0,100,100);
	canvas.fill();
	canvas.restore();
}



function GUIButton(x,y,w,h,title,callback,center, stretch, color,callback2)
{
	this.x=x;
	this.y=y;
	this.w=w;
	this.h=h;
	this.active=true;
	// this.color="#adf";
	if(!color)color = "#5af";
	this.color=color;
	if(!center)
	{
		this.x+=w/2;
		this.y+=h/2;
	}
	this.callback=callback;
	// this.color = '#24a';
	// this.color2 = "#33a";
	// this.color3 = "#227";
	this.title=title;
	this.label = new GUILabel(0,0,w*.9,h*.5,title);
	this.label.draw = labelSizedDraw;
	this.temp=-50;
	this.callback2=callback2;
	this.mouseDown = function(x,y)
	{
		this.held=true;
		if(this.callback2)this.callback2(x,y);
	}
	this.mouseUp = function(x,y)
	{
		if(this.contains(x,y)&&this.held)
		this.callback(x,y);
		this.held=false;
	}
	// this.draw = buttonSizeDraw;
	this.image = createButtonSpriteSheet(w*1000,h*1000,this);
	this.maintainRatio = !stretch;
	this.draw = function(canvas)
	{
		if(!this.active)return;
		if(this.label.title!=this.title)
		{
			this.title = this.label.title;
			this.image=createButtonSpriteSheet(this.w*1000,this.h*1000,this);
		}
		var x = this.x*CANVAS_WIDTH;
		var y = this.y*CANVAS_HEIGHT;
		var w = this.w*CANVAS_WIDTH;
		var h = this.h*CANVAS_HEIGHT;
		
		if(this.maintainRatio)
		{
			if(CANVAS_WIDTH<CANVAS_HEIGHT)
				h = w* this.h/this.w;
			else
				w = h* this.w/this.h;
		}
		// x-=w/2;
		// y-=h/2;
		var sw = this.image.mySpriteWidth;
		var sh = this.image.mySpriteHeight;
		var frame = 0;
		if(this.hovered)frame=1;
		if(this.held)frame=2;
		canvas.save();
		canvas.translate(x,y);
		if(!this.hovered)canvas.scale(.9,.9);
		// if(this.held)canvas.rotate(Math.PI/8);

		if(this.held)canvas.scale(.95,.95);
		canvas.translate(-w/2,-h/2);
		canvas.drawImage(this.image,frame*sw,0,sw,sh,0,0,w,h);
		// canvas.drawImage(this.image,frame*sw,0,sw,sh,x,y,w,h);
		if(this.hovered&&this.temp>-30&&this.temp<100)
		shine(canvas,-40+this.temp*w/100,0, w/3,h,h/10,w);

		canvas.restore();
		// this.label.draw(canvas);
	}
	this.contains = function(tx,ty){
		var x = this.x*CANVAS_WIDTH;
		var y = this.y*CANVAS_HEIGHT;
		var w = this.w*CANVAS_WIDTH;
		var h = this.h*CANVAS_HEIGHT;
		if(this.maintainRatio)
		{
			if(CANVAS_WIDTH<CANVAS_HEIGHT)
				h = w* this.h/this.w;
			else
				w = h* this.w/this.h;
		}
		x-=w/2;
		y-=h/2;
		return tx>=x&&tx<=x+w&&
			   ty>=y&&ty<=y+h;
	}
	this.fixedUpdate = function()
	{
		if(this.temp>100&&!this.hovered)this.temp=-50;
		if(this.temp>-50)
		{
			this.temp+=10;
		}
		else if(this.hovered)
		{
			this.temp=-40;
		}
	}
}

GUIButton.prototype = GUIClickableTemplate;



function GUIImage(image, x,y,w,h)
{
	this.image=image;
	this.x=x;this.y=y;this.w=w;this.h=h;
}

GUIImage.prototype.draw = function(canvas)
{
	canvas.drawImage(this.image, this.x,this.y,this.w,this.h);
}