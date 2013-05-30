// name space
var hotjs = hotjs || {};

// app -> view -> scene -> layer -> entity

// event: mouse, touch, keyboard, userdefined

// resource: audio, image, sprite, video

// animation: move, rotate, scale, fade

// math: point, vector, matrix,

// physics: collision, gravity, momentum,

// tool: UT, benchmark, debug, profiling,

// AI: pathfinding

// lang:

// addon:

// -------------------------------------

hotjs.require = function(file) {
};

// tool for inherit
// See 
// "tests/test_oo.html" for example & use case
hotjs.inherit = function(Sub, Super, o) {
	if (Super.constructor == Function) {
		Sub.prototype = new Super;
		Sub.prototype.parent = Super.prototype;
		Sub.prototype.constructor = Sub;
	} else {
		Sub.prototype = Super;
		Sub.prototype.parent = Super.prototype;
		Sub.prototype.constructor = Sub;
	}
	
	for( var p in o ) {
		if (o.hasOwnProperty(p) && p !== "prototype") {
			Sub.prototype[p] = o[p];
		}				
	}
};

// tool to print variable value in console
hotjs.log = function(o, n) {
	if (typeof n == 'undefined' ) n = 0;
	
	var prefix = "";
	for ( var i = 0; i < n; i++) prefix += "  ";
	
	if( typeof o == "object" ) {
		console.log(prefix + typeof o + ' {');
		for ( var p in o) {
			if (typeof o[p] == 'object') {
				console.log( prefix + "  " + p + ' (' + typeof o[p]+ ') = ' );
				hotjs.log(o[p], n + 1);
			} else {
				console.log(prefix + "  " + p + ' (' + typeof o[p]+ ') = ' + o[p]);
			}
		}
		console.log(prefix + '}');
	} else {
		console.log( o );
	}
};

//[].indexOf(value)
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(obj, fromIndex) {
		if (fromIndex == null) {
			fromIndex = 0;
		} else if (fromIndex < 0) {
			fromIndex = Math.max(0, this.length + fromIndex);
		}
		for ( var i = fromIndex, j = this.length; i < j; i++) {
			if (this[i] === obj)
				return i;
		}
		return -1;
	};
}

// A cross-browser requestAnimationFrame
// See
// https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame || window.oRequestAnimationFrame
			|| window.msRequestAnimationFrame || function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
})();



// ----------- hotjs.App ----------------------
var hotjs_app = undefined;
var hotjs_lastTime;

// The main game loop
hotjs_main = function(){
	var now = Date.now();
	var dt = (now - hotjs_lastTime) / 1000.0;

	if(hotjs_app != null) {
		hotjs_app.update(dt);
		hotjs_app.render();
	}

	hotjs_lastTime = now;
	requestAnimFrame(hotjs_main);
};

hotjs.App = function(){
	hotjs_app = this;
	this.upTime = 0;
	
	this.views = [];
};

hotjs.App.prototype = {
	addView : function(v) {
		this.views.push(v);
		return this;
	},
	start : function() {
		hotjs_app = this;
		
		//resources.load();
		//resources.onReady(function(){
			if(hotjs_app != undefined) {
				hotjs_app.init();
			}
		//});
		
		return this;
	},
	init : function() {
		this.reset();
		
		hotjs_lastTime = Date.now();
		hotjs_main();

		return this;
	},
	reset : function() {
		return this;
	},
	update : function(dt) {
		this.upTime += dt;
		
		for(var i=0; i<this.views.length; i++) {
			this.views[i].update(dt);
		}
		return this;
	},
	render : function() {
		for(var i=0; i<this.views.length; i++) {
			this.views[i].render();
		}
		return this;
	}
};

//--------- hotjs.View ----------------

hotjs.View = function(){
	this.canvas = document.createElement("canvas");
	this.ctx = this.canvas.getContext("2d");
	this.canvas.width = 480;
	this.canvas.height = 320;

	this.container = undefined;

	this.curScene = undefined;
	this.scenes = [];
	this.sceneIndex = {};
	this.sceneStack = [];
	
	this.fpsInfo = false;
	this.dtSum = 0;
	this.frames = 0;
	this.fps = 60;
};

