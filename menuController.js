//Niborious
//Brian Dizon	
function timeString2(v)
{
	var m = Math.floor(v/60);
	var s = v%60;
	s=s.toFixed(2);
	if(m==0)m="0";
	if(s==0)s="00";
	else if(s<10)s="0"+s;
	return m+":"+s;
}

function addLinesOfLabels(theScreen, x,y,w,h,dh,lines,color)
{
	for(var i = 0;i<lines.length;i++)
	{
		theScreen.addGuiElement(new GUILabel(x,y+dh*i,w,h,lines[i],color));
	}
}
var frameCount=0;
function MenuController(canvas)
{
	this.currentScreen;
	
	var guiCanvasElement = document.createElement('canvas');
	guiCanvasElement.width = CANVAS_WIDTH;
	guiCanvasElement.height = CANVAS_HEIGHT;
	this.guiCanvasElement = guiCanvasElement;

	this.guiCanvas = guiCanvasElement.getContext("2d");
	this.canvas=canvas;
	this.clears=true;
	this.persistentGUI = [];

	var self=this;
	this.mousePos={x:0,y:0};

	var menuScreen = new Screen();
	var gameScreen=new GameScreen();
	var scoreScreen = new Screen();
	var editorScreen = new EditorScreen();
	this.currentScreen=menuScreen;
	this.menuScreen = menuScreen;

	var labelColor = "#fff";

	this.animating = false;

	this.medalDisplay = new GUIMedalDisplay(.5,.9,.5,.1,this);

	this.persistentGUI.push(this.medalDisplay);

	var data = loadData();

	menuScreen.addGuiElement(new GUILabel(.5,.3,.9,.2,"I Puzzle Good",labelColor,true));
	menuScreen.addGuiElement(new GUIButton(.5,.5,.4,.15,"New", function(){
		gameScreen.load(0,0);
		self.setScreen(gameScreen);	
	},true));
	if(data.level!=0)
	{
		menuScreen.addGuiElement(new GUIButton(.5,.65,.4,.15,"Continue", function(){
			data = loadData();
			gameScreen.load(data.level, data.time);
			self.setScreen(gameScreen);
		},true));
	}
	menuScreen.addGuiElement(new GUIButton(.8,.9,.4,.15,"Press F for Fullscreen", function()
	{
		toggleFullscreen();
	},true));

	
	menuScreen.addGuiElement(new GUIButton(.5,.9,.4,.15, "Level Editor", function(){
		self.setScreen(editorScreen);
	},true));

	editorScreen.addGuiElement(new GUIButton(.1,.05,.2,.1, "Back", function(){
		self.setScreen(menuScreen);
	},true));
	editorScreen.addGuiElement(new GUIButton(.9,.05,.2,.1, "Play", function(){
		// self.setScreen(menuScreen);
		self.setScreen(gameScreen);
		gameScreen.customLoad([editorScreen.level]);
		gameScreen.game.levelEnd = function()
		{
			self.setScreen(editorScreen);
		}
	},true));

	gameScreen.addGuiElement(new GUIButton(.9,.05,.2,.1, "Back", function(){
		self.setScreen(self.prevScreen);
	},true))
	
	// menuScreen.addGuiElement(new GUILabel(.5,.8,.9,.025, "WASD or Arrow keys to move", labelColor, true));
	// menuScreen.addGuiElement(new GUILabel(.5,.85,.9,.025, "Space to Jump       R to Restart", labelColor, true));
	// menuScreen.addGuiElement(new GUILabel(.5,.9,.9,.025, "Up to go through Doors and Pick up Blocks", labelColor, true));
	// menuScreen.addGuiElement(new GUILabel(.5,.95,.9,.025, "Down to drop blocks", labelColor, true));
	scoreScreen.addGuiElement(new GUIButton(.25,.1,.4,.1, "Main Menu", function(){
		self.setScreen(menuScreen);
	},true));
	scoreScreen.addGuiElement(new GUILabel(.5,.3,.8,.1,"Score:", labelColor, true));
	scoreScreen.timeLabel = new GUILabel(.5,.5,.8,.1,"10:00",labelColor, true);
	scoreScreen.addGuiElement(scoreScreen.timeLabel);
	scoreScreen.score=1000000;

	this.loginLabel = (new GUILabel(.2,.8,.4,.05, "Login for medals and scoreboards",labelColor));
	this.loginButton = (new GUIButton(.05,.85,.2,.1, "LOGIN", function()
	{
		if(!self.loggedIn)
			requestLogin();
		else
			logOut();
		self.loginButton.clickable=false;
	}));
	menuScreen.addGuiElement(this.loginLabel);
	menuScreen.addGuiElement(this.loginButton);
	scoreScreen.addGuiElement(this.loginLabel);
	scoreScreen.addGuiElement(this.loginButton);
	initSession();


	
	gameScreen.postScore = function()
	{
		postScore("Time", gameScreen.time);
		unlockMedal("Puzzle Good");
	}
	gameScreen.gameComplete = function()
	{
		scoreScreen.score = gameScreen.time;
		scoreScreen.timeLabel.title = timeString2(gameScreen.time/1000);
		self.setScreen(scoreScreen);
		postScore("Time", gameScreen.time);
		unlockMedal("Puzzle Good");
	}

	scoreScreen.addGuiElement(new GUIButton(.5,.65,.8,.1,"Post Score", function(){
		if(!this.loggedIn)
			requestLogin(function(){
				postScore("Time", scoreScreen.score);
				unlockMedal("Puzzle Good");
			});
		else
		{
			postScore("Time", scoreScreen.score);
			unlockMedal("Puzzle Good");
		}

	},true));

	// var musicToggle = new GUIButton(.95,.05,.1,.05, "Music", function(){
	// 	toggleMusic();
	// 	this.label.title = musicMute ? "Music Off" : "Music On";
	// }, true);
	// var soundToggle = new GUIButton(.85,.05,.1,.05, "Sounds", function(){
	// 	toggleSound();
	// 	this.label.title = soundsEnabled ? "Sounds On" : "Sounds Off";
	// }, true);
	// menuScreen.addGuiElement(musicToggle);
	// menuScreen.addGuiElement(soundToggle);
	// scoreScreen.addGuiElement(musicToggle);
	// scoreScreen.addGuiElement(soundToggle);
	// gameScreen.addGuiElement(musicToggle);
	// gameScreen.addGuiElement(soundToggle);

	// this.FPS = 60;
	// this.intervalId = setInterval(function()
	// {
	// 	self.fixedUpdate();
	// 	self.draw();
	// 	frameCount++;
	// }, 1000/this.FPS);
	function step()
	{
		self.fixedUpdate();
		self.draw();
		frameCount++;
		window.requestAnimationFrame(step);
	}

	window.requestAnimationFrame(step);
}



