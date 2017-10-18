

function Entity()
{

}
Entity.prototype = {
	update:function(){},
	draw:function(canvas){}
}

function Drawable()
{

}
Drawable.prototype.draw = function(canvas, x,y,w,h)
{
	// canvas.fillStyle = "red";
	// canvas.fillRect(x,y,w,h);
}
function ImageDrawer(image, spriteWidth, spriteHeight,offx, offy)
{
	this.image 		 	= image;
	this.spriteWidth 	= spriteWidth;
	this.spriteHeight	= spriteHeight;
	this.frameIndex = 0;
	this.animationIndex = 0;
	// if(!offx)offx=0;
	// if(!offy)offy=0;
	// this.offx=offx;
	// this.offy=offy;
}
ImageDrawer.prototype.draw = function(canvas, x,y,w,h)
{
	canvas.drawImage(this.image,this.frameIndex*this.spriteWidth,this.animationIndex*this.spriteHeight
		,this.spriteWidth, this.spriteHeight, x,y,w,h);
}

// function collides(a, b) {
//   return a.x < b.x + b.width &&
//     a.x + a.width > b.x &&
//     a.y < b.y + b.height &&
//     a.y + a.height > b.y;
// }
function collides(a, b) {
  return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}

function Movable(x,y,w,h, drawable, speed)
{
	this.x=x;
	this.y=y;
	this.w=w;
	this.h=h;
	if(!drawable)drawable=new Drawable();
	this.drawable = drawable;
	this.speed = speed;


	this.flipped = false;
	this.vx=0;
	this.vy=0;
	this.mx=0;
	this.my=0;
}
Movable.prototype={
	update:function(){
		this.vx+=(this.mx*this.speed-this.vx)/3;
		this.vy+=(this.my*this.speed-this.vy)/3;
		this.x+=this.vx;
		this.y+=this.vy;
		this.mx=0;
		this.my=0;	
	},
	draw:function(canvas)
	{
		canvas.save();
		canvas.translate(this.x,this.y);
		if(this.flipped)canvas.scale(-1,1);
		this.drawable.draw(canvas,-this.w/2,-this.h/2,this.w,this.h);
		canvas.restore();
	},
	move:function(dx,dy)
	{
		this.mx+=dx;
		this.my+=dy;
		if(dx>0)this.flipped=false;
		if(dx<0)this.flipped=true;
	},
	moveX:function(dx)
	{
		this.mx+=dx;
		if(dx>0)this.flipped=false;
		if(dx<0)this.flipped=true;
	},
	moveY:function(dy)
	{
		this.my+=dy;
	}
}

