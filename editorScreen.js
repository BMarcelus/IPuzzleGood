

function EditorScreen()
{
	this.pixelSize=6;
	this.blocks = [];
	this.startPoint = {x:0,y:0};
	this.endPoint = {x:0,y:0};
	this.level = [];
	this.drawGrid=true;
	this.cursor = {x:0,y:0};
	this.currentBlock = 0;
	this.currentBlockType = 0;
	this.width = 11;
	this.height = 11;
	this.level=[];
	for(var i =0;i<this.height;i++)
	{
		var row = [];
		var row2 = [];
		for(var j=0;j<this.width;j++)
		{
			if(j==0||i==0||i>=this.height-2||j==this.width-1)
			{
				row.push(1);
				row2.push(new GroundBlock(j,i,this.pixelSize,this));
			}
			else
			{
				row.push(0);
				row2.push(0);
			}
		}
		this.level.push(row);
		this.blocks.push(row2);
	}
	this.addBlock(1,8, -1);
	this.addBlock(8,8,2);

	this.blockTypes = [-1,0];
	for(var i =1;i<14;i++){
		this.blockTypes.push(blockOfType(i, i+2,0,this.pixelSize,this));
	}
	var self = this;
	this.addGuiElement(new GUIButton(.1,.15,.2,.1, "Clear", function(){
		self.reset();
	},true));
	this.addGuiElement(new GUIButton(.1,.25,.2,.1, "Print", function(){
		self.print();
	},true));
}
EditorScreen.prototype = new Screen();

EditorScreen.prototype.reset = function(){
	for(var i =0;i<this.height;i++)
	{
		for(var j=0;j<this.width;j++)
		{
			if(j==0||i==0||i>=this.height-2||j==this.width-1)
			{

			}
			else
			{
				this.level[i][j]=0;
				this.blocks[i][j]=0;
			}
		}
	}
	this.addBlock(1,8, -1);
	this.addBlock(8,8,2);
}
EditorScreen.prototype.print = function(){
	// console.log(this.level);
	var map = ['s',0,1,'e','b','W','w','d','B',8,9,'a','i','I','p'];

	var result = '[\n';
	for(var j=0;j<this.height;j++){
		result+=('\t[')
		for(var i=0;i<this.width;i++){
			var c=this.level[j][i]; 
			c = map[c+1]
			result+=(c+',');
		}
		result+=('],\n');
	}
	result+=('],');
	console.log(result);
}
EditorScreen.prototype.onInit=function()
{
	
	keyHandler = this;
}

