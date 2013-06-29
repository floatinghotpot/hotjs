
//var api_url = "http://cloud.rnjsoft.com/sns/gomoku/api.inf";
var api_url = '../../sns/gomoku/api.inf';

var viewX;
var board;
var ai_player;
var net_player;

// only through network, if local file, need embedded into html
var ai_go = new Worker('ai_go.js');

ai_go.onmessage = function(evt) {
	var msg = evt.data;
	
	switch(msg.api) {
	case 'confirmColor':
		var c = (msg.color == 2) ? 1 : 2;
		board.confirmColor( c );	
		break;
	case 'judge':
		var s = msg.solution;
		board.setTip( s );
		if( s.myWinHits.length > 0 ) {
			//console.log( ai_player.mycolor + ' win', s.myWinHits );	
			//console.log( 'Computer win!' );
			board.gameOver = true;
			resources.get('audio/magic.mp3').play();
		}
		if ( s.peerWinHits.length > 0 ) {
			//console.log( board.hostColor + ' win', s.peerWinHits );
			//console.log( 'You win! ' );
			board.gameOver = true;
			resources.get('audio/magic.mp3').play();
		}
		break;
	case 'go':
		var s = msg.solution;
		var bestMove = s.bestMove;
		setTimeout(function(){
			if( ! board.gameOver ) {
				board.go( bestMove.x, bestMove.y );
			}
		}, 500);
		break;
	case 'undo':
		var s = msg.solution;
		board.setTip( s );

		var bestMove = s.bestMove;
		console.log( bestMove );
		
		break;
	}
};

var AIPlayer = function(){
	hotjs.base(this);
	
	this.mycolor = 2;
};

hotjs.inherit(AIPlayer, hotjs.Class, {
	setPeerColor : function(c) {
		ai_go.postMessage({
			api: 'setColor',
			color: c
		});
	},
	judge : function( mtx_str) {
		ai_go.postMessage({
			api: 'judge',
			matrix_str: mtx_str
		});
	},
	go : function( move, mtx_str) {
		ai_go.postMessage({
			api: 'go',
			move: {
				x: move[0],
				y: move[1],
				color:move[2]
			},
			matrix_str: mtx_str
		});
	},
	undo : function( move, mtx_str) {
		ai_go.postMessage({
			api: 'undo',
			move: {
				x: move[0],
				y: move[1],
				color:move[2]
			},
			matrix_str: mtx_str
		});
	}
});

function main() {
	resources.get('audio/hello.mp3').play();
	
	var w = window.innerWidth, h = window.innerHeight;
	h -= $("#menu").height();
	
	var v = document.getElementById('mainView');
	v.style.width = w;
	v.style.height = h;
	
	viewX = (new hotjs.View())
		.setContainer('mainView')
		.setSize(w,h)
		.setBgImage( true, resources.get('img/woodfloor.jpg') )
		.showFPS(false);

	ai_player = new AIPlayer();

	board = (new GoBoard(15))
		.setSize(w, h)
		.setColor("black").showGrid(false)
		.setDraggable(true).setMoveable(true).setZoomable(true)
		.setAreaImage( true, resources.get('img/wood.jpg') )
		.setGoImage( resources.get('img/gostones.png'), [0,0,128,128] )
		.showImg(true)
		.setPeerPlayer( ai_player )
		.resetGame()
		.addTo( viewX );
	
	var app = (new hotjs.App())
		.addNode(viewX)
		.start();
	
	$(window).resize(function(){
		var w = window.innerWidth, h = window.innerHeight;
		h -= $("#menu").height();
		var m = Math.min(w, h);
		
		viewX.setSize(w,h);
		board.setSize(w,h).setArea( (w-m)/2, (h-m)/2, m, m );
	});
}

var bgindex = 1;

$(document).ready(function(){
	$('.icon-reset').on('click', function(){
		board.resetGame();
	});

	$('.icon-undo').on('click', function(){
		board.undo();
	});

	$('.icon-set').on('click', function(){
		
	});
	
	$('.icon-more').on('click', function(){
		
	});
	
	$('.icon-tip').on('click', function(){
		board.showTip();
		if( board.getTipStatus() ) {
			$('.icon-tip').attr('src', "img/tipon.png");
		} else {
			$('.icon-tip').attr('src', "img/tipoff.png");
		}
	});

	$('.menu-icon').on('mousedown', function(){
		resources.get('audio/click.mp3').play();
		
		id = $(this).attr('id');
		
	});

	resources.load([
            'img/woodfloor.jpg',
            'img/wood.jpg',
            'img/gostones.png'
            //, 'audio/move.mp3'
    	],
    	{
			ready: main
    	});

});