function Platformer(x,y,w,h,drawable,speed, game)
{
	this.x=x;
	this.y=y;
	this.w=w;
	this.h=h;
	this.p = h/8;
	this.speed=speed;
	if(!drawable)drawable=new Drawable();
	this.drawable=drawable;

	this.iax = 0;
	this.iay = 0;
	this.vx=0;
	this.vy=0;
	this.mx=0;
	this.ay=.5;
	this.flipped=false;
	this.ax=.2;

	this.crouching = false;
	this.onGround=false;
	this.jumpStrength=8;
	this.game=game;
	this.solid=true;

	this.held = null;
	this.dropping = false;

	this.lastPickUpCollision = null;
	this.frameCount=0;
}
Platformer.prototype = {
	update:function()
	{
		if(this.crouching&&this.onGround)this.mx=0;
		this.vx+=this.iax;
		this.vy+=this.iay;
		this.iax=0;
		this.iay=0;
		var ax = this.ax;
		if(this.mx==0)ax*=1.5;
		else if(this.mx*this.vx<0)ax*=2;
		this.vx = linearlyMoveTo(this.vx,this.mx*this.speed,ax);
		if(this.vy>this.ay*3)this.onGround=false;
		this.vy += this.ay;
		this.safeMoveX(this.vx);
		this.safeMoveY(this.vy);
		// this.safeMoveX();
		// this.x+=this.vx;
		// this.y+=this.vy;
		if(this.held&&this.crouching)this.dropping = true;
		if(this.lookUp)this.dropping=false;
		// if(this.dropping)this.crouching=true;
		// this.dropping=this.crouching;
		if(this.vx==0)this.frameCount==0;
		else this.frameCount++;
		this.pickFrameState();
		if(keys[69])
		{
			console.log(this);
		}
		if(this.held)
		{
			var tx =this.x;//+ (this.w/2+this.held.w/2) * (1-2*this.flipped)*1.2;
			var ty=this.y-this.h/2-this.held.h/2;
			if(this.crouching)
			{
				var dx = (this.w/2+this.held.w/2) * (1-2*this.flipped)*1.2+this.vx;
				// this.vx += (-dx)/150;
				// this.vx = linearlyMoveTo(this.vx,-dx/100,1);
				// if(this.held.vx==0)
				// {
				// 	this.vx = (this.held.x-dx-this.x)/10;
				// }
				tx+=dx;
			}
			if(!this.dropping)
				this.held.vy=(ty-this.held.y)/2;
			this.held.vx=(tx-this.held.x)/2;
			
			var m = this.w;
			
			if(!this.held.held)
			{
				this.held.drop();
				// this.held.vx = (this.w/2+this.held.w/2) * (1-2*this.flipped);
				this.held.vx=this.vx;
				this.held.vy=this.vy;
				this.held = false;
				this.dropping=false;
				return;
			}
			// if(Math.abs(this.held.x-this.x)>this.w/2+this.held.w/2||Math.abs(this.held.y-this.y)>(this.h/2+this.held.h/2)*2)
			var dw = 2;
			if(this.dropping)dw=.9;
			if(Math.abs(this.held.x-this.x)>(this.w/2+this.held.w/2)*dw||Math.abs(this.held.y-this.y)>(this.h/2+this.held.h/2)*2)
			{
				this.held.startDrop();
				// var tx =this.x+ (this.w/2+this.held.w/2) * (1-2*this.flipped)*1.2;
				// var ty=this.y-this.h/2-this.held.h/2;
				// this.held.vx=(tx-this.held.x)/1;
				// this.held.vy=(ty-this.held.y)/1;
			}
			if(this.held.y+this.held.h/2>this.y-this.h/2&&this.dropping)
			{
				this.held.startDrop();
			}
		}
		// if(this.lookUp&&this.lastPickUpCollision&&!this.held)
		// {
		// 	this.held=this.lastPickUpCollision;
		// 	this.held.pickUp();
		// }
	},
	tryPickUp:function()
	{
		if(this.held)return;
		var closest = null;
		var dist = -1;
		for(var i=0;i<this.game.entities.length;i++)
		{
			var o = this.game.entities[i];
			var dx = this.x-o.x;
			var dy = this.y-o.y;
			var ds = dx*dx+dy*dy;
			//Math.abs(o.x-this.x)<this.w*2&&Math.abs(o.y-this.y)<this.h*2
			if(o.pickUpable&&!o.held&&ds<=this.w*this.w*3)
			{
				if(dist == -1 || ds<dist)
				{
					dist = ds;
					closest=o;
				}
			}
		}
		if(closest!=null)
		{
			this.held=closest;
			closest.pickUp();
			this.vy+=2;
		}
	},
	instantaneousAcceleration:function(x,y)
	{
		this.iax += x;
		this.iay += y;
	},
	testCollisions:function(func)
	{
		for(var i = 0; i < this.game.blocks;i++)
		{
			var b = this.game.blocks[i];
			if(collides(b.getHitbox(), this.getHitbox()))
			{
				if(func(b))
				{
					return;
				}
			}
		}
		for(var i = 0; i < this.game.entities;i++)
		{
			var o = this.game.entities[i];
			if(collides(o.getHitbox(), this.getHitbox()))
			{
				if(func(o))
				{
					return;
				}
			}
		}
	},
	safeMoveX:function(dx)
	{
		this.x+=dx;
		// var c = false;
		// c = this.game.blockCollides(this);
		var cs = this.game.getCollisions(this);
		for(var i = 0;i<cs.length;i++)
		{
			var c = cs[i];
			c.collide(this);
			if(c.pickUpable)this.lastPickUpCollision=c;
			var blockbox = c.getHitbox();
			if(c.solid&&c!=this.held)
			{

			
				if(c.steps)
				{
					if(this.y+this.h/2<=blockbox.y+blockbox.height)
					{
					this.y=blockbox.y-this.h/2;
					this.vy=0;
					this.onGround=true;
					break;
					}
				}
				else if(!c.platform)
				{
					if(this.x-dx*2+this.w/2<blockbox.x)
					{
						this.x=blockbox.x-this.w/2;
						this.vx=0;
						break;
					}
					if(this.x-dx*2-this.w/2>blockbox.x+blockbox.width)
					{
						this.x=blockbox.x+blockbox.width+this.w/2;
						this.vx=0;
						break;
					}
				}
			}
			
			// this.collide(c);
			// this.x-=dx;
			// c.collide(this);
		}
	},
	safeMoveY:function(dy)
	{
		this.y+=dy;
		var c = false;
		// c = this.game.blockCollides(this);
		// if(c)
		var cs = this.game.getCollisions(this);
		for(var i = 0; i<cs.length;i++)
		{
			var c = cs[i];
			c.collide(this);
			if(c.pickUpable)this.lastPickUpCollision=c;
			var blockbox = c.getHitbox();
			if(c!=this.held)
			{
				if((c.solid||c.platform)&&this.vy>0&&this.y-dy*2+this.h/2<blockbox.y)
				{
					this.y=blockbox.y-this.h/2;
					this.vy=0;
					this.onGround=true;
				}
				else if(c.solid&&this.y-dy*2-this.h/2>blockbox.y+blockbox.height)
				{
					// this.y-=dy;
					this.y=blockbox.y+blockbox.height+this.h/2;
					this.vy=0;
					// this.y=blockbox.y+blockbox.height+this.h/2;
				}
				// this.collide(c);
				// c.collide(this);
				// this.y-=dy;
			}
		}
	},
	pickFrameState:function()
	{
		if(this.crouching)
		{
			this.drawable.frameIndex=3;
			this.drawable.spriteHeight=5;
			this.h=this.p*5;

		}
		else if(!this.onGround)
		{
			if(this.vy<-1)
			{
				this.drawable.frameIndex=2;
			}
			else if(this.vy>1)
			{
				this.drawable.frameIndex=3;
			}
			else
			{
				this.drawable.frameIndex=0;
			}
		}
		else if(this.lookUp&&Math.abs(this.vx)<2)
		{
			this.drawable.frameIndex=2;
		}
		else if(this.mx!=0||this.vx!=0)
			// this.drawable.frameIndex = Math.floor(this.x/this.speed/8)%2;
			this.drawable.frameIndex = Math.abs(Math.floor(this.frameCount/10))%2;
		else 
			this.drawable.frameIndex=0;
	},
	draw:function(canvas)
	{
		canvas.save();
		canvas.translate(this.x,this.y);
		if(this.drawable.frameIndex==1)canvas.translate(0,-this.h/8);
		if(this.flipped)canvas.scale(-1,1);
		this.drawable.draw(canvas,-this.w/2,-this.h/2,this.w,this.h);
		canvas.restore();
	},
	setMoveX:function(dx)
	{
		this.mx = dx;
		if(this.onGround)
		{
			if(dx>0)this.flipped=false;
			if(dx<0)this.flipped=true;
		}
	},
	groundCollide:function(yval)
	{
		this.y=yval-this.h/2;
		this.vy=0;
		this.onGround=true;
	},
	collide:function(o)
	{
		// if(o.solid)this.solidBlockCollide(o);
		// if(o.pickUpable&&this.lookUp&&!this.held)
		// {
		// 	this.held=o;
		// 	o.pickUp();
		// }

	},
	blockCollide:function(block)
	{
		if(block.solid)this.solidBlockCollide(block);
		else if(block.door&&this.lookUp&&this.onGround)
		{
			block.drawable.frameIndex=1;
			this.held=false;
			this.game.levelEnd();
		}
		else if(block.platform)this.solidBlockCollide(block);
	},
	solidBlockCollide:function(block)
	{
		var blockbox = block.getHitbox();
		if(this.vy>0&&this.y-this.vy*2+this.h/2<blockbox.y||
			(block.steps))
		{
			this.y=blockbox.y-this.h/2;
			this.vy=0;
			this.onGround=true;
		}
		else if(!block.platform)
		{
			// if(this.y-this.vy*2+this.h/2<blockbox.y)
			// {
			// 	this.y=blockbox.y-this.h/2;
			// 	// this.y-=this.vy;
			// 	this.vy=0;
			// }
			if(this.y-this.vy*2-this.h/2>blockbox.y+blockbox.height)
			{
				this.y-=this.vy;
				this.vy=0;
				// this.y=blockbox.y+blockbox.height+this.h/2;
			}
		
			if(this.x-this.vx*2+this.w/2<blockbox.x)
			{
				this.x=blockbox.x-this.w/2;
				this.vx=0;
			}
			if(this.x-this.vx*2-this.w/2>blockbox.x+blockbox.width)
			{
				this.x=blockbox.x+blockbox.width+this.w/2;
				this.vx=0;
			}
		}
		// if(this.x-this.vx+this.w/2<block.x)this.x=block.x-this.w/2;
		// if(this.x-this.vx-this.w/2>block.x+block.width)this.x=block.x+block.width+this.w/2;
	},
	jump:function()
	{
		if(this.onGround)
		this.vy-=this.jumpStrength;
		this.onGround=false;
	},
	setCrouch:function(val)
	{
		if(val)
		{
			this.drawable.frameIndex=3;
			this.drawable.spriteHeight=5;
			this.h=this.p*5;
		}
		else
		{
			this.drawable.spriteHeight=8;
			this.h=this.p*8;
		}
		if(this.crouching&&!val)
		{
			this.y-=1*8;
			if(this.game.blockCollides(this))
			{
				this.y+=1*8;
				this.drawable.frameIndex=3;
				this.drawable.spriteHeight=5;
				this.h=this.p*5;
				return;
			}
		}
		this.crouching=val;
	},
	getHitbox:function()
	{
		return {x:this.x-this.w/2,y:this.y-this.h/2,width:this.w,height:this.h};
	}
}

