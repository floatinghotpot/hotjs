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

// TODO: random functions
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

// TODO: Vector functions
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

// class HashMap
var HashMap = function() {
	this.elements = new Array();

	this.size = function() {
		return this.elements.length;
	};

	this.isEmpty = function() {
		return (this.elements.length < 1);
	};

	this.clear = function() {
		this.elements = new Array();
	};

	this.put = function(_key, _value) {
		var isContainKey = false;
		for ( var i = 0; i < this.elements.length; i++) {
			if (this.elements[i].key == _key) {
				isContainKey = true;
				this.elements[i].value = _value;
				break;
			}
		}
		if (isContainKey == false) {
			this.elements.push({
				key : _key,
				value : _value
			});
		}
	};

	this.remove = function(_key) {
		var bln = false;
		try {
			for ( var i = 0; i < this.elements.length; i++) {
				if (this.elements[i].key == _key) {
					this.elements.splice(i, 1);
					return true;
				}
			}
		} catch (e) {
			bln = false;
		}
		return bln;
	};

	this.get = function(_key) {
		try {
			for ( var i = 0; i < this.elements.length; i++) {
				if (this.elements[i].key == _key) {
					return this.elements[i].value;
				}
			}
		} catch (e) {
			return null;
		}
	};

	this.element = function(_index) {
		if (_index < 0 || _index >= this.elements.length) {
			return null;
		}
		return this.elements[_index];
	};

	this.containsKey = function(_key) {
		var bln = false;
		try {
			for ( var i = 0; i < this.elements.length; i++) {
				if (this.elements[i].key == _key) {
					bln = true;
					break;
				}
			}
		} catch (e) {
			bln = false;
		}
		return bln;
	};

	this.containsValue = function(_value) {
		var bln = false;
		try {
			for ( var i = 0; i < this.elements.length; i++) {
				if (this.elements[i].value == _value) {
					bln = true;
					break;
				}
			}
		} catch (e) {
			bln = false;
		}
		return bln;
	};

	this.values = function() {
		var arr = new Array();
		for ( var i = 0; i < this.elements.length; i++) {
			arr.push(this.elements[i].value);
		}
		return arr;
	};

	this.keys = function() {
		var arr = new Array();
		for ( var i = 0; i < this.elements.length; i++) {
			arr.push(this.elements[i].key);
		}
		return arr;
	};
};

// ----------------------
// TODO: class App

var hotjs_app = undefined;
var hotjs_lastTime = undefined;

