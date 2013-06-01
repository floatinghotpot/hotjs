var WIDTH = 480, HEIGHT = 320;
var COLLISION_LOSS_V = 0.2;
var COLLISION_LOSS_H = 0.01;
var AIR_RESISTANCE = 1/160;
var GRAVITY = 9.8 / 60;

var Ball = function(name){
	hotjs.base(this, name);
};

hotjs.inherit(Ball, hotjs.Node, {
	update : function(dt) {
		Ball.supClass.update.call(this, dt);

		// check boundary 
		var bx = ((this.pos[0] + this.size[0]/2 >= WIDTH) && (this.velocity[0] >0)) 
			|| ((this.pos[0] - this.size[0]/2 <= 0) && (this.velocity[0] <0));
		var by = ((this.pos[1] + this.size[1]/2 >= HEIGHT) && (this.velocity[1] >0)) 
			|| ((this.pos[1] - this.size[1]/2 <= 0) && (this.velocity[1]<0));
		
		// bounce 
		if(by) {
			this.velocity[1] = - this.velocity[1];
			this.velocity[1] *= (1-COLLISION_LOSS_V);
			this.velocity[0] *= (1-COLLISION_LOSS_H);
		}
		if(bx){
			this.velocity[0] = - this.velocity[0];
			this.velocity[0] *= (1-COLLISION_LOSS_V);
			this.velocity[1] *= (1-COLLISION_LOSS_H);
		}
		
		// collission loss
		if( bx || by ) {

		} else {
			this.accel[0] = - this.velocity[0] * AIR_RESISTANCE / 5;
			this.accel[1] += - this.velocity[1] * AIR_RESISTANCE;
		}
		
		// gravity
		if(this.pos[1] + this.size[1]/2 < HEIGHT-5) { // air 
			this.accel[1] = GRAVITY;
		}
	}
});
	