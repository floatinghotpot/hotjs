
(function(){

hotjs = hotjs || {};

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



// TODO: to implement 
var Matrix = {
	Copy : function(){
		
	},
	Add : function() {
		
	},
	Sub : function() {
		
	},
	Mul : function() {
		
	}
};

hotjs.Random = Random;
hotjs.Matrix = Matrix;

})();
