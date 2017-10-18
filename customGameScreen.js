
function timeString(v)
{
	var m = Math.floor(v/60);
	var s = v%60;
	if(m==0)m="0";
	if(s==0)s="00";
	else if(s<10)s="0"+s;
	return m+":"+s;
}

function GameScreen()
{
	this.running = false;
	var pixelSize = 6;
	this.game = new Game(pixelSize);
	pixelSize = 5;
	this.player = new Platformer(0,0,pixelSize*6,pixelSize*8,new ImageDrawer(IMAGES["guy6"],6,8),5,this.game);
	this.displaysTime=false;
	this.savedTime=0;
	this.time=0;
	this.timeStop=false;
	this.level=0;
	this.displayOffset = CANVAS_HEIGHT/2;
	this.levelTitle="";//"WASD or Arrow Keys to Move";
}

GameScreen.prototype = new Screen();

// GameScreen.prototype.onInit = function()
// {
// 	this.timer.start();
// }

GameScreen.prototype.onInit = function()
{
	this.game.start(levelList,this.player,this.level);
	this.running=true;
	this.time=0;
	this.win=false;
	var self = this;
	this.timeStop=false;
	this.game.levelEnd = function()
	{
		
	}
	this.loadLevel(0);
	keyHandler = this;
}
GameScreen.prototype.load=function(level, time)
{
	this.level=level;
	this.savedTime=time;
}
GameScreen.prototype.draw = function(canvas)
{
	this.drawGame(canvas);
	this.drawGUI(canvas);
}
GameScreen.prototype.loadLevel = function(ind)
{
	
}
GameScreen.prototype.drawGame = function(canvas)
{
	this.game.draw(canvas);
	canvas.save();
	canvas.textAlign = "center";
	canvas.fillStyle = "#fff";
	var w = CANVAS_WIDTH/20;
	var h = w;//CANVAS_HEIGHT/10;
	var time;
	canvas.font=w+'px '+"Impact";
	// if(this.time)time=this.time;
	if(!this.timeStop)
	this.time = new Date().getTime()-this.game.time+this.savedTime;
	time = this.time;

	canvas.fillText(""+(this.game.levelIndex+1), w/2,h*1.5, w,h/2);
	if(this.displaysTime)
		canvas.fillText(""+timeString(Math.floor(time/1000)), w,h*3, w*2,h/2);
	// canvas.fillText("Controls", 100,100,500,10);
	

	this.displayOffset += (0-this.displayOffset)/20;
	canvas.fillText(this.levelTitle,  w*7,h*1.5+this.displayOffset, w*10,h/2);

	canvas.restore();
}

GameScreen.prototype.handleKeyUp = function(k)
{
}
GameScreen.prototype.handleKeyDown = function(k)
{
	if(k==32)this.player.jump();
	if(k==82)this.game.restartLevel();
	if(k==87||k==38)this.player.tryPickUp();
	if(k==84)this.displaysTime=!this.displaysTime;
	if(keys[67]&&k==78)
	{
		this.game.nextLevel();
		this.savedTime+=60000;
	}
	if(keys[67]&&k==66){
		this.game.levelIndex-=2;
		this.game.nextLevel();
	}

	if(k==77&&!keys[77])
	{
		toggleMusic();
	}
	if(k==78&&!keys[78])
	{
		toggleSound();
	}
}
GameScreen.prototype.handleHeldKeys = function(keys)
{
	var dx = 0;

	if(keys[65]||keys[37])dx-=1;
	if(keys[68]||keys[39])dx+=1;
	this.player.setMoveX(dx);
	this.player.setCrouch(keys[83]||keys[40]);
	// if(keys[87]||keys[38])this.player.jump();
	
	this.player.lookUp=(keys[87]||keys[38])
	// if(keys[83]||keys[40])this.player.moveY(1);
}
GameScreen.prototype.fixedUpdate = function()
{
	this.handleHeldKeys(keys);
	this.game.update();
	// if(this.player.y+this.player.h/2>600)
	// {
	// 	this.player.groundCollide(600);
	// }
	if(this.game.levelIndex==levelList.length-1)
	{
		this.gameComplete();
	}
}