EditorScreen.prototype.draw = function(canvas)
{
	// for(var i =0;i<this.blocks.length;i++)
	// {
	// 	this.blocks[i].draw(canvas);
	// }
	canvas.save();
	canvas.translate(CANVAS_WIDTH/2,CANVAS_HEIGHT/2);
	var s = Math.min(CANVAS_WIDTH/( 13*8*this.pixelSize), CANVAS_HEIGHT/(14*8*this.pixelSize));
	canvas.scale(s,s);
	canvas.translate(-this.width/2*8*this.pixelSize, -this.height/2*8*this.pixelSize);
	this.scale = s;
	this.xoffset = CANVAS_WIDTH/2-this.width/2*8*this.pixelSize*s;
	this.yoffset = CANVAS_HEIGHT/2- this.height/2*8*this.pixelSize*s;

	var tileSize = this.pixelSize*8;

	for(var i=0;i<this.height;i++)
	{
		for(var j=0;j<this.width;j++)
		{
			var t = this.blocks[i][j];
			if(t==-1)
			{
				canvas.fillStyle = "green";
				var pad = this.pixelSize*2;
				canvas.fillRect(j*tileSize+pad,i*tileSize+pad,tileSize-pad*2,tileSize-pad*2);
			}
			else if(t!=0)
				t.draw(canvas);
			if(this.drawGrid)
			{
				canvas.beginPath();
				canvas.strokeStyle = "black";
				if(this.cursor.x==j&&this.cursor.y==i)
					canvas.strokeStyle="White";
				canvas.rect(j*tileSize,i*tileSize,tileSize,tileSize);
				canvas.stroke();
			}
		}
	}
	canvas.restore();
	canvas.fillStyle="black";
	var margin = tileSize/2;
	// canvas.fillRect(4*tileSize,0,tileSize+margin*2,tileSize+margin*2);
	canvas.save();
	canvas.translate(CANVAS_WIDTH/2-8*tileSize,CANVAS_HEIGHT-tileSize);
	for(var i =0;i<this.blockTypes.length;i++)
	{
		var cblock = this.blockTypes[i];
		
		if(cblock==-1)
		{
			canvas.fillStyle = "green";
			var pad = this.pixelSize*2;
			canvas.fillRect(tileSize+pad,0*tileSize+pad,tileSize-pad*2,tileSize-pad*2);
		}
		else if(cblock!=0)
			cblock.draw(canvas);
		if(i==this.currentBlockType+1){
			canvas.strokeStyle="white";
			canvas.lineWidth = 5;
			canvas.strokeRect(tileSize*(i+1), 0, tileSize, tileSize);
		}
	}
	// if(this.currentBlock==-1)
	// {
	// 	canvas.fillStyle = "green";
	// 	var pad = this.pixelSize*2;
	// 	canvas.fillRect(4*tileSize+pad,0*tileSize+pad,tileSize-pad*2,tileSize-pad*2);
	// }
	// else if(this.currentBlock!=0)
	// 	this.currentBlock.draw(canvas);
	
	canvas.restore();
	this.drawGUI(canvas);
}


EditorScreen.prototype.addBlock=function(x,y,t)
{
	this.level[y][x] = t;
	// this.blocks[i].push(blockOfType(t,x,y,this.pixelSize,this));
	if(t<=0)this.blocks[y][x]=t;
	else
	this.blocks[y][x] = blockOfType(t,x,y,this.pixelSize,this);
}

EditorScreen.prototype.handleMouseMove=function(x,y)
{
	var tx = Math.floor((x-this.xoffset)/(this.pixelSize*8*this.scale));
	var ty = Math.floor((y-this.yoffset)/(this.pixelSize*8*this.scale));
	if(tx>=0&&tx<this.width&&ty>=0&&ty<this.height)
	{
		this.cursor = {x:tx,y:ty};
	}
}
EditorScreen.prototype.handleMouseDown=function(x,y)
{
	var tx = Math.floor((x-this.xoffset)/(this.pixelSize*8*this.scale));
	var ty = Math.floor((y-this.yoffset)/(this.pixelSize*8*this.scale));
	if(tx>=0&&tx<this.width&&ty>=0&&ty<this.height)
	{
		this.cursor = {x:tx,y:ty};
		if(this.level[ty][tx] == this.currentBlockType)
		{
			this.addBlock(tx,ty,0);
		}
		else
			this.addBlock(tx,ty, this.currentBlockType);
		return;
	}
	var tileSize = this.pixelSize*8;
	if(y>CANVAS_HEIGHT-tileSize){
		tx = Math.floor( (x-(CANVAS_WIDTH/2-6*tileSize))/(tileSize))
		if(tx>=-1&&tx<14){
			this.currentBlockType=tx;
			this.currentBlock=this.blockTypes[tx];
		}
	}
}

EditorScreen.prototype.cycleBlockSelect = function(d)
{
	this.currentBlockType +=d;
	if(this.currentBlockType>13)this.currentBlockType=-1;
	if(this.currentBlockType<-1)this.currentBlockType=13;
	// if(this.currentBlockType<=0)this.currentBlock=this.currentBlockType;
	// else
	// this.currentBlock = blockOfType(this.currentBlockType, 4,0,this.pixelSize,this);
	this.currentBlock = this.blockTypes[this.currentBlockType];
}


EditorScreen.prototype.handleKeyDown=function(k)
{

	if(k==68||k==39)
		this.cycleBlockSelect(1);
	else if(k==65||k==37)
		this.cycleBlockSelect(-1);
}

















