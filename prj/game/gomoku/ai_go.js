
if( typeof(importScripts) == 'function') {
	// only works for web worker
	importScripts('../../../hotjs/hotjs.js');
	importScripts('../../../hotjs/math.js');
	importScripts('../../../hotjs/ai.js');
}

// TODO: GomokuAI
var GomokuAI = function(){
	hotjs.base(this);
	
	// '10111', 1, 1000
	// '11100', 3, 100
	// 2^5 = 32, +1
	this.patterns = [];
};

hotjs.inherit(GomokuAI, hotjs.AI.BasicAI, {
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
		
		// another patten that must win
		this.addPattern( ['.2222.', 0, 5000, [0,5] ] );
		
		return this;
	},
	addPattern : function( p ) {
		var pts = this.patterns;
		for(var i=pts.length-1; i>=0; i--) {
			var pt = pts[i];
			if(pt[0] == p[0]) { 
				pt[2] = p[2]; // replace the hit score
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
	findHits : function( m1, myself ) {
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
					var phit = pt[2] + myself;
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
		var x = x0, y = x0, hit = 0;
		
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
		var moves = [];
		
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
		
		var myHits = this.findHits( m1, 5 );
		var peerHits = this.findHits( m1.clone().exchangeValue('1','2'), 0 );
		
		var mergedRating = hotjs.Matrix.add( myHits.hitRating, peerHits.hitRating );
		
		return {
			myWinHits : myHits.winHits,
			peerWinHits : peerHits.winHits,
			bestMove : this.getBestMove( mergedRating ),
			topMoves : this.getTopMoves( mergedRating, 10 ),
			hitRating : mergedRating
		};
	}
});

// create a robot to work 

var robot = new GomokuAI().initPattern();

onmessage = function(evt) {
	var msg = evt.data;
	
	switch(msg.api) {
	case 'setColor':
		var c = '' + msg.color;
		if( c == '1' || c == '2' ) {
			robot.setColor( c );
			postMessage({
				api: msg.api,
				done : true,
				color: c
			});
		} else {
			postMessage({
				api: msg.api,
				done : false,
				comment: 'Error: invalid color ' + c + ', only accept 1 or 2.' 
			});
		}
		break;
	case 'go':
	case 'judge':
		var mtx_str = msg.matrix_str.replace(/0/g, '.');
		var solution = robot.solve( mtx_str );
		postMessage({
			api: msg.api,
			done: true,
			solution: solution
		});
		break;
	case 'undo':
		var mtx_str = msg.matrix_str.replace(/0/g, '.');
		var solution = robot.solve( mtx_str );
		postMessage({
			api: msg.api,
			done: true,
			solution: solution
		});
		break;
	default:
		postMessage({
			api: msg.api,
			done: false,
			comment: 'unknown api'
		});
	}
};




