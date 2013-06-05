
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
	dragStart : function(t) {
		var ret = Node.supClass.dragStart.call(this, t);

		this.dragTime = Date.now();
		this.pos1 = [ this.pos[0], this.pos[1] ];
		
		return ret;
	},
	gainSpeedFromDragDrop : function() {
		var now = Date.now();
		var dt = now - this.dragTime;
		if( dt > 250 ) {
			var f = 1000.0/60/dt;
			var dp = [ this.pos[0] - this.pos1[0], this.pos[1] - this.pos1[1] ];
			this.setVelocity(dp[0] * f, dp[1] * f);
			//this.setSpin(0,0);
			
			this.dragTime = now;
			this.pos1 = [ this.pos[0], this.pos[1] ];
		}		
	},
	drag : function(t) {
		var ret = Node.supClass.drag.call(this, t);

		if(!! this.draggable) {
			this.gainSpeedFromDragDrop();
		}
		
		return ret;
	},
	drop : function(t) {
		var ret = Node.supClass.drop.call(this, t);

		if((!! this.draggable) && (!! this.moveable)) {
			this.gainSpeedFromDragDrop();
		}

		return ret;
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
		if(py + ry < h-5) {  
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
		var Vector = hotjs.Vector;
		
		var velAfter = Formula.velocityAfterCollision;
		
		var r1 = (this.size[0] + this.size[1]) / 2 / 2;
		var r2 = (b.size[0] + b.size[1]) / 2 / 2;
		var vectPos = Vector.Sub( this.pos, b.pos );
		
		// no collision yet
		var distance = Math.sqrt(vectPos[0] * vectPos[0] + vectPos[1] * vectPos[1]);
		if( distance > r1+r2) return false;
		
		// distance cannot be small than r1 + r2
		if( distance < r1+r2 ) {
			var fix = 1 - distance/(r1+r2);
			var vectPosFix = Vector.Mul( vectPos, fix );
			this.pos = Vector.Add( this.pos, vectPosFix );
			b.pos = Vector.Sub( b.pos, vectPosFix );
		}
		
		var vectTangent = [ vectPos[1], - vectPos[0] ];
		
		var v1 = Vector.Project(this.velocity, vectPos);
		var v1T = Vector.Project(this.velocity, vectTangent);
		
		var v2 = Vector.Project(b.velocity, vectPos);
		var v2T = Vector.Project(b.velocity, vectTangent);
		
		var v1x = velAfter(this.mass, v1[0], b.mass, v2[0]);
		var v1y = velAfter(this.mass, v1[1], b.mass, v2[1]);
		
		var v2x = velAfter(b.mass, v2[0], this.mass, v1[0]);
		var v2y = velAfter(b.mass, v2[1], this.mass, v1[1]);
		
		this.velocity = Vector.Add( v1T, [v1x, v1y] );
		b.velocity = Vector.Add( v2T, [v2x, v2y] );
		
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

