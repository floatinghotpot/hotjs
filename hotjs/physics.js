
var WIDTH = 480, HEIGHT = 270;
var COLLISION_LOSS_V = 0.2;
var COLLISION_LOSS_H = 0.01;
var AIR_RESISTANCE = 1/160;
var GRAVITY = 9.8 / 60;

// physics formula

hotjs.Physics = {
	velocityAfterCollision: function (m1,v1,m2,v2) {
		return ((m1-m2)*v1 + 2*m2*v2) / (m1+m2);
	}
};

var Ball = function(){
	hotjs.base(this);
};

hotjs.inherit(Ball, hotjs.Node, {
	update : function(dt) {
		Ball.supClass.update.call(this, dt);
		
		var px = this.pos[0], py = this.pos[1];
		var rx = this.size[0] * 0.5, ry = this.size[1] * 0.5;
		var vx = this.velocity[0], vy = this.velocity[1];
		var ax = this.accel[0], ay = this.accel[1];

		// check boundary 
		var bx = ((px + rx >= WIDTH) && (vx >0)) || ((px - rx <= 0) && (vx <0));
		var by = ((py + ry >= HEIGHT) && (vy >0)) || ((py - ry <= 0) && (vy<0));
		
		// bounce 
		if(by) {
			vy = - vy;
			vy *= (1-COLLISION_LOSS_V);
			vx *= (1-COLLISION_LOSS_H);
		}
		if(bx){
			vx = - vx;
			vx *= (1-COLLISION_LOSS_V);
			vy *= (1-COLLISION_LOSS_H);
		}
		
		// collission loss
		if( bx || by ) {

		} else {
			ax = - vx * AIR_RESISTANCE / 5;
			ay += - vy * AIR_RESISTANCE;
		}
		
		// gravity
		if(py + ry < HEIGHT-5) { // air 
			ay = GRAVITY;
		}
		
		// fix pos if out of boundary
		px = Math.max( rx, Math.min(WIDTH-rx, px));
		py = Math.max( ry, Math.min(HEIGHT-ry, py));
		
		this.pos = [px, py];
		this.velocity = [vx, vy];
		this.accel = [ax, ay];
		
		return this;
	},
	checkCollision : function(b) {
		var vectorAdd = hotjs.Math.vectorAdd;
		var vectorSub = hotjs.Math.vectorSub;
		var vectorMul = hotjs.Math.vectorMul;
		var vectorProject = hotjs.Math.vectorProject;
		
		var velAfter = hotjs.Physics.velocityAfterCollision;
		
		var r1 = (this.size[0] + this.size[1]) / 2 / 2;
		var r2 = (b.size[0] + b.size[1]) / 2 / 2;
		var vectPos = vectorSub( this.pos, b.pos );
		
		// no collision yet
		var distance = Math.sqrt(vectPos[0] * vectPos[0] + vectPos[1] * vectPos[1]);
		if( distance > r1+r2) return false;
		
		// distance cannot be small than r1 + r2
		if( distance < r1+r2 ) {
			var fix = 1 - distance/(r1+r2);
			var vectPosFix = vectorMul( vectPos, fix );
			this.pos = vectorAdd( this.pos, vectPosFix );
			b.pos = vectorSub( b.pos, vectPosFix );
		}
		
		var vectTangent = [ vectPos[1], - vectPos[0] ];
		
		var v1 = vectorProject(this.velocity, vectPos);
		var v1T = vectorProject(this.velocity, vectTangent);
		
		var v2 = vectorProject(b.velocity, vectPos);
		var v2T = vectorProject(b.velocity, vectTangent);
		
		var v1x = velAfter(this.mass, v1[0], b.mass, v2[0]);
		var v1y = velAfter(this.mass, v1[1], b.mass, v2[1]);
		
		var v2x = velAfter(b.mass, v2[0], this.mass, v1[0]);
		var v2y = velAfter(b.mass, v2[1], this.mass, v1[1]);
		
		this.velocity = vectorAdd( v1T, [v1x, v1y] );
		b.velocity = vectorAdd( v2T, [v2x, v2y] );
		
		return true;
	}
});
	
function drawVector(c, color, v1, v2) {
	c.beginPath();
	c.strokeStyle = color;
	c.moveTo(v1[0], v1[1]);
	c.lineTo(v2[0], v2[1]);
	c.stroke();
}

var BallRoom = function(){
	hotjs.base(this);
	
	this.v1 = [40,-100];
	this.v2 = [100,-50];
	
	this.v = hotjs.Math.vectorProject(this.v1, this.v2);
};

hotjs.inherit(BallRoom, hotjs.Scene, {
	update : function(dt) {
		for( var i=this.subnodes.length-1; i>=1; i-- ) {
			var b1 = this.subnodes[i];
			for( var j=0; j<i; j++ ) {
				var b2 = this.subnodes[j];
				b1.checkCollision(b2);
			}
		}
		
		BallRoom.supClass.update.call(this, dt);
	},
	draw : function(c) {
		BallRoom.supClass.draw.call(this, c);

		c.save();
		c.translate(WIDTH / 2, HEIGHT / 2);
		
		drawVector(c, "black", [0,0], this.v1);
		drawVector(c, "red", [0,0], this.v2);
		drawVector(c, "blue", this.v1, this.v);
		drawVector(c, "green", this.v, [this.v[0],0]);
		drawVector(c, "green", [0,0], [this.v[0],0]);

		c.restore();
	}
});
