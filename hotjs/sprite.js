// name space
var hotjs = hotjs || {};

(function(){
	
// TODO: Sprite

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

var Animat = function(sprite_name, anim_id){
	hotjs.base(this);
	
	this.sheet = sprites[ hotjs.getFileName( sprite_name ) ];
	this.anim = (this.sheet['anims']) [ anim_id ];
	
	this.index = 0;
	this.counter = 0;
};

hotjs.inherit(Animat, hotjs.Class, {
	update: function(dt) {
		var frame = this.anim[ this.index ];
		this.counter ++;
		if( this.counter >= frame[1]) {
			this.counter = 0;
			this.index ++;
			if( this.index >= this.anim.length ) this.index = 0;
		}
	},
	render: function(c, w, h) {
		c.save();
		c.translate( w * 0.5, h );
		var modules = this.sheet['modules'];
		var images = this.sheet['images'];
		var frames = this.sheet['frames'];

		var f = this.anim[ this.index ];
		var frame_id = f[0], ox = f[2], oy = f[3], oflag = f[4];
		var mods = frames[ frame_id ];
		
		c.translate(ox, oy);
		switch( oflag ) {
		case 0: c.scale(1,1); break;
		case 2: c.scale(-1,1); break;
		case 3: c.scale(1,-1); break;
		case 4: c.scale(-1,-1); break;
		}
		
		for( var i=0; i<mods.length; i++ ) {
			// each piece in this frame
			var m = mods[i];
			var mod_id = m[0], oox = m[1], ooy = m[2], ooflag = m[3];

			// mapping to image
			var mod = modules[ mod_id ];
			if( mod[0] == 'MD_IMAGE' ) {
				var img_id = mod[1], x = mod[2], y = mod[3], w = mod[4], h = mod[5];
				var img = images[ img_id ];
				var img_url = img[2], transp = img[1];
				var oImg = resources.get( img_url );
				
				c.save();
				c.translate( oox +w/2, ooy+h/2 );
				switch(ooflag) {
				case 0: c.scale(1.01, 1.01); break;
				case 2: c.scale(-1.01, 1.01); break;
				case 3: c.scale(1.01, -1.01); break;
				case 4: c.scale(-1.01, -1.01); break;
				}
				c.drawImage( oImg, x, y, w, h, -w/2, -h/2, w, h );
				c.restore();
			}
		}
		c.restore();
	}
});

hotjs.Sprite = Sprite;
hotjs.Animat = Animat;

})(); 