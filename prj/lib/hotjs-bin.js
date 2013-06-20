
// ------- hotjs.js ------------- 

// name space
var hotjs = hotjs || {};

(function(){

// object oriented (done)
	
// app (done) -> view (done) -> scene (done) -> node (layer -> node -> sub node ...) (done)

// event: mouse (done), multi-touch (done), keyboard, user-defined

// resource: image (done), sprite (done), audio/video (done)

// animation: move, rotate, scale, fade

// math: point/vector (done), matrix,

// physics: physical node (done), physical scene (done), ball collision (done), momentum (done), angular momentum, 

// util: UT (done), getDeviceInfo (done), benchmark (done), debug (using chrome), profiling,

// AI: pathfinding

// lang: i18n

// effect: light, flash, explosion, fire, smoke, fireworks, magic, f()
	
// addon: 
	
// scenes: goboard (done), snooker (done)

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
	var cv = this.canvas;
	this.canvas.addEventListener('click',function(e){
		me.onClick(e);
		e.preventDefault();
	});
	this.canvas.addEventListener('mousedown',function(e){
		
		// we use document.onmousemove to track mouse move, even if outside window
		document.onmousemove = function(event) {
			event = event || window.event;

			me.onMouseMove(event);
			e.preventDefault();
		};

		document.onmouseup = function(event) {
			document.onmousemove = null;

			if (cv.releaseCapture) {
				cv.releaseCapture();
			}
			
			me.onMouseUp(event);
			e.preventDefault();
		};

		if (cv.setCapture) {
			cv.setCapture();
		}

		me.onMouseDown(e);
		e.preventDefault();
	});
	// we use document.onmouseup(), so disable here
	//this.canvas.addEventListener('mouseup',function(e){
		//me.onMouseUp(e);
		//e.preventDefault();
	//});
	this.canvas.addEventListener('mousemove',function(e){
		// will be duplicated, if mouse down
		// we may need track mousemove event, even mouse not down in some case
		// TODO: is it a waste?
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
	this.canvas.addEventListener('touchcancel',function(e){
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
		
		/* These 3 lines are helpful for the browser to not accidentally 
		 * think the user is trying to "text select" the draggable object
		 * when drag initiation happens on text nodes.
		 * Unfortunately they also break draggability outside the window.
		 */
		// used for mouse event handling.
		this.canvas.unselectable = "on";
		this.canvas.onselectstart = function(){return false;};
		this.canvas.style.userSelect = this.canvas.style.MozUserSelect = "none";
		  
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
	this.zoomable = undefined;
	this.rotateable = undefined;
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
		if(b) {
			if(this.touches0 == undefined) this.touches0 = new hotjs.HashMap();	
			if(this.touches == undefined) this.touches = new hotjs.HashMap();
		}
		return this;
	},
	setMoveable : function(b) {
		this.setDraggable( b );
		
		this.moveable = b;
		return this;
	},
	setZoomable : function(b) {
		this.zoomable = b;
		if(b) {
			if(this.touches0 == undefined) this.touches0 = new hotjs.HashMap();	
			if(this.touches == undefined) this.touches = new hotjs.HashMap();
			if(this.scale == undefined) this.scale = [1,1];
		}
		return this;
	},
	setRotateable : function(b) {
		if(b) {
			if(this.touches0 == undefined) this.touches0 = new hotjs.HashMap();	
			if(this.touches == undefined) this.touches = new hotjs.HashMap();
			//if(this.scale == undefined) this.scale = [1,1];
			if(this.rotation == undefined) this.rotation = 0;
		}
		this.rotateable = b;
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
		if( !! this.touches ) {
			var f = {
				id : t.id,
				x : t.x,
				y : t.y,
				px : this.pos[0],
				py : this.pos[1]
			};
			if( this.zoomable ) {
				f.sx = this.scale[0];
				f.sy = this.scale[1];
			}
			if( this.rotateable ) {
				f.r = this.rotation;
			}
			this.touches.put( t.id, f );
		}
		
		if( !! this.dragging ) {
			this.handleDragZoomRotate(t);
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
		if( !! this.touches0 ) {
			var f = {
				id : t.id,
				x : t.x,
				y : t.y,
				px : this.pos[0],
				py : this.pos[1]
			};
			if( this.zoomable ) {
				f.sx = this.scale[0];
				f.sy = this.scale[1];
			}
			if( this.rotateable ) {
				f.r = this.rotation;
			}
			this.touches0.put( t.id, f );
			
			// only memorize the id of first touch, and we can get init pos/scale/rotation.
			if(this.touches0.size() == 1) {
				this.id0 = t.id;
			}
		}
		
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
	handleDragZoomRotate : function(t) {
		if(! this.touches) return false;
		if(! this.touches0) return false;
		
		if( this.draggable ) {
			if( this.touches.size() == 1 ) {
				var t0 = this.touches0.get( this.id0 );
				var t1 = this.touches.get( this.id0 );
				this.pos = [ (t1.x - t0.x + t0.px), (t1.y - t0.y + t0.py) ];
			}
		}
		
		if( this.zoomable ) {
			// we treat touch of 2 fingers as zoom gesture
			if( this.touches.size() == 2) {
				var ids = this.touches.keys();
				
				// calc distance between 2 fingers when touch start.
				var f1t0 = this.touches0.get( ids[0] );
				var f2t0 = this.touches0.get( ids[1] );
				var d_t0 = Vector.getLength( Vector.sub([f1t0.x, f1t0.y], [f2t0.x, f2t0.y]) );
				
				// calc distance between 2 fingers now.
				var f1t1 = this.touches.get( ids[0] );
				var f2t1 = this.touches.get( ids[1] );
				var d_t1 = Vector.getLength( Vector.sub([f1t1.x, f1t1.y], [f2t1.x, f2t1.y]) );
				
				// calc the new scale, based on the scale when put first finger.
				var t0 = this.touches0.get( this.id0 );
				this.scale = [ t0.sx * d_t1 / d_t0, t0.sy * d_t1 / d_t0 ];
				
				// we scale from the center point between 2 fingers, keep the point no move.
				var center_t0 = [ (f1t0.x + f2t0.x)/2, (f1t0.y + f2t0.y)/2 ];
				center_view = Vector.add( [t0.px, t0.py], Vector.scale( center_t0, [t0.sx, t0.sy] ) );
				this.pos = Vector.sub( center_view, Vector.scale(center_t0, this.scale) );

				// if the center point moves, let's move 
				var center_t1 = [ (f1t1.x + f2t1.x)/2, (f1t1.y + f2t1.y)/2 ];
				var center_delta = Vector.sub( center_t1, center_t0 );
				this.pos = Vector.add( this.pos, center_delta );
			}
		}
		
		if( this.rotateable ) {
			
		}
	},
	onTouchEnd : function(t) {
		if( !! this.touches ) {
			var f = {
				id : t.id,
				x : t.x,
				y : t.y,
				px : this.pos[0],
				py : this.pos[1]
			};
			if( this.zoomable ) {
				f.sx = this.scale[0];
				f.sy = this.scale[1];
			}
			if( this.rotateable ) {
				f.r = this.rotation;
			}
			this.touches.put( t.id, f );
		}
		
		if( this.dragging ) {
			this.dragging = false;
			if(!! this.moveable) {
				this.handleDragZoomRotate(t);
			} else {
				var t0 = this.touches0.get( this.id0 );
				this.pos = [ t0.px, t0.py ];
			}

			if( !! this.touches ) this.touches.remove( t.id );
			if( !! this.touches0 ) this.touches0.remove( t.id );
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
		
		if( !! this.touches ) this.touches.remove( t.id );
		if( !! this.touches0 ) this.touches0.remove( t.id );
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
	
	this.scale = [1,1];
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
		var w = this.container.width(), h = this.container.height();
		var min_sx = w / this.size[0], min_sy = h / this.size[1];
		var min_scale = Math.min( min_sx, min_sy );
		if( this.scale[0] < min_scale || this.scale[1] < min_scale ) {
			this.scale[0] = min_scale;
			this.scale[1] = min_scale;
		}
		
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





// ------- resource.js ------------- 


// merged into hotjs.js as a basic class.

(function() {
	var resourceCache = {};
	//var loading = [];
	
	var readyCallbacks = [];
	var loadingCallbacks = [];
	var errorCallbacks = [];
	
	var total = 0;
	var loaded = 0;

	function getTotal() {
		return total;
	}
	function getLoaded() {
		return loaded;
	}
	
	// func() {}
	function onReady(func) {
		readyCallbacks.push(func);
	}

	// func( url, loaded, total ) {}
	function onLoading(func) {
		loadingCallbacks.push(func);
	}
	
	// func( url ) {}
	function onError(func) {
		errorCallbacks.push(func);
	}

	// Load an resource url or an array of resource urls
	function load(urlOrArr) {
		if (urlOrArr instanceof Array) {
			urlOrArr.forEach(function(url) {
				_load(url);
			});
		} else {
			_load(urlOrArr);
		}
	}
	
	function unload(urlOrArr) {
		if (urlOrArr instanceof Array) {
			urlOrArr.forEach(function(url) {
				if ( resourceCache.hasOwnProperty(url) ) {
					delete resourceCache[ url ];
				}
			});
		} else {
			if ( resourceCache.hasOwnProperty(urlOrArr) ) {
				delete resourceCache[ url ];				
			}
		}
	}

	function isVideo(url) {
		var ext = url.substring( url.lastIndexOf('.') +1 );
		if( (ext == 'ogg') ) {
			return ( url.indexOf('video') > -1 );
		} else {
			return ( ['mp4', 'webm'].indexOf(ext) > -1);
		}
	}
	
	function isAudio(url) {
		var ext = url.substring( url.lastIndexOf('.') +1 );
		if( (ext == 'ogg') ) {
			return ( url.indexOf('video') == -1 );
		} else {
			return ( ['mp3', 'wav'].indexOf(ext) > -1);
		}
	}
	
	function _load(url) {
		if (resourceCache[url]) {
			return resourceCache[url];
		} else {
			resourceCache[url] = false;
			total ++;

			var res;
			var isvideo = isVideo(url), isaudio = isAudio(url);
			if( isvideo ) {
				res = new Video();
			} else if( isaudio ) {
				res = new Audio();
			} else {
				res = new Image();
			}
			
			var onload = function(){
				resourceCache[url] = res;
				loaded ++;

				loadingCallbacks.forEach(function(func){
					func(res.src, loaded, total);
				});

				if (isReady()) {
					readyCallbacks.forEach(function(func) {
						func();
					});
				}
			};
			var onerror = function() {
				errorCallbacks.forEach(function(func){
					func(res.src);
				});
			};
			
			if( isvideo || isaudio ) {
				res.addEventListener('canplaythrough', onload);
				res.addEventListener('error', onerror);
				res.setAttribute('src', url);
				res.load();
			} else {
				res = new Image();
				res.onload = onload;
				res.onerror = onerror;
				res.setAttribute('src', url);
			}
			
			return res;
		}
	}

	function get(url) {
		var res = resourceCache[url];
		if(! res) {
			var isvideo = isVideo(url), isaudio = isAudio(url);
			if( isvideo ) {
				res = new Video();
				res.setAttribute('src', url);
				res.load();
			} else if( isaudio ) {
				res = new Audio();
				res.setAttribute('src', url);
				res.load();
			} else {
				res = new Image();
				res.setAttribute('src', url);
			}			
		}
		return res;
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

	window.resources = {
		load : load,
		unload : unload,
		get : get,
		getTotal : getTotal,
		getLoaded : getLoaded,
		onReady : onReady,
		onLoading : onLoading,
		onError : onError,
		isReady : isReady
	};
})();

// ------- sprite.js ------------- 


// already merged into hotjs.js as a basic class.

// ------- math.js ------------- 


(function(){

hotjs = hotjs || {};

// Random, often used, so merged into hotjs.js.

// Vector, often used, so merged into hotjs.js.

// TODO: to implement

var Matrix = {
	copy : function(){
		
	},
	add : function() {
		
	},
	sub : function() {
		
	},
	mul : function() {
		
	}
};

hotjs.Matrix = Matrix;

})();

// ------- physics.js ------------- 


(function(){
	
hotjs.Physics = hotjs.Physics || {};

var Constant = {
	g : 9.8,
	RESTITUTION_V : 0.8,
	RESTITUTION_H : 0.95,
	AIR_RESISTANCE : 0.2,
	AIR_DENSITY : 0.01293,
	HYDROGEN_DENSITY : 0.0008948,
	WOOD_DENSITY : 0.5,
	WATER_DENSITY : 1,
	IRON_DENSITY : 7.8,
	METER : 100
};

// physics formula
var Formula = {
	velocityAfterCollision: function (m1,v1,m2,v2) {
		return ((m1-m2)*v1 + 2*m2*v2) / (m1+m2);
	},
	airResistance : function(w,h,velocity) {
		return Constant.AIR_RESISTANCE * Constant.AIR_DENSITY * w * h * velocity * velocity ;
	},
	airFlotage : function(w,h) {
		return (w * w * h * Constant.AIR_FLOTAGE);
	}
};

// TODO: Node in Physics world 
var Node = function(){
	hotjs.base(this);
	
	this.restitution = 0.9;
	this.throwable = true;
};

hotjs.inherit(Node, hotjs.Node, {
	setRestitution : function(r) {
		r = Math.min(1, Math.max(0, r));
		this.restitution = r;

		return this;
	},
	getRestitution : function() {
		return this.restitution;
	},
	setThrowable : function(th) {
		if(! th) th = ! this.throwable;
		this.throwable = th;
		return this;
	},
	collide : function(another) {
		return this;
	},
	onTouchStart : function(t) {
		var ret = Node.supClass.onTouchStart.call(this, t);

		this.dragTime = Date.now();
		this.t1 = [ t.x, t.y ];
		this.maxVel = [0, 0];
		
		return ret;
	},
	onTouchMove : function(t) {
		if( this.dragging ) this.gainVelocityFromDrag(t);
		
		return Node.supClass.onTouchMove.call(this, t);
	},
	onTouchEnd : function(t) {
		if( this.dragging ) {
			if( this.throwable ) {
				this.gainVelocityFromDrag(t);
			} else {
				this.setVelocity(0,0);
			}
		}

		return Node.supClass.onTouchEnd.call(this, t);
	},
	gainVelocityFromDrag : function(t) {
		var now = Date.now();
		var dt = (now - this.dragTime) / 1000.0;

		var f = 1.0/60/dt;
		var v = [ (t.x - this.t1[0]) * f, (t.y - this.t1[1]) * f ];
		this.setVelocity(v[0], v[1]);
		//this.setSpin(0,0);

		if( dt > 0.3 ) {
			this.dragTime = now;
			this.t1 = [ t.x, t.y ];
		}
	}
});

// TODO: Ball in Physics world 

var Ball = function(){
	hotjs.base(this);

};

hotjs.inherit(Ball, Node, {
	collide : function(b) {

		var Vector = hotjs.Vector;
		
		var velAfter = Formula.velocityAfterCollision;
		
		var rx1 = this.size[0]/2, ry1 = this.size[1]/2;
		var rx2 = b.size[0]/2, ry2 = b.size[1]/2;
		var c1 = [ this.pos[0]+rx1, this.pos[1]+ry1 ];
		var c2 = [ b.pos[0]+rx2, b.pos[1]+ry2 ];
		var r1 = (rx1 + ry1) / 2;
		var r2 = (rx2 + ry2) / 2;
		var vectPos = Vector.sub( c1, c2 );
		
		var tution = this.getRestitution() * b.getRestitution();
		
		// no collision yet
		var distance = Math.sqrt(vectPos[0] * vectPos[0] + vectPos[1] * vectPos[1]);
		if( distance > r1+r2) return false;
		
		// distance cannot be small than r1 + r2
		if( distance < r1+r2 ) {
			var fix = 1 - distance/(r1+r2);
			var vectPosFix = Vector.mul( vectPos, fix );
			this.pos = Vector.add( this.pos, vectPosFix );
			b.pos = Vector.sub( b.pos, vectPosFix );
		}
		
		var vectTangent = [ vectPos[1], - vectPos[0] ];
		
		var v1 = Vector.project(this.velocity, vectPos);
		var v1T = Vector.project(this.velocity, vectTangent);
		
		var v2 = Vector.project(b.velocity, vectPos);
		var v2T = Vector.project(b.velocity, vectTangent);
		
		var v1x = velAfter(this.mass, v1[0], b.mass, v2[0]) * tution;
		var v1y = velAfter(this.mass, v1[1], b.mass, v2[1]) * tution;
		
		var v2x = velAfter(b.mass, v2[0], this.mass, v1[0]) * tution;
		var v2y = velAfter(b.mass, v2[1], this.mass, v1[1]) * tution;
		
		this.velocity = Vector.add( v1T, [v1x, v1y] );
		b.velocity = Vector.add( v2T, [v2x, v2y] );
		
		return true;
	}
});

// TODO: Scene in Physics world 

var Scene = function(){
	hotjs.base(this);

	this.restitution = 0.5;
	this.gravity = Constant.g;
	this.resistance = 1/6;
	
};

hotjs.inherit(Scene, hotjs.Scene, {
	setRestitution : function(r) {
		r = Math.min(1, Math.max(0, r));
		this.restitution = r;

		return this;
	},
	getRestitution : function() {
		return this.restitution;
	},
	setGravity : function(n) {
		this.gravity = n * Constant.g;
		return this;
	},
	getGravity : function() {
		return this.gravity;
	},
	setResistance : function(r) {
		this.resistance = r;
		return this;
	},
	getResistance : function() {
		return this.resistance;
	},
	applyEnvForce : function() {
		for( var i=this.subnodes.length-1; i>=0; i-- ) {
			var b = this.subnodes[i];
			var vx = b.velocity[0], vy = b.velocity[1];

			// media resistance (like air, water, floor, etc.)
			var ax = - vx * this.resistance / 60;
			var ay = - vy * this.resistance / 60;
			//var ax -= vx / ry * Constant.AIR_RESISTANCE * (Constant.AIR_DENSITY / b.density) / 60;
			//var ay -= vy / rx * Constant.AIR_RESISTANCE * (Constant.AIR_DENSITY / b.density) / 60;
			
			// gravity / air buoyancy
			ay += (1 - Constant.AIR_DENSITY/b.density)  * this.gravity / 60;
			
			b.accel = [ax, ay];
		}
		
		return this;
	},
	checkBorderCollision : function() {
		var a = this.getArea();
		
		for( var i=this.subnodes.length-1; i>=0; i-- ) {
			var b = this.subnodes[i];
			var px = b.pos[0], py = b.pos[1];
			var rx = b.size[0], ry = b.size[1];
			
			var vx = b.velocity[0], vy = b.velocity[1];
	
			// check area 
			var x_hit = ((px + rx > a.r) && (vx >0)) || ((px <= a.l) && (vx <0));
			var y_hit = ((py + ry > a.b) && (vy >0)) || ((py <= a.t) && (vy <0));
			
			// bounce & collision loss
			var tution = this.restitution * b.getRestitution();
			if( x_hit ){
				vx *= (- tution);
				vy *= (0.9 + tution * 0.1);
			}
			if( y_hit ) {
				vy *= (- tution);
				vx *= (0.9 + tution * 0.1);
			}
	
			b.velocity = [vx, vy];
		}
		
		return this;
	},
	validatePos : function() {
		var a = this.getArea(); // {l,t,r,b,w,h}
		
		for( var i=this.subnodes.length-1; i>=0; i-- ) {
			var b = this.subnodes[i];
			var px = b.pos[0], py = b.pos[1];

			// fix pos if out of area
			px = Math.max( a.l, Math.min(a.r - b.size[0], b.pos[0]));
			py = Math.max( a.t, Math.min(a.b - b.size[1], py = b.pos[1]));
			
			b.pos = [px, py];			
		}
		
		return this;
	},
	update : function(dt) {
		if(!! this.subnodes) {
			for( var i=this.subnodes.length-1; i>=0; i-- ) {
				var b = this.subnodes[i];
				b.update(dt);
			}

			for( var i=this.subnodes.length-1; i>=1; i-- ) {
				var b = this.subnodes[i];
				for( var j=i-1; j>=0; j-- ) {
					var another = this.subnodes[j];
					b.collide( another );
				}
			}

			this.applyEnvForce();
			
			this.checkBorderCollision();

			this.validatePos();
		}
		
		return this;
	}
});

hotjs.Physics.Constant = Constant;
hotjs.Physics.Formula = Formula;

hotjs.Physics.Node = Node;
hotjs.Physics.Scene = Scene;
hotjs.Physics.Ball = Ball;

})();


// ------- social.js ------------- 

(function(){
	
hotjs.Social = hotjs.Social || {};

// TODO: AjaxClient 
// using jQuery/AJAX to handle network request 
var AjaxClient = function(){
	this.settings = {
		url : 'http://msghub.hotjs.net/api',
		cache : false,
		data : {},
		processData : true,
		type : 'GET',
		async : false,
		timeout : 10000,	// 10 sec
		dataType : 'html',
		//dataType : 'html',
		crossDomain : false,
		context : document.body,
		statusCode : {
			403 : function(){ console.log('access denied.' ); },	
			404 : function(){ console.log('url not found.'); },
			405 : function(){ console.log('method not allowed.'); },
			500 : function(){ console.log('server error'); }
		}		
	};
	
	this.msgMax = 100;
	this.msgList = [];

	this.urls = {};
};

AjaxClient.prototype = {
	config : function( set ){
		if( set.msgMax != undefined ) {
			this.msgMax = set.msgMax;
			delete set.msgMax;
		}
		for( var s in set ) {
			this.settings[ s ] = set[ s ];
		}
		// $.ajaxSetup ( this.settings );
		// Set default values for future Ajax requests. Its use is not recommended (according to jQuery doc). 
		// (so we can just handle it by ourselves.)
	},
	// { api_name : "http://msghub.hotjs.net/api/default.py", ... }
	configAPI : function( urls ) {
		if( typeof urls == 'string' ) {
			this.urls[ '_default_' ] = urls;
		} else if( typeof urls == 'object' ){
			for( var api in urls ) this.urls[ api ] = urls[ api ];
		}
		this.settings.url = this.urls['_default_'];
		
		return true;
	},
	// list API in following format:
/*
{
	"module" : "usermgmt",
	"version" : 2.0,
	"base" : "http://msghub.hotjs.net/api/usermgmt/",
	"list" : [ 
		{ "api": "_default_", "url" : "default.py", "param": [ "param1", "param2",  ... ], "comment" : "whatever" }, ... 
		{ "api": "api_name", "url" : "hello.php", "param": [ "param1", "param2",  ... ], "comment" : "whatever" }, ... 
	]
} 
*/
	loadAPI : function( inf_url, mod, req_ver ) {
		var msg = this.requestMsg( { module: mod, version: req_ver }, inf_url, { type:'GET' } );
		
		if( ! msg ) return false;
		if( ! Array.isArray(msg.list) ) return false;
		//if( msg.module != mod ) return false;
		//if( msg.version < req_ver ) return false;
		
		// if no base specified, then assume the same server & folder
		var base_url = msg.base;
		if( base_url.indexOf("://") < 0 ) {
			base_url = inf_url.substring(0, inf_url.lastIndexOf('/')+1) + base_url;
		}
		
		for( var i=0; i<msg.list.length; i++ ) {
			var entry = msg.list[i];
			if( entry.url.indexOf("://") > -1) {
				this.urls[ entry.api ] = entry.url;
			} else {
				this.urls[ entry.api ] = base_url + entry.url;
			}
		}
		
		return true;
	},
	requestMsg : function( data, url, options ) {
		var ajaxpkg = {};
		
		for( var i in this.settings ) ajaxpkg[i] = this.settings[i];
		if( !! options ) for( var i in options ) ajaxpkg[i] = options[i];
		if( !! data ) ajaxpkg.data = data;
		if( !! url ) ajaxpkg.url = url;
		ajaxpkg.async = false;
		
		var me = this;
		var msgs = false;
		
		$.ajax( ajaxpkg )
			.done(function(data, textStatus, jqXHR){
				console.log( data );
				data = JSON.parse( data );
				
				msgs = data;
			})
			.fail(function(jqXHR, textStatus, errorThrown){
				me.onMsgFail( jqXHR, textStatus, errorThrown );
			})
			.complete(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown){
				me.onMsgComplete( data_or_jqXHR, textStatus, jqXHR_or_errorThrown );
			});
		
		return msgs;
	},
	postMsg : function( data, url, options ) {
		var ajaxpkg = {};
		
		for( var i in this.settings ) ajaxpkg[i] = this.settings[i];
		if( !! options ) for( var i in options ) ajaxpkg[i] = options[i];
		if( !! data ) ajaxpkg.data = data;
		if( !! url ) ajaxpkg.url = url;
		ajaxpkg.async = true;
		
		var me = this;
		
		$.ajax( ajaxpkg )
			.done(function(data, textStatus, jqXHR){
				console.log( data );
				data = JSON.parse( data );
				
				me.onMsgComing( data, textStatus, jqXHR );
			})
			.fail(function(jqXHR, textStatus, errorThrown){
				me.onMsgFail( jqXHR, textStatus, errorThrown );
			})
			.complete(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown){
				me.onMsgComplete( data_or_jqXHR, textStatus, jqXHR_or_errorThrown );
			});
		
		return true;
	},
	onMsgFail : function( jqXHR, textStatus, errorThrown ) {
		console.log( "ajax fail" );
		console.log( jqXHR, textStatus, errorThrown );
	},
	onMsgComplete : function( data_or_jqXHR, textStatus, jqXHR_or_errorThrown ) {
	},
	onMsgComing : function( data, textStatus, jqXHR ) {
		if( Array.isArray(data) ) {
			for( var i=0; i<data.length; i++ ) {
				this.onMsgParse( data[i] );
			}
		} else {
			this.onMsgParse( data );
		}
	},
	// TODO: sub class always override this function
	// to handle incoming message immediately.
	// check msg.api, then do something.
	onMsgParse : function( msg ) {
		
	},
	// input: { api: "api_name", key1: value1, key2: value2, ... }
	// output: { api: "api_name", key1: value1, key2: value2, ... }
	callAPI : function( api, param ) {
		var url = this.urls[ api ];
		if(! url) url = this.urls[ '_default_' ];
		
		var msg = this.requestMsg( {
			api: api,
			param: JSON.stringify(param) 
			}, url );
		if( typeof msg == "object" ) {
			//if( msg.api == api ) { // double check api, needed ? 
			return msg;
			//}
		}
		return false;
	},
	hello : function hello() {
		var msg = this.callAPI( arguments.callee.name, { name: 'hotjs' } );
		return (!! msg) ? msg.name : false;
	}
};

// TODO: User
var User = function(){
	hotjs.base(this);
	
	// login info
	this.username = "";
	this.password = "";
	this.app = "hotjs";
	this.version = hotjs.version;
	
	// generated by server after authentication.
	this.session = "";		

	this.profile = {};
	this.status = {};
	this.tag = [];
	this.friends = [];
	this.blocks = [];
	
	// by default, heartbeat interval is 5 sec.
	// can be changed when calling login()
	this.hb_interval = 5000;
};

hotjs.inherit( User, AjaxClient, {

	registerAccount : function registerAccount(u, p, fn, e, c) {
		var msg = this.callAPI( arguments.callee.name, {
			username : u,
			password : p,
			fullname : fn,
			email : e,
			cellphone : c
		} );
		
		return (!! msg) ? msg.done : false;
	},
	deleteAccount : function deleteAccount() {
		var msg = this.callAPI( arguments.callee.name, {
			username : u,
			password : p
		} );
		return (!! msg) ? msg.done : false;
	},
	
	login : function login(u, p, app, ver, hb) {
		var msg = this.callAPI( arguments.callee.name, {
			username : u,
			password : p,
			app : app,
			version : ver
		} );

		if( (!!msg) && msg.done ) {
			this.session = msg.sid;
			
			// keep it for auto re-login
			this.username = u;
			this.password = p;
			this.app = app;
			this.version = ver;
			
			// set hb interval if needed.
			if(!! hb) this.hb_interval = hb;
			
			var magic_id = 'u' + this.session;
			window[ magic_id ] = this;
			
			// start first hb.
			this.heartbeat();
			
			return true;
		}
		
		return false;
	},
	// override to pull message like push from server.
	heartbeat : function heartbeat() {
		if( !! this.session ) {
			// send heartbeat msg
			var api = arguments.callee.name;
			var data = { sid : this.session, test1: [2,3,"str"], test2: {x:1, y:2} };
			this.postMsg( { 
				api: api, 
				param: JSON.stringify(data) 
				}, this.urls[ api ] );
			
			//window.hotjs_user = this;
			var magic_id = 'u' + this.session;
			var func = "window." + magic_id + ".heartbeat()"; 
			this.hb_timer = window.setTimeout( func, this.hb_interval );
		}
		return true;
	},
	logout : function logout() {
		// stop heartbeat timer
		if(!! this.hb_timer) {
			clearTimeout( this.hb_tiemr );
			
			var magic_id = 'u' + this.session;
			delete window[ magic_id ];
		}
		
		// send logout msg
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session
		});
		this.session = "";
		return (!! msg) ? msg.done : false;
	},
	changePassword : function changePassword( u, oldpwd, newpwd ) {
		var msg = this.callAPI( arguments.callee.name, {
			username : u,
			oldpwd : oldpwd,
			newpwd : newpwd
		} );
		return (!! msg) ? msg.done : false;
	},
	
	// { public: {}, protected: {}, private: {} }
	updateProfile : function updateProfile( data ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			profile : data
		} );
		return (!! msg) ? msg.done : false;
	},
	// get own profile: {}
	getProfile : function getProfile() {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session
		} );
		return ((!! msg) && msg.done) ? msg.profile : false;
	},
	// query profile of others, may be many [ user1, user2, user3, ... ]
	// return: msg.profile as a list: [ {}, {}, {} ]
	// only return public part & protected on situation, never return private profile
	queryProfile : function queryProfile( user ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			user : user
		} );
		return ((!! msg) && msg.done) ? msg.profile : false;
	},
	
	// query profile of others, may be many [ user1, user2, user3, ... ]
	// return: msg.user as a list: [ { username:"user1", fullname: "David", presence: "online" }, ... ]
	listFriend : function listFriend() {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session
		} );
		if ( (!! msg) && msg.done && Array.isArray(msg.user) ) {
			// sync the friend list
			this.friends.length = 0;
			for( var i=0; i<msg.user.length; i++ ) {
				this.friends.push( msg.user[i].username );
			}
			return msg.user;
		}
		return false;
	},
	addFriend : function addFriend( username, textmsg ) {
		if( this.friends.indexOf(username) > -1 ) {
			return false;
		}
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			username : username,
			textmsg : textmsg
		});
		if( (!! msg) && msg.done ) {
			this.friends.push( username );
			return true;
		}
		return false;
	},
	confirmAddFriend : function confirmAddFriend( username ) {
		if( this.friends.indexOf(username) > -1 ) {
			return false;
		}
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			username : username
		});
		if( (!! msg) && msg.done ) {
			this.friends.push( username );
			return true;
		}
		return false;
	},
	removeFriend : function removeFriend( username ) {
		if( this.friends.indexOf(username) == -1 ) {
			return false;
		}
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			username : username
		});
		if( (!! msg) && msg.done ) {
			var n = this.friends.indexOf(username);
			if( n > -1 ) {
				this.friends.splice(n, 1);
				return true;
			}
		}
		return false;
	},
	
	// query profile of others, may be many [ user1, user2, user3, ... ]
	// return: msg.user as a list: [ { username:"user1", fullname: "David", presence: "online" }, ... ]
	listBlock : function listBlock() {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session
		} );
		if ( (!! msg) && msg.done && Array.isArray(msg.user) ) {
			// sync the friend list
			this.blocks.length = 0;
			for( var i=0; i<msg.user.length; i++ ) {
				this.blocks.push( msg.user[i].username );
			}
			return msg.user;
		}
		return false;
	},
	// block a user, and will not receive any activity notification like invite/chat/say/join/quit ...
	block : function block( u ) {
		if( this.friends.indexOf(u) > -1 ) {
			return false;
		}
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			username : u
		});
		if( (!! msg) && msg.done ) {
			this.blocks.push( u );
			return true;
		}
		return false;
	},
	unblock : function unblock( u ) {
		if( this.friends.indexOf(u) == -1 ) {
			return false;
		}
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			username : u
		});
		if( (!! msg) && msg.done ) {
			var n = this.friends.indexOf(u);
			if( n > -1 ) {
				this.blocks.splice(n, 1);
				return true;
			}
		}
		return false;
	},

	// set tags, [ "hacker", "swimming", "golf", ... ]
	setTag : function addTag( data ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			tag : data
		} );
		if( (!! msg) && msg.done ) {
			// cache it
			this.tag.length = 0;
			for( var i=0; i<data.length; i++ ) this.tag.push( data[i] );
			return true;
		} 
		return false;
	},
	getTag : function getTag() {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session
		} );
		if( (!! msg) && msg.done ) {
			var data = msg.tag;
			// cache it
			this.tag.length = 0;
			for( var i=0; i<data.length; i++ ) this.tag.push( data[i] );
			return true;
		} 
		return false;
	},
	// { presence: "busy", location: [lat, lang] }
	updateStatus : function updateStatus( data ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			status : data
		});
		if( (!! msg) && msg.done ) {
			// cache it
			for( var i in data ) this.status[i] = data[i];
			return true;
		} 
		return false;
	},
	// query presence of others, may be many [ user1, user2, user3, ... ]
	// return [ "available"/"busy"/"nodistrub"/"rightback"/"away"/"offline" ]
	queryPresence : function queryPresence( users ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			user : users
		} );
		return ((!! msg) && msg.done) ? msg.presence : false;
	},
	
	// return: msg.user as a list: [ { username:"user1", fullname: "David", presence: "online" }, ... ]
	searchUser : function searchUser( tag, distance ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			tag : tag,
			distance : distance
		} );
		return ((!! msg) && msg.done) ? msg.user : false;
	},
	// filter is string with complex condition, like: "(age > 25) AND (age < 40) AND (tag CONTAIN 'reading')" :-)
	// return: msg.user as a list: [ { username:"user1", fullname: "David", presence: "online" }, ... ]
	searchUserComplex : function searchUserComplex( filter ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			filter : filter
		} );
		return ((!! msg) && msg.done) ? msg.user : false;
	},
	
	// invite a friend to join a group
	inviteJoinGroup : function inviteJoinGroup( name, g ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			name : name,
			group : g
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	quitGroup : function quitGroup( g ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			group : g
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	// chat in a group
	chat : function chat( s, g ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			group : g,
			what : s
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	
	// return msg.room [ "room1", "room2", ... ], not all, limit to 20
	findRoom : function findRoom( name ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			name : name
		} );
		return ((!! msg) && msg.done) ? msg.room : false;
	},
	// if room not exist, then create it.
	// may need enter password, if required
	enterRoom : function enterRoom( name, pwd ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			name : name,
			password : pwd
		} );
		return ((!! msg) && msg.done) ? msg.name : false;
	},
	// if no one in room after exist, then remove the password if there is.
	leaveRoom : function leaveRoom( name ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			name : name
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	// say something, anyone in the room can hear.
	say : function say( s ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			what : s
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	
	// send short message, only between friends.
	sms : function sms( name, s ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			name : name,
			what : s
		} );
		return ((!! msg) && msg.done) ? true : false;
	}
});

