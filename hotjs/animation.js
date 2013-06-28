
hotjs.Anim = hotjs.Anim || {};

(function(){

var Animation = function(who, param){
	hotjs.base(this);
	
	this.who = who;
	
	this.param = {
		loop : false,
		duration : 1.0
	};
	for( var i in param ) {
		this.param[i] = param[i];
	}

	this.dtSum = 0;
};

hotjs.inherit(Animation, hotjs.Class, {
	// override
	init: function(){
	},
	step: function(dt) {
	},
	restore: function(){
	},
	// called 
	play: function(){
		this.init();
		this.who.addAnim(this);
		return this;
	},
	update: function(dt) {
		this.dtSum += dt;
		var timeout = ( this.dtSum >= this.param.duration ) && (! this.loop);
		
		var func = this.param.step;
		var done = ( typeof func == 'function' ) ? func( this, dt ) : this.step(dt);
		
		if( timeout || done ) {
			this.who.removeAnim(this);
			
			var func = this.param.done;
			if( typeof func == 'function') {
				func( this );
			}
		}
	}
});

// TODO: MoveTo
var MoveTo = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(MoveTo, Animation, {
	init: function(){
		var p = this.param;
		this.from = [ this.who.pos[0], this.who.pos[1] ];
		this.to = [ p.to[0], p.to[1] ];
		
		this.inc = [ (this.to[0] - this.from[0]) / p.duration, 
		             (this.to[1] - this.from[1]) / p.duration ];
	},
	step: function(dt) {
		this.who.pos = [ this.from[0] + this.inc[0] * this.dtSum, 
		                 this.from[1] + this.inc[1] * this.dtSum ];

		if( this.dtSum >= this.param.duration ) {
			this.who.pos = this.to;
		}
		return false;
	},
	restore: function(dt) {
		this.who.pos = this.from;
	}
});

//TODO: StickTo
var StickTo = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(StickTo, Animation, {
	init: function(){
		var p = this.param;
		this.from = [ this.who.pos[0], this.who.pos[1] ];
		this.to = [ p.to[0], p.to[1] ];
		
		this.inc = [ (this.to[0] - this.from[0]) / (p.duration * p.duration),
		             (this.to[1] - this.from[1]) / (p.duration * p.duration) ];
		
	},
	step: function(dt) {
		var t = this.dtSum * this.dtSum;
		this.who.pos = [ this.from[0] + this.inc[0] * t,
		                 this.from[1] + this.inc[1] * t ];
		
		if( this.dtSum >= this.param.duration ) {
			this.who.pos = this.to;
		}
		return false;
	},
	restore: function(dt) {
		this.who.pos = this.from;
	}
});

//TODO: SlowDown
var SlowDown = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(SlowDown, Animation, {
	init: function(){
		if(! this.who.velocity) this.who.rotation = [0,0];
		this.from = this.who.velocity;
	},
	step: function(dt) {
		var perc = 1 - this.dtSum / this.param.duration;
		this.who.velocity = [ this.from[0] * perc, this.from[1] * perc ];
		if( this.dtSum >= this.param.duration ) {
			this.who.velocity = [0,0];
		}
	},
	restore: function() {
		this.who.velocity = this.from;
	}
});

// TODO: RotateBy
var RotateBy = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(RotateBy, Animation, {
	init: function(){
		if(! this.who.rotation) this.who.rotation = 0;
		if(! this.param.spin) {
			console.log('lacking param.spin');
		}		
		this.from = this.who.rotation;
		this.inc = this.param.spin;
	},
	step: function(dt) {
		this.who.rotation += this.inc * dt;
	},
	restore: function() {
		this.who.rotation = this.from;
	}
});

//TODO: ScaleTo
var ScaleTo = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(ScaleTo, Animation, {
	init: function(){
		var p = this.param;
		var dur = p.duration;

		this.from = this.who.scale;
		this.to = p.to;
		this.inc = [ (p.to[0]-this.who.scale[0]) / dur, 
		             (p.to[1]-this.who.scale[1]) / dur ];
	},
	step: function(dt) {
		this.who.scale = [ this.from[0] + this.inc[0] * dt,
		                   this.from[1] + this.inc[1] * dt ];
		if( this.dtSum >= this.param.duration ) {
			this.who.scale = this.to;
		}
	},
	restore: function(){
		this.who.scale = this.from;
	}
});

//TODO: ScaleLoop
var ScaleLoop = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(ScaleLoop, Animation, {
	init: function(){
		var p = this.param;
		this.from = this.who.scale;
		this.mid = (p.range[0] + p.range[1])/2;
		this.delta = (p.range[1] - p.range[0])/2;
	},
	step: function(dt) {
		var s = this.mid + this.delta * Math.sin( this.dtSum / this.param.freq * Math.PI );
		this.who.scale = [s, s];
		return false;
	},
	restore: function(){
		this.who.scale = this.from;
	}
});


//TODO: FadeTo
var FadeTo = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(FadeTo, Animation, {
	init: function(){
		var p = this.param;
		
		this.from = this.who.alpha;
		this.to = p.to;
		this.inc = (p.to - this.from) / p.duration;
	},
	step: function(dt) {
		this.who.alpha = this.from + this.inc * dt;
		if( this.dtSum >= this.param.duration ) {
			this.who.alpha = this.to;
		}
	},
	restore: function(){
		this.who.alpha = this.from;
	}
});

//TODO: FadeLoop
var FadeLoop = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(FadeLoop, Animation, {
	init: function(){
		var p = this.param;
		this.from = this.who.alpha;
		this.mid = (p.range[0] + p.range[1])/2;
		this.delta = (p.range[1] - p.range[0])/2;
	},
	step: function(dt) {
		this.who.alpha = this.mid + this.delta * Math.sin(this.dtSum / this.param.freq * Math.PI);
		return false;
	},
	restore: function(){
		this.who.alpha = this.from;
	}
});

var create = function(target, anim, param) {
	var animClass = hotjs.Anim[ anim ];
	if( typeof animClass != 'function') animClass = Animation;
	
	return new animClass(target, param);
};

var register = function(anim, animClass) {
	hotjs.Anim[ anim ] = animClass;
	return this;
};

hotjs.Anim = {
	register: register,
	create: create,
	MoveTo: MoveTo,
	StickTo: StickTo,
	SlowDown: SlowDown,
	RotateBy: RotateBy,
	ScaleTo: ScaleTo,
	ScaleLoop: ScaleLoop,
	FadeTo: FadeTo,
	FaceLoop: FadeLoop
};

})();