hotjs.View.prototype = {
	setContainer : function(id){
		this.container = document.getElementById(id);
		if(this.container == undefined) {
			this.container = document.body;
		}
		this.container.appendChild(this.canvas);
		return this;
	},
	setSize : function(w,h) {
		this.canvas.width = w;
		this.canvas.height = h;
		return this;
	},
	addScene : function(s, id) {
		s.setView(this);
		this.scenes.push( s );
		if(typeof id != 'undefined') {
			this.sceneIndex[id] = s;
		}
		this.curScene = s;
		return this;
	}, 
	switchScene : function(s) {
		if( s != undefined ) {
			if( this.curScene != undefined ) {
				this.curScene.stop();
			}
			this.curScene = s;
			s.play();
		}
		return this;
	},
	switchSceneById : function(id) {
		var s = this.sceneIndex[id];
		if(typeof s != 'undefined') {
			this.switchScene(s);
		}
		return this;
	},
	pushSceneById : function(id) {
		this.sceneStack.push( this.curScene );
		this.switchSceneById(id);
		return this;
	}, 
	popScene : function() {
		var s = this.sceneStack.pop();
		this.switchScene(s);
		return this;
	},
	showFPS : function(f) {
		this.fpsInfo = f;
		return this;
	},
	update : function(dt) {
		for(var i=0; i<this.scenes.length; i++) {
			this.scenes[i].update(dt);
		}

		if( this.fpsInfo ) {
			this.frames ++;
			this.dtSum += dt;
			if( this.dtSum > 1 ) {
				this.fps = Math.floor( this.frames / this.dtSum + 0.5 );
				this.dtSum = 0;
				this.frames = 0;
			}
		}
		return this;
	},
	render : function() {
		for(var i=0; i<this.scenes.length; i++) {
			this.scenes[i].render(this.ctx);
		}
		
		if( this.fpsInfo ) {
			var c = this.ctx;
			c.save();
			c.strokeStyle = "#000000";
			c.fillText( this.fps + ' fps', 10, 20 );
			c.fillText( this.frames, 10, 40 );
			c.restore();
		}
		return this;
	}
	
	// TODO: listen input events & forward
	
};

// ------------- hotjs.Node -----------

hotjs.Node = function() {
	this.pos = [0,0];
	this.size = [0,0];
	this.rotation = 0;
	this.scale = 1;

	this.velocity = [0,0];
	this.spin = 0;
	this.shrink = 1;
	
	this.img = undefined;

	this.subnodes = [];
	this.index = {};
};

hotjs.Node.prototype = {
	setPos : function(x,y) {
		this.pos = [x,y];
	},
	setSize : function(w,h) {
		this.size = [w,h];
		return this;
	},
	setRotation : function(r) {
		this.rotation = r;
		return this;
	},
	setScale : function(s) {
		this.scale = s;
		return this;
	},
	setVelocity : function(v) {
		this.velocity = v;
		return this;
	},
	setSpin : function(s) {
		this.spin = s;
		return this;
	},
	setImage : function(img) {
		this.img = img;
		return this;
	},
	addNode : function(n, id) {
		this.subnodes.push(n);
		if(typeof id == 'string') {
			this.index[id] = n;
		}
		return this;
	},
	update : function(dt) {
		// TODO: update pos / rotation / scale
		
		return this;
	},
	render : function(c) {
		// TODO: translate / rotate / scale
		
		return this;
	}
};

//------------- hotjs.Scene -----------

hotjs.Scene = function(){
	this.view = undefined;
	this.playing = false;
};

