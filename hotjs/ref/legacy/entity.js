
hotjs.Entity = function() {
	// the position of the particle
};
hotjs.Entity.prototype.init = function(p) {
	this.x = p.x, this.y = p.y;
	this.r = hotjs.Random.Integer(20, 30);
	this.f = 1;
	this.color = hotjs.Random.Color(0x30, 0xFF);
	this.frame = hotjs.Random.Integer(0, 1000);
	this.moving = false;
	return this;
};
hotjs.Entity.prototype.inRange = function(p) {
	var dx = p.x - this.x;
	var dy = p.y - this.y;
	return (dx * dx + dy * dy <= this.r * this.r);
}

hotjs.Entity.prototype.moveTo = function(x, y) {
	this.targetX = x, this.targetY = y;
	this.dx = (this.targetX - this.x) / 10.0 / 1;
	this.dy = (this.targetY - this.y) / 10.0 / 1;
	this.moving = true;
}

hotjs.Entity.prototype.update = function(i, fps, now) {
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
hotjs.Entity.prototype.render = function(c) {}
hotjs.Entity.prototype.mouseDown = function(mp) {}
hotjs.Entity.prototype.drag = function(mp) {}
hotjs.Entity.prototype.drop = function(mp) {}

// ----------------------------------------------------------------

hotjs.TestEntity = function(){
	hotjs.base(this);
}

hotjs.inherit( hotjs.TestEntity, hotjs.Entity, {});

hotjs.TestEntity.prototype.update = function(i, fps, now) {
	var ret = hotjs.TestEntity.supClass.update.call(this);

	this.f = Math.sin(Math.PI * 2 * (this.frame + i) / fps) * 0.05 + 0.95;
}

hotjs.TestEntity.prototype.render = function(c) {
	c.save();
	c.fillStyle = this.color;
	c.translate(this.x, this.y);
	c.scale(this.f, this.f);
	c.beginPath();
	c.arc(0, 0, this.r, 0, Math.PI * 2, true);
	c.fill();
	c.restore();
}

hotjs.TestEntity.prototype.mouseDown = function(mp) {
	this.p0x = this.x, this.p0y = this.y;
	this.mp0x = mp.x, this.mp0y = mp.y;
}

hotjs.TestEntity.prototype.drop = function(mp) {
	this.x = this.p0x + (mp.x - this.mp0x);
	this.y = this.p0y + (mp.y - this.mp0y);

	//this.moveTo(this.p0x, this.p0y);
}

hotjs.Entity.prototype.drag = function(mp) {
	this.x = this.p0x + (mp.x - this.mp0x);
	this.y = this.p0y + (mp.y - this.mp0y);
}

