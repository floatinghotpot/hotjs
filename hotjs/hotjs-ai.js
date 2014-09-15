
hotjs = hotjs || {};
hotjs.AI = hotjs.AI || {};

(function(){

// TODO: AI Common Interface
var BasicAI = function(){
	hotjs.base(this);
};

hotjs.inherit( BasicAI, hotjs.Class, {
	init : function(conf) {
	},
	judge : function( puzzle ) {
	},
	solve : function( puzzle ) {
		return {};
	},
	reset : function() {
	},
	exit : function() {
	}
});

// TODO: Matrix
var Matrix = function(){
	hotjs.base(this);

	this.data = [];
	this.mapping = [];
};

hotjs.inherit(Matrix, BasicAI, {
	init : function(m, n, v) {
		this.data = hotjs.Matrix.create(m, n, v);
		this.resetMapping();
		
		return this;
	},
	setValue : function(v) {
		this.data = hotjs.Matrix.setValue( this.data, v );
		
		return this;
	},
	rows : function() {
		return this.data.length;
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
	getData : function() {
		return this.data;
	},
	getMapping : function() {
		return this.mapping;
	},
	importData : function(data) {
		this.data = hotjs.Matrix.copy( data );
		this.resetMapping();
		
		return this;
	},
	importDataFromString : function(str, sep_col, sep_row) {
		this.data = hotjs.Matrix.fromString(str, sep_col, sep_row);
		this.resetMapping();
		
		return this;
	},
	toString : function(sep_col, sep_row){
		return hotjs.Matrix.toString(this.data, sep_col, sep_row);
	},
	exchangeValue : function(v1,v2){
		var mtx = this.data;
		for(var i=0, m=mtx.length; i<m; i++) {
			var r = mtx[i];
			for(var j=0, n=r.length; j<n; j++) {
				if( r[j] == v1 ) {
					r[j] = v2;
				} else if( r[j] == v2) {
					r[j] = v1;
				}
			}
		}
		return this;
	},
	countValue : function(v) {
		var c = 0;
		var mtx = this.data;
		for(var i=0, m=mtx.length; i<m; i++) {
			var r = mtx[i];
			for(var j=0, n=r.length; j<n; j++) {
				if( r[j] == v ) {
					c ++;
				}
			}
		}
		return c;
	},
	setValueByPos : function(x, y, v) {
		this.data[y][x] = v;
		return this;
	},
	getValuebyPos : function(x, y) {
		return this.data[y][x];
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

//TODO: GoAI
var GoAI = function(){
	hotjs.base(this);
	
	this.char_style = {
			level: 1,
			think_time: 500,
			attack_factor: 1.2
	};
};

hotjs.inherit(GoAI, BasicAI, {
	setCharStyle : function( c ) {
		this.char_style = {
				level: c.level,
				think_time: c.think_time,
				attack_factor: c.attack_factor
		};
		return this;
	},
	getCharStyle : function() {
		return this.char_style;
	}	
});

//TODO: GomokuAI
var GomokuAI = function(){
	hotjs.base(this);
	
	// '10111', 1, 1000
	// '11100', 3, 100
	// 2^5 = 32, +1
	this.patterns = [];
	this.char_style = {
			level: 1,
			think_time: 500,
			attack_factor: 1.2
	};
};

hotjs.inherit(GomokuAI, GoAI, {
	genPattern : function genPattern(str) {
		if(str == undefined) str = '';
		if( str.length < 5 ) {
			var ar = genPattern(str+'2'), ar2 = genPattern(str+'.');
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
				if(str[j] == '2') n++;
				else loc.push(j);
			}
			if( n >= 1 ) {
				var pt = [ str, n, Math.pow(10,(n-1)), loc ];
				//console.log( pt[0], pt[1], pt[2], pt[3] );
				this.patterns.push( pt );
			} else {
				// ignore pattern '00000'
			}
		}
		
		// another patten that must or easy to win
		this.addPattern( ['.2222.', 0, 5000, [0,5] ] );
		this.addPattern( ['.222.', 3, 500, [0,4] ] );
		this.addPattern( ['.2.2.', 2, 50, [2,0,4] ] );
		
		return this;
	},
	addPattern : function( p ) {
		var pts = this.patterns;
		for(var i=pts.length-1; i>=0; i--) {
			var pt = pts[i];
			if(pt[0] == p[0]) {
				// replace the hit score
				pt[2] = p[2]; 
				pt[3] = p[3];
				return this;
			}
		}
		this.patterns.push(p);
		return this;
	},
	setColor : function( c ) {
		c = '' + c;
		var pts = this.patterns;
		for(var i=pts.length-1; i>=0; i--) {
			var pt = pts[i];
			if( pt[0].indexOf(c) == -1 ) {
				if( c == '1' ) {
					pt[0] = pt[0].replace(/2/g, c);
				} else {
					pt[0] = pt[0].replace(/1/g, c);
				}
			}
		}
		
		return this;
	},
	findHits : function( m1, hit_factor ) {
		var pts = this.patterns;
		
		// prepare 4 matrix to search the patterns
		//hotjs.Matrix.log( m1.getData() );
		var ms = [];
		ms.push( m1 );
		ms.push( m1.clone().inverse() );
		ms.push( m1.clone().leanRight45() );
		ms.push( m1.clone().leanLeft45() );
		
		// record hit score with priority of patterns
		var hitRating = hotjs.Matrix.setValue( hotjs.Matrix.copy(m1.getData()), 0 );
		var winHits = [];

		for( var k=0; k<ms.length; k++ ) {
			//var k = 0;
			var mtx = ms[k].getData();
			var mtxmap = ms[k].getMapping();
			var mtxhit = hotjs.Matrix.setValue( hotjs.Matrix.copy( mtx ), 0 );
			
			// calc hit for each matrix
			for( var i=mtx.length-1; i>=0; i-- ) { // row
				var r = mtx[i];
				var rstr = r.join('');
				var rhit = mtxhit[i];
				var rmap = mtxmap[i];

				// let's search the patterns in each row
				for(var j=pts.length-1; j>=0; j--) {
					var pt = pts[j];
					var pstr = pt[0]; // pattern str
					var pn = pt[1];
					var phit = pt[2] * hit_factor; //+ priority_plus;
					var ploc = pt[3];
					
					var n = -1;
					while( (n = rstr.indexOf(pstr,n+1)) != -1 ) {
						if( pn == 5 ) {
							var win_hit = [];
							for(var p=4; p>=0; p--) {
								win_hit.push( rmap[ n + p ] );
							}
							winHits.push( win_hit );
							//console.log( rmap );
							//console.log( n, ploc, pt );
							//console.log( win_hit );
						} else {
							for(var p=ploc.length-1; p>=0; p--) {
								var x = n + ploc[p];
								if( r[x] == '.' ) { // still empty slot
									rhit[ x ] += phit;
								}
							}
						}
					}
				}
				
				// sum to single matrix according to mapping
				for(var j=rhit.length-1; j>=0; j--) {
					var pos = rmap[j];
					hitRating[ pos[1] ][ pos[0] ] += rhit[j];
				}
			}
		}
		
		return { 
			hitRating : hitRating, 
			winHits : winHits 
			};
	},
	getBestMove : function( hits ) {
		// default move is the center point
		var x0 = Math.floor(hits.length/2);
		var x = x0, y = x0, hit = 1;
		
		for(var i=hits.length-1; i>=0; i--) {
			var r = hits[i];
			for(var j=r.length-1; j>=0; j--) {
				var h = r[j];
				if( h > hit ) {
					x = j;
					y = i;
					hit = h;
				}
			}
		}
		
		return [x,y,hit];
	},
	getTopMoves : function( hits, count ) {
		var x0 = Math.floor(hits.length/2);
		var moves = [ [x0,x0,1] ];
		
		for(var i=hits.length-1; i>=0; i--) {
			var r = hits[i];
			for(var j=r.length-1; j>=0; j--) {
				var h = r[j];
				var move = [j,i,h];
				
				var n = moves.length;
				for( var k=0; k<n; k++) {
					if( h > moves[k][2] ) {
						moves.splice(k, 0, move);
						break;
					}
				}
				if( moves.length == n ) {
					if( n < count ) moves.push(move);
				}
				if( moves.length > count ) {
					moves.pop();
				}
			}
		}
		
		return moves;
	},
	solve : function( mtx_or_str ) {
		var m1 = new hotjs.AI.Matrix();
		if( Array.isArray( mtx_or_str ) ) {
			m1.importData( mtx_or_str );
		} else { 
			m1.importDataFromString( mtx_or_str );
		}
		
		var myHits = this.findHits( m1, this.char_style.attack_factor );
		var peerHits = this.findHits( m1.clone().exchangeValue('1','2'), 1 );
		
		var mergedRating = hotjs.Matrix.add( myHits.hitRating, peerHits.hitRating );
		var topMoves = this.getTopMoves( mergedRating, 5 );
		var bestMove = (topMoves.length>0) ? topMoves[0] : [Math.floor(m1.rows()/2),Math.floor(m1.rows()/2),1];
		return {
			myWinHits : myHits.winHits,
			peerWinHits : peerHits.winHits,
			bestMove : bestMove,
			topMoves : topMoves,
			hitRating : mergedRating
		};
	},
	deepThinking : function( mtx_or_str, depth ) {
		if( typeof depth == 'undefined' ) {
			depth = this.char_style.level -1;
		}
		
		var m1 = new hotjs.AI.Matrix();
		if( Array.isArray( mtx_or_str ) ) {
			m1.importData( mtx_or_str );
		} else { 
			m1.importDataFromString( mtx_or_str );
		}
		
		var myHits = this.findHits( m1, this.char_style.attack_factor );
		var peerHits = this.findHits( m1.clone().exchangeValue('1','2'), 1 );
		
		var mergedRating = hotjs.Matrix.add( myHits.hitRating, peerHits.hitRating );
		var topMoves = this.getTopMoves( mergedRating, 5 );
		var bestMove = (topMoves.length>0) ? topMoves[0] : [Math.floor(m1.rows()/2),Math.floor(m1.rows()/2),1];

		var notWinNow = (myHits.winHits.length == 0) && (peerHits.winHits.length == 0);
		var notWinNextStep = (bestMove[2] < 1000);
		//console.log( notWin, notWinNextStep, myHits.winHits.length, peerHits.winHits.length );
		if( notWinNow && notWinNextStep && (depth > 1) ) {
			//console.log( 'depth = ' + depth );
			
			for( var i=0; i<topMoves.length; i++ ) {
				var move = topMoves[i];
				var m2 = m1.clone();
				m2.setValueByPos( move[0], move[1], (m2.countValue('1')<=m2.countValue('2') ? '1' :'2')  );
				var result = this.deepThinking(m2.data, depth-1);
				if( result.myWinHits.length > 0 || result.peerWinHits.length > 0 ) {
					if( result.myWinHits.length > 0) move[2] += 1000;
					if( result.peerWinHits.length > 0 ) move[2] -= 1000;
				//} else if( result.peerWinHits.length > 0 ) {
				//	move[2] -= 1000;
				} else {
					move[2] += result.bestMove[2] / 10;
				}
				mergedRating[ move[1] ][ move[0] ] = move[2];
			}
			topMoves.sort(function(a,b){
				if(a[2] > b[2]) return -1;
				else if(a[2] < b[2]) return 1;
				return 0;
			});
			bestMove = (topMoves.length>0) ? topMoves[0] : [Math.floor(m1.rows()/2),Math.floor(m1.rows()/2),1];
		}
		
		return {
			myWinHits : myHits.winHits,
			peerWinHits : peerHits.winHits,
			bestMove : bestMove,
			topMoves : topMoves,
			hitRating : mergedRating
		};
	},
	solveDeep : function( mtx_or_str ) {
		var think_start = Date.now();
		var result = this.deepThinking(mtx_or_str, this.char_style.level);
		var used_time = Date.now() - think_start;
		//console.log( used_time );
		return result;
	}
});

// TODO: PathFinder
var PathFinder = function(){
	hotjs.base(this);
};

hotjs.inherit(PathFinder, BasicAI, {
	solve : function( puzzle ) {
		var matrix = puzzle.matrix;
		var from = puzzle.from;
		var to = puzzle.to;
		var path = [];
		
		
		return path;
	}
});

hotjs.AI.BasicAI = BasicAI;
hotjs.AI.Matrix = Matrix;
hotjs.AI.GomokuAI = GomokuAI;
hotjs.AI.PathFinder = PathFinder;

})();
