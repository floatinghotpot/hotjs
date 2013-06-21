
hotjs = hotjs || {};
hotjs.AI = hotjs.AI || {};

(function(){

// TODO: AI Interface
var AI = function(){
	hotjs.base(this);
};

hotjs.inherit(AI, hotjs.Class, {
	startup : function(conf) {
	},
	solve : function( puzzle ) {
	},
	reset : function() {
	},
	shutdown : function() {
	}
});

// TODO: Matrix
var Matrix = function(m,n){
	hotjs.base(this);

	if(m != undefined) {
		this.data = hotjs.Matrix.create(m,n);
	} else {
		this.data = null;
	}
};

hotjs.inherit(Matrix, AI, {
	clone : function() {
		var nw = new Matrix();
		nw.data = hotjs.Matrix.copy( this.data );
		return nw;
	},
	copy : function(mtx) {
		this.data = hotjs.Matrix.copy( mtx.data );
		return this;
	},
	copyData : function(data) {
		this.data = hotjs.Matrix.copy( data );
		return this;
	},
	inverse : function() {
		this.data = hotjs.Matrix.inverse( this.data );
		return this;
	},
	toString : function(sep_col, sep_row){
		return hotjs.Matrix.toString(this.data, sep_col, sep_row);
	},
	exchangeValue : function(x,y){
		var mtx = this.data;
		for(var i=0, m=mtx.length; i<m; i++) {
			var r = mtx[i];
			for(var j=0, n=r.length; j<n; j++) {
				if( r[j] == x ) {
					r[j] = y;
				} else if( r[j] == y) {
					r[j] = x;
				}
			}
		}
		return this;
	},
	getPosByValue : function(v) {
		var points = [];
		var mtx = this.data;
		for(var i=0, m=mtx.length; i<m; i++) {
			var r = mtx[i];
			if(Number(r.join('')) === 0) continue;
			for(var j=0, n=r.length; j<n; j++) {
				if( r[j] === v ) {
					points.push([j,i]);
				}
			}
		}
		return points;
	},
	flipLeftRight : function() {
		var dest = [];
		var mtx = this.data;
		for(var i=0, m=mtx.length; i<m; i++) {
			var r = mtx[i], t = [];
			for(var j=0, n=r.length; j<n; j++) {
				t.push( r[n-1 -j] );
			}
			dest.push(t);
		}
		this.data = dest;
		return this;
	},
	leanRight45 : function() {
		var dest = [];
		var mtx = this.data;
		var m = mtx.length, n = mtx[0].length;
		var mm = m + n -1;
		for(var i=0; i<mm; i++) {
			var t = [];
			for(var j=0; j<=i; j++) {
				if( (i-j)<m && j<n ) {
					t.push( mtx[i-j][j] );
				}
			}
			dest.push(t);
		}
		this.data = dest;
		return this;
	},
	leanLeft45 : function() {
		// return this.flipLeftRight().inverse().leanRight45();

		// result is same. reduce func call for better performance.
		var dest = [];
		var mtx = this.data;
		var m = mtx.length, n = mtx[0].length;
		var mm = m + n -1;
		for(var i=0; i<mm; i++) {
			var t = [];
			for(var j=i; j>=0; j--) {
				if( (i-j)<m && j<n ) {
					t.push( mtx[i-j][n-1-j] );
				}
			}
			dest.push(t);
		}
		this.data = dest;
		return this;
	}
});


// TODO: Gomoku
var Gomoku = function(){
	hotjs.base(this);
};

hotjs.inherit(Gomoku, AI, {
	solve : function( puzzle ) {
		var matrix = puzzle;
		var points = [];
		
		return points;
	}
});

// TODO: PathFinder
var PathFinder = function(){
	hotjs.base(this);
};

hotjs.inherit(PathFinder, AI, {
	solve : function( puzzle ) {
		var matrix = puzzle.matrix;
		var from = puzzle.from;
		var to = puzzle.to;
		var path = [];
		
		
		return path;
	}
});

hotjs.AI.AI = AI;
hotjs.AI.Matrix = Matrix;
hotjs.AI.Gomoku = Gomoku;
hotjs.AI.PathFinder = PathFinder;

})();
