//Niborious
//Brian Dizon

function Screen()
{
	this.gui=[];
}

Screen.prototype = {
	handleKeyDown:function(k)
	{

	},
	handleKeyUp:function(k)
	{

	},
	handleMouseDown:function(x,y){},
	handleMouseUp:function(x,y){},
	handleMouseMove:function(x,y){},
	onInit:function()
	{

	},
	onLeave:function()
	{

	},
	addGuiElement:function(e)
	{
		this.gui.push(e);
	},
	resize:function(w,h)
	{
		
	},
	drawGUI:function(canvas)
	{
		for(var i =0;i<this.gui.length;i++)
		{
			this.gui[i].draw(canvas);
		}
	},
	draw:function(canvas)
	{
		this.drawGUI(canvas);
	},
	fixedUpdate:function()
	{
		
	}
}