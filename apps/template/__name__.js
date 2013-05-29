var render = new hotjs.Render(hotjs.Render.CANVAS, 'container');

var view = new hotjs.View({
	width : 320,
	height : 480
}).addTo(render, 'logoview');

var bg = new hotjs.Layer({
	width : 320,
	height : 480
}).addTo(view, 'background');

var layer = new hotjs.Layer({
	width : 320,
	height : 480
}).addTo(view, 'logoboard');

hotjs.ImageManager.add({
	hot : "img/hot-256.png"
});

hotjs.AudioManager.add({
	hello : "media/hello.mp3"
});

var logo = new hotjs.Entity({
	x : "center",
	y : "center",
	velocityRotate : 90,
	backgroundImage : "hot"
}).addTo(layer);

hotjs.App.start(render);
