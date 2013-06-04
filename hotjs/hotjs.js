// name space
var hotjs = hotjs || {};

(function(){

// object oriented (done)
	
// app (done) -> view (done) -> scene (done) -> layer -> node (done) -> sub node ...

// event: mouse, touch, keyboard, user-defined

// resource: image (done), sprite, audio, video

// animation: move, rotate, scale, fade

// math: vector (done), matrix,

// physics: physical node (done), physical scene (done), ball collision (done), momentum (done), angular momentum, 

// tool: UT, benchmark, debug, profiling,

// AI: pathfinding

// lang: i18n

// effect: light, flash, explosion, fire, smoke, fireworks, magic

// addon: 



// -------------------------------------

hotjs.require = function(file) {
};

// tool for inherit
// See 
// "tests/test_oo.html" for example & use case
hotjs.inherit = function(childCtor, parentCtor, newMethods) {
	function F() {};
	F.prototype = parentCtor.prototype;
	
	childCtor.prototype = new F();
	childCtor.prototype.constructor = childCtor;
	
	childCtor.supClass = parentCtor.prototype;
	childCtor.supClass.constructor = parentCtor;
	
	for ( var p in newMethods) {
		if (newMethods.hasOwnProperty(p) && p !== "prototype") {
			childCtor.prototype[p] = newMethods[p];
		}
	}
};

hotjs.base = function(me, opt_methodName, var_args) {
	var caller = arguments.callee.caller;
	if (caller.supClass) {
		// This is a constructor. Call the superclass constructor.
		var args = Array.prototype.slice.call(arguments, 1);
		var f = caller.supClass.constructor;
		return f.apply(me, args);
	}

	var args = Array.prototype.slice.call(arguments, 2);
	var foundCaller = false;
	for ( var ctor = me.constructor; ctor; ctor = ctor.supClass && ctor.supClass.constructor) {
		if (ctor.prototype[opt_methodName] === caller) {
			foundCaller = true;
		} else if (foundCaller) {
			return ctor.prototype[opt_methodName].apply(me, args);
		}
	}

	// If we did not find the caller in the prototype chain,
	// then one of two things happened:
	// 1) The caller is an instance method.
	// 2) This method was not called by the right caller.
	if (me[opt_methodName] === caller) {
		return me.constructor.prototype[opt_methodName].apply(me, args);
	} else {
		throw Error('goog.base called from a method of one name '
				+ 'to a method of a different name');
	}
};

var number_of_objects = 0;

hotjs.Class = function(){
	number_of_objects ++;
	this.oid = number_of_objects;
};

hotjs.Class.getObjectNumber = function(){
	return number_of_objects;
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
		if (fromIndex == null || fromIndex == undefined) {
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

var Vector = {
	Copy : function(v) {
		return [ v[0], v[1] ];
	},
	Vert : function(v) {
		return [ v[1], -v[0] ];
	},
	Add : function (v1, v2) {
		return [ v1[0]+v2[0], v1[1]+v2[1] ];
	},
	Sub : function (v1, v2) {
		return [ v1[0]-v2[0], v1[1]-v2[1] ];
	},
	Mul : function (v, n) {
		return [v[0] * n, v[1] * n ];
	},
	Scale : function (v, n) {
		return [v[0] * n[0], v[1] * n[1] ];
	},
	ScaleDown : function(v, n) {
		return [v[0] / n[0], v[1] / n[1] ];
	},
	Length : function(v) {
		return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
	},
	Norm : function(v) {
		var n = 1 / Math.sqrt(v[0]*v[0] + v[1]*v[1]);
		return [v[0] * n, v[1] * n ];
	},
	Project : function (v1, v2) {
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

// ----------- hotjs.App ----------------------
var hotjs_app = undefined;
var hotjs_lastTime = undefined;

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

var App = function(){
	hotjs.base(this);
	
	hotjs_app = this;
	hotjs_lastTime = Date.now();
	
	this.views = [];
	this.upTime = 0;
};

hotjs.inherit(App, hotjs.Class, {
	addView : function(v) {
		this.views.push(v);
		return this;
	},
	start : function() {
		hotjs_app = this;
		
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
});

//--------- hotjs.View ----------------

var View = function(){
	hotjs.base(this);
	
	this.canvas = document.createElement("canvas");
	this.ctx = this.canvas.getContext("2d");
	this.canvas.width = 480;
	this.canvas.height = 320;
	
	this.rect = this.canvas.getBoundingClientRect();

	this.container = undefined;

	this.curScene = undefined;
	this.scenes = [];
	this.sceneIndex = {};
	this.sceneStack = [];
	
	this.fpsInfo = false;
	this.dtSum = 0;
	this.frames = 0;
	this.fps = 60;
	
	this.upTime = 0;
	this.upTimeShow = ""; // h:m:s
};

hotjs.inherit(View, hotjs.Class, {
	setContainer : function(id){
		this.container = document.getElementById(id);
		if( ! this.container ) {
			this.container = document.body;
		}
		this.container.appendChild(this.canvas);
		return this;
	},
	setSize : function(w,h) {
		this.canvas.width = w;
		this.canvas.height = h;
		this.rect = this.canvas.getBoundingClientRect();
		return this;
	},
	getSize : function() {
		return [this.canvas.width, this.canvas.height];
	},
	width : function() {
		return this.canvas.width;
	},
	height : function() {
		return this.canvas.height;
	},
	// shift view, then move scene in reverse direction
	shift : function(x,y) {
		if(!! this.curScene ) {
			this.curScene.move( -x, -y );
		}
		return this;
	},
	zoom : function(f, posCenter) {
		if(! posCenter) {
			posCenter = [this.width()/2, this.height()/2];
		}

		if(!! this.curScene ) {
			var pos = this.curScene.posFromView( posCenter );
			this.curScene.zoom( f, pos );
		}
		return this;
	},
	addScene : function(s, id) {
		this.scenes.push( s );
		if(id != undefined) {
			this.sceneIndex[id] = s;
		}
		s.setView(this);
		
		this.curScene = s;
		return this;
	}, 
	switchScene : function(s) {
		if( !! s ) {
			if(!! this.curScene ) {
				//this.curScene.stop();
			}
			this.curScene = s;
			//s.play();
		}
		return this;
	},
	switchSceneById : function(id) {
		var s = this.sceneIndex[id];
		if( !! s ) {
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
				this.upTime += this.dtSum;
				
				var s = Math.floor(this.upTime);
				var m = Math.floor( s / 60 );
				s %= 60;
				if(s<10) s="0"+s;
				h = Math.floor( m / 60 );
				m %= 60;
				if(m<10) m="0"+m;
				this.upTimeShow = h + " : " + m + " : " + s;
				
				this.fps = Math.floor( this.frames / this.dtSum + 0.5 );
				this.dtSum = 0;
				this.frames = 0;
			}
		}
		return this;
	},
	render : function() {
		var c = this.ctx;
		c.save();
		c.fillStyle = "white";
		c.fillRect( 0, 0, this.canvas.width, this.canvas.height );
		
		for(var i=0; i<this.scenes.length; i++) {
			this.scenes[i].render(c);
		}
		
		if( this.fpsInfo ) {
			c.strokeStyle = "black";
			c.fillStyle = "black";
			
			c.fillText( this.upTimeShow, 10, 20 );
			c.fillText( this.fps + ' fps: ' + this.frames, 10, 40 );
			c.fillText( this.canvas.width + " x " + this.canvas.height, 10, 60 ); 
			var rectInfo = this.rect.left + "," + this.rect.top + " -> "
			 + this.rect.right + ',' + this.rect.bottom 
			 + ' ( ' + this.rect.width + ' x ' + this.rect.height + ' ) ';
			c.fillText( rectInfo, 10, 80);
			
			if( this.curScene ) {
				var s = this.curScene.scale;
				s = Math.round(s[0] * 100) + "% x " + Math.round(s[1] * 100) + "%";
				c.fillText( s, 10, 100 );
			}

			c.strokeRect( 0, 0, this.canvas.width, this.canvas.height );
		}
		c.restore();
		
		return this;
	}
	
	// TODO: listen input events & forward
	
});

// ------------- hotjs.Node -----------
var hotjs_node_id = 0;

var Node = function() {
	hotjs.base(this);
	
	this.container = undefined;
	this.name = "node_" + (hotjs_node_id ++);
	this.subnodes = [];
	this.index = {};
	
	this.size = [40,40];
	this.bgcolor = undefined; // default: "white"
	this.color = undefined; // default: "black"
	this.img = undefined;
	this.sprite = undefined;

	// geometry, 2D only
	this.pos = [0,0];
	this.velocity = undefined; // default [0,0]

	this.rotation = undefined; // default: 0
	this.spin = undefined; // default: 0

	this.scale = undefined; // default: [1,1]
	this.shrink = undefined; // default: 1

	this.alpha = undefined; // default: 1, range: [0,1]
	this.fade = undefined; // default: 0
	
	// physical
	this.accel = undefined; // default: [0,0]
	this.mass = 1600; // default: 1600
	this.density = 1;

};

hotjs.inherit(Node, hotjs.Class, {
	setContainer : function(c) {
		this.container = c;
		return this;
	},
	setName : function(n) {
		this.name = n;
		return this;
	},
	setPos : function(x,y) {
		this.pos = [x,y];
		return this;
	},
	setSize : function(w,h) {
		this.size = [w,h];
		return this;
	},
	getSize : function() {
		return this.size;
	},
	width : function() {
		return this.size[0];
	},
	height : function() {
		return this.size[1];
	},
	setRotation : function(r) {
		this.rotation = r;
		return this;
	},
	setScale : function(sx,sy) {
		this.scale = [sx,sy];
		return this;
	},
	setVelocity : function(vx,vy) {
		this.velocity = [vx,vy];
		return this;
	},
	setSpin : function(s) {
		if( ! this.rotation ) {
			this.rotation = 0;
		}
		this.spin = s;
		return this;
	},
	setShrink : function(sx,sy) {
		if( ! this.scale ) {
			this.scale = [1,1];
		}
		this.shrink = [sx,sy];
		return this;
	},
	setMass : function(m) {
		this.mass = m;
		return this;
	},
	setDensity : function(d) {
		this.density = d;
		this.mass = this.size[0] * this.size[1] * d;
		return this;
	},
	setAccel : function(ax,ay) {
		if( ! this.velocity ) {
			this.velocity = [0,0];
		}
		this.accel = [ax,ay];
		return this;
	},
	setColor : function(c) {
		this.color = c;
		return this;
	},
	setBgColor : function(c) {
		this.bgcolor = c;
		return this;
	},
	// alpha, range [0,1]
	setAlpha : function(a) {
		this.alpha = a;
		return this;
	},
	// f can be a small like, like 1.0/60; or function: alpha = f(alpha)
	setFade : function(f) {
		if(this.alpha == undefined) this.alpha=1;
		this.fade = f;
		return this;
	},
	setImage : function(img) {
		this.img = img;
		if(! this.size) this.size = [img.width, img.height];
		return this;
	},
	addNode : function(n, id) {
		if(this.subnodes == undefined) this.subnodes=[];
		if(this.index == undefined) this.index={};
		
		this.subnodes.push(n);
		if(typeof id == 'string') {
			this.index[id] = n;
		}
		n.setContainer(this);
		
		return this;
	},
	removeNode : function(n) {
		var i = this.subnodes.indexOf(n);
		if( i>=0 ) this.subnodes.splice(i, 1);
		n.setContainer(undefined);
		
		return this;
	},
	update : function(dt) {
		// update pos / rotation / scale, according to velocity / spin / shrink
		if(this.velocity !== undefined) {
			this.pos[0] += this.velocity[0];
			this.pos[1] += this.velocity[1];
		}
		if(this.spin !== undefined) {
			this.rotation += this.spin;
		}
		if(this.shrink !== undefined) {
			this.scale[0] *= this.shrink[0];
			this.scale[1] *= this.shrink[1];
		}
		
		// update velocity / alpha, according to accel / fade
		if(this.accel !== undefined) {
			this.velocity[0] += this.accel[0];
			this.velocity[1] += this.accel[1];
		}
		if(this.fade !== undefined) {
			if(typeof this.fade == 'number') {
				this.alpha += this.fade;
				if(this.alpha<0 || this.alpha>1) this.fade=undefined;
			} else if (typeof this.fade == 'function') {
				this.alpha = this.fade( this.alpha, dt );
			}
		}

		for(var i=0; i<this.subnodes.length; i++) {
			this.subnodes[i].update(dt);
		}
		
		return this;
	},
	render : function(c) {
		c.save();
		
		// apply pos / scale / rotation
		c.translate(this.pos[0], this.pos[1]);
		if(this.scale !== undefined) c.scale(this.scale[0],this.scale[1]);
		if(this.rotation !== undefined) c.rotate(this.rotation * Math.PI / 180);
		if(this.alpha !== undefined) c.globalAlpha = this.alpha;
		//if(this.composite !== undefined) c.globalCompositeOperation = this.compositeOperation;
		
		this.draw(c);
		
		for(var i=0; i<this.subnodes.length; i++) {
			this.subnodes[i].render(c);
		}
		
		c.restore();
		return this;
	},
	draw : function(c) {
		if(this.img !== undefined) {
			//c.translate( - this.img.width/2, -this.img.height/2 );
			c.translate( - this.size[0]/2, -this.size[1]/2 );
			c.scale( this.size[0]/this.img.width, this.size[1]/this.img.height);
			c.drawImage( this.img, 0, 0 );
		}
		
		return this;
	}
});

//------------- hotjs.Scene -----------

var Scene = function(){
	hotjs.base(this);
	
	this.grid = false;
	this.color = "black";
	this.bgcolor = "white";

	this.playing = false;
};

hotjs.inherit( Scene, Node, {
	setView : function(v) {
		this.setContainer(v);
		this.zoom();
		return this;
	},
	posFromView : function(p) {
		var x = p[0] - this.pos[0], 
			y = p[1] - this.pos[1];

		if(this.scale != undefined) {
			x /= this.scale[0];
			y /= this.scale[1];
		}
		
		return [ x, y ];
	},
	posToView : function(p) {
		var x = p[0], y = p[1];

		if(this.scale != undefined) {
			x *= this.scale[0];
			y *= this.scale[1];
		}
		
		return [x + this.pos[0], y + this.pos[1]];
	},
	// ensure the scene is always in view
	fixView : function() {		
		if( this.pos[0] >0 ) this.pos[0]=0;
		if( this.pos[1] >0 ) this.pos[1]=0;
		
		var posRightBottom = Vector.Add( Vector.Scale(this.size, this.scale), this.pos );
		var offsetRB = Vector.Sub( this.container.getSize(), posRightBottom );
		
		if( offsetRB[0] >0) this.pos[0] += offsetRB[0];
		if( offsetRB[1] >0) this.pos[1] += offsetRB[1];

		return this;
	},
	move : function(x, y) {
		this.pos[0] += x;
		this.pos[1] += y;
		
		this.fixView();
		
		return this;
	},
	zoom : function(f, posCenter) {
		var vSize = this.container.getSize();
		var sXY = [ vSize[0] / this.size[0], vSize[1] / this.size[1] ];
		var sMin = Math.max(sXY[0], sXY[1]);

		if( f == 'none' ) {
			this.scale = [1,1];
			this.pos = [ (vSize[0]-this.size[0])/2, (vSize[1]-this.size[1])/2 ];
			
		} else if (f == 'stretch') {
			this.scale = sXY;
			this.pos = [0,0];
			
		} else if( f > 0 ) {
			if(! this.scale) this.scale = [1,1];
			
			// no smaller than view (container) size
			var fMin = [ sMin/this.scale[0], sMin/this.scale[1] ];
			f = Math.max(fMin[0], Math.max(fMin[1], f));

			// posCenter -> posInView -> offsetChange -> move
			// code #1
			//var posInView = Vector.Scale( posCenter, this.scale );
			//var offsetChange = Vector.Mul( posInView, f-1 );
			//this.pos = Vector.Sub( this.pos, offsetChange );

			// code #2, optimized, no function call
			this.pos = [ this.pos[0] - posCenter[0] * this.scale[0] * (f-1),
			             this.pos[1] - posCenter[1] * this.scale[1] * (f-1)
			            ];
			
			this.scale = Vector.Mul( this.scale, f );
	
			// ensure scene always in view
			if( this.scale[0] <sMin || this.scale[1] < sMin ) {
				this.scale = [sMin, sMin];
			}
			
			this.fixView();

		} else {
			// by default, scale & center scene to fit view
			this.scale = [sMin, sMin];
			this.pos = [ (vSize[0] - this.size[0] * sMin) /2, (vSize[1] - this.size[1] * sMin)/2 ];
		}
		
		return this;
	},
	
	showGrid : function(g) {
		this.grid = g;
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
		Scene.supClass.update.call(this, dt);
		
		// TODO: somethig to do here ?
	},

	draw : function(c) {
		c.save();
		c.fillStyle = this.bgcolor;
		c.fillRect(0, 0, this.size[0], this.size[1]);
		
		if( this.grid ) {
			c.strokeStyle = this.color;			
			c.lineWidth = 0.5;
			var dx = 40, dy = 40, w = this.size[0], h = this.size[1];
			c.beginPath();
			for( var x=0; x<=w; x += dx ) {
				c.moveTo(x, 0);
				c.lineTo(x, h);
			}
			for( var y=0; y<=h; y += dy ) {
				c.moveTo(0, y);
				c.lineTo(w, y);
			}
			c.stroke();
			
			c.lineWidth = 1;
			c.translate( this.size[0]/2, this.size[1]/2 );
			c.beginPath();
			c.arc(0, 0, 10, 0, Math.PI * 2);
			c.stroke();
		}
		c.restore();
		return this;
	}
});

hotjs.Vector = Vector;
hotjs.Node = Node;
hotjs.Scene = Scene;
hotjs.View = View;
hotjs.App = App;

})(); 

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


