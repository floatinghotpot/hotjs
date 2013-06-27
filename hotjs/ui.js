
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
		} else {
			this.setMoveable(false, true);
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
		for( var i=0, r=0, c=0; i<nodes.length; i++ ) {
			var n = nodes[i];
			n.pos[0] = cw * (c + cols * pgc) + mg * (1+pgc*2) + (cw - n.size[0])/2;
			n.pos[1] = ch * (r + rows * pgr) + mg * (1+pgr*2) + (ch - n.size[1])/2;
			
			//c ++;
			if( ++ c >= cols ) {
				c = 0;
				//r ++;
				if( ++ r >= rows ) {
					r = 0;
					if( dir ) {
						pgr ++;
					} else {
						pgc ++;
					}
				}
			}
		}
		this.size[0] = (cw * cols + mg * 2) * (pgc +1);
		this.size[1] = (ch * rows + mg * 2) * (pgr +1);
		
		return this;
	},
	draw : function(c) {
		c.save();
		c.strokeStyle = '#cccccc';
		c.fillStyle = '#eeeeee';
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
		
		for( var i=0, row=0, col=0, pgc=0, pgr=0; i<nodes.length; i++ ) {
			c.fillRect( 
					cw * (col + cols * pgc) + mg * (1+pgc*2) + sp, 
					ch * (row + rows * pgr) + mg * (1+pgr*2) + sp, 
					cw - sp * 2, 
					ch - sp * 2
					);
			// or c.fillRect() with color/pattern
			
			//c ++;
			if( ++ col >= cols ) {
				col = 0;
				//r ++;
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
