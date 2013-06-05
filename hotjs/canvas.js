
// -------------------------------------------------------
// param : { id : 'id', width : w, height : h }
hotjs.Canvas = function(param) {
	this.canvas = undefined;
	this.jcanvas = undefined;
	this.debugInfo = "{}";
	this.debugMode = true;

	// init canvas
	if (param.id != undefined) {
		this.canvas = document.getElementById(param.id);
	}
	if (this.canvas == undefined) {
		this.canvas = document.createElement('canvas');
		document.body.appendChild(this.canvas);
		this.canvas.style.width = '100%';
		this.canvas.style.height = '100%';
		this.canvas.id = 'can_' + Math.floor(Math.random() * 100);
	}
	this.debugInfo = "canvas id = " + this.canvas.id;
	if (param.width != undefined)
		this.canvas.width = param.width;
	if (param.height != undefined)
		this.canvas.height = param.height;

	this.jcanvas = $("#" + this.canvas.id);
	// init or change scale
	this.scale = {
		x : this.canvas.width / this.jcanvas.width(),
		y : this.canvas.height / this.jcanvas.height()
	};
	this.offset = {
		x : this.jcanvas.offset().left,
		y : this.jcanvas.offset().top
	}
	this.onResize = function() {
		var cw = this.jcanvas.width(), ch = this.jcanvas.height();
		var w = this.canvas.width, h = this.canvas.height;
		this.scale.x = w / cw, this.scale.y = h / ch;
	};
	window.rnjCanvas = this;
	$(window).resize(function() {
		this.rnjCanvas.onResize();
	});

	// entity list
	this.entities = [];
	this.dragItems = new HashMap();
	this.mousedown = new HashMap();
	this.canvas.rnjCanvas = this;
	this.posFromEvent = function(e) {
		var id = e.identifier;
		if (id == undefined)
			id = 0;
		return {
			id : id,
			x : Math.floor((e.pageX - this.offset.x) * this.scale.x + 0.5),
			y : Math.floor((e.pageY - this.offset.y) * this.scale.y + 0.5)
		};
	};
	this.onClick = function(e) {
		return false;

		var pos = this.posFromEvent(e);
		this.click(pos);
	}
	this.onMouseDown = function(e) {
		//this.debugInfo = "onMouseDown";
		var pos = this.posFromEvent(e);
		this.mousedown.put( pos.id, pos );
		// pass to entities
		for ( var i = this.entities.length - 1; i >= 0; i--) {
			entity = this.entities[i];
			if (entity.inRange(pos)) {
				entity.mouseDown(pos);
				this.dragItems.put( pos.id, entity );
				return;
			}
		}
		//this.click(pos);
	};
	this.onMouseUp = function(e) {
		//this.debugInfo = "onMouseUp";
		var pos = this.posFromEvent(e);
		var entity = this.dragItems.get( pos.id );
		if( entity != null ) {
			entity.drop(pos);
			this.dragItems.remove( pos.id );
		}
		var downpos = this.mousedown.get( pos.id );
		if( downpos != null ) {
			var dx = pos.x - downpos.x;
			var dy = pos.y - downpos.y;
			//if ((pos.x == downpos.x) && (pos.y == downpos.y)) {
			if( dx * dx + dy * dy <= 25 ) {
				this.click(pos);
			}
			this.mousedown.remove( pos.id );
		}
	};
	this.onMouseMove = function(e) {
		//this.debugInfo = "onMouseMove";
		var pos = this.posFromEvent(e);
		var entity = this.dragItems.get( pos.id );
		if( entity != null ) {
			entity.drag(pos);
		}
	};

	this.onTouchStart = function(e) {
		this.debugInfo =  "start: " + e.targetTouches.length + "/" + e.changedTouches.length+ "/" + e.touches.length + " (";
		for ( var i = 0; i < e.targetTouches.length; i++) {
			this.debugInfo += e.targetTouches[i].identifier + "/";
			//this.onClick(e.targetTouches[i]);
			this.onMouseDown(e.targetTouches[i]);
		}
		this.debugInfo += ") drag/down:" + this.dragItems.size() + "/" + this.mousedown.size();
		e.preventDefault();
	};
	this.onTouchEnd = function(e) {
		this.debugInfo =  "end: " + e.targetTouches.length + "/" + e.changedTouches.length+ "/" + e.touches.length + " (";
		for ( var i = 0; i < e.changedTouches.length; i++) {
			this.debugInfo += e.changedTouches[i].identifier + "/";
			this.onMouseUp(e.changedTouches[i]);
		}
		this.debugInfo += ") drag/down:" + this.dragItems.size() + "/" + this.mousedown.size();
		e.preventDefault();
	};
	this.onTouchMove = function(e) {
		this.debugInfo =  "move: " + e.targetTouches.length + "/" + e.changedTouches.length+ "/" + e.touches.length + " (";
		for ( var i = 0; i < e.targetTouches.length; i++) {
			this.debugInfo += e.targetTouches[i].identifier + "/";
			this.onMouseMove(e.targetTouches[i]);
		}
		this.debugInfo += ") drag/down:" + this.dragItems.size() + "/" + this.mousedown.size();
		e.preventDefault();
	};

	this.canvas.addEventListener('click',function(e){
		this.rnjCanvas.onClick(e);
	});
	this.canvas.addEventListener('mousedown',function(e){
		this.rnjCanvas.onMouseDown(e);
	});
	this.canvas.addEventListener('mouseup',function(e){
		this.rnjCanvas.onMouseUp(e);
	});
	this.canvas.addEventListener('mousemove',function(e){
		this.rnjCanvas.onMouseMove(e);
	});
	this.canvas.addEventListener('touchstart',function(e){
		this.rnjCanvas.onTouchStart(e);
	});
	this.canvas.addEventListener('touchend',function(e){
		this.rnjCanvas.onTouchEnd(e);
	});
	this.canvas.addEventListener('touchmove',function(e){
		this.rnjCanvas.onTouchMove(e);
	});

	this.context = this.canvas.getContext('2d');
	// background
	this.bg = undefined;
	this.setBackground = function(b) {
		this.bg = b;
	};

	// render & update
	this.fps = 30;
	this.fps_show = 30;
	this.frame = 0;
	this.lastFrameTime = 0;
	this.lastSecond = 0;
	this.showDebugInfo = function(c) {
		// draw msg
		var nw = $(window).innerWidth(), nh = $(window).innerHeight();
		var w = c.canvas.width, h = c.canvas.height;
		var m = 0;
		c.save();
		c.fillStyle = "white";
		c.strokeStyle = "white";
		c.strokeRect(m, m, w - m * 2, h - m * 2);
		c.fillText("nW x nH = (" + nw + "," + nh + ") ", 10, 40);
		c.fillText("W x H = (" + w + "," + h + ") ", 10, 60);
		c.fillText(Math.floor(this.fps_show + 0.5) + " fps", 10, 80);
		c.fillText(this.debugInfo, 10, 100);
		c.restore();
	};
	this.update = function(now) {
		// calculate fps & frame index
		this.fps = 1000 / (now - this.lastFrameTime);
		this.lastFrameTime = now;
		if (now - this.lastSecond > 1000) {
			this.lastSecond = now;
			if (this.fps > this.fps_show)
				this.fps_show = this.fps;
		}
		this.frame++;
		if( this.frame > this.fps_show ) this.frame = 0;

		// draw background
		if (this.bg != undefined) {
			this.bg.update(this.frame, this.fps_show, now);
		}

		// draw entities
		for (i = 0; i < this.entities.length; i++) {
			var entity = this.entities[i];
			entity.update(this.frame, this.fps_show, now);
		}
	};
	this.render = function(now) {
		// clear canvas
		var c = this.context;
		c.fillStyle = "rgb(0,0,0)";
		c.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// draw background
		if (this.bg != undefined) {
			this.bg.render(c);
		}

		// draw entities
		for (i = 0; i < this.entities.length; i++) {
			var entity = this.entities[i];
			entity.render(c);
		}

		if(this.debugMode) this.showDebugInfo(c);

	};
}

// override 
hotjs.Canvas.prototype.click = function(pos) {
	// pass to entities
	for ( var i = this.entities.length - 1; i >= 0; i--) {
		var entity = this.entities[i];
		if (entity.inRange(pos)) {
			this.entities.splice(i, 1);
			return;
		}
	}

	// create a new entity
	var entity = new hotjs.TestEntity();
	entity.init( pos );
	this.entities.push( entity );;
}


