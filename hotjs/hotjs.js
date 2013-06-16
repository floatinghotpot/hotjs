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

hotjs.version = 1.0;

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
	copy : function(v) {
		return [ v[0], v[1] ];
	},
	vert : function(v) {
		return [ v[1], -v[0] ];
	},
	add : function (v1, v2) {
		return [ v1[0]+v2[0], v1[1]+v2[1] ];
	},
	sub : function (v1, v2) {
		return [ v1[0]-v2[0], v1[1]-v2[1] ];
	},
	mul : function (v, n) {
		return [v[0] * n, v[1] * n ];
	},
	scale : function (v, n) {
		return [v[0] * n[0], v[1] * n[1] ];
	},
	scaleDown : function(v, n) {
		return [v[0] / n[0], v[1] / n[1] ];
	},
	getLength : function(v) {
		return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
	},
	norm : function(v) {
		var n = 1 / Math.sqrt(v[0]*v[0] + v[1]*v[1]);
		return [v[0] * n, v[1] * n ];
	},
	angle : function(v) {
		var a = Math.acos( v[0] / Math.sqrt(v[0]*v[0] + v[1]*v[1]) );
		if( v[1] < 0 ) a = - a; 
		return a;
	},
	project : function (v1, v2) {
		var v1x = v1[0], v1y = v1[1];
		var v2x = v2[0], v2y = v2[1];
		var ang1 = Math.atan2(v1y,v1x);
		var ang2 = Math.atan2(v2y,v2x);
		var ang = ang1 - ang2;
		var v = Math.sqrt( v1x * v1x + v1y * v1y ) * Math.cos(ang);
		var vx = v * Math.cos(ang2);
		var vy = v * Math.sin(ang2);
		return [vx, vy];
	},
	inRect : function(v, r) { // [x,y,w,h]
		return ((v[0]>=r[0]) && (v[0]<r[0]+r[2])) && ((v[1]>=r[1]) && (v[1]<r[1]+r[3]));
	},
	inCircle : function(v1, v2, r) {
		return ((v1[0]-v2[0])*(v1[0]-v2[0])+(v1[1]-v2[1])*(v1[1]-v2[1]) <= (r*r));
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

// -----------------------------------
// TODO: hotjs.Class, the root class
var number_of_objects = 0;

hotjs.Class = function(){
	number_of_objects ++;
	this.oid = number_of_objects;
};

hotjs.Class.prototype = {
	getObjectNumber : function(){
		return number_of_objects;
	},
	addNode : function(subnode, id){
		return this;
	},
	addTo : function(container, id) {
		container.addNode(this, id);
		return this;
	}	
};
		
// ----------------------
// TODO: class App

var App = function(){
	hotjs.base(this);
	
	hotjs_app = this;
	hotjs_lastTime = Date.now();
	
	this.views = [];
	this.upTime = 0;
};

hotjs.inherit(App, hotjs.Class, {
	addNode : function(v) {
		this.views.push(v);
		return this;
	},
	start : function() {
		// using closure, me is accessable to inner function, but 'this' changed.
		var me = this;
		var lastTime = Date.now();
		
		function app_loop(){
			var now = Date.now();
			var dt = (now - lastTime) / 1000.0;
			
			me.update( dt );
			me.render();
			
			lastTime = now;
			requestAnimFrame( app_loop );
		}
		
		app_loop();

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

	this.bFps = false;
	this.dtSum = 0;
	this.frames = 0;
	this.fps = 60;
	
	this.upTime = 0;
	this.upTimeShow = "0 : 00 : 00"; // h:m:s
	
	this.infoPos = [40, 40];
	
	this.dragItems = new hotjs.HashMap();
	this.touches = new hotjs.HashMap();
	
	// for testing only, [x,y,id]
	this.mouseInView = [0,0,0]; 
	this.mouseInNode = [0,0,0];
	
	this.touch_accuracy = 3;
	
	// using closure, 'me' is accessable to inner function, but 'this' changed.
	var me = this; 
	this.canvas.addEventListener('click',function(e){
		me.onClick(e);
		e.preventDefault();
	});
	this.canvas.addEventListener('mousedown',function(e){
		me.onMouseDown(e);
		e.preventDefault();
	});
	this.canvas.addEventListener('mouseup',function(e){
		me.onMouseUp(e);
		e.preventDefault();
	});
	this.canvas.addEventListener('mousemove',function(e){
		me.onMouseMove(e);
		e.preventDefault();
	});
	this.canvas.addEventListener('touchstart',function(e){
		me.onTouchStart(e);
		e.preventDefault();
	});
	this.canvas.addEventListener('touchend',function(e){
		me.onTouchEnd(e);
		e.preventDefault();
	});
	this.canvas.addEventListener('touchmove',function(e){
		me.onTouchMove(e);
		e.preventDefault();
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
			var pos = this.curScene.posFromContainer( posCenter );
			this.curScene.zoom( f, pos );
		}
		return this;
	},
	addNode : function(s, id) {
		this.scenes.push( s );
		if(id != undefined) {
			this.sceneIndex[id] = s;
		}
		s.setContainer(this);
		
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
	
		if( this.dtSum > 1.0 ) {
			this.rect = this.canvas.getBoundingClientRect();

			this.upTime += this.dtSum;
			this.fps = Math.round( this.frames / this.dtSum );
			
			this.dtSum = 0;
			this.frames = 0;

			if(this.bFps) {
				var s = Math.floor(this.upTime);
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
	setInfoPos : function(x,y) {
		this.infoPos = [x, y];
		return this;
	},
	draw : function(c) {
		if( this.bFps ) {
			c.strokeStyle = "black";
			c.fillStyle = "black";
			
			c.fillText( this.upTimeShow, this.infoPos[0], this.infoPos[1] + 20 );
			c.fillText( this.fps + ' fps: ' + this.frames, this.infoPos[0], this.infoPos[1] + 40 );
			c.fillText( '(' + this.canvas.width + " x " + this.canvas.height + ')', this.infoPos[0], this.infoPos[1] + 60 ); 
			var rectInfo = '(' + this.rect.width + ' x ' + this.rect.height + ')' 
			 + ': ('+this.rect.left + "," + this.rect.top + ") -> (" + this.rect.right + ',' + this.rect.bottom + ')';
			c.fillText( rectInfo, this.infoPos[0], this.infoPos[1] + 80);
			
			if( this.curScene && this.curScene.scale ) {
				var s = this.curScene.scale;
				s = Math.round(s[0] * 100) + "% x " + Math.round(s[1] * 100) + "%";
				c.fillText( s, this.infoPos[0], this.infoPos[1] + 100 );
			}
			
			c.fillText( this.mouseInView[2] + ': (' + this.mouseInView[0] + ', ' + this.mouseInView[1] + ')', this.infoPos[0], this.infoPos[1] + 120 );
			c.fillText( this.mouseInNode[2] + ': (' + this.mouseInNode[0] + ', ' + this.mouseInNode[1] +')', this.infoPos[0], this.infoPos[1] + 140 );

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
	click : function( t ) {
		// pass to scene
		var s = this.curScene;
		if( !! s ) {
			if( s.inRange( [t.x, t.y] ) ) {
				return s.onClick( t );
			}
		}

		return false;
	},
	onClick : function(e) {
		// ignore, just fire the click event by ourselves.
		return false;

		// var t = this.touchFromEvent(e);
		// this.click( t );
	},
	onMouseDown : function(e) {
		var t = this.touchFromEvent(e);
		this.touches.put( t.id, [t.x, t.y] );
		
		// for debug
		this.mouseInView = [t.x, t.y, t.id];
		this.t0 = [t.x, t.y];

		// pass to scene
		var s = this.curScene;
		if( !! s ) {
			if( s.inRange( [t.x, t.y] ) ) {
				if( s.draggable ) this.dragItems.put( t.id, s );
				return s.onTouchStart( t );
			}
		}
		
		return false;
	},	
	onMouseUp : function(e) {
		var t = this.touchFromEvent(e);
		this.touches.remove( t.id );
		
		// for debug
		this.mouseInView = [t.x, t.y, t.id];

		// finger is not accurate, so range in 5 pixel is okay.
		var vect = [ t.x - this.t0[0], t.y - this.t0[1] ];
		if( Vector.getLength(vect) <= this.touch_accuracy ) {
			this.click( t );
		}

		var s = this.dragItems.get( t.id );
		if( !! s ) {
			this.dragItems.remove( t.id );
			return s.onTouchEnd( t );
		}
		
		// pass to scene
		var s = this.curScene;
		if( !! s ) {
			if( s.inRange( [t.x, t.y] ) ) {
				return s.onTouchEnd( t );
			}
		}		

		return false;
	},
	onMouseMove : function(e) {
		var t = this.touchFromEvent(e);
		
		// for debug
		this.mouseInView = [t.x, t.y, t.id];
		
		// if a scene is being dragged, then drag it
		var s = this.dragItems.get( t.id );
		if( !! s ) {
			return s.onTouchMove( t );
		}

		// pass to scene
		var s = this.curScene;
		if( !! s ) {
			return s.onTouchMove( t );
		}
		
		return false;
	},	
	
	onTouchStart : function(e) {
		this.touch_accuracy = 10;
		for ( var i = 0; i < e.targetTouches.length; i++) {
			this.onMouseDown(e.targetTouches[i]);
		}
	},
	onTouchEnd : function(e) {
		this.touch_accuracy = 10;
		for ( var i = 0; i < e.changedTouches.length; i++) {
			this.onMouseUp(e.changedTouches[i]);
		}
	},
	onTouchMove : function(e) {
		this.touch_accuracy = 10;
		for ( var i = 0; i < e.targetTouches.length; i++) {
			this.onMouseMove(e.targetTouches[i]);
		}
	}
});

//-----------------------
//TODO: class Node
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
	this.imgrect = undefined; // [x,y,w,h]
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

hotjs.inherit(Node, hotjs.Class, {
	setContainer : function(c) {
		this.container = c;
		return this;
	},
	setName : function(n) {
		this.name = n;
		return this;
	},
	getName : function() {
		return this.name;
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
	posFromContainer : function(p) {
		var x = p[0] - this.pos[0], 
			y = p[1] - this.pos[1];

		if(!! this.scale) {
			x /= this.scale[0];
			y /= this.scale[1];
		}
		
		return [ Math.floor(x), Math.floor(y) ];
	},
	posToContainer : function(p) {
		var x = p[0], y = p[1];

		if(!! this.scale) {
			x *= this.scale[0];
			y *= this.scale[1];
		}
		
		return [ Math.floor(x + this.pos[0]), Math.floor(y + this.pos[1])];
	},
	inRange : function( pos ) {
		var p = this.posFromContainer( pos );
		var b = (p[0]>=0) && (p[0]<this.size[0]) && (p[1]>=0) && (p[1]<this.size[1]);
		return b;
	},
	setDraggable : function(b) {
		this.draggable = b;
		return this;
	},
	setMoveable : function(b) {
		this.moveable = b;
		return this;
	},
	onClick : function(t) {
		// override if need handle click event
		var pos = this.posFromContainer( [t.x, t.y] );
		var ts = { id:t.id, x: pos[0], y: pos[1] };

		// for debug purpose
		this.container.mouseInNode = [ts.x, ts.y, ts.id];

		if( !! this.subnodes ) {
			// pass to subnodes
			for(var i=this.subnodes.length-1; i>=0; i--) {
				var n = this.subnodes[i];
				if( n.inRange( pos ) ) {
					return n.onClick( ts );
				}
			}
		}
	},
	onTouchMove : function(t) {
		if( !! this.dragging ) {
			var delta = Vector.sub([t.x,t.y], [this.t0.x, this.t0.y]);
			this.pos = Vector.add( this.pos0, delta );
			return true;
		}
		
		var pos = this.posFromContainer( [t.x, t.y] );
		var ts = { id:t.id, x: pos[0], y: pos[1] };

		this.container.mouseInNode = [ts.x, ts.y, ts.id];

		if( !! this.dragItems ) {
			// if a sub node is being dragged, then drag it
			var n = this.dragItems.get( t.id );
			if( !! n ) {
				return n.onTouchMove( ts );
			}
		}
		
		if( !! this.subnodes ) {
			// pass to subnodes
			for(var i=this.subnodes.length-1; i>=0; i--) {
				var n = this.subnodes[i];
				if( n.inRange( pos ) ) {
					return n.onTouchMove( ts );
				}
			}
		}
		
		return false;
	},	
	onTouchStart : function(t) {
		if( !! this.touches ) {
			this.touches.put( t.id, [t.x, t.y] );
		}
		
		this.pos0 = [ this.pos[0], this.pos[1] ];
		this.t0 = { id: t.id, x: t.x, y: t.y };

		var pos = this.posFromContainer( [t.x, t.y] );
		var ts = { id:t.id, x: pos[0], y: pos[1] };

		this.container.mouseInNode = [ts.x, ts.y, ts.id];
		
		if(!! this.subnodes) {
			for(var i=this.subnodes.length-1; i>=0; i--) {
				var n = this.subnodes[i];
				if( (!! n.draggable) && n.inRange( pos ) ) {
					// drag subnode 
					this.dragItems.put( ts.id, n );
					return n.onTouchStart( ts );
				}
			}
		}
		
		if(!! this.draggable) {
			this.dragging = true;
			this.setVelocity(0, 0);
			return true;
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
		
		if( this.dragging ) {
			this.dragging = false;
			if(!! this.moveable) {
				var delta = Vector.sub([t.x,t.y], [this.t0.x, this.t0.y]);
				this.pos = Vector.add( this.pos0, delta );
			} else {
				this.pos = [ this.pos0[0], this.pos0[1] ];
			}
			return true;
		}
		
		var pos = this.posFromContainer( [t.x, t.y] );
		var ts = { id:t.id, x: pos[0], y: pos[1] };
		
		this.container.mouseInNode = [ts.x, ts.y, ts.id];
		
		if( !! this.dragItems ) {
			var n = this.dragItems.get( t.id );
			if( !! n ) {
				this.dragItems.remove( ts.id );
				return n.onTouchEnd( ts );
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
	setImage : function(img, r) {
		this.img = img;
		if(! r) {
			this.imgrect = [0, 0, img.width, img.height];
			if(! this.size) this.size = [img.width, img.height];
		} else {
			this.imgrect = [ r[0], r[1], r[2], r[3] ];
			if(! this.size) this.size = [rect[2], rect[3]];
		}
		return this;
	},
	setSprite : function(s) {
		this.sprite = s;
		return this;
	},
	addNode : function(n, id) {
		if(this.subnodes == undefined) this.subnodes=[];
		if(this.index == undefined) this.index={};
		if(this.dragItems == undefined) this.dragItems = new hotjs.HashMap();
		if(this.touches == undefined) this.touches = new hotjs.HashMap();	
		
		n.setContainer(this);
		
		this.subnodes.push(n);
		if(typeof id == 'string') {
			this.index[id] = n;
		}
		
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
		if(!! this.sprite) {
			this.sprite.update(dt);
		}
		
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
		if(! this.rotation) {
			c.translate(this.pos[0], this.pos[1]);
		} else {
			c.translate(this.pos[0] + this.size[0]/2, this.pos[1] + this.size[1]/2);
			c.rotate(this.rotation * Math.PI / 180);
			c.translate( - this.size[0]/2, - this.size[1]/2 );
		}
		if( !! this.scale ) c.scale(this.scale[0],this.scale[1]);
		if( !! this.alpha ) c.globalAlpha = this.alpha;
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

		if( !! this.sprite ) {
			this.sprite.render(c, this.size[0], this.size[1]);
			
		} else if( !! this.img ) {
			if( !! this.imgrect ) {
				c.drawImage( this.img, 
						this.imgrect[0], this.imgrect[1], this.imgrect[2], this.imgrect[3], 
						0, 0, this.size[0], this.size[1] );
			} else {
				c.drawImage( this.img, 0, 0, this.size[0], this.size[1] );
				//c.scale( this.size[0]/this.img.width, this.size[1]/this.img.height);
				//c.drawImage( this.img, 0, 0 );
			}
			
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

	this.gridOn = false;
	this.imgOn = true;
	this.color = "black";
	this.bgcolor = "white";

	this.bgrepeat = false;
	this.bgimg = undefined;
	this.bgimgrect = undefined;
	
	// { l, t, r, b, w, h }
	this.area = undefined;
	this.arearepeat = false;
	this.areaimg = undefined;
	this.areaimgrect = undefined;
};

hotjs.inherit( Scene, Node, {
	setView : function(v) {
		this.setContainer(v);
		this.zoom();
		this.setDraggable(true);
		this.setMoveable(true);
		
		return this;
	},
	setBgImage : function(repeat, img, r) {
		this.bgrepeat = repeat;
		this.bgimg = img;
		if(! r) {
			this.bgimgrect = [0,0, img.width, img.height];
		} else {
			this.bgimgrect = [ r[0], r[1], r[2], r[3] ];
		}
		return this;
	},
	setAreaImage : function(repeat, img, r) {
		this.arearepeat = repeat;
		this.areaimg = img;
		if(! r) {
			this.areaimgrect = [0,0, img.width, img.height];
		} else {
			this.areaimgrect = [ r[0], r[1], r[2], r[3] ];
		}
		return this;
	},
	setArea : function(x,y,w,h) {
		this.area = { l:x, t:y, w:w, h:h, r:(x+w), b:(y+h) };
		return this;
	},
	getArea : function() {
		if(! this.area) {
			return {
				l : 0,
				t : 0,
				w : this.size[0],
				h : this.size[1],
				r : this.size[0],
				b : this.size[1]
			};
		}
		
		return this.area;
	},
	setBgColor : function(c) {
		this.bgcolor = c;
		return this;
	},
	onTouchMove : function(t) {
		var ret = Scene.supClass.onTouchMove.call(this, t);
		
		this.fixView();
		//this.setVelocity(0,0);
		//this.setSpin(0,0);
		
		return ret;
	},
	onTouchEnd : function(t) {
		var ret = Scene.supClass.onTouchEnd.call(this, t);

		this.fixView();
		//this.setVelocity(0,0);
		//this.setSpin(0,0);
		
		return ret;
	},
	// ensure the scene is always in view
	fixView : function() {		
		if( this.pos[0] >0 ) this.pos[0]=0;
		if( this.pos[1] >0 ) this.pos[1]=0;
		
		var posRightBottom = (! this.scale) 
				? Vector.add(this.size, this.pos) 
				: Vector.add( Vector.scale(this.size, this.scale), this.pos );
				
		var offsetRB = Vector.sub( this.container.getSize(), posRightBottom );
		
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
			//var posInView = Vector.scale( posCenter, this.scale );
			//var offsetChange = Vector.mul( posInView, f-1 );
			//this.pos = Vector.sub( this.pos, offsetChange );

			// code #2, optimized, no function call
			this.pos = [ this.pos[0] - posCenter[0] * this.scale[0] * (f-1),
			             this.pos[1] - posCenter[1] * this.scale[1] * (f-1)
			            ];
			
			this.scale = Vector.mul( this.scale, f );
	
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
		if(g == undefined) g = (! this.gridOn);
		this.gridOn = g;
		return this;
	},
	showImg : function(g) {
		if(g == undefined) g = (! this.imgOn);
		this.imgOn = g;
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
	// override node.draw(), ignore all node.draw() content.
	draw : function(c) { 
		c.save();

		var a = this.getArea();
		
		if( this.imgOn ) {
			if(!! this.bgimg) {
				if( this.bgrepeat ) {
					c.fillStyle = c.createPattern(this.bgimg, 'repeat');
					c.fillRect(0, 0, this.size[0], this.size[1]);
				} else {
					c.drawImage(this.bgimg, 
							this.bgimgrect[0], this.bgimgrect[1], this.bgimgrect[2], this.bgimgrect[3], 
							0, 0, this.size[0], this.size[1]);
				}
			}
			if(!! this.areaimg) {
				if( this.arearepeat ) {
					c.fillStyle = c.createPattern(this.areaimg, 'repeat');
					c.fillRect(a.l, a.t, a.w, a.h);
				} else {
					c.drawImage(this.areaimg, 
							this.areaimgrect[0], this.areaimgrect[1], this.areaimgrect[2], this.areaimgrect[3], 
							a.l, a.t, a.w, a.h);
				}
			}
		} else {
			if( !! this.bgcolor ){
				c.fillStyle = this.bgcolor;
				c.fillRect(0, 0, this.size[0], this.size[1]);
			}
		}
		
		if( this.gridOn ) {
			c.strokeStyle = this.color;

			c.lineWidth = 0.5;
			var dx = 40, dy = 40;
			c.beginPath();
			for( var x=0; x<=this.size[0]; x += dx ) {
				c.moveTo(x, 0);
				c.lineTo(x, this.size[1]);
			}
			for( var y=0; y<=this.size[1]; y += dy ) {
				c.moveTo(0, y);
				c.lineTo(this.size[0], y);
			}
			c.stroke();
			
			c.lineWidth = 1;
			c.beginPath();
			c.arc((a.l+a.r)/2, (a.t+a.b)/2, 10, 0, Math.PI * 2);
			c.arc(this.size[0]/2, this.size[1]/2, 20, 0, Math.PI * 2);
			c.stroke();

			c.beginPath();
			c.strokeRect( a.l, a.t, a.w, a.h );
			c.strokeRect( 0, 0, this.size[0], this.size[1]);
			c.stroke();
		}
		c.restore();
		return this;
	},
	addItem : function() { // interface for benchmark purpose
		
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

(function() {
    function Sprite(url, pos, size, speed, frames, dir, once) {
        this.pos = pos;
        this.size = size;
        this.speed = typeof speed === 'number' ? speed : 0;
        this.frames = frames;
        this._index = 0;
        this.url = url;
        this.dir = dir || 'horizontal';
        this.once = once;
    };

    Sprite.prototype = {
		update : function(dt) {
			this._index += this.speed * dt;
		},

		render : function(ctx, w, h) {
			var frame;

			if (this.speed > 0) {
				var max = this.frames.length;
				var idx = Math.floor(this._index);
				frame = this.frames[idx % max];

				if (this.once && idx >= max) {
					this.done = true;
					return;
				}
			} else {
				frame = 0;
			}

			var x = this.pos[0];
			var y = this.pos[1];

			if (this.dir == 'vertical') {
				y += frame * this.size[1];
			} else {
				x += frame * this.size[0];
			}
			
			if(! w) w = this.size[0];
			if(! h) h = this.size[1];
			
			var img = resources.get(this.url);

			ctx.drawImage( img, 
					x, y, this.size[0], this.size[1], 
					0, 0, w, h);
		}
    };

    window.Sprite = Sprite;
})();

(function() {
	var resourceCache = {};
	var loading = [];
	var readyCallbacks = [];

	// Load an image url or an array of image urls
	function load(urlOrArr) {
		if (urlOrArr instanceof Array) {
			urlOrArr.forEach(function(url) {
				_load(url);
			});
		} else {
			_load(urlOrArr);
		}
	}

	function _load(url) {
		if (resourceCache[url]) {
			return resourceCache[url];
		} else {
			var img = new Image();
			img.onload = function() {
				resourceCache[url] = img;

				if (isReady()) {
					readyCallbacks.forEach(function(func) {
						func();
					});
				}
			};
			resourceCache[url] = false;
			img.src = url;
		}
	}

	function get(url) {
		return resourceCache[url];
	}

	function isReady() {
		var ready = true;
		for ( var k in resourceCache) {
			if (resourceCache.hasOwnProperty(k) && !resourceCache[k]) {
				ready = false;
			}
		}
		return ready;
	}

	function onReady(func) {
		readyCallbacks.push(func);
	}

	window.resources = {
		load : load,
		get : get,
		onReady : onReady,
		isReady : isReady
	};
})();