hotjs.inherit( hotjs.Scene, hotjs.Node, {
	setView : function(v) {
		this.view = v;
		return this;
	},
	play : function() {
		this.playing = true;
		return this;
	},
	stop : function() {
		this.playing = false;
		return this;
	},
	update : function(dt) {
		this.parent.update.call(this, arguments);

		var dx = 0, dy = 0;
	},
	render : function(c) {
		this.parent.render.call(this, arguments);
		
		c.save();
		c.fillStyle = "silver";
		c.fillRect(0, 0, this.size[0], this.size[1]);
		c.strokeStyle = "#0000ff";			
		c.lineWidth = 1;
		var m = 80, n = 80;
		for( var i=0; i<this.size[0]; i+=m ) {
			for( var j=0; j<this.size[1]; j+=n) {
				c.save();
				c.translate(i, j);

				c.strokeRect(0,0, m, n);
				c.restore();
			}
		}		
		c.restore();
		return this;
	}
});

// ----------------------------------
function init() {
	terrainPattern = ctx.createPattern(resources.get('img/terrain.png'),
			'repeat');

	document.getElementById('play-again').addEventListener('click', function() {
		reset();
	});

	reset();
	lastTime = Date.now();
	main();
}

// Game state
var player = {
	pos : [ 0, 0 ],
	sprite : new Sprite('img/sprites.png', [ 0, 0 ], [ 39, 39 ], 16, [ 0, 1 ])
};

var bullets = [];
var enemies = [];
var explosions = [];

var lastFire = Date.now();
var gameTime = 0;
var isGameOver;
var terrainPattern;

var score = 0;
//var scoreEl = document.getElementById('score');

// Speed in pixels per second
var playerSpeed = 200;
var bulletSpeed = 500;
var enemySpeed = 100;

// Update game objects
function update(dt) {
	gameTime += dt;

	handleInput(dt);
	updateEntities(dt);

	// It gets harder over time by adding enemies using this
	// equation: 1-.993^gameTime
	if (Math.random() < 1 - Math.pow(.993, gameTime)) {
		enemies.push({
			pos : [ canvas.width, Math.random() * (canvas.height - 39) ],
			sprite : new Sprite('img/sprites.png', [ 0, 78 ], [ 80, 39 ], 6, [
					0, 1, 2, 3, 2, 1 ])
		});
	}

	checkCollisions();

	//scoreEl.innerHTML = score;
};

function handleInput(dt) {
	if (input.isDown('DOWN') || input.isDown('s')) {
		player.pos[1] += playerSpeed * dt;
	}

	if (input.isDown('UP') || input.isDown('w')) {
		player.pos[1] -= playerSpeed * dt;
	}

	if (input.isDown('LEFT') || input.isDown('a')) {
		player.pos[0] -= playerSpeed * dt;
	}

	if (input.isDown('RIGHT') || input.isDown('d')) {
		player.pos[0] += playerSpeed * dt;
	}

	if (input.isDown('SPACE') && !isGameOver && Date.now() - lastFire > 100) {
		var x = player.pos[0] + player.sprite.size[0] / 2;
		var y = player.pos[1] + player.sprite.size[1] / 2;

		bullets.push({
			pos : [ x, y ],
			dir : 'forward',
			sprite : new Sprite('img/sprites.png', [ 0, 39 ], [ 18, 8 ])
		});
		bullets.push({
			pos : [ x, y ],
			dir : 'up',
			sprite : new Sprite('img/sprites.png', [ 0, 50 ], [ 9, 5 ])
		});
		bullets.push({
			pos : [ x, y ],
			dir : 'down',
			sprite : new Sprite('img/sprites.png', [ 0, 60 ], [ 9, 5 ])
		});

		lastFire = Date.now();
	}
}

