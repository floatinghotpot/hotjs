
hotjs = hotjs || {};
hotjs.Physics = hotjs.Physics || {};

(function(){
	
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
	
	this.restitution = 0.95;
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
		var vectPos = Vector.sub( c1, c2 );
		
		var tution = this.getRestitution() * b.getRestitution();
		
		// no collision yet
		var distance = Math.sqrt(vectPos[0] * vectPos[0] + vectPos[1] * vectPos[1]);
		if( distance > r1+r2) return false;
		
		// distance cannot be small than r1 + r2
		if( distance < r1+r2 ) {
			var fix = 1 - distance/(r1+r2);
			var vectPosFix = Vector.mul( vectPos, fix );
			this.pos = Vector.add( this.pos, vectPosFix );
			b.pos = Vector.sub( b.pos, vectPosFix );
		}
		
		var vectTangent = [ vectPos[1], - vectPos[0] ];
		
		var v1 = Vector.project(this.velocity, vectPos);
		var v1T = Vector.project(this.velocity, vectTangent);
		
		var v2 = Vector.project(b.velocity, vectPos);
		var v2T = Vector.project(b.velocity, vectTangent);
		
		var v1x = velAfter(this.mass, v1[0], b.mass, v2[0]) * tution;
		var v1y = velAfter(this.mass, v1[1], b.mass, v2[1]) * tution;
		
		var v2x = velAfter(b.mass, v2[0], this.mass, v1[0]) * tution;
		var v2y = velAfter(b.mass, v2[1], this.mass, v1[1]) * tution;
		
		this.velocity = Vector.add( v1T, [v1x, v1y] );
		b.velocity = Vector.add( v2T, [v2x, v2y] );
		
		return true;
	}
});

// TODO: Scene in Physics world 

var Scene = function(){
	hotjs.base(this);

	this.restitution = 0.6;
	this.gravity = Constant.g;
	this.resistance = 1/2;
	this.meter = 200;
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
	setMeter: function(m) {
		this.meter = m;
		return this;
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
	checkBorderCollision : function(dt) {
		var a = this.getArea();
		
		for( var i=this.subnodes.length-1; i>=0; i-- ) {
			var b = this.subnodes[i];
			var px = b.pos[0], py = b.pos[1];
			var rx = b.size[0], ry = b.size[1];
			var vx = b.velocity[0], vy = b.velocity[1];

			// check area 
			var x_hit = ((px <= a.l) && (vx <=0)) || ((px + rx >= a.r) && (vx >=0));
			var y_hit = ((py <= a.t) && (vy <=0)) || ((py + ry >= a.b) && (vy >=0));
			
			// media resistance (like air, water, floor, etc.)
			var ax = vx * (- this.resistance);
			var ay = vy * (- this.resistance);

			// bounce & collision loss
			var tution = this.restitution * b.getRestitution();
			if( x_hit ){
				vx *= (- tution);
				vy *= (0.9 + tution * 0.1);
			}
			if( y_hit ) {
				vy *= (- tution);
				vx *= (0.9 + tution * 0.1);
			} else {
				// gravity / air buoyancy
				ay += (1 - Constant.AIR_DENSITY/b.density)  * (this.gravity * this.meter);
			}
	
			b.velocity = [vx, vy];
			b.accel = [ax, ay];
		}
		
		return this;
	},
	validatePos : function() {
		var a = this.getArea(); // {l,t,r,b,w,h}
		
		for( var i=this.subnodes.length-1; i>=0; i-- ) {
			var b = this.subnodes[i];

			// fix pos if out of area
			px = Math.max( a.l, Math.min(a.r - b.size[0], b.pos[0]));
			py = Math.max( a.t, Math.min(a.b - b.size[1], b.pos[1]));
			
			b.pos = [ Math.round(px), Math.round(py) ];			
		}
		
		return this;
	},
	update : function(dt) {
		if(!! this.subnodes) {
			for( var i=this.subnodes.length-1; i>=0; i-- ) {
				var b = this.subnodes[i];
				b.update(dt);
			}

			for( var i=this.subnodes.length-1; i>=1; i-- ) {
				var b = this.subnodes[i];
				for( var j=i-1; j>=0; j-- ) {
					var another = this.subnodes[j];
					b.collide( another );
				}
			}

			this.checkBorderCollision(dt);
			this.validatePos();
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