function Cube(x,y,p,game)
{
	this.r=y;
	this.c=x;
	this.x=(x+.5)*p*8;
	this.y=(y+.5)*p*8;
	this.w=p*5;
	this.rw=p*6;
	this.h=p*6;
	this.drawable=new ImageDrawer(IMAGES["cube"],6,6);
	this.vx=0;
	this.vy=0;
	this.ay=.2;
	this.solid=true;
	this.pickUpable = true;
	this.game=game;
}
Cube.prototype = {
	update:function()
	{
		if(this.onGround||this.vy==0)
			this.vx = linearlyMoveTo(this.vx,0,.5);
		this.vy+=this.ay;
		// this.x+=this.vx;
		// this.y+=this.vy;
		this.safeMoveY(this.vy);
		this.safeMoveX(this.vx);
		this.onGround=false;
	},
	draw:function(canvas)
	{
		canvas.save();
		canvas.translate(this.x,this.y);
		if(this.drawable.frameIndex==1)canvas.translate(0,-this.h/8);
		if(this.flipped)canvas.scale(-1,1);
		this.drawable.draw(canvas,-this.rw/2,-this.h/2,this.rw,this.h);
		canvas.restore();
	},
	groundCollide:function(yval)
	{
		this.y=yval-this.h/2;
		this.vy=0;
		this.onGround=true;
	},
	safeMoveX:function(dx)
	{
		this.x+=dx;
		var cs = this.game.getCollisions(this);
		for(var i =0;i<cs.length;i++)
		{
			var c = cs[i];
			c.collide(this);
			var blockbox = c.getHitbox();
			if(c.solid&&c.held!=this)
			{
				if(c.steps)
				{
					if(this.y+this.h/2<=blockbox.y+blockbox.height)
					{
					this.y=blockbox.y-this.h/2;
					this.vy=0;
					this.onGround=true;
					this.solid=true;
					}
				}
				else if(!c.platform)
				{
					if(this.x-dx*2+this.w/2<blockbox.x)
					{
						this.x=blockbox.x-this.w/2;
						this.vx=0;
					}
					if(this.x-dx*2-this.w/2>blockbox.x+blockbox.width)
					{
						this.x=blockbox.x+blockbox.width+this.w/2;
						this.vx=0;
					}
				}
			}
			
			// this.collide(c);
			// this.x-=dx;
			// c.collide(this);
		}
	},
	safeMoveY:function(dy)
	{
		this.y+=dy;
		var cs = this.game.getCollisions(this);
		for(var i =0;i<cs.length;i++)
		{
			var c = cs[i];
			c.collide(this);
			if(c.held!=this)
			{
				var blockbox = c.getHitbox();
				if((c.solid||c.platform)&&this.vy>0&&this.y-this.vy*2+this.h/2<blockbox.y)
				{
					this.y=blockbox.y-this.h/2;
					this.vy=0;
					this.onGround=true;
					this.solid=true;
				}
				else if(c.solid&&this.y-this.vy*2-this.h/2>blockbox.y+blockbox.height)
				{
					this.y-=this.vy;
					this.vy=0;
					// this.y=blockbox.y+blockbox.height+this.h/2;
				}
				// this.collide(c);
				// c.collide(this);
				// this.y-=dy;
			}

		}
	},
	collide:function(o)
	{
		// if(!this.solid)return;
		// if(o.solid)this.solidBlockCollide(o);
	},
	blockCollide:function(block)
	{
		if(block.solid)this.solidBlockCollide(block);
	},
	solidBlockCollide:function(block)
	{
		var blockbox = block.getHitbox();
		if(this.vy>0&&this.y-this.vy*2+this.h/2<blockbox.y||
			(block.steps))
		{
			this.y=blockbox.y-this.h/2;
			this.vy=0;
			this.onGround=true;
		}
		else
		{
			if(this.y-this.vy*2-this.h/2>blockbox.y+blockbox.height)
			{
				this.vy=0;
				this.y=blockbox.y+blockbox.height+this.h/2;
			}
		
			if(this.x-this.vx*2+this.w/2<blockbox.x)
			{
				this.x=blockbox.x-this.w/2;
				this.vx=0;
			}
			if(this.x-this.vx*2-this.w/2>blockbox.x+blockbox.width)
			{
				this.x=blockbox.x+blockbox.width+this.w/2;
				this.vx=0;
			}
		}
		// if(this.x-this.vx+this.w/2<block.x)this.x=block.x-this.w/2;
		// if(this.x-this.vx-this.w/2>block.x+block.width)this.x=block.x+block.width+this.w/2;
	},
	getHitbox:function()
	{
		return {x:this.x-this.w/2,y:this.y-this.h/2,width:this.w,height:this.h};
	},
	pickUp:function()
	{
		this.solid=false;
		this.held=true;
	},
	startDrop:function()
	{
		this.held=false;
		this.solid=false;
	},
	drop:function()
	{
		this.held=false;
		// this.solid=true;
	}
}