hotjs.Social.AjaxClient = AjaxClient;
hotjs.Social.User = User;

})();
// ------- util.js ------------- 

(function(){
	
hotjs.Util = hotjs.Util || {};

// borrow from collie.js
var _htDeviceInfo = null;

hotjs.Util = {
		
getDeviceInfo : function (sAgent) {
	if (_htDeviceInfo !== null && typeof sAgent === "undefined") {
		return _htDeviceInfo;
	}
	
	var aMat = null;
	var bIsDesktop = false;
	var bSupportCanvas = typeof CanvasRenderingContext2D !== "undefined";
	var bIsAndroid = false;
	var bIsIOS = false;
	var bIsIE = false;
	var bHasChrome = (/chrome/i.test(sAgent)) ? true : false;
	var sAgent = sAgent || navigator.userAgent;
	var nVersion = 0;
	
	if (/android/i.test(sAgent)) { // android
		bIsAndroid = true;
		aMat = sAgent.toString().match(/android ([0-9]\.[0-9])\.?([0-9]?)/i);
		
		if (aMat && aMat[1]) {
			nVersion = (parseFloat(aMat[1]) + (aMat[2] ? aMat[2] * 0.01 : 0)).toFixed(2);
		}
	} else if (/(iphone|ipad|ipod)/i.test(sAgent)) { // iOS
		bIsIOS = true;
		aMat = sAgent.toString().match(/([0-9]_[0-9])/i);
		
		if (aMat && aMat[1]) {
			nVersion = parseFloat(aMat[1].replace(/_/, '.'));
		}
	} else { // PC
		bIsDesktop = true;
		
		if (/(MSIE)/i.test(sAgent)) { // IE
			bIsIE = true;
			aMat = sAgent.toString().match(/MSIE ([0-9])/i);
			
			if (aMat && aMat[1]) {
				nVersion = parseInt(aMat[1], 10);
			}
		}
	}
	
	_htDeviceInfo = {
		supportCanvas : bSupportCanvas,
		desktop : bIsDesktop,
		android : bIsAndroid ? nVersion : false,
		ios : bIsIOS ? nVersion : false,
		ie : bIsIE ? nVersion : false,
		chrome : bHasChrome
	};
	
	return _htDeviceInfo;
},

getBoundaryRect : function (aPoints) {
	var nMinX = aPoints[0][0];
	var nMaxX = aPoints[0][0];
	var nMinY = aPoints[0][1];
	var nMaxY = aPoints[0][1];
	
	for (var i = 1, len = aPoints.length; i < len; i++) {
		nMinX = Math.min(nMinX, aPoints[i][0]);
		nMaxX = Math.max(nMaxX, aPoints[i][0]);
		nMinY = Math.min(nMinY, aPoints[i][1]);
		nMaxY = Math.max(nMaxY, aPoints[i][1]);
	}
	
	return {
		left : nMinX,
		right : nMaxX,
		top : nMinY,
		bottom : nMaxY
	};
},

getRectPoints : function (rect) {
	return [[rect.left, rect.top], [rect.right, rect.top], [rect.right, rect.bottom], [rect.left, rect.bottom]];
},

cloneObject : function (oSource) {
	var oReturn = {};
	
	for (var i in oSource) {
		oReturn[i] = oSource[i];
	}
	
	return oReturn;
},

addEventListener : function (el, sName, fHandler, bUseCapture) {
	if ("addEventListener" in el) {
		el.addEventListener(sName, fHandler, bUseCapture);
	} else {
		el.attachEvent("on" + sName, fHandler, bUseCapture);
	}
},

removeEventListener : function (el, sName, fHandler, bUseCapture) {
	if ("removeEventListener" in el) {
		el.removeEventListener(sName, fHandler, bUseCapture);
	} else {
		el.detachEvent("on" + sName, fHandler, bUseCapture);
	}
},

stopEventDefault : function (e) {
	e = e || window.event;
	
	if ("preventDefault" in e) {
		e.preventDefault();
	}
	
	e.returnValue = false;
},

getClientRect : function (el) {
	var elDocument = el.ownerDocument || el.document || document;
	var elHtml = elDocument.documentElement;
	var elBody = elDocument.body;
	var rect = {};
	
	if ("getBoundingClientRect" in el) {
		var htBox = el.getBoundingClientRect();
		rect.left = htBox.left;
		rect.left += elHtml.scrollLeft || elBody.scrollLeft;
		rect.top = htBox.top;
		rect.top += elHtml.scrollTop || elBody.scrollTop;
		rect.width = htBox.width;
		rect.height = htBox.height;
		rect.right = htBox.right;
		rect.right += elHtml.scrollLeft || elBody.scrollLeft;
		rect.bottom = htBox.bottom;
		rect.bottom += elHtml.scrollTop || elBody.scrollTop;
	} else {
		rect.left = 0;
		rect.top = 0;
		rect.width = el.offsetWidth;
		rect.height = el.offsetHeight;
		
		for (var o = el; o; o = o.offsetParent) {
			rect.left += o.offsetLeft;
			rect.top += o.offsetTop;
		}

		for (var o = el.parentNode; o; o = o.parentNode) {
			if (o.tagName === 'BODY') {
				break;
			}
			
			if (o.tagName === 'TR') {
				rect.top += 2;
			}
								
			rect.left -= o.scrollLeft;
			rect.top -= o.scrollTop;
		}
		rect.right = rect.left + rect.width;
		rect.bottom = rect.top + rect.height;
	}
	
	return rect;
}

};

// iOS
if (hotjs.Util.getDeviceInfo().ios) {
	window.addEventListener("load", function () {
		setTimeout(function () {
			document.body.scrollTop = 0;
		}, 300);
	});
}

//bind polyfill, https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5 internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 1), 
			fToBind = this, 
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();
		return fBound;
	};
}