// The main game loop call back
hotjs_main = function(){
	var now = Date.now();
	var dt = (now - hotjs_lastTime); // / 1000.0;

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

//------------------------
// TODO: class View
var View = function(){
	hotjs.base(this);
	
	this.canvas = document.createElement("canvas");
	this.ctx = this.canvas.getContext("2d");
	
	this.canvas.width = 480;
	this.canvas.height = 320;
	this.rect = this.canvas.getBoundingClientRect();

	this.container = undefined;

	// all scenes
	this.scenes = [];
	this.sceneIndex = {};
	
	// visible scene
	this.curScene = undefined;

	// TODO: reserved, support layered scene for transition animation.
	this.visibleScenes = [];
	
	this.bFps = false;
	this.dtSum = 0;
	this.frames = 0;
	this.fps = 60;
	
	this.upTime = 0;
	this.upTimeShow = "0 : 00 : 00"; // h:m:s
	
	this.dragItems = new hotjs.HashMap();
	this.touches = new hotjs.HashMap();
	
	// for testing only, [x,y,id]
	this.mouseInView = [0,0,0]; 
	this.mouseInScene = [0,0,0];
	
	// register mouse/touch events
	this.canvas.hotjsView = this;
	this.canvas.addEventListener('click',function(e){
		this.hotjsView.onClick(e);
	});
	this.canvas.addEventListener('mousedown',function(e){
		this.hotjsView.onMouseDown(e);
	});
	this.canvas.addEventListener('mouseup',function(e){
		this.hotjsView.onMouseUp(e);
	});
	this.canvas.addEventListener('mousemove',function(e){
		this.hotjsView.onMouseMove(e);
	});
	this.canvas.addEventListener('touchstart',function(e){
		this.hotjsView.onTouchStart(e);
	});
	this.canvas.addEventListener('touchend',function(e){
		this.hotjsView.onTouchEnd(e);
	});
	this.canvas.addEventListener('touchmove',function(e){
		this.hotjsView.onTouchMove(e);
	});	
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
		if(f == undefined) f = (! this.bFps);
		this.bFps = f;
		return this;
	},
	update : function(dt) {
		for(var i=0; i<this.scenes.length; i++) {
			this.scenes[i].update(dt);
		}

		this.frames ++;
		this.dtSum += dt;
	
		if( this.dtSum > 1000 ) {
			this.rect = this.canvas.getBoundingClientRect();

			this.upTime += this.dtSum;
			this.fps = Math.round( this.frames * 1000 / this.dtSum );
			
			this.dtSum = 0;
			this.frames = 0;

			if(this.bFps) {
				var s = Math.floor(this.upTime / 1000);
				var m = Math.floor( s / 60 );
				s %= 60;
				if(s<10) s="0"+s;
				h = Math.floor( m / 60 );
				m %= 60;
				if(m<10) m="0"+m;
				this.upTimeShow = h + " : " + m + " : " + s;
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
		
		this.draw(c);
		
		c.restore();		
		return this;
	},
	draw : function(c) {
		if( this.bFps ) {
			c.strokeStyle = "black";
			c.fillStyle = "black";
			
			c.fillText( this.upTimeShow, 10, 20 );
			c.fillText( this.fps + ' fps: ' + this.frames, 10, 40 );
			c.fillText( '(' + this.canvas.width + " x " + this.canvas.height + ')', 10, 60 ); 
			var rectInfo = '(' + this.rect.width + ' x ' + this.rect.height + ')' 
			 + ': ('+this.rect.left + "," + this.rect.top + ") -> (" + this.rect.right + ',' + this.rect.bottom + ')';
			c.fillText( rectInfo, 10, 80);
			
			if( this.curScene ) {
				var s = this.curScene.scale;
				s = Math.round(s[0] * 100) + "% x " + Math.round(s[1] * 100) + "%";
				c.fillText( s, 10, 100 );
			}
			
			c.fillText( this.mouseInView[2] + ': (' + this.mouseInView[0] + ', ' + this.mouseInView[1] + ')', 10, 120 );
			c.fillText( this.mouseInScene[2] + ': (' + this.mouseInScene[0] + ', ' + this.mouseInScene[1] +')', 10, 140 );

			c.strokeRect( 0, 0, this.canvas.width, this.canvas.height );
		}
	},
	// listen input events & forward
	touchFromEvent : function(e) {
		var el = this.canvas;
		var elDocument = el.ownerDocument || el.document || document;
		var elHtml = elDocument.documentElement;
		var elBody = elDocument.body;
		var scrollX = elHtml.scrollLeft || elBody.scrollLeft;
		var scrollY = elHtml.scrollTop || elBody.scrollTop;
		
		var id = e.identifier;
		if (e.identifier == undefined) id = 0;
		return {
			id : id,
			x : Math.round( e.pageX - this.rect.left - scrollX ),
			y : Math.round( e.pageY - this.rect.top - scrollY )
		};
	},
	click : function(pos) {
		// pass to scene
		var s = this.curScene;
		if( !! s ) {
			var xy = s.posFromView( [t.x, t.y] );
			if( s.inRange(t.x, t.y) ) {
				var ts = { id: t.id, x: xy[0], y: xy[1] };
				return s.onClick( ts );
			}
		}

		return false;
	},
	onClick : function(e) {
		// ignore, just fire the click event by ourselves.
		return false;

		//var t = this.touchFromEvent(e);
		//this.click( t );
	},
	inRange : function(x,y) {
		
	},
	onMouseDown : function(e) {
		var t = this.touchFromEvent(e);
		this.mouseInView = [t.x, t.y, t.id];

		this.touches.put( t.id, [t.x, t.y] );
		
		// pass to scene
		var s = this.curScene;
		if( !! s ) {
			var xy = s.posFromView( [t.x, t.y] );
			this.mouseInScene = [ Math.round(xy[0]), Math.round(xy[1]), t.id ];

			//this.dragItems.put( t.id, s );
			//s.dragStart( t ); 
			//return true;

			if( s.inRange(t.x, t.y) ) {
				var ts = { id: t.id, x: xy[0], y: xy[1] };
				if( s.onTouchStart( ts ) ) return true;
				
				// drag scene 
				this.dragItems.put( t.id, s );
				return s.dragStart( t );
			}
		}
		return false;
	},	
	onMouseUp : function(e) {
		var t = this.touchFromEvent(e);
		this.mouseInView = [t.x, t.y, t.id];

		var s = this.dragItems.get( t.id );
		if( !! s ) {
			var xy = s.posFromView( [t.x, t.y] );
			this.mouseInScene = [ Math.round(xy[0]), Math.round(xy[1]), t.id ];

			s.drop( t );
			this.dragItems.remove( t.id );
			return true;
		}

		var t0 = this.touches.get( t.id );
		if( t0 != null ) {
			this.touches.remove( t.id );
			
			// finger is not accurate, so range in 5 pixel is okay.
			var vect = [ t.x - t0.x, t.y - t0.y ];
			if( Vector.Length(vect) <= 25 ) {
				this.click( t );
			} else {
				// pass to scene
				var s = this.curScene;
				if(!! s ) {
					var xy = s.posFromView( [t.x, t.y] );
					this.mouseInScene = [ Math.round(xy[0]), Math.round(xy[1]), t.id ];
					
					var ts = { id: t.id, x: xy[0], y: xy[1] };
					return s.onTouchEnd( ts );
				}
			}
		}
		
		return false;
	},
	onMouseMove : function(e) {
		var t = this.touchFromEvent(e);
		this.mouseInView = [t.x, t.y, t.id];
		
		// if a scene is being dragged, then drag it
		var s = this.dragItems.get( t.id );
		if( !! s ) {
			var xy = s.posFromView( [t.x, t.y] );
			this.mouseInScene = [ Math.round(xy[0]), Math.round(xy[1]), t.id ];
			
			s.drag( t );
			return true;
		}

		// pass to scene
		var s = this.curScene;
		if(!! s ) {
			var xy = s.posFromView( [t.x, t.y] );
			this.mouseInScene = [ Math.round(xy[0]), Math.round(xy[1]), t.id ];
			
			var ts = { id: t.id, x: xy[0], y: xy[1] };
			return s.onTouchMove( ts );
		}
		return false;
	},	
	
	onTouchStart : function(e) {
		for ( var i = 0; i < e.targetTouches.length; i++) {
			this.onMouseDown(e.targetTouches[i]);
		}
		e.preventDefault();
	},
	onTouchEnd : function(e) {
		for ( var i = 0; i < e.changedTouches.length; i++) {
			this.onMouseUp(e.changedTouches[i]);
		}
		e.preventDefault();
	},
	onTouchMove : function(e) {
		for ( var i = 0; i < e.targetTouches.length; i++) {
			this.onMouseMove(e.targetTouches[i]);
		}
		e.preventDefault();
	}
});

// ------------- hotjs.Node -----------
var hotjs_node_id = 0;

var Node = function() {
	hotjs.base(this);
	
	this.container = undefined;
	this.name = "node_" + (hotjs_node_id ++);
	this.subnodes = undefined;
	this.index = {};
	
	this.size = [40,40];
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

	this.draggable = undefined;
	this.moveable = undefined;
};

//-----------------------
// TODO: class Node
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
	inRange : function(x,y) {
		var xc = this.pos[0], yc = this.pos[1];
		var halfw = this.size[0]/2, halfh = this.size[1]/2;
		return ((x >= (xc-halfw)) && (x <=(xc+halfw)) && (y >= (yc-halfh)) && (y <= (yc+halfh)));
	},
	setDraggable : function(b) {
		this.draggable = b;
		return this;
	},
	setMoveable : function(b) {
		this.moveable = b;
		return this;
	},
	dragStart : function(t) {
		this.pos0 = [ this.pos[0], this.pos[1] ];
		this.t0 = { id: t.id, x: t.x, y: t.y };

		if(!! this.draggable) {
			this.setVelocity(0, 0);
			//this.setSpin(0,0);			
		}
		return true;
	},
	drag : function(t) {
		if(!! this.draggable) {
			this.dragging = true;
			this.pos = Vector.Add( this.pos0, Vector.Sub([t.x,t.y], [this.t0.x, this.t0.y]) );
			//this.setVelocity(0, 0);
			//this.setSpin(0,0);
			
			return true;
		}
		return false;
	},
	drop : function(t) {
		this.dragging = false;
		if(!! this.moveable) {
			this.pos = Vector.Add( this.pos0, Vector.Sub([t.x,t.y], [this.t0.x, this.t0.y]) );
		} else {
			this.pos = [ this.pos0[0], this.pos0[1] ];
		}
		return true;
	},
	onTouchMove : function(t) {
		if( !! this.dragItems ) {
			// if a sub node is being dragged, then drag it
			var n = this.dragItems.get( t.id );
			if( !! n ) {
				n.drag( t );
			}
		}
		
		if( !! this.subnodes ) {
			// pass to subnodes
			for(var i=this.subnodes.length-1; i>=0; i--) {
				var n = this.subnodes[i];
				if( n.inRange(t.x, t.y) ) {
					return n.onTouchMove( t );
				}
			}
		}
		
		return false;
	},	
	onTouchStart : function(t) {
		if( !! this.touches ) {
			this.touches.put( t.id, [t.x, t.y] );
		}
		
		if(!! this.subnodes) {
			for(var i=this.subnodes.length-1; i>=0; i--) {
				var n = this.subnodes[i];
				if( (!! n.draggable) && n.inRange(t.x, t.y) ) {
					if(!! this.dragItems) {
						// drag subnode 
						this.dragItems.put( t.id, n );
						return n.dragStart( t );
					}
				}
			}
		}
		return false;
	},	
	onTouchEnd : function(t) {
		if( !! this.touches ) {
			var t0 = this.touches.get( t.id );
			if( !! t0 ) {
				this.touches.remove( t.id );
			}
		}
		
		if( !! this.dragItems ) {
			var n = this.dragItems.get( t.id );
			if( !! n ) {
				this.dragItems.remove( t.id );
				return n.drop( t );
			}
		}
		return false;
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
	// alpha, range [0,1]
	setAlpha : function(a) {
		this.alpha = a;
		return this;
	},
	// f can be a small number, like 1.0/60; or function: alpha = f(alpha)
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
		if(this.dragItems == undefined) this.dragItems = new hotjs.HashMap();
		if(this.touches == undefined) this.touches = new hotjs.HashMap();	
		
		this.subnodes.push(n);
		if(typeof id == 'string') {
			this.index[id] = n;
		}
		n.setContainer(this);
		
		return this;
	},
	removeNode : function(n) {
		if(!! this.subnodes) {
			var i = this.subnodes.indexOf(n);
			if( i>=0 ) {
				this.subnodes.splice(i, 1);
				n.setContainer(undefined);
			}
		}
		
		return this;
	},
	removeAll : function() {
		if(!! this.subnodes) {
			while( this.subnodes.length > 0) {
				n = this.subnodes.pop();
				if("removeAll" in n) n.removeAll();
			}
			for( id in this.index ) {
				delete this.index[id];
			}
		}
		return this;
	},
	update : function(dt) {
		if(!! this.subnodes) {
			for(var i=0; i<this.subnodes.length; i++) {
				this.subnodes[i].update(dt);
			}
		}
		
		if( !! this.dragging ) 	return this;
		
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
		
		if(!! this.subnodes) {
			for(var i=0; i<this.subnodes.length; i++) {
				this.subnodes[i].render(c);
			}
		}
		
		c.restore();
		return this;
	},
	draw : function(c) {
		c.save();
		c.translate( - this.size[0]/2, -this.size[1]/2 );
		if( !! this.img ) {
			c.scale( this.size[0]/this.img.width, this.size[1]/this.img.height);
			c.drawImage( this.img, 0, 0 );
		} else {
			c.strokeRect(0,0, this.size[0], this.size[1]);
		}
		c.restore();
		
		return this;
	}
});

