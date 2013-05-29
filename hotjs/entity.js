rnj.Entity = function() {
	// the position of the particle
};
rnj.Entity.prototype.init = function(p) {
	this.x = p.x, this.y = p.y;
	this.r = Math.randomRange(20, 30);
	this.f = 1;
	this.color = Math.randomColor(0x30, 0xFF);
	this.frame = Math.randomRange(0, 1000);
	this.moving = false;
	return this;
};
rnj.Entity.prototype.inRange = function(p) {
	var dx = p.x - this.x;
	var dy = p.y - this.y;
	return (dx * dx + dy * dy <= this.r * this.r);
}

rnj.Entity.prototype.moveTo = function(x, y) {
	this.targetX = x, this.targetY = y;
	this.dx = (this.targetX - this.x) / 10.0 / 1;
	this.dy = (this.targetY - this.y) / 10.0 / 1;
	this.moving = true;
}

rnj.Entity.prototype.update = function(i, fps, now) {
	if (this.moving) {
		var keep_moving = ((this.dx > 0) && (this.x < this.targetX))
				|| ((this.dx < 0) && (this.x > this.targetX));
		if (keep_moving) {
			this.x += this.dx;
			this.y += this.dy;
		} else {
			this.moving = false;
		}
	}	
}
rnj.Entity.prototype.render = function(c) {}
rnj.Entity.prototype.mouseDown = function(mp) {}
rnj.Entity.prototype.drag = function(mp) {}
rnj.Entity.prototype.drop = function(mp) {}

// ----------------------------------------------------------------

rnj.TestEntity = function(){}
rnj.TestEntity.inheritsFrom( rnj.Entity );

rnj.TestEntity.prototype.update = function(i, fps, now) {
	var ret = this.parent.update.call(this);

	this.f = Math.sin(Math.PI * 2 * (this.frame + i) / fps) * 0.05 + 0.95;
}

rnj.TestEntity.prototype.render = function(c) {
	c.save();
	c.fillStyle = this.color;
	c.translate(this.x, this.y);
	c.scale(this.f, this.f);
	c.beginPath();
	c.arc(0, 0, this.r, 0, Math.PI * 2, true);
	c.fill();
	c.restore();
}

rnj.TestEntity.prototype.mouseDown = function(mp) {
	this.p0x = this.x, this.p0y = this.y;
	this.mp0x = mp.x, this.mp0y = mp.y;
}

rnj.TestEntity.prototype.drop = function(mp) {
	this.x = this.p0x + (mp.x - this.mp0x);
	this.y = this.p0y + (mp.y - this.mp0y);

	//this.moveTo(this.p0x, this.p0y);
}

rnj.Entity.prototype.drag = function(mp) {
	this.x = this.p0x + (mp.x - this.mp0x);
	this.y = this.p0y + (mp.y - this.mp0y);
}