function linearlyMoveTo(current, target, step)
{
	var result = current;
	if(target>current){
		result+=step;
		if(target<result)return target;
	}
	else if(target<current){
		result-=step;
		if(target>result)return target;
	}
	return result;
}

function Block(x,y,w,h)
{
	this.x=x;this.y=y;this.width=w;this.height=h;
	this.solid=true;
	this.drawable=new Drawable();
}
Block.prototype={
	update:function(){},
	draw:function(canvas)
	{
		this.drawable.draw(canvas,this.x,this.y,this.width,this.height);
	},
	getHitbox:function(){return this;},
	collide:function(e){}
}

function GroundBlock(x,y,p, game)
{
	this.r=y;this.c=x;
	this.x=x*p*8;this.y=y*p*8;this.width=p*8;this.height=p*8;
	var image=  IMAGES["block"];
	var offx=0;
	var offy=0;
	if(y>0)
	{
		var b = game.level[y-1][x];
		if(b==1||b==4)
		{
			image = IMAGES["block2"];
			offx=x%8;
			offy=y%8;
		}
		else
		{
			offx=(x+y)%8;
		}
	}
	
	this.image=image;
	this.drawable = new ImageDrawer(image,8,8,offx,offy);
	this.solid=true;
}
GroundBlock.prototype=new Block();

function PlatformBlock(x,y,p)
{
	this.r=y;this.c=x;
	this.x=x*p*8;this.y=y*p*8;
	this.width=p*8; this.height=p*2;
	this.drawable = new ImageDrawer(IMAGES["block"],8,2);
	this.solid=false;
	this.platform = true;
}
PlatformBlock.prototype=new Block();

