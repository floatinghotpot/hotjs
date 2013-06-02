
(function(){
	
hotjs.Physics = hotjs.Physics || {};

var Constant = {
	RESTITUTION_V : 0.8,
	RESTITUTION_H : 0.95,
	AIR_RESISTANCE : 1/160,
	GRAVITY : 9.8/60
};

// physics formula
var Formula = {
	velocityAfterCollision: function (m1,v1,m2,v2) {
		return ((m1-m2)*v1 + 2*m2*v2) / (m1+m2);
	}
};

// ----- Node in Physics world ---------

var Node = function(){
	hotjs.base(this);
};

hotjs.inherit(Node, hotjs.Node, {
	interactWidth : function(another) {
		return this;
	},
	update : function(dt) {
		Node.supClass.update.call(this, dt);
		
		var w = this.container.width(), h = this.container.height();
		
		var px = this.pos[0], py = this.pos[1];
		var rx = this.size[0] * 0.5, ry = this.size[1] * 0.5;
		var vx = this.velocity[0], vy = this.velocity[1];
		var ax = this.accel[0], ay = this.accel[1];

		// check boundary 
		var bx = ((px + rx >= w) && (vx >0)) || ((px - rx <= 0) && (vx <0));
		var by = ((py + ry >= h) && (vy >0)) || ((py - ry <= 0) && (vy<0));
		
		// bounce 
		if(by) {
			vy = - vy;
			vy *= Constant.RESTITUTION_V;
			vx *= Constant.RESTITUTION_H;
		}
		if(bx){
			vx = - vx;
			vx *= Constant.RESTITUTION_V;
			vy *= Constant.RESTITUTION_H;
		}
		
		// collision loss
		if( bx || by ) {

		} else { // air resistance
			ax = - vx * Constant.AIR_RESISTANCE / 5;
			ay += - vy * Constant.AIR_RESISTANCE;
		}
		
		// gravity
		if(py + ry < HEIGHT-5) {  
			ay = Constant.GRAVITY;
		}
		
		// fix pos if out of boundary
		px = Math.max( rx, Math.min(w-rx, px));
		py = Math.max( ry, Math.min(h-ry, py));
		
		this.pos = [px, py];
		this.velocity = [vx, vy];
		this.accel = [ax, ay];
		
		return this;
	}
});

//-------------- Ball in Physics world -----------------

var Ball = function(){
	hotjs.base(this);

};

hotjs.inherit(Ball, Node, {
	interactWith : function(b) {
		var vectorAdd = hotjs.Math.vectorAdd;
		var vectorSub = hotjs.Math.vectorSub;
		var vectorMul = hotjs.Math.vectorMul;
		var vectorProject = hotjs.Math.vectorProject;
		
		var velAfter = Formula.velocityAfterCollision;
		
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

// -------------- Scene in Physics world -----------------

var Scene = function(){
	hotjs.base(this);
};

hotjs.inherit(Scene, hotjs.Scene, {
	update : function(dt) {
		this.checkInteraction();
		Scene.supClass.update.call(this, dt);
		return this;
	},
	checkInteraction : function() {
		for( var i=this.subnodes.length-1; i>=1; i-- ) {
			var b1 = this.subnodes[i];
			for( var j=0; j<i; j++ ) {
				var b2 = this.subnodes[j];
				b1.interactWith(b2);
			}
		}
	}
});

hotjs.Physics.Constant = Constant;
hotjs.Physics.Formula = Formula;

hotjs.Physics.Node = Node;
hotjs.Physics.Scene = Scene;
hotjs.Physics.Ball = Ball;

})();

