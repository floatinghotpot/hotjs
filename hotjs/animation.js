
hotjs.Anim = hotjs.Anim || {};

(function(){

var Animation = function(who, dur){
	hotjs.base(this);
	this.who = who;
	this.duration = dur;
	this.callStep = undefined; // function(ani,dt){};
	this.callDone = undefined; // function(ani){};
	
	this.dtSum = 0;
	this.done = false;
};

hotjs.inherit(Animation, hotjs.Class, {
	// overridable
	restore: function(){
	},
	step: function(dt) {
	},
	// called 
	update: function(dt) {
		this.dtSum += dt;
		var done = ( typeof this.callStep == 'function' ) ? this.callStep(this,dt) : this.step(dt);
		
		if( done || (this.dtSum >= this.duration) ) {
			this.who.removeAnim(this);
			if( typeof this.callDone ) {
				this.callDone( this );
			}
		}
	},
	play: function( callDone ){
		this.callDone = callDone;
		this.who.addAnim(this);
		return this;
	}
});

// TODO: MoveTo
var MoveTo = function(who, pos, dur, callStep) {
	hotjs.base(this, who, dur, callStep);
	
	if(! dur) dur = 1.0;
	this.from = [ who.pos[0], who.pos[1] ];
	this.to = [ pos[0], pos[1] ];
	
	this.inc = [ (this.to[0] - this.from[0])/dur, 
	                  (this.to[1] - this.from[1])/dur ];
};

hotjs.inherit(MoveTo, Animation, {
	step: function(dt) {
		this.who.pos = [ this.who.pos[0] + this.inc[0] * dt, 
		                 this.who.pos[1] + this.inc[1] * dt ];
		
		if( this.dtSum >= this.duration ) {
			this.who.pos = this.to;
		}
		return false;
	},
	restore: function(dt) {
		this.who.pos = this.from;
	}
});

//TODO: StickTo
var StickTo = function(who, pos, dur, callStep) {
	hotjs.base(this, who, dur, callStep);
	
	if(! dur) dur = 1.0;
	this.from = [ who.pos[0], who.pos[1] ];
	this.to = [ pos[0], pos[1] ];
	
	this.inc = [ (this.to[0]-this.from[0])/(dur*dur),
	             (this.to[1]-this.from[1])/(dur*dur) ];
};

hotjs.inherit(StickTo, Animation, {
	step: function(dt) {
		var t = this.dtSum * this.dtSum;
		this.who.pos = [ this.from[0] + this.inc[0] * t,
		                 this.from[1] + this.inc[1] * t ];
		
		if( this.dtSum >= this.duration ) {
			this.who.pos = this.to;
		}
		return false;
	},
	restore: function(dt) {
		this.who.pos = this.from;
	}
});

// TODO: RotateBy
var RotateBy = function(who, spin, dur, callStep) {
	hotjs.base(this, who, dur, callStep);
	
	if(! dur) dur = 1.0;
	this.from = this.who.rotation;
	this.spin = spin;
	
	this.inc = spin;
};

hotjs.inherit(RotateBy, Animation, {
	step: function(dt) {
		this.who.roation += this.inc * dt;
	},
	restore: function() {
		this.who.rotation = this.from;
	}
});

//TODO: ScaleTo
var ScaleTo = function(who, to, dur, callStep) {
	hotjs.base(this, who, dur, callStep);
	
	if(! dur) dur = 1.0;
	this.from = this.who.scale;
	this.to = to;
	
	this.inc = [ (to[0]-this.who.scale[0])/dur, 
	                (to[1]-this.who.scale[1])/dur ];
};

hotjs.inherit(ScaleTo, Animation, {
	step: function(dt) {
		this.who.scale = [ this.from[0] + this.inc[0] * dt,
		                   this.from[1] + this.inc[1] * dt ];
	},
	restore: function(){
		this.who.scale = this.from;
	}
});

//TODO: FadeTo
var FadeTo = function(who, to, dur, callStep) {
	hotjs.base(this, who, dur, callStep);
	
	if(! dur) dur = 1.0;
	this.from = this.who.alpha;
	this.to = to;
	
	this.inc = [ (to - this.from)/dur ];
};

hotjs.inherit(FadeTo, Animation, {
	step: function(dt) {
		this.who.alpha = [ this.from + this.inc * dt ];
	},
	restore: function(){
		this.who.alpha = this.from;
	}
});

hotjs.Anim.MoveTo = MoveTo;
hotjs.Anim.StickTo = StickTo;

hotjs.Anim.RotateBy = RotateBy;

hotjs.Anim.ScaleTo = ScaleTo;
hotjs.Anim.FadeTo = FadeTo;

})();
