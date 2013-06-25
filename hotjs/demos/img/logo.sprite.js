
// converted by sprite2js.py v0.1 (HotJS v1.0)

var sprites = sprites || {};

sprites['logo.sprite.js'] = {
'version' : 1,
// images:	1
// modules:	6
// frames:	1
// anims:	1
'images' : { // img_file, transp color
0:['./logo.png','0x00FF00FF']
},
'modules' : { // id: type, img_id, x, y, w, h
4096:['MD_IMAGE',0,0,0,320,512],
4097:['MD_IMAGE',0,320,0,320,512],
4098:['MD_IMAGE',0,0,512,320,512],
4099:['MD_IMAGE',0,320,512,320,512],
4100:['MD_IMAGE',0,0,1024,320,112],
4101:['MD_IMAGE',0,320,1024,320,112]
},
'frames' : { // id: mod_id, ox, oy, flag (0:none, 1:hyper_fm, 2:flip_x, 3:flip_y, 4:rot_90)
8192: [
[4096,0,0,0],
[4097,320,0,0],
[4098,0,512,0],
[4099,320,512,0],
[4100,0,1024,0],
[4101,320,1024,0]
]
},
'anims' : { // id: frame_id, time, ox, oy, flag (0:none, 2:flip_x, 3:flip_y, 4:rot_90)
12288: [
[8192,1,0,0,0],
[8192,1,0,0,0]
]
}
};

