rnj.CanvasBackground = function(imgfile) {
	this.bgImg = new Image();
	this.bgImg.src = imgfile;

	this.bgOffset = 0, // This is set before calling drawBackground()
	this.bgVelocity = 42,

	this.render = function(c) {
		c.save();
		c.translate(-this.bgOffset, 0);
		c.drawImage(this.bgImg, 0, 0);
		c.drawImage(this.bgImg, this.bgImg.width, 0);
		c.translate(this.bgOffset, 0);
		c.restore();

	};

	this.update = function(i, fps, now) {
		// Time-based motion
		var offset = this.bgOffset + this.bgVelocity / fps; 

		if (offset > 0 && offset < this.bgImg.width) {
			this.bgOffset = offset;
		} else {
			this.bgOffset = 0;
		}
	};
};
