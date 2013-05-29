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
	logo : "img/logo.png"
});

hotjs.AudioManager.add({
	laugh : "media/laugh.mp3"
});

var logo = new hotjs.Entity({
	x : "center",
	y : "center",
	velocityRotate : 90,
	backgroundImage : "logo"
}).addTo(layer);

hotjs.App.start(render);
