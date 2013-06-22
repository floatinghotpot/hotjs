
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
var Matrix = function(){
	hotjs.base(this);

	this.data = [];
	this.mapping = [];
};

hotjs.inherit(Matrix, AI, {
	init : function(m, n, v) {
		this.data = hotjs.Matrix.create(m, n, v);
		this.resetMapping();
		
		return this;
	},
	resetMapping : function() {
		var mtx = this.data;
		var map = [];
		for(var i=0, m=mtx.length; i<m; i++) {
			var r = mtx[i], mr = [];
			for(var j=0, n=r.length; j<n; j++) {
				mr.push( [j, i] );
			} 
			map.push( mr );
		}
		this.mapping = map;
		
		return this;
	},
	clone : function() {
		var o = new (this.constructor)();
		o.data = hotjs.Matrix.copy( this.data );
		o.mapping = hotjs.Matrix.copy( this.mapping );
		
		return o;
	},
	copy : function(mtx) {
		this.data = hotjs.Matrix.copy( mtx.data );
		this.mapping = hotjs.Matrix.copy( mtx.mapping );
		
		return this;
	},
	importData : function(data) {
		this.data = hotjs.Matrix.copy( data );
		this.resetMapping();
		
		return this;
	},
	getData : function() {
		return this.data;
	},
	getMapping : function() {
		return this.mapping;
	},
	toString : function(sep_col, sep_row){
		return hotjs.Matrix.toString(this.data, sep_col, sep_row);
	},
	importDataFromString : function(str, sep_col, sep_row) {
		this.data = hotjs.Matrix.fromString(str, sep_col, sep_row);
		
		return this;
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
	inverse : function() {
		this.data = hotjs.Matrix.inverse( this.data );
		this.mapping = hotjs.Matrix.inverse( this.mapping );
		
		return this;
	},
	flipLeftRight : function() {
		var dest = [], mapping = [];
		var mtx = this.data, mtxm = this.mapping;
		for(var i=0, m=mtx.length; i<m; i++) {
			var s = mtx[i], t = [], sm = mtxm[i], tm = [];
			for(var j=0, n=s.length; j<n; j++) {
				t.push( s[n-1 -j] );
				tm.push( sm[n-1 -j] );
			}
			dest.push( t );
			mapping.push( tm );
		}
		this.data = dest;
		this.mapping = mapping;
		
		return this;
	},
	flipUpDown : function() {
		var dest = [], mapping = [];
		var mtx = this.data, mtxm = this.mapping;
		for(var i=mtx.length-1; i>=0; i--) {
			dest.push( mtx[i] );
			mapping.push( mtxm[i] );
		}
		this.data = dest;
		this.mapping = mapping;
		
		return this;
	},
	leanRight45 : function() {
		var dest = [], mapping = [];
		var mtx = this.data, mtxm = this.mapping;
		var m = mtx.length, n = mtx[0].length;
		var mm = m + n -1;
		for(var i=0; i<mm; i++) {
			var t = [], tm = [];
			for(var j=0; j<=i; j++) {
				if( (i-j)<m && j<n ) {
					t.push( mtx[i-j][j] );
					tm.push( mtxm[i-j][j] ); // x,y || col,row
				}
			}
			dest.push(t);
			mapping.push(tm);
		}
		this.data = dest;
		this.mapping = mapping;
		
		return this;
	},
	leanLeft45 : function() {
		var dest = [], mapping = [];
		var mtx = this.data, mtxm = this.mapping;
		var m = mtx.length, n = mtx[0].length;
		var mm = m + n -1;
		for(var i=0; i<mm; i++) {
			var t = [], tm = [];
			for(var j=i; j>=0; j--) {
				if( (i-j)<m && j<n ) {
					t.push( mtx[i-j][n-1-j] );
					tm.push( mtxm[i-j][n-1-j] ); // x,y || col,row
				}
			}
			dest.push(t);
			mapping.push( tm );
		}
		this.data = dest;
		this.mapping = mapping;
		
		return this;
	}
});


// TODO: Gomoku
var Gomoku = function(){
	hotjs.base(this);
	
	// '10111', 1, 1000
	// '11100', 3, 100
	// 2^5 = 32, +1
	this.patterns = [];
};

hotjs.inherit(Gomoku, AI, {
	genPattern : function genPattern(str) {
		if(str == undefined) str = '';
		if( str.length < 5 ) {
			var ar = genPattern(str+'1'), ar2 = genPattern(str+'0');
			while( s = ar2.shift() ) {
				ar.push( s );
			}
			return ar;
		}
		return [ str ];
	},
	initPattern : function() {
		var ar = this.genPattern();
		for(var i=ar.length-1; i>=0; i--) {
			var str = ar[i];
			
			var n = 0;
			var loc = [];
			for(var j=str.length-1; j>=0; j--) {
				if(str[j] == '1') n++;
				else loc.push(j);
			}
			if( n >= 1 ) {
				var pt = [ str, n, Math.pow(10,(n-1)), loc ];
				console.log( pt[0], pt[1], pt[2], pt[3] );
				this.patterns.push( pt );
			} else {
				// ignore pattern '00000'
			}
		}
		return this;
	},
	addPattern : function(p) {
		this.patterns.push(p);
		return this;
	},
	solve : function( matrix ) {
		var pts = this.patterns;
		var points = [];
		
		// 4 matrix to search the pattern
		var m1 = new Matrix().importData( matrix );
		var ms = [];
		ms.push( m1 );
		ms.push( m1.clone().inverse() );
		ms.push( m1.clone().leanRight45() );
		ms.push( m1.clone().leanLeft45() );

		// 
		var mr = [];
		for( var i=0; i<ms.length; i++ ) {
			mstrs.push( ms[i].toString('','|') );
		}
		
		// let's search the patterns
		for(var j=pts.length-1; j>=0; j--) {
			var pt = pts[j];
			var pstr = pt[0];
			for(var i=0; i<mstrs.length; i++) {
				var mstr = mstr[i];
				var n = 0;
				while( (n = mstr.indexOf(pstr,n)) != -1 ) {
					
				}
			}
		}
		
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
