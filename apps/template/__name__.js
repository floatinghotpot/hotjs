var sceneHello = new hotjs.Scene({
	width : 640,
	height : 480
});

var sceneMenu = new hotjs.Scene({
	width : 320,
	height : 480
});

var bg = new hotjs.Layer({
	width : 320,
	height : 480
}).addTo(sceneHello, 'background');

var layer = new hotjs.Layer({
	width : 320,
	height : 480
}).addTo(sceneHello, 'logoboard');

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
})
.addTo(layer)
.on('click',function(e){
	
})
.on('drag',function(e){
	
})
.on('drop',function(e){

});

var app = new hotjs.App;
var view = new hotjs.View(hotjs.View.CANVAS, 'container').setSize(320,480);
app.setView(view)
.addScene(sceneHello,'hello')
.addScene(sceneMenu,'menu')
.switchScene('menu')
.start();