//-----------------------
// TODO: class Scene
// Note: in a scene, this.pos is the [left,top]
var Scene = function(){
	hotjs.base(this);
	
	this.grid = false;
	this.bgimg = true;
	this.color = "black";
	this.bgcolor = "white";
};

hotjs.inherit( Scene, Node, {
	setView : function(v) {
		this.setContainer(v);
		this.zoom();
		this.setDraggable(true);
		this.setMoveable(true);
		
		return this;
	},
	setBgColor : function(c) {
		this.bgcolor = c;
		return this;
	},
	inRange : function(x,y) {
		var b1 = (x >= this.pos[0]);
		var b2 = (x <= this.pos[0] + this.size[0]);
		var b3 = (y >= this.pos[1]);
		var b4 = (y <= this.pos[1] + this.size[1]);
		return b1 && b2 && b3 && b4;
	},
	drag : function(t) {
		var ret = Scene.supClass.drag.call(this, t);
		
		this.fixView();
		this.setVelocity(0,0);
		this.setSpin(0,0);
		
		return ret;
	},
	drop : function(t) {
		var ret = Scene.supClass.drop.call(this, t);
		
		this.fixView();
		this.setVelocity(0,0);
		this.setSpin(0,0);
		
		return ret;
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
		if(g == undefined) g = (! this.grid);
		this.grid = g;
		return this;
	},
	showBgImg : function(g) {
		if(g == undefined) g = (! this.bgimg);
		this.bgimg = g;
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
		
		this.checkInteraction();
		
		return this;
	},
	checkInteraction : function() {
	},
	// override node.draw(), ignore all node.draw() content.
	draw : function(c) { 
		c.save();

		if( (!! this.img) && (this.bgimg) ) {
			c.save();
			c.scale( this.size[0]/this.img.width, this.size[1]/this.img.height);
			c.drawImage( this.img, 0, 0 );
			c.restore();
		} else {
			c.fillStyle = this.bgcolor;
			c.fillRect(0, 0, this.size[0], this.size[1]);
		}
		
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

//-----------------------
// TODO: all packages, classes, and function set
hotjs.Random = Random;
hotjs.Vector = Vector;
hotjs.HashMap = HashMap;
hotjs.App = App;
hotjs.View = View;
hotjs.Node = Node;
hotjs.Scene = Scene;

})(); 
