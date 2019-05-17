function start(){
   var selfref=this

   this.interval=setInterval(function(){
      selfref.render()
   },1000/this.FPS)

   console.log("started rendering at "  + this.interval)
}

function end(){
   console.log("Clearing :  " + this.interval)
   clearInterval(this.interval)
   this.moving=false
   this.render()
}
function move(e){
   this.moving=true

   this.tx=e.x
   this.ty=e.y

	 /*
	 console.log("move")
	 console.log(e)
	 */
}

// Constructor for dasher model 
function Dasher(el){
   //  Call parent class
   Alpha.call(this,el)
   
   // CFG
   this.clen = 48
   this.cx = this.w/2
   this.cy = this.h*.8
   this.FPS = 30
	 this.inputCursorLen = 20
	 
	 this.inputAreaGravity="SW"
	 this.inputAreaPadding=0.1

	 // Velocity
	 this.v = 250

   // State
   this.interval=-1
	 this.pos=new Victor(0,0)

	 // Calc. pos & dim for touch area
	 this.calcInputArea()

   console.log("Set up dasher model...")
   this.render()

   // Touch / User interaction
   this.touchstart=start
   this.touchmove=move
   this.touchend=end

   // bind touch events
//   this.touch()
}

// Projection coeffecient 
Dasher.prototype.coeff=function(dx){
	 return 1-Math.log(1-dx)
}

// Draw "Dasher" Box 
// Returns width of box, for use as x offset
Dasher.prototype.dBox=function(s,f,w0,h0,xoffs,yoffs,xo){
   var w=f*w0
   var h=f*h0
   var y=h0*0.05+this.pos.y

	 var dy=(y-this.cy)/h0-yoffs
	 var dx=xoffs+this.pos.x
	 var k=this.coeff(dy)*2

	 var P=new Victor(xo+k*dx,0)
	 var D=new Victor(k*w,k*h)

   this.rect(P.x,P.y,D.x,D.y)
	 this.string(s,P.x,D.y,D.y/2,D.x,true)
			
	 var xoi=xo+k*(xoffs+this.pos.x)

	 // next level
   for(var kx in this.prof.sorted){
			var f1=this.prof.f(this.prof.sorted[kx])
			var s=this.prof.sorted[kx]

			xoi+=this.dBoxII(s,f1,xoi,k*w,k*h,dy-1)
	 }

   return w
}

Dasher.prototype.dBoxII=function(s,f,x0,w0,h0,dy){
	 if(dy<-4) return;

	 var dy1=dy
	 var k1=this.coeff(dy1)*2

	 var w1=w0*f
	 var h1=h0*f

	 this.rect(x0,0,w1,h1)
	 this.string(s,x0,h1,h1/2,w1,true)

	 var xoi=x0

   for(var kx in this.prof.sorted){
			var f1=this.prof.f(this.prof.sorted[kx])
			var s=this.prof.sorted[kx]

			xoi+=this.dBoxII(s,f1,xoi,w1,h1,dy-1)
	 }

	 return w1
}

Dasher.prototype.dBoxI=function(s,f,w0,h0,xoffs,yoffs,xo){
   var w=f*w0
   var h=f*h0
   var y=h0*0.05+this.pos.y

	 var dy=(y-this.cy)/h0-yoffs
	 var k=this.coeff(dy)*2

	 if(k*(xoffs+this.pos.x+w)<0)
			return w

   //  draw  rectangle / stroke Rect
   this.rect(k*(xoffs),0,k*w,k*h)
   // draw text
   this.string(s,k*(xoffs),h*k,k*h,k*w)

   return w
}

Dasher.prototype.cursor=function(){
   var x=this.cx
   var y=this.cy
   var l=this.clen

   this.line(x-l,y,x+l,y)
   this.line(x,y-l,x,y+l)
}

Dasher.prototype.touchstart=function(){
   console.log("Dasher touchstart")
}

// update position
Dasher.prototype.update=function(){
	 if(!this.moving) return

	 // cursor
//	 var c=new Victor(this.cx,this.cy)
//	 console.log("Cursor position")
//	 console.log(this.inputCursor)
	 var c=this.inputCursor

	 // touch input
	 var i=new Victor(this.tx,this.ty)
	 i.subtract(c)
//	 i.normalize()
	 i.divide(this.inputRect.D)

	 i.invertY()
	 i.invertX()

	 var t=1.0/this.FPS
	 var d=t*this.v
	 i.multiply(new Victor(d,d))

	 console.log("V0: "+i.magnitude())
	 
	 this.pos.add(i)
	 console.log(i)
}

// Calculate coordinates for input area
Dasher.prototype.calcInputArea=function(){
	 var input=new Rect(new Victor(0,0),new Victor(1,1))

	 switch(this.inputAreaGravity){
			case "SW":
				 input.P=new Victor(0,0.5)
				 input.D.multiply(new Victor(0.5,0.5))
				 break;
			case "NW":
				 input.P=new Victor(0,0.0)
				 input.D.multiply(new Victor(0.5,0.5))
				 break;
			case "SW":
				 input.P=new Victor(0.0,0.5)
				 input.D.multiply(new Victor(0.5,0.5))
				 break;
			case "SE":
				 input.P=new Victor(0.5,0.5)
				 input.D.multiply(new Victor(0.5,0.5))
				 break;
			default:
				 break;
	 }
	 // Apply padding
	 var p=this.inputAreaPadding
	 var w=this.w*(1-p*2)
	 var h=this.h*(1-p*2)
	 var x=this.w*p
	 var y=this.h*p

	 input.D.multiply(new Victor(w,h))
	 input.P.multiply(new Victor(w,h))
	 input.P.add(new Victor(x,y))
	 
	 console.log(input.P)
	 console.log(input.D)

	 this.inputRect=input

	 var mid=input.center()
	 this.inputCursor=mid
}

Dasher.prototype.inputArea=function(){
	 this.rectR(this.inputRect)
	 this.cursorP(this.inputCursor,this.inputCursorLen)
}

Dasher.prototype.key=function(e){
	 console.log("Got key movement")
}

Dasher.prototype.render=function(){
	 //  Do movement logic
	 this.update()
	 //  Fill canvas
   this.clear()

   // needs to be cleared for every render
	 var xoffs=0

   for(var k in this.prof.sorted){
      var f=this.prof.f(this.prof.sorted[k])
			var x0=xoffs

      xoffs+=this.dBox(this.prof.sorted[k],f,
				 this.w,this.h,xoffs,0,0)
   }
	 
	 var pstr=this.tx+"x"+this.ty
//	 this.string(pstr,0,42,42,1000)
	 
	 // Draw input control box
	 this.inputArea()
   // Draw cursor
   this.cursor()

	 // Draw dir vector
   if(this.moving){
      this.vector(this.inputCursor.x,this.inputCursor.y,this.tx,this.ty)
   }
}
