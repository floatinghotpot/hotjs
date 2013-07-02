// name space
var hotjs = hotjs || {};

(function(){
	
// TODO: Sprite, from simple PNG
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

// TODO: Animat, data source: AuroraGT by Gamelosft
var Animat = function(url, anim_id){
	hotjs.base(this);
	
	this.sheet = sprite_cache[ hotjs.getFileName( url ) ];
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

// TODO: Particle
var Particle = function( par ){
	hotjs.base(this);
	
	this.par = par;
	
	this.frame = 0;
	this.life = 0;
	
	this.spin = 0;
	this.spin_delta = 0;
};

hotjs.inherit( Particle, hotjs.Node, {
	init: function(){
		var randi = hotjs.Random.Integer;
		var randf = hotjs.Random.Float;
		var par = this.par;
		var v = par.mode.v;
		
		if( par.res.endsWith('.png') ) {
			this.setImage( resources.get(par.resurl) );
		} else if( par.res.endsWith('.sprite.js') ) {
			this.setSprite( new Animat(par.resurl, 'xxx') );
		} else {
			return this;
		}
		
		this.life = randi( par.lifeMin, par.lifeMax );

		// init pos
		this.pos = [ par.x, par.y ];
		switch( par.mode.id ) {
		case 0:
			break;
		case 31: // rect 
			this.pos[0] += randf(v[0], v[2]);
			this.pos[1] += randf(v[1], v[3]);
			break;
		case 32: // circle
			var R = randf(v[1], v[0]);
			var ang = randf(v[2], v[3]);
			this.pos[0] += R * Math.cos(ang * Math.PI / 180);
			this.pos[1] += R * Math.sin(ang * Math.PI / 180);
			break;
		}
		
		var fts = par.filters;
		for( var i=0; i<fts.length; i++ ) {
			var ft = fts[i];
			var v = ft.v;
			switch( ft.type ) {
			case 'rotate':
				if( v[1] > 0 ) {
					this.rotation = randf(0, 1) * 360;
				} else {
					this.rotation = v[0];
				}
				this.spin = v[2];
				this.spin_delta = (v[3] - v[2]) / this.life;
				break;
			case 'scale':
				var s = randf(v[0], v[1]);
				this.scale = [s, s];
				// TODO: center point shift
				break;
			case 'move':
				break;
			case 'color':
				break;
			case 'h3g':
				break;
			}
		}
		
		return this;
	},
	update: function(dt){
		Particle.supClass.update.call(this, dt);
		
		this.frame ++;
		this.rotation += this.spin;
		this.spin += this.spin_delta;
	}	
});

// TODO: ParticleSet
var ParticleSet = function( par ) {
	hotjs.base(this);
	
	this.par = par;
	
	// TODO: to ensure performance, set limit up to 16 particles
	this.par.maxPtsCount = Math.min( this.par.maxPtsCount, 16 );
	this.subnodes = [];
	
	this.frame = 0;
};

hotjs.inherit( ParticleSet, hotjs.Node, {
	init: function(){
	},
	destroy: function(){
		this.subnodes.length = 0;
	},
	update: function(dt){
		var randi = hotjs.Random.Integer;
		var par = this.par;
		var ps = this.subnodes;
		
		// destroy
		for( var i=ps.length-1; i>=0; i-- ) {
			var p = ps[i];
			if( p.frame < p.life ) {
				p.update(dt);
			} else {
				ps.splice(i,1);
				delete p;
			}
		}
		
		// create
		if( this.frame >= par.delay && this.frame < par.life ) {
			var n = randi( par.createMin, par.createMax );
			for( var i=0; i<n; i++ ) {
				if( ps.length >= par.maxPtsCount ) break;
				var p = new Particle( par ).init();
				this.addNode(p);
			}
		}

		this.frame ++;
		if( this.frame >= 25 ) this.frame = 0;
	}
});

// TODO: ParticleSystem
var ParticleSystem = function( url ) {
	hotjs.base(this);

	var pst = pst_cache[ hotjs.getFileName( url ) ];
	var pset = pst.launchers;
	
	for( var i=0; i<pset.length; i++ ) {
		this.addNode( new ParticleSet( pset[i] ) );
	}
};

hotjs.inherit( ParticleSystem, hotjs.Node, {

});

hotjs.Sprite = Sprite;

hotjs.Animat = Animat;

hotjs.Particle = Particle;
hotjs.ParticleSet = ParticleSet;
hotjs.ParticleSystem = ParticleSystem;

})(); 