function updateEntities(dt) {
	// Update the player sprite animation
	player.sprite.update(dt);

	// Update all the bullets
	for ( var i = 0; i < bullets.length; i++) {
		var bullet = bullets[i];

		switch (bullet.dir) {
		case 'up':
			bullet.pos[1] -= bulletSpeed * dt;
			break;
		case 'down':
			bullet.pos[1] += bulletSpeed * dt;
			break;
		default:
			bullet.pos[0] += bulletSpeed * dt;
		}

		// Remove the bullet if it goes offscreen
		if (bullet.pos[1] < 0 || bullet.pos[1] > canvas.height
				|| bullet.pos[0] > canvas.width) {
			bullets.splice(i, 1);
			i--;
		}
	}

	// Update all the enemies
	for ( var i = 0; i < enemies.length; i++) {
		enemies[i].pos[0] -= enemySpeed * dt;
		enemies[i].sprite.update(dt);

		// Remove if offscreen
		if (enemies[i].pos[0] + enemies[i].sprite.size[0] < 0) {
			enemies.splice(i, 1);
			i--;
		}
	}

	// Update all the explosions
	for ( var i = 0; i < explosions.length; i++) {
		explosions[i].sprite.update(dt);

		// Remove if animation is done
		if (explosions[i].sprite.done) {
			explosions.splice(i, 1);
			i--;
		}
	}
}

// Collisions

function collides(x, y, r, b, x2, y2, r2, b2) {
	return !(r <= x2 || x > r2 || b <= y2 || y > b2);
}

function boxCollides(pos, size, pos2, size2) {
	return collides(pos[0], pos[1], pos[0] + size[0], pos[1] + size[1],
			pos2[0], pos2[1], pos2[0] + size2[0], pos2[1] + size2[1]);
}

function checkCollisions() {
	checkPlayerBounds();

	// Run collision detection for all enemies and bullets
	for ( var i = 0; i < enemies.length; i++) {
		var pos = enemies[i].pos;
		var size = enemies[i].sprite.size;

		for ( var j = 0; j < bullets.length; j++) {
			var pos2 = bullets[j].pos;
			var size2 = bullets[j].sprite.size;

			if (boxCollides(pos, size, pos2, size2)) {
				// Remove the enemy
				enemies.splice(i, 1);
				i--;

				// Add score
				score += 100;

				// Add an explosion
				explosions.push({
					pos : pos,
					sprite : new Sprite('img/sprites.png', [ 0, 117 ],
							[ 39, 39 ], 16, [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
									11, 12 ], null, true)
				});

				// Remove the bullet and stop this iteration
				bullets.splice(j, 1);
				break;
			}
		}

		if (boxCollides(pos, size, player.pos, player.sprite.size)) {
			gameOver();
		}
	}
}

function checkPlayerBounds() {
	// Check bounds
	if (player.pos[0] < 0) {
		player.pos[0] = 0;
	} else if (player.pos[0] > canvas.width - player.sprite.size[0]) {
		player.pos[0] = canvas.width - player.sprite.size[0];
	}

	if (player.pos[1] < 0) {
		player.pos[1] = 0;
	} else if (player.pos[1] > canvas.height - player.sprite.size[1]) {
		player.pos[1] = canvas.height - player.sprite.size[1];
	}
}

// Draw everything
function render() {
	ctx.fillStyle = terrainPattern;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Render the player if the game isn't over
	if (!isGameOver) {
		renderEntity(player);
	}

	renderEntities(bullets);
	renderEntities(enemies);
	renderEntities(explosions);
};

function renderEntities(list) {
	for ( var i = 0; i < list.length; i++) {
		renderEntity(list[i]);
	}
}

function renderEntity(entity) {
	ctx.save();
	ctx.translate(entity.pos[0], entity.pos[1]);
	entity.sprite.render(ctx);
	ctx.restore();
}

// Game over
function gameOver() {
	document.getElementById('game-over').style.display = 'block';
	document.getElementById('game-over-overlay').style.display = 'block';
	isGameOver = true;
}

// Reset game to original state
function reset() {
	document.getElementById('game-over').style.display = 'none';
	document.getElementById('game-over-overlay').style.display = 'none';
	isGameOver = false;
	gameTime = 0;
	score = 0;

	enemies = [];
	bullets = [];

	player.pos = [ 50, canvas.height / 2 ];
};
