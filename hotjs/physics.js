
(function(){
	
hotjs.Physics = hotjs.Physics || {};

var Constant = {
	g : 9.8,
	RESTITUTION_V : 0.8,
	RESTITUTION_H : 0.95,
	AIR_RESISTANCE : 0.2,
	AIR_DENSITY : 0.01293,
	HYDROGEN_DENSITY : 0.0008948,
	WOOD_DENSITY : 0.5,
	WATER_DENSITY : 1,
	IRON_DENSITY : 7.8,
	METER : 100
};

// physics formula
var Formula = {
	velocityAfterCollision: function (m1,v1,m2,v2) {
		return ((m1-m2)*v1 + 2*m2*v2) / (m1+m2);
	},
	airResistance : function(w,h,velocity) {
		return Constant.AIR_RESISTANCE * Constant.AIR_DENSITY * w * h * velocity * velocity ;
	},
	airFlotage : function(w,h) {
		return (w * w * h * Constant.AIR_FLOTAGE);
	}
};

// TODO: Node in Physics world 
var Node = function(){
	hotjs.base(this);
	
	this.restitution = 0.9;
};

hotjs.inherit(Node, hotjs.Node, {
	setRestitution : function(r) {
		r = Math.min(1, Math.max(0, r));
		this.restitution = r;

		return this;
	},
	getRestitution : function() {
		return this.restitution;
	},
	collide : function(another) {
		return this;
	},
	dragStart : function(t) {
		var ret = Node.supClass.dragStart.call(this, t);

		this.dragTime = Date.now();
		this.pos1 = [ this.pos[0], this.pos[1] ];
		this.maxVel = [0, 0];
		
		return ret;
	},
	gainSpeedFromDrag : function() {
		var now = Date.now();
		var dt = now - this.dragTime;

		var f = 1000.0/60/dt * 2;
		var v = [ (this.pos[0] - this.pos1[0]) * f, (this.pos[1] - this.pos1[1]) * f ];
		this.setVelocity(v[0], v[1]);
		//this.setSpin(0,0);

		if( dt > 500 ) {
			this.dragTime = now;
			this.pos1 = [ this.pos[0], this.pos[1] ];
		}
	},
	drag : function(t) {
		var ret = Node.supClass.drag.call(this, t);

		if(!! this.draggable) {
			this.gainSpeedFromDrag();
		}
		
		return ret;
	},
	drop : function(t) {
		var ret = Node.supClass.drop.call(this, t);

		if( ! this.moveable ) {
			this.setVelocity(0,0);
		}

		return ret;
	},
	checkBorderCollision : function() {
		var w = this.container.width(), h = this.container.height();
		var tution = this.container.getRestitution() * this.getRestitution();
		
		var px = this.pos[0], py = this.pos[1];
		var rx = this.size[0], ry = this.size[1];
		var vx = this.velocity[0], vy = this.velocity[1];

		// check boundary 
		var bx = ((px + rx > w) && (vx >0)) || ((px <= 0) && (vx <0));
		var by = ((py + ry > h) && (vy >0)) || ((py <= 0) && (vy <0));
		
		// bounce & collision loss
		if(by) {
			console.log( tution );
			vy *= (- tution);
			vx *= (0.9 + tution * 0.1);
		}
		if(bx){
			vx *= (- tution);
			vy *= (0.9 + tution * 0.1);
		}

		this.velocity = [vx, vy];
		
		// fix pos if out of boundary
		px = Math.max( 0, Math.min(w-rx, px));
		py = Math.max( 0, Math.min(h-ry, py));
		
		this.pos = [px, py];
	
		return this;
	},
	checkForce : function() {
		var vx = this.velocity[0], vy = this.velocity[1];
		var stance = this.container.getResistance();

		// air resistance
		//var ax -= vx / ry * Constant.AIR_RESISTANCE * (Constant.AIR_DENSITY / this.density) / 60;
		//var ay -= vy / rx * Constant.AIR_RESISTANCE * (Constant.AIR_DENSITY / this.density) / 60;
		var ax = - vx * stance / 60;
		var ay = - vy * stance / 60;
		
		// gravity / air buoyancy
		ay += (1 - Constant.AIR_DENSITY/this.density)  * this.container.getGravity() / 60;
		
		this.accel = [ax, ay];
		
		return this;
	},
	update : function(dt) {
		Node.supClass.update.call(this, dt);
		
		this.checkBorderCollision();
		
		this.checkForce();
		
		return this;
	}
});

// TODO: Ball in Physics world 

var Ball = function(){
	hotjs.base(this);

};

hotjs.inherit(Ball, Node, {
	collide : function(b) {

		var Vector = hotjs.Vector;
		
		var velAfter = Formula.velocityAfterCollision;
		
		var rx1 = this.size[0]/2, ry1 = this.size[1]/2;
		var rx2 = b.size[0]/2, ry2 = b.size[1]/2;
		var c1 = [ this.pos[0]+rx1, this.pos[1]+ry1 ];
		var c2 = [ b.pos[0]+rx2, b.pos[1]+ry2 ];
		var r1 = (rx1 + ry1) / 2;
		var r2 = (rx2 + ry2) / 2;
		var vectPos = Vector.Sub( c1, c2 );
		
		var tution = this.getRestitution() * b.getRestitution();
		
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
		
		var v1x = velAfter(this.mass, v1[0], b.mass, v2[0]) * tution;
		var v1y = velAfter(this.mass, v1[1], b.mass, v2[1]) * tution;
		
		var v2x = velAfter(b.mass, v2[0], this.mass, v1[0]) * tution;
		var v2y = velAfter(b.mass, v2[1], this.mass, v1[1]) * tution;
		
		this.velocity = Vector.Add( v1T, [v1x, v1y] );
		b.velocity = Vector.Add( v2T, [v2x, v2y] );
		
		return true;
	}
});

// TODO: Scene in Physics world 

var Scene = function(){
	hotjs.base(this);

	this.restitution = 0.5;
	this.gravity = Constant.g;
	this.resistance = 1/6;
};

hotjs.inherit(Scene, hotjs.Scene, {
	setRestitution : function(r) {
		r = Math.min(1, Math.max(0, r));
		this.restitution = r;

		return this;
	},
	getRestitution : function() {
		return this.restitution;
	},
	setGravity : function(n) {
		this.gravity = n * Constant.g;
		return this;
	},
	getGravity : function() {
		return this.gravity;
	},
	setResistance : function(r) {
		
		this.resistance = r;
		return this;
	},
	getResistance : function() {
		return this.resistance;
	},
	update : function(dt) {
		if(!! this.subnodes) {
			for( var i=this.subnodes.length-1; i>=0; i-- ) {
				this.subnodes[i].update(dt);
			}

			for( var i=this.subnodes.length-1; i>=1; i-- ) {
				var b1 = this.subnodes[i];
				for( var j=i-1; j>=0; j-- ) {
					var b2 = this.subnodes[j];
					b1.collide(b2);
				}
			}
		}
		
		return this;
	}
});

hotjs.Physics.Constant = Constant;
hotjs.Physics.Formula = Formula;

hotjs.Physics.Node = Node;
hotjs.Physics.Scene = Scene;
hotjs.Physics.Ball = Ball;

})();

