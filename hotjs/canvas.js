// name space
var hotjs = hotjs || {};

(function(){
	
var Vector = hotjs.Vector;

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
	
//------------------------
// TODO: class View
var View = function(){
	hotjs.base(this);
	
	this.canvas = document.createElement("canvas");
	this.ctx = this.canvas.getContext("2d");
	
	this.canvas.width = 480;
	this.canvas.height = 320;
	this.rect = this.canvas.getBoundingClientRect();
	
	this.color = "black";
	this.bgcolor = 'white';

	this.bgrepeat = false;
	this.bgimg = undefined;
	this.bgimgrect = undefined;

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
	
	this.maxFps = 60;
	
	this.runningTime = 0;
	this.runningTimeStr = "0 : 00 : 00"; // h:m:s
	
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
	start : function() {
		// using closure, me is accessable to inner function, but 'this' changed.
		var me = this;
		var lastTime = Date.now();
		var step = 1000 / this.maxFps;
		var nextTime = lastTime + step;
		
		function view_loop(){
			var now = Date.now();
			if( now > nextTime ) {
				if( me.running ) {
					var dt = (now - lastTime) / 1000.0;
					me.update( dt );
					me.render();
				}
				lastTime = now;
				nextTime += step;
			}
			
			requestAnimFrame( view_loop );
		}
		
		this.running = true;
		view_loop();

		return this;
	},
	setMaxFps : function( f ) {
		this.maxFps = Math.max(1, Math.min(f, 60));
		return this;
	},
	resume : function( r ) {
		if(r == undefined) r = true;
		this.running = r;
		return this;
	},
	pause : function() {
		this.rusume( false );
		return this;
	},
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
	setBgColor : function(c) {
		this.bgcolor = c;
		return this;
	},
	setColor : function(c) {
		this.color = c;
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

			this.runningTime += this.dtSum;
			if(this.bFps) {
				var s = Math.floor(this.runningTime);
				var m = Math.floor( s / 60 );
				s %= 60;
				if(s<10) s="0"+s;
				h = Math.floor( m / 60 );
				m %= 60;
				if(m<10) m="0"+m;
				this.runningTimeStr = h + " : " + m + " : " + s;
			}

			this.fps = Math.round( this.frames / this.dtSum );
			this.dtSum = 0;
			this.frames = 0;

		}

		return this;
	},
	render : function() {
		var c = this.ctx;
		c.save();
		
		if(!! this.bgimg) {
			if( this.bgrepeat ) {
				c.fillStyle = c.createPattern(this.bgimg, 'repeat');
				c.fillRect( 0, 0, this.canvas.width,this.canvas.height);
			} else {
				c.drawImage(this.bgimg, 
						this.bgimgrect[0], this.bgimgrect[1], this.bgimgrect[2], this.bgimgrect[3], 
						0, 0, this.canvas.width,this.canvas.height);
			}
		} else {
			if(!! this.bgcolor ) c.fillStyle = this.bgcolor;
			c.fillRect( 0, 0, this.canvas.width, this.canvas.height );
		}
		
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
			c.save();
			c.strokeStyle = this.color;
			c.fillStyle = this.color;
			
			c.fillText( this.runningTimeStr, this.infoPos[0], this.infoPos[1] + 20 );
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
			c.restore();
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
		if( hotjs.Vector.getLength(vect) <= this.touch_accuracy ) {
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
	setDraggable : function(x,y) {
		this.draggableX = x;
		this.draggableY = (y == undefined) ? x : y;
		this.draggable = x || y;
		if( this.draggable ) {
			if(this.touches0 == undefined) this.touches0 = new hotjs.HashMap();	
			if(this.touches == undefined) this.touches = new hotjs.HashMap();
		}
		return this;
	},
	setMoveable : function(x,y) {
		this.setDraggable(x,y);
		
		this.moveable = x || y;
		
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
	fixPos : function(){
	},
	handleDragZoomRotate : function(t) {
		if(! this.touches) return false;
		if(! this.touches0) return false;
		
		if( this.draggable ) {
			if( this.touches.size() == 1 ) {
				var t0 = this.touches0.get( this.id0 );
				var t1 = this.touches.get( this.id0 );
				if( this.draggableX ) this.pos[0] = (t1.x - t0.x + t0.px);
				if( this.draggableY ) this.pos[1] = (t1.y - t0.y + t0.py);
				
				this.fixPos();
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
				
				this.fixPos();
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
	this.bgcolor = undefined;

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
		
		//this.fixPos();
		//this.setVelocity(0,0);
		//this.setSpin(0,0);
		
		return ret;
	},
	onTouchEnd : function(t) {
		var ret = Scene.supClass.onTouchEnd.call(this, t);

		//this.fixPos();
		//this.setVelocity(0,0);
		//this.setSpin(0,0);
		
		return ret;
	},
	// ensure the scene is always in view
	fixPos : function() {
		var Vector = hotjs.Vector;
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
		
		this.fixPos();
		
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
			
		} else {
			// by default, scale & center scene to fit view
			this.scale = [sMin, sMin];
			this.pos = [ (vSize[0] - this.size[0] * sMin) /2, (vSize[1] - this.size[1] * sMin)/2 ];
		}
		
		this.fixPos();

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
			} else if( !! this.bgcolor ){
				c.fillStyle = this.bgcolor;
				c.fillRect(0, 0, this.size[0], this.size[1]);
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
// TODO: all core packages, classes, and function set
hotjs.View = View;
hotjs.Node = Node;
hotjs.Scene = Scene;

})(); 