function Exit(x,y,p)
{
	this.r=y;this.c=x;
	this.x=x*p*8+p;this.y=y*p*8;this.width=p*6;this.height=p*8;
	this.drawable = new ImageDrawer(IMAGES["door"],6,8);
	this.solid=false;
	this.door=true;
}
Exit.prototype=new Block();

function Button(x,y,p)
{
	this.r=y;this.c=x;
	this.x=x*p*8+p;this.y=y*p*8+p*6;this.width=p*6;this.height=p*2;
	this.drawable = new ImageDrawer(IMAGES["button"],6,2);
	this.solid=true;
	this.steps=true;
	this.on=false;
	this.onTimer = 0;
	this.maxTime = 16;
	this.powers=true;
	this.getsPower=false;
}
Button.prototype=new Block();
Button.prototype.setNeighbors=function(blocks)
{
	for(var i =0;i<blocks.length;i++)
	{
		var b = blocks[i];
		if(b.c==this.c&&b.r==this.r+1)
		{
			this.below=b;
			return;
		}
	}
}
Button.prototype.collide=function(e)
{
	// e.y-=this.height;
	if(!this.on)
	{
		playSound(SOUNDS["Controller4.wav"]);
	}
	this.drawable.frameIndex=1;
	this.on=true;
	this.onTimer=this.maxTime;
}
Button.prototype.getHitbox=function()
{
	// if(this.on)
	// {
		return {x:this.x,y:this.y+this.height/2,width:this.width,height:this.height/2};
	// }
	// else return this;
}
Button.prototype.update=function()
{
	if(this.below)
	{	
		var h = this.below.getHitbox();
		this.y=h.y-this.height;
		// this.x=h.x+h.width/2-this.width/2;
	}
	if(!this.on)return;
	this.onTimer--;
	if(this.onTimer<=0)
	{
		this.on=false;
		this.drawable.frameIndex=0;
		playSound(SOUNDS["Controller5.wav"]);
	}
	
}

function WireBlock(x,y,p)
{
	this.r=y;this.c=x;
	this.x=x*p*8;this.y=y*p*8;this.width=p*8;this.height=p*8;
	this.drawable = new ImageDrawer(IMAGES["block6"],8,8);
	this.solid=true;
	this.steps=false;
	this.on=false;
	this.onTimer = 0;
	this.maxTime = 16;
	this.powers=true;
	this.getsPower=true;
	this.neighbors=[];
	this.drawTop = false;
	this.drawLeft = false;
	this.drawRight = false;
	this.drawBot = false;
}
WireBlock.prototype=new Block();
WireBlock.prototype.setNeighbors=function(blocks)
{
	for(var i = 0;i < blocks.length;i++)
	{
		var b = blocks[i];
		if( (b.powers||(b.getsPower&&this.powers))
			&&Math.abs(b.c-this.c)+Math.abs(b.r-this.r)==1)
			// &&Math.abs(b.x-this.x)<=this.width&&Math.abs(b.y-this.y)<=this.height)
		{
			this.neighbors.push(b);
			if(b.c == this.c+1)this.drawRight=true;
			if(b.r == this.r+1)this.drawBot=true;
			if(b.c == this.c-1)this.drawLeft=true;
			if(b.r == this.r-1)this.drawTop=true;
		}
	}
}
WireBlock.prototype.update=function()
{
	this.onTimer=0;
	for(var i = 0;i < this.neighbors.length;i++)
	{
		var n = this.neighbors[i];
		if(n.powers&&n.onTimer>this.onTimer)this.onTimer=n.onTimer-1;
	}
	this.on = this.onTimer>0;
}
WireBlock.prototype.draw=function(canvas)
{
	this.drawable.draw(canvas, this.x,this.y,this.width,this.height);
	canvas.save();
	if(this.on)
	{
		// canvas.fillStyle="#67a";
		// canvas.fillStyle="#68b";
		// canvas.fillStyle="#aef";
		canvas.fillStyle="#0ff";
		canvas.globalAlpha = this.onTimer/this.maxTime*.5+.5;
	}
	else 
	{
		// canvas.fillStyle="#223";
		// canvas.fillStyle="#236";
		canvas.fillStyle="#23f";
		// canvas.fillStyle="#000";
		// canvas.globalAlpha=.75;
	}
	var p = this.width/8*3;
	var w = this.width-p*2;
	var h = this.height-p*2;
	canvas.fillRect(this.x+p,this.y+p,w,h);
	if(this.drawRight)
		canvas.fillRect(this.x+p+p,this.y+p,w,h);
	if(this.drawTop)
		canvas.fillRect(this.x+p,this.y,w,h);
	if(this.drawLeft)
		canvas.fillRect(this.x,this.y+p,w,h);
	if(this.drawBot)
		canvas.fillRect(this.x+p,this.y+p+p,w,h);
	canvas.restore();
}

function WireAir(x,y,p)
{
	this.r=y;
	this.c=x;
	this.x=x*p*8;this.y=y*p*8;this.p=p;
	this.width=p*8; this.height=p*8;
	this.solid=false;
	this.drawable=new Drawable();
	this.neighbors=[];
}
WireAir.prototype=new WireBlock();

