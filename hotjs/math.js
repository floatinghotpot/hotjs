
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
	create : function(m,n){
		var mtx = [];
		for(var i=0; i<m; i++) {
			var r = [];
			for(var j=0; j<n; j++) {
				r.push(0);
			}
			mtx.push( r );
		}
		return mtx;
	},
	copy : function(src){
		var dest = [];
		for(var i=0, m=src.length; i<m; i++) {
			var r = [], s = src[i];
			for(var j=0, n=s.length; j<n; j++) {
				r[j] = s[j];
			}
			dest.push( r );
		}
		return dest;
	},
	inverse : function(src) {
		var m = src.length;
		var n = src[0].length;
		var dest = Matrix.create(n, m);
		for(var i=0; i<m; i++) {
			var s = src[i];
			for(var j=0; j<n; j++) {
				dest[j][i] = s[j];
			}
		}
		return dest;
	},
	isEqual : function(a1, a2) {
		if(a1.length < 1 || a2.length < 1) return false;
		if(a1.length != a2.length) return false;
		if(a1[0].length != a2[0].length) return false;
		
		for(var i=0, m=a1.length; i<m; i++) {
			var r1 = a1[i], r2 = a2[i];
			for(var j=0, n=r1.length; j<n; j++) {
				if(r1[j] != r2[j]) {
					return false;
				}
			}
		}
		return true;
	},
	add : function(a1, a2) {
		var dest = [];
		for(var i=0, m=a1.length; i<m; i++) {
			var r = [], s = a1[i], t = a2[i];
			for(var j=0, n=s.length; j<n; j++) {
				r[j] = s[j] + t[j];
			}
			dest.push( r );
		}
		return dest;
	},
	sub : function(a1, a2) {
		var dest = [];
		for(var i=0, m=a1.length; i<m; i++) {
			var r = [], s = a1[i], t = a2[i];
			for(var j=0, n=s.length; j<n; j++) {
				r[j] = s[j] - t[j];
			}
			dest.push( r );
		}
		return dest;
	},
	mul : function() {
		
	},
	toString : function(mtx, sep_col, sep_row) {
		if(sep_col == undefined) sep_col = '';
		if(sep_row == undefined) sep_row = '';
		var str = '';
		for(var i=0, m=mtx.length; i<m; i++) {
			var r = mtx[i];
			str += r.join(sep_col);
			str += sep_row;
		}
		return str;
	}	
};

hotjs.Random = Random;
hotjs.Vector = Vector;
hotjs.Matrix = Matrix;

})();