var BenchLab = function(){
	hotjs.base(this);
	
	this.nMin = 1;
	this.nMax = 500;
	this.loopBench = false;
	
	this.fpsData = [];
	this.dtSumB = 0;
	this.nCur = this.nMax;
	
	this.marginFormula = 40;
	this.formula = false;
};

hotjs.inherit(BenchLab, hotjs.View, {
	setBenchmarkRange : function(n1, n2) {
		this.nMin = Math.min( n1, n2 );
		this.nMax = Math.max( n1, n2 );
		this.nCur = this.nMax;
		return this;
	},
	showFormula : function(f) {
		if(f == undefined) f = (! this.formula);
		this.formula = f;
		return this;
	},
	benchFPS: function(min, max, loop) {
		this.nMin = min;
		this.nMax = max;
		this.fpsData = [];
		
		this.dtSumB = 0;
		this.nCur = this.nMin;
		
		this.loopBench = (!! loop);
		
		return true;
	},
	benchStop : function() {
		this.nCur = this.nMax;

		return true;
	},
	update : function(dt) {
		BenchLab.supClass.update.call(this, dt);
		
		if( this.nCur < this.nMax ) {
			this.dtSumB += dt;
			if( this.dtSumB >= 0.2 ) {
				this.dtSumB = 0;
				
				this.curScene.addItem();
				this.nCur ++;
				
				var f = (this.height()-this.marginFormula*2) / 60;
				this.fpsData.push( f * this.fps );

				if( this.nCur >= this.nMax ) {
					if (!! this.loopBench ) {
						this.nCur = this.nMin;
						this.fpsData.length = 0;
					}
				}
			}
		} 
		
		return true;
	},
	drawFormula : function(c) {
		c.save();
		
		// draw x, y axis 
		var x0 = this.marginFormula, 
			y0 = this.height() - this.marginFormula;
		var w = this.width() - this.marginFormula * 2, 
			h = this.height() - this.marginFormula * 2;
		
		c.beginPath();
		c.strokeStyle = "black";
		c.fillStyle = "black";
		for(var i=0; i<6; i++) {
			c.beginPath();
			c.moveTo(x0, this.marginFormula + i * h / 6);
			c.lineTo(x0 + w, this.marginFormula + i * h / 6);
			c.stroke();
		}
		c.beginPath();
		c.moveTo(x0,this.marginFormula); 
		c.lineTo(x0,y0); 
		c.lineTo(this.width()-this.marginFormula, y0);
		c.stroke();
		c.fillText( "60 fps", x0-20, this.marginFormula-10 );
		c.fillText( "" + this.nMax, this.width()-this.marginFormula-20, y0+20 );
		
		// draw graph
		c.beginPath();
		c.strokeStyle = "red";
		var f = w / (this.nMax-this.nMin);
		if( this.fpsData.length >0 ) {
			c.moveTo( x0, y0-this.fpsData[0] );
			for( var i=1; i<this.fpsData.length; i++) {
				c.lineTo( x0 + i * f, y0-this.fpsData[i] );
			}
		}
		c.stroke();
		
		c.restore();		
	},
	draw : function(c) {
		BenchLab.supClass.draw.call(this, c);

		if( this.formula ) this.drawFormula(c);
	}		
});

hotjs.Util.BenchLab = BenchLab;

})();