function Door(x,y,p,game)
{
	this.r=y;this.c=x;
	this.x=x*p*8;this.y=y*p*8;this.width=p*8;this.height=p*8;
	this.ty=this.y;
	this.drawable=new ImageDrawer(IMAGES["block5"],8,8);
	this.solid=true;
	this.offTimer=0;
	this.powers=false;
	this.animationSpeed = 1;
	this.game=game;
	this.neighbors=[];
	this.door=true;
}
Door.prototype=new WireAir();
Door.prototype.draw=function(canvas)
{
	if(this.drawTop||this.drawLeft||this.drawRight)
	{
		canvas.save();
		if(this.on)
		{
			// canvas.fillStyle="#67a";
			// canvas.fillStyle="#68b";
			// canvas.fillStyle="#aef";
			canvas.fillStyle="#0ff";
			canvas.globalAlpha = this.onTimer/this.maxTime*.5+.5;
		}
		else 
			// canvas.fillStyle="#223";
			// canvas.fillStyle="#236";
			canvas.fillStyle="#127";
			// canvas.fillStyle="#000";
		var p = this.width/8*3;
		var w = this.width-p*2;
		var h = this.height-p*2;
		canvas.fillRect(this.x+p,this.ty+p,w,h);
		if(this.drawRight)
			canvas.fillRect(this.x+p+p,this.ty+p,w,h);
		if(this.drawTop)
			canvas.fillRect(this.x+p,this.ty,w,h);
		if(this.drawLeft)
			canvas.fillRect(this.x,this.ty+p,w,h);
		if(this.drawBot)
			canvas.fillRect(this.x+p,this.ty+p+p,w,h);
		canvas.restore();
	}

	this.drawable.draw(canvas, this.x,this.y,this.width,this.height);
	
}
// Door.prototype.superDraw = Door.prototype.draw;
// Door.prototype.draw=function(canvas)
// {
// 	if(!this.on)return 	this.superDraw(canvas);
// }
Door.prototype.superUpdate = Door.prototype.update;
Door.prototype.update = function()
{
	var prevon = this.on;
	this.superUpdate();
	if(this.on&&!prevon)
	{
		playSound(SOUNDS["Toaster1.wav"]);	
	}
	if(prevon&&!this.on)
	{
		playSound(SOUNDS["Toaster2.wav"]);
	}

	// this.solid=!this.on;
	var ot = this.offTimer;
	if(this.on)
	{
		if(this.offTimer<8)this.offTimer+=this.animationSpeed;
	}
	else if(this.offTimer>0)this.offTimer-=this.animationSpeed;

	var ny =this.ty+this.offTimer*this.height/8;
			
	if(ny!=this.y)
	{
		if(!this.safeMoveTo(ny))
		{
			this.offTimer=ot;
		}	
	}
}
Door.prototype.safeMoveTo=function(ny)
{
	var py = this.y;
	this.y=ny;
	var e = this.game.entityCollides(this);
	if(e)
	{
		this.y=py;
		e.vy+=(ny-this.y)/2;
		return false;
	}
	return true;
}
// Door.prototype.getHitbox=function()
// {
// 	return {x:this.x,y:this.y+this.onTimer, width:this.width, height:this.height};
// }
function Switch(x,y,p,game)
{
	this.game=game;
	this.r=y;this.c=x;
	this.x=x*p*8+p;this.y=y*p*8;this.width=p*6;this.height=p*8;
	this.drawable = new ImageDrawer(IMAGES["switch"],6,8);
	this.solid=false;
	this.steps=false;
	this.colliding=false;
	this.collidingThisFrame = false;
}
Switch.prototype = new Button();
Switch.prototype.collide=function(e)
{
	if(e)return;
	if(!this.colliding)
	{
		this.on=!this.on
		this.drawable.frameIndex=this.on;
		if(this.on)this.onTimer = this.maxTime;
		if(this.on)
			playSound(SOUNDS["Controller1.wav"]);
		else
			playSound(SOUNDS["Controller2.wav"]);
	}
	this.collidingThisFrame=true;
}
Switch.prototype.update=function()
{
	if(this.game.entityCollides(this))
	{
		this.collide();
	}
	if(this.below)
	{
		this.y=this.below.y-this.height;
	}
	this.colliding=this.collidingThisFrame;
	this.collidingThisFrame=false;
	if(!this.on&&this.onTimer>0)this.onTimer--;
}
Switch.prototype.turnOn = function(){
	this.on=true;
	this.onTimer=this.maxTime;
	this.drawable.frameIndex=1;
}

function DissolveDoor(x,y,p)
{
	this.r=y;this.c=x;
	this.x=x*p*8;this.y=y*p*8;this.width=p*8;this.height=p*8;
	this.ty=this.y;
	this.drawable=new ImageDrawer(IMAGES["block7"],8,8);
	this.neighbors=[];
}
DissolveDoor.prototype = new Door();
DissolveDoor.prototype.update = function()
{
	this.superUpdate();
	// this.solid=!this.on;
	var ot = this.offTimer;
	if(this.on)
	{
		if(this.offTimer<8)this.offTimer+=this.animationSpeed;
	}
	else if(this.offTimer>0)this.offTimer-=this.animationSpeed;

	this.solid = !this.on;
}
DissolveDoor.prototype.draw = function(canvas)
{
	canvas.save();
	canvas.globalAlpha = (8-this.offTimer)/8*.7+.3;
	this.drawable.draw(canvas,this.x,this.y,this.width,this.height);
	canvas.restore();
}

