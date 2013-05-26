
Math.randomRange = function(min, max) {
	return ((Math.random() * (max - min)) + min);
}

Math.randomInteger = function(min, max) {
	return Math.floor((Math.random() * (max - min)) + min);
}

Math.randomColor = function(min, max) {
	var R = Math.randomInteger(min, max);
	var G = Math.randomInteger(min, max);
	var B = Math.randomInteger(min, max);
	return ("#" + R.toString(16) + G.toString(16) + B.toString(16));	
}

Math.near = function(p1, p2, range) {
	var dx = p1.x - p2.x;
	var dy = p1.y - p2.y;
	return (dx * dx + dy * dy) <= range * range;
}