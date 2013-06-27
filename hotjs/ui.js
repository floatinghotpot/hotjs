
(function(){
	
var ShowBoard = function() {
	hotjs.base(this);
	
	this.subnodes = [];
	
	this.param = {
		width : 300,
		height : 400,
		margin : 20,
		padding : 10,
		rows : 1, // 1 row per page
		cols : 1, // 1 col per page
		dir : 0 // scroll X
	};
};

hotjs.inherit(ShowBoard, hotjs.Node, {
	addNode : function(sub) {
		ShowBoard.supClass.addNode.call(this, sub);
		this.updateLayout();
		return this;
	},
	setParam : function(p) {
		for( var i in p ) {
			this.param[i] = p[i];
		}
		if( this.param.dir == 0 ) {
			this.setMoveable(true, false);
			this.setThrowable(true, false);
		} else {
			this.setMoveable(false, true);
			this.setThrowable(false, true);
		}
		this.updateLayout();
		return this;
	},
	fixPos : function() {
		if( this.pos[0] > 0 ) this.pos[0] = 0;
		if( this.pos[1] > 0 ) this.pos[1] = 0;

		var minX = this.container.width() - this.size[0];
		var minY = this.container.height() - this.size[1];
		if( this.pos[0] < minX ) this.pos[0] = minX;
		if( this.pos[1] < minY ) this.pos[1] = minY;
	},
	onTouchEnd : function(t) {
		ShowBoard.supClass.onTouchEnd.call(this,t);
		
		this.autoFixPos = true;
	},
	update : function(dt) {
		ShowBoard.supClass.update.call(this, dt);
		
		if(!! this.autoFixPos ) {
			var p = this.param;
			if(this.velocity == undefined) this.velocity = [0,0];
			if( p.dir == 0 ) {
				var anchor = Math.floor(this.pos[0]/p.width + 0.49) * p.width;
				if( this.pos[0] != anchor ){
					this.velocity[0] += (anchor-this.pos[0]) * 0.2;
					this.velocity[0] = Math.floor( this.velocity[0]/2 + 0.49 );
				} else {
					this.velocity[0] = 0;
					this.autoFixPos = false;
				}
			} else {
				var anchor = Math.floor(this.pos[1]/p.height + 0.49) * p.height;
				if( this.pos[1] != anchor ) {
					this.velocity[1] += (anchor-this.pos[1]) * 0.2;
					this.velocity[1] = Math.floor( this.velocity[1]/2 + 0.49 );
				} else {
					this.velocity[1] = 0;
					this.autoFixPos = false;
				}
			}
		}
		
		return this;
	},
	updateLayout : function(){
		var nodes = this.subnodes;
		
		var p = this.param;
		var mg = p.margin || 0;
		var pad = p.padding || 0;
		var sp = p.spacing || 0;
		var rows = p.rows || 1;
		var cols = p.cols || 1;
		var dir = p.dir ? 1 : 0;
		var w = p.width || 300; w -= mg * 2;
		var h = p.height || 400; h -= mg * 2;
		var cw = w / cols, ch = h / rows;
		
		var pgc=0, pgr=0;
		for( var i=0, row=0, col=0; i<nodes.length; i++ ) {
			var n = nodes[i];
			n.pos[0] = cw * (col + cols * pgc) + mg * (1+pgc*2) + (cw - n.size[0])/2;
			n.pos[1] = ch * (row + rows * pgr) + mg * (1+pgr*2) + (ch - n.size[1])/2;
			
			if( ++ col >= cols ) {
				col = 0;
				if( ++ row >= rows ) {
					row = 0;
					if( dir ) {
						pgr ++;
					} else {
						pgc ++;
					}
				}
			}
		}
		pgc ++;
		pgr ++;
		if( col==0 && row==0 ) {
			if( dir ) {
				if( pgr>1 ) pgr --;
			} else {
				if( pgc>1 ){
					pgc --;
				}
			}
		}
		this.size[0] = (cw * cols + mg * 2) * pgc;
		this.size[1] = (ch * rows + mg * 2) * pgr;
		
		return this;
	},
	draw : function(c) {
		c.save();
		var nodes = this.subnodes;
		
		var p = this.param;
		var mg = p.margin || 0;
		var pad = p.padding || 0;
		var sp = p.spacing || 0;
		var rows = p.rows || 1;
		var cols = p.cols || 1;
		var dir = p.dir ? 1 : 0;
		var wd = p.width || 300; wd -= mg * 2;
		var ht = p.height || 400; ht -= mg * 2;
		var cw = wd / cols, ch = ht / rows;
		
		for( var i=0, row=0, col=0, pgc=0, pgr=0; i<nodes.length; i++ ) {
			var x = cw * (col + cols * pgc) + mg * (1+pgc*2) + sp;
			var y = ch * (row + rows * pgr) + mg * (1+pgr*2) + sp;
			var w = cw - sp * 2; 
			var h = ch - sp * 2;
			
			if(!! this.bgcolor ) {
				c.fillStyle = this.bgcolor;
				c.fillRect(x, y, w, h);
			}
			if(!! this.color) {
				c.strokeStyle = this.color;
				c.strokeRect(x, y, w, h);
			}
			// or c.fillRect() with color/pattern
			
			if( ++ col >= cols ) {
				col = 0;
				if( ++ row >= rows ) {
					row = 0;
					if( dir ) {
						pgr ++;
					} else {
						pgc ++;
					}
				}
			}
		}
		
		c.restore();
		return this;
	}
});

hotjs.ShowBoard = ShowBoard;

})();
