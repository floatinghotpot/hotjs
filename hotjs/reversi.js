//TODO: ReversiAI
var ReversiAI = function(){
	hotjs.base(this);

	// [-1,-1], [0,-1], [1,-1]
	// [-1,0], x, [1,0]
	// [-1,1], [0,1], [1,1]
	this.patterns = [];
	this.char_style = {
			level: 1,
			think_time: 500,
			attack_factor: 1.2
	};
};

hotjs.inherit(ReversiAI, BasicAI, {
	initPattern : function() {
		this.patterns = [];
		for( var i=-1; i<=1; i++ ) {
			for( var j=-1; j<=1; j++ ) {
				if( i || j ) {
					this.patterns.push( [j,i] );
				}
			}
		}
	},
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
	},
	getAllowedMoves : function( mtx_or_str, c0 ) {
		var m1;
		if( Array.isArray( mtx_or_str ) ) {
			m1 = mtx_or_str;
		} else { 
			m1 = hotjs.Matrix.fromString( mtx_or_str );
		}
		
		var peer_c = (c0 == '1') ? '2' : '1';
		var rows = m1.length;
		var ps = this.patterns;
		var allowedMoves = [];

		for( var i=0; i<rows; i++ ) {
			for( var j=0; j<rows; j++ ) {
				var c = m1[i][j];
				if( c === c0 || c === peer_c ) continue;
				var peer_is_neighbor = false;
				for( var k=ps.length-1; k>=0; k--) {
					var p = ps[k];
					var x = j + p[0], y = i + p[1];
					if( x>=0 && x<rows && y>=0 && y<rows ) {
						peer_is_neighbor = true;
					}
				}
				if( peer_is_neighbor ) allowedMoves.push( [j,i] );
			}
		}
		
		return allowedMoves;
	},
	judge : function( mtx_or_str, lastMove, c0 ) {
		var m1;
		if( Array.isArray( mtx_or_str ) ) {
			m1 = mtx_or_str;
		} else { 
			m1 = hotjs.Matrix.fromString( mtx_or_str );
		}
		
		var x0 = lastMove.x, y0 = lastMove.y;
		var peer_c = (c0 == '1') ? '2' : '1';
		var rows = m1.length;
		var ps = this.patterns;
		var m2 = hotjs.Matrix.copy( m1 );

		for(var i=ps.length-1; i>=0; i--) {
			var p = ps[i];
			
			var n = Math.max( x0, (rows-x0), y0, (rows-y0 ) );
			var x = x0 + p[0], y = y0 + p[1];
			for(var j=1; j<n; j++) {
				if( x<0 || x>=rows || y<0 || y>=rows ) break;
				
				var c = m1[y][x];
				if( c === peer_c ) { // peer, continue search
					x += p[0], y += p[1];
					continue;
					
				} else if( c === c0 ) { // same color, turn over the ones between us
					for( var k=1; k<j; k++ ) {
						m2[ y0 + k * p[1] ][ x0 + k * p[0] ] = c0;
					}
					break;
					
				} else { // not me, not peer, just empty slot, stop search
					break;
				}
			}
		}
		
		return m2;
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
		var notWinNextStep = (bestMove[2] < 10000);
		//console.log( notWin, notWinNextStep, myHits.winHits.length, peerHits.winHits.length );
		if( notWinNow && notWinNextStep && (depth > 1) ) {
			//console.log( 'depth = ' + depth );
			
			for( var i=0; i<topMoves.length; i++ ) {
				var move = topMoves[i];
				var m2 = m1.clone();
				m2.setValueByPos( move[0], move[1], (m2.countValue('1')<=m2.countValue('2') ? '1' :'2')  );
				var result = this.deepThinking(m2.data, depth-1);
				if( result.myWinHits.length > 0 ) {
					move[2] += 5000;
				} else if( result.peerWinHits.length > 0 ) {
					move[2] -= 5000;
				} else {
					move[2] += result.bestMove[2] / 2;
				}
				mergedRating[ move[1] ][ move[0] ] = move[2];
			}
			topMoves.sort(function(a,b){
				if(a[2] > b[2]) return -1;
				else if(a[2] < b[2]) return 1;
				return 0;
			});
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