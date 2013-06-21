
hotjs = hotjs || {};

(function(){

//TODO: random functions
var Random = {
	// extend random
	Float : function(min, max) {
		return ((Math.random() * (max - min)) + min);
	},
	Integer : function(min, max) {
		return Math.floor((Math.random() * (max - min)) + min);
	},
	Color : function(min, max) {
		var R = Random.Integer(min, max);
		var G = Random.Integer(min, max);
		var B = Random.Integer(min, max);
		return ("#" + R.toString(16) + G.toString(16) + B.toString(16));	
	}
};

// TODO: Vector functions
var Vector = {
	copy : function(v) {
		return [ v[0], v[1] ];
	},
	vert : function(v) {
		return [ v[1], -v[0] ];
	},
	add : function (v1, v2) {
		return [ v1[0]+v2[0], v1[1]+v2[1] ];
	},
	sub : function (v1, v2) {
		return [ v1[0]-v2[0], v1[1]-v2[1] ];
	},
	mul : function (v, n) {
		return [v[0] * n, v[1] * n ];
	},
	scale : function (v, n) {
		return [v[0] * n[0], v[1] * n[1] ];
	},
	scaleDown : function(v, n) {
		return [v[0] / n[0], v[1] / n[1] ];
	},
	getLength : function(v) {
		return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
	},
	norm : function(v) {
		var n = 1 / Math.sqrt(v[0]*v[0] + v[1]*v[1]);
		return [v[0] * n, v[1] * n ];
	},
	angle : function(v) {
		var a = Math.acos( v[0] / Math.sqrt(v[0]*v[0] + v[1]*v[1]) );
		if( v[1] < 0 ) a = - a; 
		return a;
	},
	project : function (v1, v2) {
		var v1x = v1[0], v1y = v1[1];
		var v2x = v2[0], v2y = v2[1];
		var ang1 = Math.atan2(v1y,v1x);
		var ang2 = Math.atan2(v2y,v2x);
		var ang = ang1 - ang2;
		var v = Math.sqrt( v1x * v1x + v1y * v1y ) * Math.cos(ang);
		var vx = v * Math.cos(ang2);
		var vy = v * Math.sin(ang2);
		return [vx, vy];
	},
	inRect : function(v, r) { // [x,y,w,h]
		return ((v[0]>=r[0]) && (v[0]<r[0]+r[2])) && ((v[1]>=r[1]) && (v[1]<r[1]+r[3]));
	},
	inCircle : function(v1, v2, r) {
		return ((v1[0]-v2[0])*(v1[0]-v2[0])+(v1[1]-v2[1])*(v1[1]-v2[1]) <= (r*r));
	}
};

// TODO: to implement

var Matrix = {
	copy : function(){
		
	},
	add : function() {
		
	},
	sub : function() {
		
	},
	mul : function() {
		
	}
};

hotjs.Random = Random;
hotjs.Vector = Vector;
hotjs.Matrix = Matrix;

})();
