(function(){
	
hotjs.Math = {
		
	// extend random
	randomRange : function(min, max) {
		return ((Math.random() * (max - min)) + min);
	},
	randomInteger : function(min, max) {
		return Math.floor((Math.random() * (max - min)) + min);
	},
	randomColor : function(min, max) {
		var R = Math.randomInteger(min, max);
		var G = Math.randomInteger(min, max);
		var B = Math.randomInteger(min, max);
		return ("#" + R.toString(16) + G.toString(16) + B.toString(16));	
	},
	
	// vector
	vectorAdd : function (v1, v2) {
		return [ v1[0]+v2[0], v1[1]+v2[1] ];
	},
	vectorSub : function (v1, v2) {
		return [ v1[0]-v2[0], v1[1]-v2[1] ];
	},
	vectorMul : function (v, n) {
		return [v[0] * n, v[1] * n ];
	},
	vectorLength : function(v) {
		return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
	},
	vectorProject : function (v1, v2) {
		var v1x = v1[0], v1y = v1[1];
		var v2x = v2[0], v2y = v2[1];
		var ang1 = Math.atan2(v1y,v1x);
		var ang2 = Math.atan2(v2y,v2x);
		var ang = ang1 - ang2;
		var v = Math.sqrt( v1x * v1x + v1y * v1y ) * Math.cos(ang);
		var vx = v * Math.cos(ang2);
		var vy = v * Math.sin(ang2);
		return [vx, vy];
	}
	
};

})();