MenuController.prototype = {
	resize:function(w,h)
	{
		this.guiCanvasElement.width=w;
		this.guiCanvasElement.height=h;
		this.currentScreen.resize(w,h);
		this.guiCanvas.imageSmoothingEnabled = false;
		this.guiCanvas.mozImageSmoothingEnabled=false;
		this.guiCanvas.msImageSmoothingEnabled = false;
		this.guiCanvas.oImageSmoothingEnabled=false;

		this.guiCanvas.webkitImageSmoothingEnabled=false;
		this.draw();
	},
	fixedUpdate:function()
	{
		this.currentScreen.fixedUpdate();
		for(var i = 0; i< this.currentScreen.gui.length;i++)
		{
			if(this.currentScreen.gui[i].fixedUpdate)
			this.currentScreen.gui[i].fixedUpdate();
		}
		for(var i = 0; i< this.persistentGUI.length;i++)
		{
			if(this.persistentGUI[i].fixedUpdate)
			this.persistentGUI[i].fixedUpdate();
		}
	},
	draw:function()
	{
	// 	if(this.clears)
	// 	{
			this.canvas.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
	// 		// this.canvas.fillStyle = "#fff";
	// 		// this.canvas.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
	// 	}
	// 	this.guiCanvas.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
	// 	this.currentScreen.draw(this.guiCanvas);
	// 	// if(this.currentScreen.background)
	// 	// {
	// 	// 	this.currentScreen.background.draw(this.canvas);
	// 	// }
	// 	this.canvas.drawImage(this.guiCanvasElement,0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
		

		this.currentScreen.draw(this.canvas);

		this.persistentGUI.forEach(function(e){
			e.draw(this.canvas);
		});
	},
	setScreen:function(s, smooth)
	{
		this.handleClickUp(-1,-1);
		// if(this.currentScreen!=s)
		if(!smooth)
		{
			this.currentScreen.onLeave();
			s.onInit();
		}
		this.prevScreen=this.currentScreen;
		this.currentScreen=s;
		// this.draw(canvas);
		this.handleCursorMove(this.mousePos.x,this.mousePos.y);

	},
	moveToScreen:function(s)
	{
		this.handleClickUp(-1,-1);
		if(s!=this.currentScreen)
			this.prevScreen = this.currentScreen;
		this.currentScreen = s;
		this.handleCursorMove(-1,-1);
		if(this.currentScreen.onMoveTo)this.currentScreen.onMoveTo();
		this.handleCursorMove(this.mousePos.x,this.mousePos.y);
	},
	returnToPrev:function()
	{
		this.handleCursorMove(-1,-1);
		this.handleClickUp(-1,-1);
		this.currentScreen = this.prevScreen;
		this.handleCursorMove(this.mousePos.x,this.mousePos.y);
	},
	handleKeyDown:function(e)
	{
		if(this.currentScreen)this.currentScreen.handlePress(e);
	},
	handleKeyUp:function(e)
	{
		if(this.currentScreen)this.currentScreen.handleRelease(e);
	},
	handleGUIClicking:function(x,y, callback)
	{
		if(this.currentScreen.animating)return;
		var gui = this.currentScreen.gui;
		for( var i = 0; i < gui.length; i++)
		{
			var g = gui[i];
			if(!g.clickable)continue;
			callback(g,x,y);
		}
		this.draw();
	},
	handleClickDown:function(x,y)
	{
		this.handleGUIClicking(x,y, function(g,mx,my){
			if(g.contains(mx,my))g.mouseDown(mx,my);
		});
		this.currentScreen.handleMouseDown(x,y);
	},
	handleClickUp:function(x,y,right)
	{
		this.handleGUIClicking(x,y,function(g,mx,my){
			if(g.held||g.contains(mx,my))g.mouseUp(mx,my,right);
		})
		this.currentScreen.handleMouseUp(x,y);
	},
	handleCursorMove:function(x,y)
	{
		this.mousePos={x:x,y:y};
		this.handleGUIClicking(x,y, function(g,mx,my){
			if(g.held||g.contains(mx,my))
			{
				g.mouseMove(mx,my);
				g.hovered=true;
			}
			else if(g.hovered)
			{
				g.hovered=false;
				g.mouseLeave(mx,my);
			}
		});
		this.currentScreen.handleMouseMove(x,y);
	},
	onLoggedIn:function(name)
	{
		this.loginLabel.title = "Signed in As: " + name;
		this.loginButton.label.title = "logout";
		this.loggedIn=true;
		this.loginButton.clickable=true;

		this.draw();

	},
	onLoggedOut:function()
	{
		this.loginLabel.title = "Login for medals and scoreboards";
		this.loginButton.label.title = "LOGIN";
		this.loggedIn=false;
		this.loginButton.clickable=true;

		this.draw();
	},
	displayMedalUnlock:function(medal)
	{
		this.medalDisplay.startDisplay(this.canvas, medal);
		console.log(medal.description);
	},
	onSessionExpired:function(callback)
	{
		this.onLoggedOut();
		// if(this.gameScreen.pauseButton&&!this.gameScreen.paused)this.gameScreen.pauseButton.callback();
		// this.postLoginQue = callback;
		// this.moveToScreen(this.expiredScreen);
	}
}