function Inverter(x,y,p)
{
	this.r=y;this.c=x;
	this.x=x*p*8;this.y=y*p*8;this.width=p*8;this.height=p*8;
	this.drawable = new ImageDrawer(IMAGES["inverter2"],8,8);
	this.neighbors=[];
	this.powers=true;
	this.solid=true;
	this.getsPower=false;
	this.inverter=true;
}
Inverter.prototype = new WireAir();
Inverter.prototype.update=function()
{
	this.drawLeft=false;
	this.drawRight=false;
	this.drawTop=false;
	this.drawBot=false;
	var powered = false;
	for(var i = 0;i < this.neighbors.length;i++)
	{
		var n = this.neighbors[i];
		if(n.powers&&!n.getsPower&&n.onTimer>0){
			powered=true;
			break;
		}
	}
	this.on=!powered;
	if(this.on)this.onTimer=this.maxTime;
	else this.onTimer=0;
	// else if (this.onTimer>0)this.onTimer--;
	// console.log(this.onTimer);	
}

function InverterWire(x,y,p)
{
	this.r=y;this.c=x;
	this.x=x*p*8;this.y=y*p*8;this.width=p*8;this.height=p*8;
	this.drawable = new ImageDrawer(IMAGES["inverter"],8,8);
	this.solid=true;
	this.getsPower=false;
	this.neighbors=[];
}
InverterWire.prototype = new WireBlock();
InverterWire.prototype.update = function()
{
	this.onTimer=0;
	for(var i = 0;i < this.neighbors.length;i++)
	{
		var n = this.neighbors[i];
		if(n.powers&&n.onTimer>this.onTimer&&!n.inverter)this.onTimer=n.onTimer-1;
	}
	this.on = this.onTimer>0;
}


var blockList = [GroundBlock, Exit, Button, WireBlock, WireAir, Door, Cube, Switch, Switch, DissolveDoor, Inverter, InverterWire, PlatformBlock]
function blockOfType(type, x,y,pixelSize,game)
{
	var result =  new blockList[type-1](x,y,pixelSize,game);
	if(type == 9)result.turnOn();
	return result;
}

function Game(pixelSize)
{
	this.pixelSize=pixelSize;
	this.entities = [];
	this.blocks=[];
	this.endTimer=0;
	this.transitionTime = 30;
}

Game.prototype = {
	start:function(levelList,player, index)
	{
		this.blocks=[];
		this.levelList = levelList;
		this.levelIndex=index;
		this.player=player;
		this.entities=[player];
		this.loadLevel(levelList[this.levelIndex]);
		this.time = new Date().getTime();
		if(index>7)
		{
			bgMusic = songSlow;
			bgMusic.currentTime=0;
			bgMusic.play();
		}
	},
	restartLevel:function()
	{
		if(this.endTimer==0)
		{
			this.endTimer = this.transitionTime*2;
			this.levelIndex--;
			this.door=false;
		}
	},
	levelEnd:function()
	{
		
	},
	nextLevel:function()
	{
		this.levelIndex=(this.levelIndex+1)%this.levelList.length;
		this.loadLevel(this.levelList[this.levelIndex]);
		if(this.levelIndex==this.levelList.length-2)
		{		
			bgMusic.pause();
			playSound(victoryMusic);
		}
		else if(this.levelIndex==8&&!musicMute)
		{
			// bgMusic.pause();
			
			bgMusic = songSlow;
			// playSound(bgMusic);
			bgMusic.currentTime=0;
			bgMusic.play();
			
		}
		else if(this.levelIndex==24&&!musicMute)
		{
			var old = bgMusic;
			bgMusic.pause();
			bgMusic = songFast;
			// playSound(bgMusic);
			bgMusic.currentTime=0;
			bgMusic.play();

			if(old.duration&&bgMusic.duration)
			{
				bgMusic.currentTime = old.currentTime * bgMusic.duration/old.duration;
			}
		}
		else if(this.levelIndex==44&&!musicMute)
		{
			var old = bgMusic;
			bgMusic.pause();
			bgMusic = songVeryFast;
			// playSound(bgMusic);
			bgMusic.currentTime=0;
			bgMusic.play();
			if(old.duration&&bgMusic.duration)
			{
				bgMusic.currentTime = old.currentTime * bgMusic.duration/old.duration;
			}
		}
		else if(this.levelIndex==50&&!musicMute)
		{
			var old = bgMusic;
			bgMusic.pause();
			bgMusic = songSlow;
			// playSound(bgMusic);
			bgMusic.currentTime=0;
			bgMusic.play();
			if(old.duration&&bgMusic.duration)
			{
				bgMusic.currentTime = old.currentTime * bgMusic.duration/old.duration;
			}
		}

		//44 24 8
	},
	loadLevel:function(level)
	{
		
		this.level=level;
		this.entities=[this.player];
		this.player.held=false;
		this.blocks=[];
		this.levelHeight = level.length;
		this.levelWidth =0;
		for(var j=0;j<level.length;j++)
		{
			var row = level[j];
			if(row.length>this.levelWidth)this.levelWidth=row.length;
			for(var i=0;i<row.length;i++)
			{
				var blockType = row[i];
				if(blockType>0)
				{
					var nb = blockOfType(blockType, i,j, this.pixelSize,this);
					if(blockType==2)this.door=nb;
					if(blockType==7)
						this.addEntity(nb);
					else
						this.blocks.push(nb);
				}
				else if(blockType==-1)
				{
					this.player.x = (i+.5)*this.pixelSize*8;
					this.player.y = (j+.5)*this.pixelSize*8;
				}
			}
		}
		for(var i = 0; i< this.blocks.length;i++)
		{
			var b = this.blocks[i];
			if(b.setNeighbors)
			{
				b.setNeighbors(this.blocks);
			}
		}
		this.blocks = this.blocks.sort(function(a,b){return a.door});
	},
	addEntity:function(e)
	{
		this.entities.push(e);
	},
	update:function()
	{
		// var ctime = new Date().getTime();
		// console.log(1000/(ctime-this.otime));
		// this.otime = ctime;
		if(this.endTimer>0)
		{
			// if(soundsEnabled)
			if(transitionMusic)
			bgMusic.volume += (.5-bgMusic.volume)/10;
			this.endTimer--;
			if(this.endTimer==this.transitionTime)
			{
				this.nextLevel();
			}
			this.player.vx=0;
			this.player.vy=0;
			if(this.endTimer>this.transitionTime&&this.door)
			{
				this.door.drawable.frameIndex = Math.floor((this.transitionTime*2-this.endTimer)/this.transitionTime*4);
			// 	this.player.x=this.door.x+this.door.width/2;
			// 	this.player.y=this.door.y+this.door.height-this.player.h/2;
			}
			return;
		}
		else
		{
			// if(soundsEnabled)
			if(transitionMusic)
			bgMusic.volume += (1-bgMusic.volume)/10;
		}
		for(var i=0;i<this.blocks.length;i++)
		{
			this.blocks[i].update();
		}
		for(var i =0;i<this.entities.length;i++)
		{
			var e = this.entities[i];
			e.update();
			// for(var j =0;j<this.blocks.length;j++)
			// {
			// 	var b=this.blocks[j];
			// 	if(collides(b.getHitbox(), e.getHitbox()))
			// 	{
			// 		e.blockCollide(b);
			// 		b.collide(e);
			// 	}
			// }
			// for(var j =i+1;j<this.entities.length;j++)
			// {
			// 	var o=this.entities[j];
			// 	if(collides(o.getHitbox(), e.getHitbox()))
			// 	{
			// 		e.collide(o);
			// 		o.collide(e);
			// 	}
			// }
		}
		if(this.door && collides(this.player.getHitbox(), this.door.getHitbox()) && this.player.onGround)// && this.player.looku)
		{
			this.endTimer = this.transitionTime*2;
			this.levelEnd();
			playSound(SOUNDS["DeadBolt2.wav"]);
		}
	},
	getCollisions:function(e)
	{
		result = [];
		for(var i = 0; i<this.blocks.length;i++)
		{
			var b = this.blocks[i];
			if(collides(b.getHitbox(), e.getHitbox()))
			{
				result.push(b);
			}
		}
		for(var i =0; i<this.entities.length;i++)
		{
			var o = this.entities[i];
			if(o!=e&&collides(e.getHitbox(),o.getHitbox()))
			{
				result.push(o);
			}
		}
		return result;
	},
	blockCollides:function(e)
	{
		for(var i =0;i<this.blocks.length;i++)
		{
			var b=this.blocks[i];
			if(b.solid && collides(b.getHitbox(), e.getHitbox()))
			{
				return b;
			}
		}
		for(var i =0;i<this.entities.length;i++)
		{
			var o=this.entities[i];
			if(o.solid&&o!=e&&collides(o.getHitbox(), e.getHitbox()))
			{
				return o;
			}
		}	
		return false;
	},
	entityCollides:function(b)
	{
		for(var i =0;i<this.entities.length;i++)
		{
			var e=this.entities[i];
			if(collides(b.getHitbox(), e.getHitbox()))
			{
				return e;
			}
		}	
	},
	draw:function(canvas)
	{
		canvas.save();
		// canvas.translate(CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
		// canvas.translate(-this.player.x,-this.player.y);
		canvas.translate(CANVAS_WIDTH/2,CANVAS_HEIGHT/2);
		var s = Math.min(CANVAS_WIDTH/( 13*8*this.pixelSize), CANVAS_HEIGHT/(14*8*this.pixelSize));
		canvas.scale(s,s);
		canvas.translate(-this.levelWidth/2*8*this.pixelSize, -this.levelHeight/2*8*this.pixelSize);
		// canvas.scale(2,2);
		for(var i=0;i<this.blocks.length;i++)
		{
			this.blocks[i].draw(canvas);
		}
		for(var i=0;i<this.entities.length;i++)
		{
			this.entities[i].draw(canvas);
		}
		
		canvas.restore();
		if(this.endTimer>0)
		{
			canvas.save();
			canvas.fillStyle="#000";
			canvas.globalAlpha=(this.transitionTime-Math.abs(this.transitionTime-this.endTimer))/(this.transitionTime*1.0);
			canvas.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
			canvas.restore();
		}

	}
}
