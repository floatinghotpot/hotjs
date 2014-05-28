
// ------- hotjs.js ------------- 

// name space
var hotjs = hotjs || {};

(function(){

hotjs.version = 1.0;

/*
 * copy this code to where needs __FILE__
 * 
//Method 1: get path using the last loaded script, 
//remember, we must append script in resource preloading.
function getCurrentScriptPath() {
	var scripts = document.getElementsByTagName("script");
	var n = scripts.length;
	while( n > 0 ) {
		n --;
		var url = scripts[ n ].src;
		if( url.indexOf('xxx.js') >= 0 ) return url;
	}
	return '';
}

//Method 2: get with error exception
function getCurrentScriptPath2() {
	var url = '';
	try {
		throw Error("get js path");
	}catch(ex){
		if(ex.fileName) { //Firefox
			url = ex.fileName;
		} else if(ex.sourceURL) { //Safari
			url = ex.sourceURL;
		} else if(ex.stack) { //Chrome or IE10+
			url = (ex.stack.match(/at\s+(.*?):\d+:\d+/)||['',''])[1];
		} else {
			// no such info in ex, iOS 5
		}
	}
	return url;
}

var __FILE__ = getCurrentScriptPath() || getCurrentScriptPath2();

function _F(f) {
	return hotjs.getAbsPath(f, __FILE__);
}

*/

// tool for inherit
// See 
// "tests/test_oo.html" for example & use case
hotjs.inherit = function(childCtor, parentCtor, newMethods) {
	function F() {};
	F.prototype = parentCtor.prototype;
	
	childCtor.prototype = new F();
	childCtor.prototype.constructor = childCtor;
	
	childCtor.supClass = parentCtor.prototype;
	childCtor.supClass.constructor = parentCtor;
	
	for ( var p in newMethods) {
		if (newMethods.hasOwnProperty(p) && p !== "prototype") {
			childCtor.prototype[p] = newMethods[p];
		}
	}
};

hotjs.base = function(me, opt_methodName, var_args) {
	var caller = arguments.callee.caller;
	if (caller.supClass) {
		// This is a constructor. Call the superclass constructor.
		var args = Array.prototype.slice.call(arguments, 1);
		var f = caller.supClass.constructor;
		return f.apply(me, args);
	}

	var args = Array.prototype.slice.call(arguments, 2);
	var foundCaller = false;
	for ( var ctor = me.constructor; ctor; ctor = ctor.supClass && ctor.supClass.constructor) {
		if (ctor.prototype[opt_methodName] === caller) {
			foundCaller = true;
		} else if (foundCaller) {
			return ctor.prototype[opt_methodName].apply(me, args);
		}
	}

	// If we did not find the caller in the prototype chain,
	// then one of two things happened:
	// 1) The caller is an instance method.
	// 2) This method was not called by the right caller.
	if (me[opt_methodName] === caller) {
		return me.constructor.prototype[opt_methodName].apply(me, args);
	} else {
		throw Error('hotjs.base must be called in constructor');
	}
};

// tool to print variable value in console
hotjs.log = function(o, n) {
	if (typeof n == 'undefined' ) n = 0;
	
	var prefix = "";
	for ( var i = 0; i < n; i++) prefix += "  ";
	
	if( typeof o == "object" ) {
		console.log(prefix + typeof o + ' {');
		for ( var p in o) {
			if (typeof o[p] == 'object') {
				console.log( prefix + "  " + p + ' (' + typeof o[p]+ ') = ' );
				hotjs.log(o[p], n + 1);
			} else {
				console.log(prefix + "  " + p + ' (' + typeof o[p]+ ') = ' + o[p]);
			}
		}
		console.log(prefix + '}');
	} else {
		console.log( o );
	}
};

function s4() {
	return Math.floor((1 + Math.random()) * 0x10000)
		.toString(16)
	    .substring(1);
}

hotjs.guid = function() {
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

//[].indexOf(value)
if (typeof Array.prototype.indexOf !== 'function') {
	Array.prototype.indexOf = function(obj, fromIndex) {
		if (fromIndex == null || fromIndex == undefined) {
			fromIndex = 0;
		} else if (fromIndex < 0) {
			fromIndex = Math.max(0, this.length + fromIndex);
		}
		for ( var i = fromIndex, j = this.length; i < j; i++) {
			if (this[i] === obj)
				return i;
		}
		return -1;
	};
}

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

hotjs.formatString = function () {
    var param = [];
    for (var i = 0, l = arguments.length; i < l; i++)
    {
        param.push(arguments[i]);
    }
    var statment = param[0]; // get the first element(the original statement)
    param.shift(); // remove the first element from array
    return statment.replace(/\{(\d+)\}/g, function(m, n)
    {
        return param[n];
    });
};

hotjs.formatNumber = function(num, length) {
    var r = "" + num;
    while (r.length < length) {
        r = "0" + r;
    }
    return r;
};

hotjs.getFileName = function(path) {
	return path.substring( path.lastIndexOf('/')+1 );
};

hotjs.getDirPath = function(path) {
	return path.substring(0, path.lastIndexOf('/'));
};

hotjs.getAbsPath = function(f, me) {
	if( f.indexOf('://') > -1 ) return f;
	
	d = hotjs.getDirPath(me);
	do { // './xx.js' or '../xx.js'
		if (f.substring(0, 2) == './') {
			f = f.substring(2);
			continue;
		}
		if (d.length == 0)
			break;
		if (f.substring(0, 3) == '../') {
			f = f.substring(3);
			d = hotjs.getDirPath(d);
			continue;
		}
		if (d.length > 0) {
			f = d + '/' + f;
			break;
		}
	} while (1);

	return f;
};

// TODO: async call, may not fully loaded ... try check the github project require.js.
hotjs.require = function( f ) {
	//var f = hotjs.getAbsPath(f, document.location.href);
	
	var d = document, s = 'script';
	var ss = d.getElementsByTagName(s);

	var me = ss[ ss.length-1 ].src;
	f = hotjs.getAbsPath( f, me );
	
	for(var i=0; i<ss.length; i++) {
		if( ss[i].src == f ) return;
	}
	
	o = d.createElement(s);
	o.async = 0;
	o.src = f;
	ss[0].parentNode.insertBefore(o, ss[0]);
};

if( typeof requireScripts == 'function' ) {
	hotjs.require = requireScripts;
} else {
	requireScripts = hotjs.require;
}

// class HashMap
var HashMap = function() {
	this.elements = new Array();

	this.size = function() {
		return this.elements.length;
	};

	this.isEmpty = function() {
		return (this.elements.length < 1);
	};

	this.clear = function() {
		this.elements = new Array();
	};

	this.put = function(_key, _value) {
		var isContainKey = false;
		for ( var i = 0; i < this.elements.length; i++) {
			if (this.elements[i].key == _key) {
				isContainKey = true;
				this.elements[i].value = _value;
				break;
			}
		}
		if (isContainKey == false) {
			this.elements.push({
				key : _key,
				value : _value
			});
		}
	};

	this.remove = function(_key) {
		var bln = false;
		try {
			for ( var i = 0; i < this.elements.length; i++) {
				if (this.elements[i].key == _key) {
					this.elements.splice(i, 1);
					return true;
				}
			}
		} catch (e) {
			bln = false;
		}
		return bln;
	};

	this.get = function(_key) {
		try {
			for ( var i = 0; i < this.elements.length; i++) {
				if (this.elements[i].key == _key) {
					return this.elements[i].value;
				}
			}
		} catch (e) {
			return null;
		}
		return null;
	};

	this.element = function(_index) {
		if (_index < 0 || _index >= this.elements.length) {
			return null;
		}
		return this.elements[_index];
	};

	this.containsKey = function(_key) {
		var bln = false;
		try {
			for ( var i = 0; i < this.elements.length; i++) {
				if (this.elements[i].key == _key) {
					bln = true;
					break;
				}
			}
		} catch (e) {
			bln = false;
		}
		return bln;
	};

	this.containsValue = function(_value) {
		var bln = false;
		try {
			for ( var i = 0; i < this.elements.length; i++) {
				if (this.elements[i].value == _value) {
					bln = true;
					break;
				}
			}
		} catch (e) {
			bln = false;
		}
		return bln;
	};

	this.values = function() {
		var arr = new Array();
		for ( var i = 0; i < this.elements.length; i++) {
			arr.push(this.elements[i].value);
		}
		return arr;
	};

	this.keys = function() {
		var arr = new Array();
		for ( var i = 0; i < this.elements.length; i++) {
			arr.push(this.elements[i].key);
		}
		return arr;
	};
};

// -----------------------------------
// TODO: hotjs.Class, the root class
var number_of_objects = 0;

hotjs.Class = function(){
	number_of_objects ++;
	this.oid = number_of_objects;
};

hotjs.Class.prototype = {
	getObjectNumber : function(){
		return number_of_objects;
	},
	addNode : function(subnode, id){
		return this;
	},
	setContainer : function(c) {
		this.container = c;
		return this;
	},
	addTo : function(container, id) {
		this.setContainer( container );
		container.addNode(this, id);
		return this;
	}	
};

//----------------------
//TODO: class App

var App = function(){
	hotjs.base(this);
	
	this.res = [];
	this.modules = [];
};

hotjs.inherit(App, hotjs.Class, {
	init : function(){
	},
	exit : function() {
	},
	addRes : function(url) {
		this.res.push( url );
		return this;
	},
	getRes : function() {
		return this.res;
	},
	addNode : function(v) {
		this.modules.push(v);
		return this;
	},
	start : function() {
		for(var i=0; i<this.modules.length; i++) {
			this.modules[i].start();
		}
		return this;
	},
	resume : function( true_or_false ) {
		for(var i=0; i<this.modules.length; i++) {
			this.modules[i].resume( true_or_false );
		}
		return this;
	},	
	pause : function() {
		for(var i=0; i<this.modules.length; i++) {
			this.modules[i].resume( false );
		}
		return this;
	},
	stop : function() {
		for(var i=0; i<this.modules.length; i++) {
			this.modules[i].stop();
		}
		return this;
	}
});

// TODO: export to external

hotjs.HashMap = HashMap;
hotjs.App = App;

})(); 


// ------- hotjs-math.js ------------- 


hotjs = hotjs || {};

(function(){

//TODO: random functions
var Random = {
	// extend random
	Float : function(min, max) {
		return ((Math.random() * (max - min)) + min);
	},
	Integer : function(min, max) {
		return Math.floor((Math.random() * (max - min)) + min);
	},
	Color : function(min, max) {
		var R = Random.Integer(min, max);
		var G = Random.Integer(min, max);
		var B = Random.Integer(min, max);
		return ("#" + R.toString(16) + G.toString(16) + B.toString(16));	
	}
};

// TODO: Vector functions
var Vector = {
	copy : function(v) {
		return [ v[0], v[1] ];
	},
	vert : function(v) {
		return [ v[1], -v[0] ];
	},
	add : function (v1, v2) {
		return [ v1[0]+v2[0], v1[1]+v2[1] ];
	},
	sub : function (v1, v2) {
		return [ v1[0]-v2[0], v1[1]-v2[1] ];
	},
	mul : function (v, n) {
		return [v[0] * n, v[1] * n ];
	},
	scale : function (v, n) {
		return [v[0] * n[0], v[1] * n[1] ];
	},
	scaleDown : function(v, n) {
		return [v[0] / n[0], v[1] / n[1] ];
	},
	getLength : function(v) {
		return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
	},
	norm : function(v) {
		var n = 1 / Math.sqrt(v[0]*v[0] + v[1]*v[1]);
		return [v[0] * n, v[1] * n ];
	},
	angle : function(v) {
		var a = Math.acos( v[0] / Math.sqrt(v[0]*v[0] + v[1]*v[1]) );
		if( v[1] < 0 ) a = - a; 
		return a;
	},
	project : function (v1, v2) {
		var v1x = v1[0], v1y = v1[1];
		var v2x = v2[0], v2y = v2[1];
		var ang1 = Math.atan2(v1y,v1x);
		var ang2 = Math.atan2(v2y,v2x);
		var ang = ang1 - ang2;
		var v = Math.sqrt( v1x * v1x + v1y * v1y ) * Math.cos(ang);
		var vx = v * Math.cos(ang2);
		var vy = v * Math.sin(ang2);
		return [vx, vy];
	},
	inRect : function(v, r) { // [x,y,w,h]
		return ((v[0]>=r[0]) && (v[0]<r[0]+r[2])) && ((v[1]>=r[1]) && (v[1]<r[1]+r[3]));
	},
	inCircle : function(v1, v2, r) {
		return ((v1[0]-v2[0])*(v1[0]-v2[0])+(v1[1]-v2[1])*(v1[1]-v2[1]) <= (r*r));
	}
};

// TODO: to implement

var Matrix = {
	create : function(m, n, v){
		if(v == undefined) v = 0;
		var mtx = [];
		for(var i=0; i<m; i++) {
			var r = [];
			for(var j=0; j<n; j++) {
				r.push( v );
			}
			mtx.push( r );
		}
		return mtx;
	},
	copy : function(src){
		var dest = [];
		for(var i=0, m=src.length; i<m; i++) {
			var s = src[i], r = [];
			for(var j=0, n=s.length; j<n; j++) {
				r[j] = s[j];
			}
			dest.push( r );
		}
		return dest;
	},
	copyDeep : function copyDeep(src) {
		if( Array.isArray(src) ) {
			var dest = [];
			for(var i=0, m=src.length; i<m; i++) {
				dest.push( Matrix.copyDeep(src[i]) );
			}
			return dest;
		} else {
			return src;
		}		
	},
	isEqual : function(a1, a2) {
		if(a1.length < 1 || a2.length < 1) return false;
		if(a1.length != a2.length) return false;
		if(a1[0].length != a2[0].length) return false;
		
		for(var i=0, m=a1.length; i<m; i++) {
			var r1 = a1[i], r2 = a2[i];
			for(var j=0, n=r1.length; j<n; j++) {
				if(r1[j] != r2[j]) {
					return false;
				}
			}
		}
		return true;
	},
	add : function(a1, a2) {
		var dest = [];
		for(var i=0, m=a1.length; i<m; i++) {
			var r = [], s = a1[i], t = a2[i];
			for(var j=0, n=s.length; j<n; j++) {
				r[j] = s[j] + t[j];
			}
			dest.push( r );
		}
		return dest;
	},
	sub : function(a1, a2) {
		var dest = [];
		for(var i=0, m=a1.length; i<m; i++) {
			var r = [], s = a1[i], t = a2[i];
			for(var j=0, n=s.length; j<n; j++) {
				r[j] = s[j] - t[j];
			}
			dest.push( r );
		}
		return dest;
	},
	mul : function() {
		
	},
	setValue : function(src, v) {
		var dest = [];
		for(var i=0, m=src.length; i<m; i++) {
			var s = src[i], d = [];
			for(var j=0, n=s.length; j<n; j++) {
				d.push( v );
			}
			dest.push( d );
		}
		return dest;
	},
	convert : function(src, func) {
		var dest = [];
		for(var i=0, m=src.length; i<m; i++) {
			var s = src[i], d = [];
			for(var j=0, n=s.length; j<n; j++) {
				d.push( func(s[j]) );
			}
			dest.push( d );
		}
		return dest;
	},
	inverse : function(src) {
		//console.log( src );
		var m = src.length;
		var n = src[0].length;
		var dest = Matrix.create(n, m);
		for(var i=0; i<m; i++) {
			var s = src[i];
			for(var j=0; j<n; j++) {
				dest[j][i] = s[j];
			}
		}
		return dest;
	},
	toString : function(mtx, sep_col, sep_row) {
		if(sep_col == undefined) sep_col = '';
		if(sep_row == undefined) sep_row = '|';
		var rows = [];
		for(var i=0, m=mtx.length; i<m; i++) {
			rows.push( mtx[i].join(sep_col) );
		}
		return rows.join(sep_row);
	},
	fromString : function(str, sep_col, sep_row) {
		if(sep_col == undefined) sep_col = '';
		if(sep_row == undefined) sep_row = '|';
		var mtx = [];
		var rowstrs = str.split(sep_row);
		for(var i=0; i<rowstrs.length; i++) {
			mtx.push( rowstrs[i].split(sep_col) );
		}
		return mtx;
	},
	log : function(mtx) {
		for(var i=0, m=mtx.length; i<m; i++) {
			console.log( mtx[i] );
		}		
	}
};

hotjs.Random = Random;
hotjs.Vector = Vector;
hotjs.Matrix = Matrix;

})();

// ------- hotjs-resource.js ------------- 


// merged into hotjs.js as a basic class.

(function() {
	
	var gifLoading = 'data:image/gif;base64,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';
	var pngX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpFNTQ4MDYzRUUzRjcxMUUyOURFRUYzMDcwRjUyN0U4OSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpFNTQ4MDYzRkUzRjcxMUUyOURFRUYzMDcwRjUyN0U4OSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjJGRTkyMTc1RTNGMDExRTI5REVFRjMwNzBGNTI3RTg5IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjJGRTkyMTc2RTNGMDExRTI5REVFRjMwNzBGNTI3RTg5Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8++2P9ygAACSZJREFUeNrkV3uM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';

	var resourceCache = {};

	var activeApp = null;
	
	var total = 0;
	var loaded = 0;
	
	var resDebug = false;

	function isVideo(url) {
		if( url.endsWith('ogg') ) {
			return ( url.indexOf('video') > -1 );
		} else {
			return ( url.endsWith('mp4') || url.endsWith('webm') );
		}
	}
	
	function isAudio(url) {
		if( url.endsWith('ogg') ) {
			return ( url.indexOf('video') == -1 );
		} else {
			return ( url.endsWith('mp3') || url.endsWith('wav') );
		}
	}
	
	function isReady() {
		var ready = true;
		for ( var k in resourceCache) {
			if (resourceCache.hasOwnProperty(k) && !resourceCache[k]) {
				ready = false;
			}
		}
		
		return ready;
	}

	function loadingProgress(url, n, all) {
		var per = Math.round( 100 * n / all );
		var d = document.getElementById('loading_msg');
		if( d ) {
			if( resDebug ) {
				d.innerHTML = per + "% (" + n + '/' + all + ')';
				for( var k in resourceCache ) {
					if( resourceCache[k] == false ) {
						d.innerHTML += '<br/>' + k;
					}
				}
			}
		}
	}
	
	function loadingError(url){
		var d = document.getElementById('loading_msg');
		if( d ) {
			d.innerHTML = 'error loading: ' + url.substring(url.lastIndexOf('/')+1); 
		}
	}

	function loadingDone(){
		d = document.getElementById('hotjs_res_loading_win');
		if( d ) {
			d.parentNode.removeChild( d );
		}
	}

	var readyCallbacks = [ loadingDone ];
	var loadingCallbacks = [ loadingProgress ];
	var errorCallbacks = [ loadingError ];
	
	// func() {}
	function onReady(func) {
		readyCallbacks = [ loadingDone, func ];
	}

	// func( url, loaded, total ) {}
	function onLoading(func) {
		loadingCallbacks = [ loadingProgress, func ];
	}
	
	// func( url ) {}
	function onError(func) {
		errorCallbacks = [ loadingError, func ];
	}
	
	function showLoadingMessage(){
		var w = window.innerWidth, h = window.innerHeight;
		var tw = 100, th = 300;
		var x = (w-tw)/2, y = (h-th)/2;
		var d = document.getElementById('hotjs_res_loading_win');
		if( d == undefined ) {
			d = document.createElement('div');
			d.setAttribute('id', 'hotjs_res_loading_win');
			d.setAttribute('style', 
					'left:' +x + 'px;top:' +y+'px;width:'+tw+'px;text-align:center;alpha:0.5;padding:10px;display:solid;position:absolute;'
					+ '-moz-border-radius:10px;-webkit-border-radius: 10px;-khtml-border-radius: 10px;border-radius: 10px;'
					);
			document.body.appendChild( d );
		}
		d.style['font-family'] = 'Verdana,Geneva,sans-serif';
		d.style['font-size'] = '9pt';
		d.innerHTML = "<img id='loading_img' src='" + gifLoading + "'/>";
		d.innerHTML += "<br><br><div id='loading_msg'></div>";
		d.style.display = 'block';
	}
	
	// Load an resource url or an array of resource urls
	function load( urlOrArr, callbacks ) {
		readyCallbaks = [ loadingDone ];
		loadingCallbacks = [ loadingProgress ];
		errorCallbacks = [ loadingError ];
		
		if( callbacks != undefined ) {
			if( typeof callbacks.ready == 'function' ) {
				readyCallbacks = [ loadingDone, callbacks.ready ];
			}
			if( typeof callbacks.loading == 'function' ) {
				loadingCallbacks = [ loadingProgress, callbacks.loading ];
			}
			if( typeof callbacks.error == 'function' ) {
				errorCallbacks = [ loadingError, callbacks.error ];
			}
		}
		
		if (urlOrArr instanceof Array) {
			urlOrArr.forEach(function(url) {
				_load(url);
			});
		} else {
			_load(urlOrArr);
		}
		
		if(! isReady()) {
			showLoadingMessage();
		}
	}
	
	function _unload(url) {
		url = hotjs.getAbsPath(url, document.location.href);

		//if( ! (url in resourceCache) ) return;
		if ( resourceCache.hasOwnProperty( url ) ) {
			delete resourceCache[ url ];
		}
		
		// remove from DOM tree, if there is.
		if( url.endsWith('.js') ) {
			var fs = document.getElementsByTagName('script');
			for( var i=0; i<fs.length; i++ ) {
				if( url == hotjs.getAbsPath(fs[i].src, document.location.href) ) {
					fs[i].parentNode.removeChild( fs[i] );
				}
			}
		} else if( url.endsWith('.css') ) {
			var fs = document.getElementsByTagName('link');
			for( var i=0; i<fs.length; i++ ) {
				if( url == hotjs.getAbsPath(fs[i].href, document.location.href) ) {
					fs[i].parentNode.removeChild( fs[i] );
				}
			}
		} else {
			
		}
	}

	function unload(urlOrArr) {
		if (urlOrArr instanceof Array) {
			urlOrArr.forEach(function(url) {
				_unload( url );
			});
		} else {
			_unload( urlOrArr );
		}
	}
	
	function _load(url) {
		url = hotjs.getAbsPath(url, document.location.href);

		if ( url in resourceCache ) {
			return;
			
		} else {
			var res;
			
			var is_video = isVideo(url), is_audio = isAudio(url), is_script = url.endsWith('.js'), is_css = url.endsWith('.css');

			if( is_video ) {
				res = new Video();
			} else if( is_audio ) {
				res = new Audio();
			} else if( is_script ){
				var ss = document.getElementsByTagName('script');
				for(var i=0; i<ss.length; i++) {
					if( ss[i].src == url ) return ss[i];
				}
				res = document.createElement('script');
			} else if( is_css ) {
				var ss = document.getElementsByTagName('link');
				for(var i=0; i<ss.length; i++) {
					if( ss[i].href == url ) return ss[i];
				}
				res = document.createElement('link');
				res.setAttribute('rel', 'stylesheet');
			} else {
				res = new Image();
			}
			
			resourceCache[url] = false;
			total ++;

			var onload = function(){
				resourceCache[url] = res;
				
				if( activeApp != null ) {
					if( typeof activeApp.addRes == 'function' ) {
						activeApp.addRes( url );
					}
				}

				loaded ++;
				
				if( resDebug ) {
					console.log( url + ' preloaded (' + loaded + '/' + total + ')'  );
				}

				if( url.endsWith('.sprite.js') ) {
					var f = hotjs.getFileName(url);
					if( f in sprite_cache ) {
						var sprite = sprite_cache[ f ];
						sprite['url'] = url;
						var images = sprite['images'];
						for( id in images ) {
							var image = images[ id ];
							var imgurl = hotjs.getAbsPath( image[0], url );							
							image[2] = imgurl; // image[1] is transp color							
							_load( imgurl );
						}
					}
				} else if (url.endsWith('.pst.js') ) {
					var f = hotjs.getFileName(url);
					if( f in pst_cache ) {
						var launchers = pst_cache[ f ]['launchers'];
						for( var i=0; i<launchers.length; i++ ) {
							// might be .sprite.js, or .png
							resurl = hotjs.getAbsPath( launchers[i].res, url );
							launchers[i].resurl = resurl;
							_load( resurl );
						}						
					}
				}
				
				loadingCallbacks.slice(0).forEach(function(func){
					func( url, loaded, total );
				});

				if (isReady()) {
					if( resDebug ) {
						console.log( 'resources ready.' );
					}
					readyCallbacks.slice(0).forEach(function(func) {
						func();
					});
				}
			};
			var onerror = function() {
				if( resDebug ) {
					console.log( url + ' preloaded (' + loaded + '/' + total + ')'  );
				}

				errorCallbacks.slice(0).forEach(function(func){
					func( url );
				});
			};
			
			res.addEventListener('error', onerror);
			if( is_video || is_audio ) {
				res.addEventListener('canplay', onload);
				res.setAttribute('preload', 'auto');
				
				var div = document.getElementById('hotjs_media_lib');
				if(! div) {
					div = document.createElement('div');
					div.setAttribute('id', 'hotjs_media_lib');
					div.style.display = 'none';
					document.body.appendChild( div );
				}
				div.appendChild( res );
				
				res.setAttribute('src', url);
			} else if ( is_script ) {
				res.async = true;
				res.addEventListener('load', onload);
				var ss = document.getElementsByTagName('script');
				ss[0].parentNode.appendChild(res);
				res.setAttribute('src', url);
			} else if ( is_css ) {
				res.async = true;
				res.addEventListener('load', onload);
				var ss = document.getElementsByTagName('script');
				ss[0].parentNode.appendChild(res);
				res.setAttribute('href', url);
			} else {
				res.addEventListener('load', onload);
				res.setAttribute('src', url);
			}
			
			return res;
		}
	}

	function get(url) {
		url = hotjs.getAbsPath(url, document.location.href);
		
		var res = resourceCache[url];
		if(! res) {
			var is_video = isVideo(url), is_audio = isAudio(url), is_script = url.endsWith('.js'), is_css = url.endsWith('.css');
			if( is_video ) {
				res = new Video();
				res.setAttribute('src', url);
				res.load();
			} else if( is_audio ) {
				res = new Audio();
				res.setAttribute('src', url);
				res.load();
			} else if( is_script ){
				res = document.createElement('script');
				res.async = 1;
				res.setAttribute('src', url);
				var ss = document.getElementsByTagName('script');
				ss[0].parentNode.appendChild( res );
			} else {
				res = new Image();
				res.setAttribute('src', url);
			}
			resourceCache[ url ] = res;
		}
		return res;
	}
	
	var audio_muted = false;
	var audioCache = {};
	
	function muteAudio( mute_it ) {
		audio_muted = mute_it;
		
		if( mute_it ) {
			for( var url in audioCache ) {
				var status = audioCache[ url ];
				if( status === 'loop' || status === 'play' ) {
					stopAudio( url );
				}
			}
		}
	}
	function preloadAudio( url, is_fx ) {
		var using_html5_audio = ((! window.plugins) || (! window.plugins.LowLatencyAudio) || (url.indexOf('http://') === 0) );
		if( using_html5_audio ) {
			return;
		} else {
			if(! audioCache[ url ]) {
				var www = 'www/';
				var assetPath = url.substring( url.indexOf(www) + www.length );
				var lla = window.plugins.LowLatencyAudio;
				if(is_fx) {
					lla.preloadFX(url, assetPath);
				} else {
					lla.preloadAudio(url, assetPath, 1);
				}
				audioCache[ url ] = 'loaded';
			}			
		}		
	}
	function preloadMusic( urls ) {
		if( Array.isArray(urls) ) {
			for( var i=0; i<urls.length; i++ ) {
				preloadAudio( urls[i], false );
			}
		} else {
			preloadAudio( urls, false );
		}
	}
	function preloadFX( urls ) {
		if( Array.isArray(urls) ) {
			for( var i=0; i<urls.length; i++ ) {
				preloadAudio( urls[i], true );
			}
		} else {
			preloadAudio( urls, true );
		}
	}
	function playAudio(url, is_fx, loop) {
		if( audio_muted ) return;
		
		var using_html5_audio = ((! window.plugins) || (! window.plugins.LowLatencyAudio) || (url.indexOf('http://') === 0) );
		if( using_html5_audio ) {
			get(url).play();
			audioCache[ url ] = 'play';
		} else {
			if(! audioCache[ url ]) {
				preloadAudio( url, is_fx );
			}
			
			var lla = window.plugins.LowLatencyAudio;
			if( loop ) {
				lla.loop( url );
				audioCache[ url ] = 'loop';
			} else {
				lla.play( url );
				audioCache[ url ] = 'play';
			}
		}
	}
	function stopAudio(url) {
		if( audio_muted ) return;
		
		if( audioCache[ url ] ) {
			var using_html5_audio = ((! window.plugins) || (! window.plugins.LowLatencyAudio) || (url.indexOf('http://') === 0) );
			if( using_html5_audio ) {
				var res = get(url);
				res.pause();
				if(res.currentTime) res.currentTime = 0;
			} else {
				window.plugins.LowLatencyAudio.stop( url );
			}
			audioCache[ url ] = 'stop';
		}
	}
	function stopAllAudio() {
		for( var url in audioCache ) {
			var status = audioCache[ url ];
			if( status === 'loop' || status === 'play' ) {
				stopAudio( url );
			}
		}		
	}
	
	function regApp(app) {
		if( activeApp !== null ) {
			console.log( 'warning: previous app not exit normally.');
		}
		
		activeApp = app;
		return this;
	}
	
	function runAppFromJs( js ){
		if( activeApp ) {
			if( typeof activeApp.exit == 'function' ) {
				activeApp.exit();
			}
			if( typeof activeApp.getRes == 'function' ) {
				unload( activeApp.getRes() );
			}
			activeApp = null;
		}
		
		if( resDebug ) {
			console.log( 'loading app from js: ' + js );
		}
		
		load( js, {
			ready: function() {
				if( activeApp ) {
					if( typeof activeApp.init == 'function' ) {
						activeApp.init();
					}
				}
			}
		});
		
		return this;
	}
		
	window.resources = {
		getLoadingGif : function() { return gifLoading; },
		setLoadingGif : function(url) { gifLoading = url; },
		getXPng : function() { return pngX; },
		setXPng : function(url) { pngX = url },

		get : get,
		load : load,
		unload : unload,

		isReady : isReady,
		onReady : onReady,
		onLoading : onLoading,
		onError : onError,
		
		preloadMusic : preloadMusic,
		preloadFX : preloadFX,
		playAudio : playAudio,
		stopAudio : stopAudio,
		muteAudio : muteAudio,
		stopAllAudio : stopAllAudio,

		regApp : regApp,
		runAppFromJs : runAppFromJs,
		
		setDebug : function( true_or_false ) { resDebug = true_or_false; },
		getAll : function() { return resourceCache; },
		getActiveApp : function() { return activeApp; }
	};

})();

// ------- hotjs-canvas.js ------------- 

// name space
var hotjs = hotjs || {};

(function(){

var Vector = hotjs.Vector;

// A cross-browser requestAnimationFrame
// See
// https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame
			|| window.mozRequestAnimationFrame || window.oRequestAnimationFrame
			|| window.msRequestAnimationFrame || function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
})();
	
//------------------------
// TODO: class View
var View = function(){
	hotjs.base(this);
	
	this.canvas = document.createElement("canvas");
	this.ctx = this.canvas.getContext("2d");
	
	this.canvas.width = 480;
	this.canvas.height = 320;
	this.rect = this.canvas.getBoundingClientRect();
	
	this.color = "black";
	this.bgcolor = 'white';

	this.bgrepeat = false;
	this.bgimg = undefined;
	this.bgimgrect = undefined;

	this.fgrepeat = false;
	this.fgimg = undefined;
	this.fgimgrect = undefined;
	
	this.container = undefined;

	// all scenes
	this.scenes = [];
	this.sceneIndex = {};
	
	// visible scene
	this.curScene = undefined;

	this.bFps = false;
	this.dtSum = 0;
	this.frames = 0;
	this.fps = 60;
	
	this.maxFps = 60;
	
	this.runningTime = 0;
	this.runningTimeStr = "0 : 00 : 00"; // h:m:s
	
	this.infoPos = [40, 40];
	
	this.dragItems = new hotjs.HashMap();
	this.touches = new hotjs.HashMap();
	
	// for testing only, [x,y,id]
	this.mouseInView = [0,0,0]; 
	this.mouseInNode = [0,0,0];
	
	this.touch_accuracy = 3;
	
	// using closure, 'me' is accessable to inner function, but 'this' changed.
	var me = this;
	var cv = this.canvas;
	this.canvas.addEventListener('click',function(e){
		me.onClick(e);
		e.preventDefault();
	});
	this.canvas.addEventListener('mousedown',function(e){
		
		// we use document.onmousemove to track mouse move, even if outside window
		document.onmousemove = function(event) {
			event = event || window.event;

			me.onMouseMove(event);
			e.preventDefault();
		};

		document.onmouseup = function(event) {
			document.onmousemove = null;

			if (cv.releaseCapture) {
				cv.releaseCapture();
			}
			
			me.onMouseUp(event);
			e.preventDefault();
		};

		if (cv.setCapture) {
			cv.setCapture();
		}

		me.onMouseDown(e);
		e.preventDefault();
	});
	// we use document.onmouseup(), so disable here
	//this.canvas.addEventListener('mouseup',function(e){
		//me.onMouseUp(e);
		//e.preventDefault();
	//});
	this.canvas.addEventListener('mousemove',function(e){
		// will be duplicated, if mouse down
		// we may need track mousemove event, even mouse not down in some case
		// TODO: is it a waste?
		me.onMouseMove(e);
		e.preventDefault();
	});
	this.canvas.addEventListener('touchstart',function(e){
		me.onTouchStart(e);
		e.preventDefault();
	});
	this.canvas.addEventListener('touchend',function(e){
		me.onTouchEnd(e);
		e.preventDefault();
	});
	this.canvas.addEventListener('touchcancel',function(e){
		me.onTouchEnd(e);
		e.preventDefault();
	});
	this.canvas.addEventListener('touchmove',function(e){
		me.onTouchMove(e);
		e.preventDefault();
	});	
};

hotjs.inherit(View, hotjs.Class, {
	start : function() {
		// using closure, me is accessable to inner function, but 'this' changed.
		var self = this;
		var lastTime = Date.now();
		var nextTime = lastTime + 1000 / self.maxFps;
		
		function view_loop(){
			var now = Date.now();
			if( now > nextTime ) {
				if( self.running ) {
					var dt = (now - lastTime) / 1000.0;
					self.update( dt );
					self.render();
				}
				lastTime = now;
				nextTime += 1000 / self.maxFps;
			}
			
			if( ! self.stopping ) {
				requestAnimFrame( view_loop );
			} else {
				self.stopped = true;
			}
		}
		
		this.stopping = false;
		this.running = true;
		view_loop();

		return this;
	},
	stop : function() {
		this.stopping = true;
		return this;
	},
	setMaxFps : function( f ) {
		this.maxFps = Math.max(1, Math.min(f, 60));
		return this;
	},
	resume : function( r ) {
		if(r == undefined) r = true;
		this.running = r;
		return this;
	},
	pause : function() {
		this.rusume( false );
		return this;
	},
	setContainer : function(id){
		this.container = document.getElementById(id);
		if( ! this.container ) {
			this.container = document.body;
		}
		this.container.appendChild(this.canvas);
		
		/* These 3 lines are helpful for the browser to not accidentally 
		 * think the user is trying to "text select" the draggable object
		 * when drag initiation happens on text nodes.
		 * Unfortunately they also break draggability outside the window.
		 */
		// used for mouse event handling.
		this.canvas.unselectable = "on";
		this.canvas.onselectstart = function(){return false;};
		this.canvas.style.userSelect = this.canvas.style.MozUserSelect = "none";
		  
		return this;
	},
	setSize : function(w,h) {
		this.canvas.width = w;
		this.canvas.height = h;
		this.rect = this.canvas.getBoundingClientRect();
		return this;
	},
	setBgColor : function(c) {
		this.bgcolor = c;
		return this;
	},
	setColor : function(c) {
		this.color = c;
		return this;
	},
	setBgImage : function(repeat, img, r) {
		this.bgrepeat = repeat;
		this.bgimg = img;
		if(! r) {
			this.bgimgrect = [0,0, img.width, img.height];
		} else {
			this.bgimgrect = [ r[0], r[1], r[2], r[3] ];
		}
		return this;
	},	
	setFgImage : function(repeat, img, r) {
		this.fgrepeat = repeat;
		this.fgimg = img;
		if(! r) {
			this.fgimgrect = [0,0, img.width, img.height];
		} else {
			this.fgimgrect = [ r[0], r[1], r[2], r[3] ];
		}
		return this;
	},	
	getSize : function() {
		return [this.canvas.width, this.canvas.height];
	},
	width : function() {
		return this.canvas.width;
	},
	height : function() {
		return this.canvas.height;
	},
	// shift view, then move scene in reverse direction
	shift : function(x,y) {
		if(!! this.curScene ) {
			this.curScene.move( -x, -y );
		}
		return this;
	},
	zoom : function(f, posCenter) {
		if(! posCenter) {
			posCenter = [this.width()/2, this.height()/2];
		}

		if(!! this.curScene ) {
			var pos = this.curScene.posFromContainer( posCenter );
			this.curScene.zoom( f, pos );
		}
		return this;
	},
	addNode : function(s, id) {
		this.scenes.push( s );
		if(id != undefined) {
			this.sceneIndex[id] = s;
		}
		s.setContainer(this);
		
		this.curScene = s;
		return this;
	}, 
	switchScene : function(s) {
		if( !! s ) {
			if(!! this.curScene ) {
				//this.curScene.stop();
			}
			this.curScene = s;
			//s.play();
		}
		return this;
	},
	switchSceneById : function(id) {
		var s = this.sceneIndex[id];
		if( !! s ) {
			this.switchScene(s);
		}
		return this;
	},
	pushSceneById : function(id) {
		this.sceneStack.push( this.curScene );
		this.switchSceneById(id);
		return this;
	}, 
	popScene : function() {
		var s = this.sceneStack.pop();
		this.switchScene(s);
		return this;
	},
	showFPS : function(f) {
		if(f == undefined) f = (! this.bFps);
		this.bFps = f;
		return this;
	},
	update : function(dt) {
		for(var i=0; i<this.scenes.length; i++) {
			this.scenes[i].update(dt);
		}

		this.frames ++;
		this.dtSum += dt;
	
		if( this.dtSum > 1.0 ) {
			this.rect = this.canvas.getBoundingClientRect();

			this.runningTime += this.dtSum;
			if(this.bFps) {
				var s = Math.floor(this.runningTime);
				var m = Math.floor( s / 60 );
				s %= 60;
				if(s<10) s="0"+s;
				h = Math.floor( m / 60 );
				m %= 60;
				if(m<10) m="0"+m;
				this.runningTimeStr = h + " : " + m + " : " + s;
			}

			this.fps = Math.round( this.frames / this.dtSum );
			this.dtSum = 0;
			this.frames = 0;

		}

		return this;
	},
	drawBg : function( c ) {
		if(!! this.bgimg) {
			if( this.bgrepeat ) {
				c.fillStyle = c.createPattern(this.bgimg, 'repeat');
				c.fillRect( 0, 0, this.canvas.width,this.canvas.height);
			} else {
				c.drawImage(this.bgimg, 
						this.bgimgrect[0], this.bgimgrect[1], this.bgimgrect[2], this.bgimgrect[3], 
						0, 0, this.canvas.width,this.canvas.height);
			}
		} else if(!! this.bgcolor ) {
			c.fillStyle = this.bgcolor;
			c.fillRect( 0, 0, this.canvas.width, this.canvas.height );
		}
	},
	drawFg : function( c ) {
		if(!! this.fgimg) {
			if( this.fgrepeat ) {
				c.fillStyle = c.createPattern(this.fgimg, 'repeat');
				c.fillRect( 0, 0, this.canvas.width,this.canvas.height);
			} else {
				c.drawImage(this.fgimg, 
						this.fgimgrect[0], this.fgimgrect[1], this.fgimgrect[2], this.fgimgrect[3], 
						0, 0, this.canvas.width,this.canvas.height);
			}
		}
	},
	render : function() {
		var c = this.ctx;
		c.save();

		this.drawBg(c);
		
		for(var i=0; i<this.scenes.length; i++) {
			this.scenes[i].render(c);
		}
		
		this.drawFg(c);
		
		this.draw(c);
		
		c.restore();		
		return this;
	},
	setInfoPos : function(x,y) {
		this.infoPos = [x, y];
		return this;
	},
	draw : function(c) {
		if( this.bFps ) {
			c.save();
			c.strokeStyle = this.color;
			c.fillStyle = this.color;
			
			c.fillText( this.runningTimeStr, this.infoPos[0], this.infoPos[1] + 20 );
			c.fillText( this.fps + ' fps: ' + this.frames, this.infoPos[0], this.infoPos[1] + 40 );
			c.fillText( '(' + this.canvas.width + " x " + this.canvas.height + ')', this.infoPos[0], this.infoPos[1] + 60 ); 
			var rectInfo = '(' + this.rect.width + ' x ' + this.rect.height + ')' 
			 + ': ('+this.rect.left + "," + this.rect.top + ") -> (" + this.rect.right + ',' + this.rect.bottom + ')';
			c.fillText( rectInfo, this.infoPos[0], this.infoPos[1] + 80);
			
			if( this.curScene && this.curScene.scale ) {
				var sc = this.curScene;
				var s = sc.scale;
				s = Math.round(s[0] * 100) + "% x " + Math.round(s[1] * 100) + "%";
				c.fillText( s, this.infoPos[0], this.infoPos[1] + 100 );
				if(sc.touches0 && sc.touches) {
					c.fillText( 'multi-touch: (' + JSON.stringify(sc.touches0.keys()) + ', ' + JSON.stringify(sc.touches.keys()) +')', this.infoPos[0], this.infoPos[1] + 120 );
				}
			}
			
			c.fillText( this.mouseInView[2] + ': (' + this.mouseInView[0] + ', ' + this.mouseInView[1] + ')', this.infoPos[0], this.infoPos[1] + 140 );
			c.fillText( this.mouseInNode[2] + ': (' + this.mouseInNode[0] + ', ' + this.mouseInNode[1] +')', this.infoPos[0], this.infoPos[1] + 160 );
			
			c.strokeRect( 0, 0, this.canvas.width, this.canvas.height );
			c.restore();
		}
	},
	// listen input events & forward
	touchFromEvent : function(e) {
		var el = this.canvas;
		var elDocument = el.ownerDocument || el.document || document;
		var elHtml = elDocument.documentElement;
		var elBody = elDocument.body;
		var scrollX = elHtml.scrollLeft || elBody.scrollLeft;
		var scrollY = elHtml.scrollTop || elBody.scrollTop;
		
		var id = e.identifier;
		if (e.identifier == undefined) id = 0;
		return {
			id : id,
			x : Math.round( e.pageX - this.rect.left - scrollX ),
			y : Math.round( e.pageY - this.rect.top - scrollY )
		};
	},
	click : function( t ) {
		// pass to scene
		var s = this.curScene;
		if( !! s ) {
			if( s.inRange( [t.x, t.y] ) ) {
				return s.onClick( t );
			}
		}

		return false;
	},
	onClick : function(e) {
		// ignore, just fire the click event by ourselves.
		return false;

		// var t = this.touchFromEvent(e);
		// this.click( t );
	},
	onMouseDown : function(e) {
		var t = this.touchFromEvent(e);
		this.touches.put( t.id, [t.x, t.y] );
		
		// for debug
		this.mouseInView = [t.x, t.y, t.id];
		this.t0 = [t.x, t.y];

		// pass to scene
		var s = this.curScene;
		if( !! s ) {
			if( s.inRange( [t.x, t.y] ) ) {
				if( s.draggable ) this.dragItems.put( t.id, s );
				return s.onTouchStart( t );
			}
		}
		
		return false;
	},	
	onMouseUp : function(e) {
		var t = this.touchFromEvent(e);
		this.touches.remove( t.id );
		
		// for debug
		this.mouseInView = [t.x, t.y, t.id];

		// finger is not accurate, so range in 5 pixel is okay.
		var vect = [ t.x - this.t0[0], t.y - this.t0[1] ];
		if( hotjs.Vector.getLength(vect) <= this.touch_accuracy ) {
			this.click( t );
		}

		var s = this.dragItems.get( t.id );
		if( !! s ) {
			this.dragItems.remove( t.id );
			return s.onTouchEnd( t );
		}
		
		// pass to scene
		var s = this.curScene;
		if( !! s ) {
			if( s.inRange( [t.x, t.y] ) ) {
				return s.onTouchEnd( t );
			}
		}		

		return false;
	},
	onMouseMove : function(e) {
		var t = this.touchFromEvent(e);
		
		// for debug
		this.mouseInView = [t.x, t.y, t.id];
		
		// if a scene is being dragged, then drag it
		var s = this.dragItems.get( t.id );
		if( !! s ) {
			return s.onTouchMove( t );
		}

		// pass to scene
		var s = this.curScene;
		if( !! s ) {
			return s.onTouchMove( t );
		}
		
		return false;
	},	
	
	onTouchStart : function(e) {
		this.touch_accuracy = 10;
		for ( var i = 0; i < e.targetTouches.length; i++) {
			this.onMouseDown(e.targetTouches[i]);
		}
	},
	onTouchEnd : function(e) {
		this.touch_accuracy = 10;
		for ( var i = 0; i < e.changedTouches.length; i++) {
			this.onMouseUp(e.changedTouches[i]);
		}
	},
	onTouchMove : function(e) {
		this.touch_accuracy = 10;
		for ( var i = 0; i < e.targetTouches.length; i++) {
			this.onMouseMove(e.targetTouches[i]);
		}
	}
});

//-----------------------
//TODO: class Node
var hotjs_node_id = 0;

var Node = function() {
	hotjs.base(this);
	
	this.container = undefined;
	this.name = "node_" + (hotjs_node_id ++);
	this.subnodes = undefined;
	this.index = {};
	
	this.hidden = false;
	
	this.size = [40,40];
	this.color = undefined; // default: 'black'
	this.bgcolor = undefined; // default: 'white'
	this.img = undefined;
	this.imgrect = undefined; // [x,y,w,h]
	this.sprite = undefined;

	this.gridOn = false;
	this.imgOn = true;
	
	// geometry, 2D only
	this.pos = [0,0];
	this.velocity = [0,0]; // default [0,0]

	this.rotation = undefined; // default: 0
	this.scale = undefined; // default: [1,1]
	this.alpha = undefined; // default: 1, range: [0,1]
	
	this.anims = [];
	
	// physical
	this.accel = undefined; // default: [0,0]
	this.mass = 1600; // default: 1600
	this.density = 1;

	this.draggable = undefined;
	this.moveable = undefined;
	this.zoomable = undefined;
	this.rotateable = undefined;
	this.throwable = undefined;
	this.gesture = [0,0];
	this.dragging = false;
};

hotjs.inherit(Node, hotjs.Class, {
	show : function( s ) {
		if(s === undefined) s = true;
		this.hidden = (! s);
		
		if(this.sprite) this.sprite.reset();
		
		return this;
	},
	setName : function(n) {
		this.name = n;
		return this;
	},
	getName : function() {
		return this.name;
	},
	setPos : function(x,y) {
		this.pos = [x,y];
		return this;
	},
	setSize : function(w,h) {
		this.size = [w,h];
		return this;
	},
	getSize : function() {
		return this.size;
	},
	posFromContainer : function(p) {
		var x = p[0] - this.pos[0], 
			y = p[1] - this.pos[1];

		if(!! this.scale) {
			x /= this.scale[0];
			y /= this.scale[1];
		}
		
		return [ Math.floor(x), Math.floor(y) ];
	},
	posToContainer : function(p) {
		var x = p[0], y = p[1];

		if(!! this.scale) {
			x *= this.scale[0];
			y *= this.scale[1];
		}
		
		return [ Math.floor(x + this.pos[0]), Math.floor(y + this.pos[1])];
	},
	inRange : function( pos ) {
		var p = this.posFromContainer( pos );
		var b = (p[0]>=0) && (p[0]<this.size[0]) && (p[1]>=0) && (p[1]<this.size[1]);
		return b;
	},
	setDraggable : function(x,y) {
		this.draggable = x || y;
		this.draggableX = x;
		this.draggableY = (y == undefined) ? x : y;

		if( this.draggable ) {
			if(this.touches0 == undefined) this.touches0 = new hotjs.HashMap();	
			if(this.touches == undefined) this.touches = new hotjs.HashMap();
		}

		return this;
	},
	setMoveable : function(x,y) {
		this.setDraggable(x,y);
		
		this.moveable = x || y;
		return this;
	},
	setThrowable : function(x,y) {
		this.setMoveable(x,y);
		
		this.throwable = x || y;
		this.throwableX = x;
		this.throwableY = (y == undefined) ? x : y;
		return this;
	},
	setZoomable : function(b) {
		this.zoomable = b;
		if(b) {
			if(this.touches0 == undefined) this.touches0 = new hotjs.HashMap();	
			if(this.touches == undefined) this.touches = new hotjs.HashMap();
			if(this.scale == undefined) this.scale = [1,1];
		}
		return this;
	},
	setRotateable : function(b) {
		if(b) {
			if(this.touches0 == undefined) this.touches0 = new hotjs.HashMap();	
			if(this.touches == undefined) this.touches = new hotjs.HashMap();
			//if(this.scale == undefined) this.scale = [1,1];
			if(this.rotation == undefined) this.rotation = 0;
		}
		this.rotateable = b;
		return this;
	},
	onClick : function(t) {
		// override if need handle click event
		var pos = this.posFromContainer( [t.x, t.y] );
		var ts = { id:t.id, x: pos[0], y: pos[1] };

		// for debug purpose
		this.container.mouseInNode = [ts.x, ts.y, ts.id];

		if( !! this.subnodes ) {
			// pass to subnodes
			for(var i=this.subnodes.length-1; i>=0; i--) {
				var n = this.subnodes[i];
				if( n.inRange( pos ) ) {
					return n.onClick( ts );
				}
			}
		}
	},

	onTouchStart : function(t) {
		if( !! this.touches0 ) {
			var f = {
				id : t.id,
				x : t.x,
				y : t.y,
				px : this.pos[0],
				py : this.pos[1]
			};
			if( this.zoomable ) {
				if(! this.scale) this.scale = [1,1];
				f.sx = this.scale[0];
				f.sy = this.scale[1];
			}
			if( this.rotateable ) {
				f.r = this.rotation;
			}
			this.touches0.put( t.id, f );
			
			// only memorize the id of first touch, and we can get init pos/scale/rotation.
			if(this.touches0.size() == 1) {
				this.id0 = t.id;
			}
		}

		// introduce simple gesture of 1 touch
		this.gestureTime = Date.now();
		this.gesturePos = [ t.x, t.y ];
		this.gesture = [0,0];

		var pos = this.posFromContainer( [t.x, t.y] );
		var ts = { id:t.id, x: pos[0], y: pos[1] };

		this.container.mouseInNode = [ts.x, ts.y, ts.id];
		
		if(!! this.subnodes) {
			for(var i=this.subnodes.length-1; i>=0; i--) {
				var n = this.subnodes[i];
				if( (!! n.draggable) && n.inRange( pos ) ) {
					// drag subnode 
					this.dragItems.put( ts.id, n );
					return n.onTouchStart( ts );
				}
			}
		}
		
		if(!! this.draggable) {
			this.dragging = true;
			this.setVelocity(0, 0);
			
			return true;
		}
		
		return false;
	},
	fixPos : function(){
	},
	handleDragZoomRotate : function(t) {
		if(! this.touches) return false;
		if(! this.touches0) return false;
		
		if( this.draggable ) {
			if( this.touches.size() == 1 ) {
				var t0 = this.touches0.get( this.id0 );
				var t1 = this.touches.get( this.id0 );
				if( this.draggableX ) this.pos[0] = (t1.x - t0.x + t0.px);
				if( this.draggableY ) this.pos[1] = (t1.y - t0.y + t0.py);
				
				this.fixPos();
			}
		}
		
		if( this.zoomable ) {
			// we treat touch of 2 fingers as zoom gesture
			if(( this.touches.size() == 2) && (this.touches0.size() == 2)) {
				var ids = this.touches.keys();
				
				// calc distance between 2 fingers when touch start.
				var f1t0 = this.touches0.get( ids[0] );
				var f2t0 = this.touches0.get( ids[1] );
				var d_t0 = Vector.getLength( Vector.sub([f1t0.x, f1t0.y], [f2t0.x, f2t0.y]) );
				if(d_t0 < 1) d_t0 = 1;
				
				// calc distance between 2 fingers now.
				var f1t1 = this.touches.get( ids[0] );
				var f2t1 = this.touches.get( ids[1] );
				var d_t1 = Vector.getLength( Vector.sub([f1t1.x, f1t1.y], [f2t1.x, f2t1.y]) );
				if(d_t1 < 1) d_t1 = 1;
				
				// calc the new scale, based on the scale when put first finger.
				var t0 = this.touches0.get( this.id0 );
				this.scale = [ t0.sx * d_t1 / d_t0, t0.sy * d_t1 / d_t0 ];
				
				// we scale from the center point between 2 fingers, keep the point no move.
				var center_t0 = [ (f1t0.x + f2t0.x)/2, (f1t0.y + f2t0.y)/2 ];
				center_view = Vector.add( [t0.px, t0.py], Vector.scale( center_t0, [t0.sx, t0.sy] ) );
				this.pos = Vector.sub( center_view, Vector.scale(center_t0, this.scale) );

				// if the center point moves, let's move 
				var center_t1 = [ (f1t1.x + f2t1.x)/2, (f1t1.y + f2t1.y)/2 ];
				var center_delta = Vector.sub( center_t1, center_t0 );
				this.pos = Vector.add( this.pos, center_delta );
				
				this.fixPos();
			}
		}
		
		if( this.rotateable ) {
			
		}
		
		if( !! this.throwable ) {
			var gesture = this.getGesture();
			if( this.throwableX ) this.velocity[0] = gesture[0];
			if( this.throwableY ) this.velocity[1] = gesture[1];
		}
	},
	updateGesture : function(t) {
		var now = Date.now();
		var dt = (now - this.gestureTime) / 1000.0;
		if( dt > 0 ) {
			this.gesture = [ (t.x - this.gesturePos[0]) / dt, (t.y - this.gesturePos[1]) /dt ];
			if( dt > 0.3 ) {
				this.gestureTime = now;
				this.gesturePos = [ t.x, t.y ];
			}
		}
	},
	getGesture: function(){
		return this.gesture;
	},
	onTouchMove : function(t) {
		if( !! this.touches ) {
			var f = {
				id : t.id,
				x : t.x,
				y : t.y,
				px : this.pos[0],
				py : this.pos[1]
			};
			if( this.zoomable ) {
				if(! this.scale) this.scale = [1,1];
				f.sx = this.scale[0];
				f.sy = this.scale[1];
			}
			if( this.rotateable ) {
				f.r = this.rotation;
			}
			this.touches.put( t.id, f );
		}
		
		this.updateGesture(t);
		
		if( !! this.dragging ) {
			this.handleDragZoomRotate(t);
			return true;
		}
		
		var pos = this.posFromContainer( [t.x, t.y] );
		var ts = { id:t.id, x: pos[0], y: pos[1] };

		this.container.mouseInNode = [ts.x, ts.y, ts.id];

		if( !! this.dragItems ) {
			// if a sub node is being dragged, then drag it
			var n = this.dragItems.get( t.id );
			if( !! n ) {
				return n.onTouchMove( ts );
			}
		}
		
		if( !! this.subnodes ) {
			// pass to subnodes
			for(var i=this.subnodes.length-1; i>=0; i--) {
				var n = this.subnodes[i];
				if( n.inRange( pos ) ) {
					return n.onTouchMove( ts );
				}
			}
		}
		
		return false;
	},	
	onTouchEnd : function(t) {
		if( !! this.touches ) {
			var f = {
				id : t.id,
				x : t.x,
				y : t.y,
				px : this.pos[0],
				py : this.pos[1]
			};
			if( this.zoomable ) {
				if(! this.scale) this.scale = [1,1];
				f.sx = this.scale[0];
				f.sy = this.scale[1];
			}
			if( this.rotateable ) {
				f.r = this.rotation;
			}
			this.touches.put( t.id, f );
		}
		
		this.updateGesture(t);
		
		if( this.dragging ) {
			this.dragging = false;
			
			if(!! this.moveable) {
				this.handleDragZoomRotate(t);
			} else {
				var t0 = this.touches0.get( this.id0 );
				this.pos = [ t0.px, t0.py ];
			}
			
			if( !! this.touches ) this.touches.remove( t.id );
			if( !! this.touches0 ) this.touches0.remove( t.id );
			return true;
		}
		
		var pos = this.posFromContainer( [t.x, t.y] );
		var ts = { id:t.id, x: pos[0], y: pos[1] };
		
		this.container.mouseInNode = [ts.x, ts.y, ts.id];
		
		if( !! this.dragItems ) {
			var n = this.dragItems.get( t.id );
			if( !! n ) {
				this.dragItems.remove( ts.id );
				return n.onTouchEnd( ts );
			}
		}
		
		if( !! this.touches ) this.touches.remove( t.id );
		if( !! this.touches0 ) this.touches0.remove( t.id );
		return false;
	},
	width : function() {
		return this.size[0];
	},
	height : function() {
		return this.size[1];
	},
	setRotation : function(r) {
		this.rotation = r;
		return this;
	},
	setScale : function(sx,sy) {
		this.scale = [sx,sy];
		return this;
	},
	setVelocity : function(vx,vy) {
		this.velocity = [vx,vy];
		return this;
	},
	setMass : function(m) {
		this.mass = m;
		return this;
	},
	setDensity : function(d) {
		this.density = d;
		this.mass = this.size[0] * this.size[1] * d;
		return this;
	},
	setAccel : function(ax,ay) {
		if( ! this.velocity ) {
			this.velocity = [0,0];
		}
		this.accel = [ax,ay];
		return this;
	},
	setColor : function(c) {
		this.color = c;
		return this;
	},
	setBgColor : function(c) {
		this.bgcolor = c;
		return this;
	},
	// alpha, range [0,1]
	setAlpha : function(a) {
		this.alpha = a;
		return this;
	},
	showGrid : function(g) {
		if(g == undefined) g = (! this.gridOn);
		this.gridOn = g;
		return this;
	},
	showImg : function(g) {
		if(g == undefined) g = (! this.imgOn);
		this.imgOn = g;
		return this;
	},
	setImage : function(img, r) {
		this.img = img;
		if(! r) {
			this.imgrect = [0, 0, img.width, img.height];
			if(! this.size) this.size = [img.width, img.height];
		} else {
			this.imgrect = [ r[0], r[1], r[2], r[3] ];
			if(! this.size) this.size = [rect[2], rect[3]];
		}
		return this;
	},
	setSprite : function(s) {
		this.sprite = s;
		return this;
	},
	addNode : function(n, id) {
		if(this.subnodes == undefined) this.subnodes=[];
		if(this.index == undefined) this.index={};
		if(this.dragItems == undefined) this.dragItems = new hotjs.HashMap();
		if(this.touches == undefined) this.touches = new hotjs.HashMap();	
		
		n.setContainer(this);
		
		this.subnodes.push(n);
		if(typeof id == 'string') {
			this.index[id] = n;
		}
		
		return this;
	},
	removeNode : function(n) {
		if(!! this.subnodes) {
			var i = this.subnodes.indexOf(n);
			if( i>=0 ) {
				this.subnodes.splice(i, 1);
				n.setContainer(undefined);
			}
		}
		
		return this;
	},
	removeAll : function() {
		if(!! this.subnodes) {
			while( this.subnodes.length > 0) {
				n = this.subnodes.pop();
				if("removeAll" in n) n.removeAll();
			}
			for( id in this.index ) {
				delete this.index[id];
			}
		}
		return this;
	},
	update : function(dt) {
		if(!! this.sprite) {
			this.sprite.update(dt);
		}
		
		if(!! this.subnodes) {
			for(var i=0; i<this.subnodes.length; i++) {
				this.subnodes[i].update(dt);
			}
		}
		
		if( !! this.dragging ) 	return this;
		
		// update pos according to velocity
		if(this.velocity !== undefined) {
			this.pos[0] += this.velocity[0] * dt;
			this.pos[1] += this.velocity[1] * dt;
		}
		// update velocity accoring to accel
		if(this.accel !== undefined) {
			this.velocity[0] += this.accel[0] * dt;
			this.velocity[1] += this.accel[1] * dt;
		}
		
		// process other complex animation
		if( this.anims.length > 0 ) {
			for( var i=0; i<this.anims.length; i++ ) {
				this.anims[i].update(dt);
			}
		}

		return this;
	},
	addAnim : function(anim) {
		this.anims.push( anim );
		return this;
	},
	removeAnim : function(anim) {
		this.anims.splice( this.anims.indexOf(anim), 1 );
		return this;
	},
	render : function(c) {
		if( this.hidden ) return;
		
		c.save();
		
		// apply pos / scale / rotation
		if(! this.rotation) {
			c.translate(this.pos[0], this.pos[1]);
		} else {
			c.translate(this.pos[0] + this.size[0]/2, this.pos[1] + this.size[1]/2);
			c.rotate( this.rotation * Math.PI / 180 );
			c.translate( - this.size[0]/2, - this.size[1]/2 );
		}
		if( !! this.scale ) c.scale(this.scale[0],this.scale[1]);
		if( !! this.alpha ) c.globalAlpha = this.alpha;
		//if(this.composite !== undefined) c.globalCompositeOperation = this.compositeOperation;
		
		this.draw(c);
		
		if(!! this.subnodes) {
			for(var i=0; i<this.subnodes.length; i++) {
				this.subnodes[i].render(c);
			}
		}
		
		c.restore();
		return this;
	},
	draw : function(c) {
		c.save();

		if( this.imgOn ) {
			if( !! this.sprite ) {
				this.sprite.render(c, this.size[0], this.size[1]);
				
			} else if( !! this.img ) {
				if( !! this.imgrect ) {
					c.drawImage( this.img, 
							this.imgrect[0], this.imgrect[1], this.imgrect[2], this.imgrect[3], 
							0, 0, this.size[0], this.size[1] );
				} else {
					c.drawImage( this.img, 0, 0, this.size[0], this.size[1] );
				}
			}
		}
		if( this.gridOn ) {
			c.strokeRect(0,0, this.size[0], this.size[1]);
		}
		
		c.restore();
		return this;
	}
});

//-----------------------
// TODO: class Scene
// Note: in a scene, this.pos is the [left,top]
var Scene = function(){
	hotjs.base(this);

	this.bgrepeat = false;
	this.bgimg = undefined;
	this.bgimgrect = undefined;
	
	// { l, t, r, b, w, h }
	this.area = undefined;
	this.arearepeat = false;
	this.areaimg = undefined;
	this.areaimgrect = undefined;
	
	this.scale = [1,1];
};

hotjs.inherit( Scene, Node, {
	setView : function(v) {
		this.setContainer(v);
		this.zoom();
		this.setDraggable(true);
		this.setMoveable(true);
		
		return this;
	},
	setBgImage : function(repeat, img, r) {
		this.bgrepeat = repeat;
		this.bgimg = img;
		if(! r) {
			this.bgimgrect = [0,0, img.width, img.height];
		} else {
			this.bgimgrect = [ r[0], r[1], r[2], r[3] ];
		}
		return this;
	},
	setAreaImage : function(repeat, img, r) {
		this.arearepeat = repeat;
		this.areaimg = img;
		if(! r) {
			this.areaimgrect = [0,0, img.width, img.height];
		} else {
			this.areaimgrect = [ r[0], r[1], r[2], r[3] ];
		}
		return this;
	},
	setArea : function(x,y,w,h) {
		this.area = { l:x, t:y, w:w, h:h, r:(x+w), b:(y+h) };
		return this;
	},
	getArea : function() {
		if(! this.area) {
			return {
				l : 0,
				t : 0,
				w : this.size[0],
				h : this.size[1],
				r : this.size[0],
				b : this.size[1]
			};
		}
		
		return this.area;
	},
	onTouchMove : function(t) {
		var ret = Scene.supClass.onTouchMove.call(this, t);
		
		//this.fixPos();
		//this.setVelocity(0,0);
		//this.setSpin(0,0);
		
		return ret;
	},
	onTouchEnd : function(t) {
		var ret = Scene.supClass.onTouchEnd.call(this, t);

		this.fixPos();
		//this.setVelocity(0,0);
		//this.setSpin(0,0);
		
		return ret;
	},
	// ensure the scene is always in view
	fixPos : function() {
		var Vector = hotjs.Vector;
		var w = this.container.width(), h = this.container.height();
		var min_sx = w / this.size[0], min_sy = h / this.size[1];
		var min_scale = Math.min( min_sx, min_sy );
		if( this.scale[0] < min_scale || this.scale[1] < min_scale ) {
			this.scale[0] = min_scale;
			this.scale[1] = min_scale;
		}
		
		if( this.pos[0] >0 ) this.pos[0]=0;
		if( this.pos[1] >0 ) this.pos[1]=0;
		
		var posRightBottom = (! this.scale) 
				? Vector.add(this.size, this.pos) 
				: Vector.add( Vector.scale(this.size, this.scale), this.pos );
				
		var offsetRB = Vector.sub( this.container.getSize(), posRightBottom );
		
		if( offsetRB[0] >0) this.pos[0] += offsetRB[0];
		if( offsetRB[1] >0) this.pos[1] += offsetRB[1];

		return this;
	},
	move : function(x, y) {
		this.pos[0] += x;
		this.pos[1] += y;
		
		this.fixPos();
		
		return this;
	},
	zoom : function(f, posCenter) {
		var vSize = this.container.getSize();
		var sXY = [ vSize[0] / this.size[0], vSize[1] / this.size[1] ];
		var sMin = Math.max(sXY[0], sXY[1]);

		if( f == 'none' ) {
			this.scale = [1,1];
			this.pos = [ (vSize[0]-this.size[0])/2, (vSize[1]-this.size[1])/2 ];
			
		} else if (f == 'stretch') {
			this.scale = sXY;
			this.pos = [0,0];
			
		} else if( f > 0 ) {
			if(! this.scale) this.scale = [1,1];
			
			// no smaller than view (container) size
			var fMin = [ sMin/this.scale[0], sMin/this.scale[1] ];
			f = Math.max(fMin[0], Math.max(fMin[1], f));

			// posCenter -> posInView -> offsetChange -> move
			// code #1
			//var posInView = Vector.scale( posCenter, this.scale );
			//var offsetChange = Vector.mul( posInView, f-1 );
			//this.pos = Vector.sub( this.pos, offsetChange );

			// code #2, optimized, no function call
			this.pos = [ this.pos[0] - posCenter[0] * this.scale[0] * (f-1),
			             this.pos[1] - posCenter[1] * this.scale[1] * (f-1)
			            ];
			
			this.scale = Vector.mul( this.scale, f );
	
			// ensure scene always in view
			if( this.scale[0] <sMin || this.scale[1] < sMin ) {
				this.scale = [sMin, sMin];
			}
			
		} else {
			// by default, scale & center scene to fit view
			this.scale = [sMin, sMin];
			this.pos = [ (vSize[0] - this.size[0] * sMin) /2, (vSize[1] - this.size[1] * sMin)/2 ];
		}
		
		this.fixPos();

		return this;
	},
	
	play : function() {
		this.playing = true;
		return this;
	},
	stop : function() {
		this.playing = false;
		return this;
	},
	// override node.draw(), ignore all node.draw() content.
	draw : function(c) { 
		c.save();

		var a = this.getArea();
		
		if( this.imgOn ) {
			if(!! this.bgimg) {
				if( this.bgrepeat ) {
					c.fillStyle = c.createPattern(this.bgimg, 'repeat');
					c.fillRect(0, 0, this.size[0], this.size[1]);
				} else {
					c.drawImage(this.bgimg, 
							this.bgimgrect[0], this.bgimgrect[1], this.bgimgrect[2], this.bgimgrect[3], 
							0, 0, this.size[0], this.size[1]);
				}
			} else if( !! this.bgcolor ){
				c.fillStyle = this.bgcolor;
				c.fillRect(0, 0, this.size[0], this.size[1]);
			}

			if(!! this.areaimg) {
				if( this.arearepeat ) {
					c.fillStyle = c.createPattern(this.areaimg, 'repeat');
					c.fillRect(a.l, a.t, a.w, a.h);
				} else {
					c.drawImage(this.areaimg, 
							this.areaimgrect[0], this.areaimgrect[1], this.areaimgrect[2], this.areaimgrect[3], 
							a.l, a.t, a.w, a.h);
				}
			}		
		}
		
		if( this.gridOn ) {
			c.strokeStyle = this.color;

			c.lineWidth = 0.5;
			var dx = 40, dy = 40;
			c.beginPath();
			for( var x=0; x<=this.size[0]; x += dx ) {
				c.moveTo(x, 0);
				c.lineTo(x, this.size[1]);
			}
			for( var y=0; y<=this.size[1]; y += dy ) {
				c.moveTo(0, y);
				c.lineTo(this.size[0], y);
			}
			c.stroke();
			
			c.lineWidth = 1;
			c.beginPath();
			c.arc((a.l+a.r)/2, (a.t+a.b)/2, 10, 0, Math.PI * 2);
			c.arc(this.size[0]/2, this.size[1]/2, 20, 0, Math.PI * 2);
			c.stroke();

			c.beginPath();
			c.strokeRect( a.l, a.t, a.w, a.h );
			c.strokeRect( 0, 0, this.size[0], this.size[1]);
			c.stroke();
		}
		c.restore();
		return this;
	},
	addItem : function() { // interface for benchmark purpose
		
	}
});


//-----------------------
// TODO: all core packages, classes, and function set
hotjs.View = View;
hotjs.Node = Node;
hotjs.Scene = Scene;

})(); 


// ------- hotjs-sprite.js ------------- 

// name space
var hotjs = hotjs || {};

(function(){
	
// TODO: Sprite, from simple PNG
function Sprite(url, pos, size, speed, frames, dir, once) {
    this.pos = pos;
    this.size = size;
    this.speed = typeof speed === 'number' ? speed : 0;
    this.frames = frames;
    this._index = 0;
    this.url = url;
    this.dir = dir || 'horizontal';
    this.once = once;
};

Sprite.prototype = {
	update : function(dt) {
		this._index += this.speed * dt;
	},
	reset : function() {
		this._index = 0;
	},

	render : function(ctx, w, h) {
		var frame;

		if (this.speed > 0) {
			var max = this.frames.length;
			var idx = Math.floor(this._index);
			frame = this.frames[idx % max];

			if (this.once && idx >= max) {
				this.done = true;
				return;
			}
		} else {
			frame = 0;
		}

		var x = this.pos[0];
		var y = this.pos[1];

		if (this.dir == 'vertical') {
			y += frame * this.size[1];
		} else {
			x += frame * this.size[0];
		}
		
		if(! w) w = this.size[0];
		if(! h) h = this.size[1];
		
		var img = resources.get(this.url);

		ctx.drawImage( img, 
				x, y, this.size[0], this.size[1], 
				0, 0, w, h);
	}
};

// TODO: Animat, data source: AuroraGT by Gamelosft
var Animat = function(url, anim_id){
	hotjs.base(this);
	
	this.sheet = sprite_cache[ hotjs.getFileName( url ) ];
	this.anim = (this.sheet['anims']) [ anim_id ];
	
	this.index = 0;
	this.counter = 0;
};

hotjs.inherit(Animat, hotjs.Class, {
	update: function(dt) {
		var frame = this.anim[ this.index ];
		this.counter ++;
		if( this.counter >= frame[1]) {
			this.counter = 0;
			this.index ++;
			if( this.index >= this.anim.length ) this.index = 0;
		}
	},
	reset : function() {
		this.index = 0;
	},
	render: function(c, w, h) {
		c.save();
		c.translate( w * 0.5, h );
		var modules = this.sheet['modules'];
		var images = this.sheet['images'];
		var frames = this.sheet['frames'];

		var f = this.anim[ this.index ];
		var frame_id = f[0], ox = f[2], oy = f[3], oflag = f[4];
		var mods = frames[ frame_id ];
		
		c.translate(ox, oy);
		switch( oflag ) {
		case 0: c.scale(1,1); break;
		case 2: c.scale(-1,1); break;
		case 3: c.scale(1,-1); break;
		case 4: c.scale(-1,-1); break;
		}
		
		for( var i=0; i<mods.length; i++ ) {
			// each piece in this frame
			var m = mods[i];
			var mod_id = m[0], oox = m[1], ooy = m[2], ooflag = m[3];

			// mapping to image
			var mod = modules[ mod_id ];
			if( mod[0] == 'MD_IMAGE' ) {
				var img_id = mod[1], x = mod[2], y = mod[3], w = mod[4], h = mod[5];
				var img = images[ img_id ];
				var img_url = img[2], transp = img[1];
				var oImg = resources.get( img_url );
				
				c.save();
				c.translate( oox +w/2, ooy+h/2 );
				switch(ooflag) {
				case 0: c.scale(1.01, 1.01); break;
				case 2: c.scale(-1.01, 1.01); break;
				case 3: c.scale(1.01, -1.01); break;
				case 4: c.scale(-1.01, -1.01); break;
				}
				c.drawImage( oImg, x, y, w, h, -w/2, -h/2, w, h );
				c.restore();
			}
		}
		c.restore();
	}
});

// TODO: Particle
var Particle = function( par ){
	hotjs.base(this);
	
	this.par = par;
	
	this.frame = 0;
	this.life = 0;
	
	this.spin = 0;
	this.spin_delta = 0;
};

hotjs.inherit( Particle, hotjs.Node, {
	init: function(){
		var randi = hotjs.Random.Integer;
		var randf = hotjs.Random.Float;
		var par = this.par;
		var v = par.mode.v;
		
		if( par.res.endsWith('.png') ) {
			this.setImage( resources.get(par.resurl) );
		} else if( par.res.endsWith('.sprite.js') ) {
			this.setSprite( new Animat(par.resurl, 'xxx') );
		} else {
			return this;
		}
		
		this.life = randi( par.lifeMin, par.lifeMax );

		// init pos
		this.pos = [ par.x, par.y ];
		switch( par.mode.id ) {
		case 0:
			break;
		case 31: // rect 
			this.pos[0] += randf(v[0], v[2]);
			this.pos[1] += randf(v[1], v[3]);
			break;
		case 32: // circle
			var R = randf(v[1], v[0]);
			var ang = randf(v[2], v[3]);
			this.pos[0] += R * Math.cos(ang * Math.PI / 180);
			this.pos[1] += R * Math.sin(ang * Math.PI / 180);
			break;
		}
		
		var fts = par.filters;
		for( var i=0; i<fts.length; i++ ) {
			var ft = fts[i];
			var v = ft.v;
			switch( ft.type ) {
			case 'rotate':
				if( v[1] > 0 ) {
					this.rotation = randf(0, 1) * 360;
				} else {
					this.rotation = v[0];
				}
				this.spin = v[2];
				this.spin_delta = (v[3] - v[2]) / this.life;
				break;
			case 'scale':
				var s = randf(v[0], v[1]);
				this.scale = [s, s];
				// TODO: center point shift
				break;
			case 'move':
				break;
			case 'color':
				break;
			case 'h3g':
				break;
			}
		}
		
		return this;
	},
	update: function(dt){
		Particle.supClass.update.call(this, dt);
		
		this.frame ++;
		this.rotation += this.spin;
		this.spin += this.spin_delta;
	}	
});

// TODO: ParticleSet
var ParticleSet = function( par ) {
	hotjs.base(this);
	
	this.par = par;
	
	// TODO: to ensure performance, set limit up to 16 particles
	this.par.maxPtsCount = Math.min( this.par.maxPtsCount, 16 );
	this.subnodes = [];
	
	this.frame = 0;
};

hotjs.inherit( ParticleSet, hotjs.Node, {
	init: function(){
	},
	destroy: function(){
		this.subnodes.length = 0;
	},
	update: function(dt){
		var randi = hotjs.Random.Integer;
		var par = this.par;
		var ps = this.subnodes;
		
		// destroy
		for( var i=ps.length-1; i>=0; i-- ) {
			var p = ps[i];
			if( p.frame < p.life ) {
				p.update(dt);
			} else {
				ps.splice(i,1);
				delete p;
			}
		}
		
		// create
		if( this.frame >= par.delay && this.frame < par.life ) {
			var n = randi( par.createMin, par.createMax );
			for( var i=0; i<n; i++ ) {
				if( ps.length >= par.maxPtsCount ) break;
				var p = new Particle( par ).init();
				this.addNode(p);
			}
		}

		this.frame ++;
		if( this.frame >= 25 ) this.frame = 0;
	}
});

// TODO: ParticleSystem
var ParticleSystem = function( url ) {
	hotjs.base(this);

	var pst = pst_cache[ hotjs.getFileName( url ) ];
	var pset = pst.launchers;
	
	for( var i=0; i<pset.length; i++ ) {
		this.addNode( new ParticleSet( pset[i] ) );
	}
};

hotjs.inherit( ParticleSystem, hotjs.Node, {

});

hotjs.Sprite = Sprite;

hotjs.Animat = Animat;

hotjs.Particle = Particle;
hotjs.ParticleSet = ParticleSet;
hotjs.ParticleSystem = ParticleSystem;

})(); 
// ------- hotjs-animation.js ------------- 


hotjs.Anim = hotjs.Anim || {};

(function(){

var Animation = function(who, param){
	hotjs.base(this);
	
	this.who = who;
	
	this.param = {
		loop : false,
		duration : 1.0
	};
	for( var i in param ) {
		this.param[i] = param[i];
	}

	this.dtSum = 0;
};

hotjs.inherit(Animation, hotjs.Class, {
	// override
	init: function(){
	},
	step: function(dt) {
	},
	restore: function(){
	},
	// called 
	play: function(){
		this.init();
		this.who.addAnim(this);
		return this;
	},
	update: function(dt) {
		this.dtSum += dt;
		var timeout = ( this.dtSum >= this.param.duration ) && (! this.loop);
		
		var done = this.step(dt);
		
		var func = this.param.step;
		if( typeof func == 'function' ) {
			func( this.who, dt );
		}
			
		if( timeout || done ) {
			this.who.removeAnim(this);
			
			var func = this.param.done;
			if( typeof func == 'function') {
				func( this.who );
			}
		}
	}
});

// TODO: MoveTo
var MoveTo = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(MoveTo, Animation, {
	init: function(){
		var p = this.param;
		this.from = [ this.who.pos[0], this.who.pos[1] ];
		this.to = [ p.to[0], p.to[1] ];
	},
	step: function(dt) {
		this.who.pos = [ this.from[0] + (this.to[0] - this.from[0]) * this.dtSum / this.param.duration, 
		                 this.from[1] + (this.to[1] - this.from[1]) * this.dtSum / this.param.duration ];

		if( this.dtSum >= this.param.duration ) {
			this.who.pos = this.to;
		}
		return false;
	},
	restore: function(dt) {
		this.who.pos = this.from;
	}
});

//TODO: StickTo
var StickTo = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(StickTo, Animation, {
	init: function(){
		var p = this.param;
		this.from = [ this.who.pos[0], this.who.pos[1] ];
		this.to = [ p.to[0], p.to[1] ];
	},
	step: function(dt) {
		var t = Math.pow(this.dtSum/this.param.duration, 2);
		this.who.pos = [ this.from[0] + (this.to[0] - this.from[0]) * t,
		                 this.from[1] + (this.to[1] - this.from[1]) * t ];
		
		if( this.dtSum >= this.param.duration ) {
			this.who.pos = this.to;
		}
		return false;
	},
	restore: function(dt) {
		this.who.pos = this.from;
	}
});

//TODO: SlowDown
var SlowDown = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(SlowDown, Animation, {
	init: function(){
		if(! this.who.velocity) this.who.rotation = [0,0];
		this.from = this.who.velocity;
	},
	step: function(dt) {
		var perc = Math.cos( (this.dtSum / this.param.duration) * (Math.PI / 180) );
		this.who.velocity = [ this.from[0] * perc, this.from[1] * perc ];
		if( this.dtSum >= this.param.duration ) {
			this.who.velocity = [0,0];
		}
	},
	restore: function() {
		this.who.velocity = this.from;
	}
});

// TODO: RotateBy
var RotateBy = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(RotateBy, Animation, {
	init: function(){
		if(! this.who.rotation) this.who.rotation = 0;
		this.from = this.who.rotation;
		this.inc = this.param.spin;
	},
	step: function(dt) {
		this.who.rotation += this.inc * dt;
	},
	restore: function() {
		this.who.rotation = this.from;
	}
});

//TODO: ScaleTo
var ScaleTo = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(ScaleTo, Animation, {
	init: function(){
		this.from = this.who.scale;
		this.to = param.to;
	},
	step: function(dt) {
		this.who.scale = [ this.from[0] + (this.to[0] - this.from[0]) * this.dtSum / this.param.duration, 
		                   this.from[1] + (this.to[1] - this.from[1]) * this.dtSum / this.param.duration ];

		if( this.dtSum >= this.param.duration ) {
			this.who.scale = this.to;
		}
	},
	restore: function(){
		this.who.scale = this.from;
	}
});

//TODO: ScaleLoop
var ScaleLoop = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(ScaleLoop, Animation, {
	init: function(){
		var p = this.param;
		this.from = this.who.scale;
		this.mid = (p.range[1] + p.range[0])/2;
		this.delta = (p.range[1] - p.range[0])/2;
	},
	step: function(dt) {
		var s = this.mid + this.delta * Math.sin( this.dtSum / this.param.freq * Math.PI );
		this.who.scale = [s, s];
		return false;
	},
	restore: function(){
		this.who.scale = this.from;
	}
});


//TODO: FadeTo
var FadeTo = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(FadeTo, Animation, {
	init: function(){
		this.from = this.who.alpha;
		this.to = this.param.to;
	},
	step: function(dt) {
		this.who.alpha = this.from + (this.to - this.from) * this.dtSum / this.param.duration;
		if( this.dtSum >= this.param.duration ) {
			this.who.alpha = this.to;
		}
	},
	restore: function(){
		this.who.alpha = this.from;
	}
});

//TODO: FadeLoop
var FadeLoop = function(who, param) {
	hotjs.base(this, who, param);
};
hotjs.inherit(FadeLoop, Animation, {
	init: function(){
		var p = this.param;
		this.from = this.who.alpha;
		this.mid = (p.range[0] + p.range[1])/2;
		this.delta = (p.range[1] - p.range[0])/2;
	},
	step: function(dt) {
		this.who.alpha = this.mid + this.delta * Math.sin(this.dtSum / this.param.freq * Math.PI);
		return false;
	},
	restore: function(){
		this.who.alpha = this.from;
	}
});

var create = function(target, anim, param) {
	var animClass = hotjs.Anim[ anim ];
	if( typeof animClass != 'function') {
		console.log( animClass + ' not exists, using default.' );
		animClass = Animation;
	}
	
	return new animClass(target, param);
};

var register = function(anim, animClass) {
	hotjs.Anim[ anim ] = animClass;
	return this;
};

hotjs.Anim = {
	register: register,
	create: create,
	MoveTo: MoveTo,
	StickTo: StickTo,
	SlowDown: SlowDown,
	RotateBy: RotateBy,
	ScaleTo: ScaleTo,
	ScaleLoop: ScaleLoop,
	FadeTo: FadeTo,
	FadeLoop: FadeLoop
};

})();

// ------- hotjs-physics.js ------------- 


hotjs = hotjs || {};
hotjs.Physics = hotjs.Physics || {};

(function(){
	
var Constant = {
	g : 9.8,
	RESTITUTION_V : 0.8,
	RESTITUTION_H : 0.95,
	AIR_RESISTANCE : 0.2,
	AIR_DENSITY : 0.01293,
	HYDROGEN_DENSITY : 0.0008948,
	WOOD_DENSITY : 0.5,
	WATER_DENSITY : 1,
	IRON_DENSITY : 7.8,
	METER : 100
};

// physics formula
var Formula = {
	velocityAfterCollision: function (m1,v1,m2,v2) {
		return ((m1-m2)*v1 + 2*m2*v2) / (m1+m2);
	},
	airResistance : function(w,h,velocity) {
		return Constant.AIR_RESISTANCE * Constant.AIR_DENSITY * w * h * velocity * velocity ;
	},
	airFlotage : function(w,h) {
		return (w * w * h * Constant.AIR_FLOTAGE);
	}
};

// TODO: Node in Physics world 
var Node = function(){
	hotjs.base(this);
	
	this.restitution = 0.95;
};

hotjs.inherit(Node, hotjs.Node, {
	setRestitution : function(r) {
		r = Math.min(1, Math.max(0, r));
		this.restitution = r;

		return this;
	},
	getRestitution : function() {
		return this.restitution;
	},
	collide : function(another) {
		return this;
	}
});

// TODO: Ball in Physics world 

var Ball = function(){
	hotjs.base(this);

};

hotjs.inherit(Ball, Node, {
	collide : function(b) {

		var Vector = hotjs.Vector;
		
		var velAfter = Formula.velocityAfterCollision;
		
		var rx1 = this.size[0]/2, ry1 = this.size[1]/2;
		var rx2 = b.size[0]/2, ry2 = b.size[1]/2;
		var c1 = [ this.pos[0]+rx1, this.pos[1]+ry1 ];
		var c2 = [ b.pos[0]+rx2, b.pos[1]+ry2 ];
		var r1 = (rx1 + ry1) / 2;
		var r2 = (rx2 + ry2) / 2;
		var vectPos = Vector.sub( c1, c2 );
		
		var tution = this.getRestitution() * b.getRestitution();
		
		// no collision yet
		var distance = Math.sqrt(vectPos[0] * vectPos[0] + vectPos[1] * vectPos[1]);
		if( distance > r1+r2) return false;
		
		// distance cannot be small than r1 + r2
		if( distance < r1+r2 ) {
			var fix = 1 - distance/(r1+r2);
			var vectPosFix = Vector.mul( vectPos, fix );
			this.pos = Vector.add( this.pos, vectPosFix );
			b.pos = Vector.sub( b.pos, vectPosFix );
		}
		
		var vectTangent = [ vectPos[1], - vectPos[0] ];
		
		var v1 = Vector.project(this.velocity, vectPos);
		var v1T = Vector.project(this.velocity, vectTangent);
		
		var v2 = Vector.project(b.velocity, vectPos);
		var v2T = Vector.project(b.velocity, vectTangent);
		
		var v1x = velAfter(this.mass, v1[0], b.mass, v2[0]) * tution;
		var v1y = velAfter(this.mass, v1[1], b.mass, v2[1]) * tution;
		
		var v2x = velAfter(b.mass, v2[0], this.mass, v1[0]) * tution;
		var v2y = velAfter(b.mass, v2[1], this.mass, v1[1]) * tution;
		
		this.velocity = Vector.add( v1T, [v1x, v1y] );
		b.velocity = Vector.add( v2T, [v2x, v2y] );
		
		return true;
	}
});

// TODO: Scene in Physics world 

var Scene = function(){
	hotjs.base(this);

	this.restitution = 0.6;
	this.gravity = Constant.g;
	this.resistance = 1/2;
	this.meter = 200;
};

hotjs.inherit(Scene, hotjs.Scene, {
	setRestitution : function(r) {
		r = Math.min(1, Math.max(0, r));
		this.restitution = r;

		return this;
	},
	getRestitution : function() {
		return this.restitution;
	},
	setMeter: function(m) {
		this.meter = m;
		return this;
	},
	setGravity : function(n) {
		this.gravity = n * Constant.g;
		return this;
	},
	getGravity : function() {
		return this.gravity;
	},
	setResistance : function(r) {
		this.resistance = r;
		return this;
	},
	getResistance : function() {
		return this.resistance;
	},
	checkBorderCollision : function(dt) {
		var a = this.getArea();
		
		for( var i=this.subnodes.length-1; i>=0; i-- ) {
			var b = this.subnodes[i];
			var px = b.pos[0], py = b.pos[1];
			var rx = b.size[0], ry = b.size[1];
			var vx = b.velocity[0], vy = b.velocity[1];

			// check area 
			var x_hit = ((px <= a.l) && (vx <=0)) || ((px + rx >= a.r) && (vx >=0));
			var y_hit = ((py <= a.t) && (vy <=0)) || ((py + ry >= a.b) && (vy >=0));
			
			// media resistance (like air, water, floor, etc.)
			var ax = vx * (- this.resistance);
			var ay = vy * (- this.resistance);

			// bounce & collision loss
			var tution = this.restitution * b.getRestitution();
			if( x_hit ){
				vx *= (- tution);
				vy *= (0.9 + tution * 0.1);
			}
			if( y_hit ) {
				vy *= (- tution);
				vx *= (0.9 + tution * 0.1);
			} else {
				// gravity / air buoyancy
				ay += (1 - Constant.AIR_DENSITY/b.density)  * (this.gravity * this.meter);
			}
	
			b.velocity = [vx, vy];
			b.accel = [ax, ay];
		}
		
		return this;
	},
	validatePos : function() {
		var a = this.getArea(); // {l,t,r,b,w,h}
		
		for( var i=this.subnodes.length-1; i>=0; i-- ) {
			var b = this.subnodes[i];

			// fix pos if out of area
			px = Math.max( a.l, Math.min(a.r - b.size[0], b.pos[0]));
			py = Math.max( a.t, Math.min(a.b - b.size[1], b.pos[1]));
			
			b.pos = [ Math.round(px), Math.round(py) ];			
		}
		
		return this;
	},
	update : function(dt) {
		if(!! this.subnodes) {
			for( var i=this.subnodes.length-1; i>=0; i-- ) {
				var b = this.subnodes[i];
				b.update(dt);
			}

			for( var i=this.subnodes.length-1; i>=1; i-- ) {
				var b = this.subnodes[i];
				for( var j=i-1; j>=0; j-- ) {
					var another = this.subnodes[j];
					b.collide( another );
				}
			}

			this.checkBorderCollision(dt);
			this.validatePos();
		}
		
		return this;
	}
});

hotjs.Physics.Constant = Constant;
hotjs.Physics.Formula = Formula;

hotjs.Physics.Node = Node;
hotjs.Physics.Scene = Scene;
hotjs.Physics.Ball = Ball;

})();


// ------- hotjs-social.js ------------- 


hotjs = hotjs || {};
hotjs.Social = hotjs.Social || {};

(function(){

// TODO: AjaxClient 
// using jQuery/AJAX to handle network request 
var AjaxClient = function(){
	this.settings = {
		url : 'http://msghub.hotjs.net/api',
		cache : false,
		data : {},
		processData : true,
		type : 'POST',
		async : false,
		timeout : 10000,	// 10 sec
		dataType : 'html',
		crossDomain : false,
		context : document.body,
		statusCode : {
			403 : function(){ console.log('access denied.' ); },	
			404 : function(){ console.log('url not found.'); },
			405 : function(){ console.log('method not allowed.'); },
			500 : function(){ console.log('server error'); }
		}		
	};
	
	this.msgMax = 100;
	this.msgList = [];

	this.urls = {};
	this.debugmode = false;
};

AjaxClient.prototype = {
	setDebugMode : function(d) {
		if(d === undefined) d = true;
		this.debugmode = d;
		return true;
	},
	config : function( set ){
		if( set.msgMax != undefined ) {
			this.msgMax = set.msgMax;
			delete set.msgMax;
		}
		for( var s in set ) {
			this.settings[ s ] = set[ s ];
		}
		// $.ajaxSetup ( this.settings );
		// Set default values for future Ajax requests. Its use is not recommended (according to jQuery doc). 
		// (so we can just handle it by ourselves.)
	},
	// { api_name : "http://msghub.hotjs.net/api/default.py", ... }
	configAPI : function( urls ) {
		if( typeof urls == 'string' ) {
			this.urls[ '_default_' ] = urls;
		} else if( typeof urls == 'object' ){
			for( var api in urls ) this.urls[ api ] = urls[ api ];
		}
		this.settings.url = this.urls['_default_'];
		
		return true;
	},
	// list API in following format:
/*
{
	"module" : "usermgmt",
	"version" : 2.0,
	"base" : "http://msghub.hotjs.net/api/usermgmt/",
	"list" : [ 
		{ "api": "_default_", "url" : "default.py", "param": [ "param1", "param2",  ... ], "comment" : "whatever" }, ... 
		{ "api": "api_name", "url" : "hello.php", "param": [ "param1", "param2",  ... ], "comment" : "whatever" }, ... 
	]
} 
*/
	loadAPI : function( inf_url, mod, req_ver ) {
		var msg = this.requestMsg( { module: mod, version: req_ver }, inf_url, { type:'GET' } );
		
		if( ! msg ) return false;
		if( ! Array.isArray(msg.list) ) return false;
		//if( msg.module != mod ) return false;
		//if( msg.version < req_ver ) return false;
		
		// if no base specified, then assume the same server & folder
		var base_url = msg.base;
		if( base_url.indexOf("://") < 0 ) {
			base_url = inf_url.substring(0, inf_url.lastIndexOf('/')+1) + base_url;
		}
		
		for( var i=0; i<msg.list.length; i++ ) {
			var entry = msg.list[i];
			var url = ( entry.url.indexOf("://") > -1) ? entry.url : (base_url + entry.url);
			url = url.replace('/./', '/');
			this.urls[ entry.api ] =  url;
		}
		
		return true;
	},
	requestMsg : function( data, url, options ) {
		if(this.debugmode) console.log( 'sending: ' + JSON.stringify(data) );
		var ajaxpkg = {};		
		for( var i in this.settings ) ajaxpkg[i] = this.settings[i];
		if( !! options ) for( var i in options ) ajaxpkg[i] = options[i];
		if( !! data ) ajaxpkg.data = data;
		if( !! url ) ajaxpkg.url = url;
		ajaxpkg.async = false;
		
		var self = this;
		var msgs = false;
		
		$.ajax( ajaxpkg )
			.done(function(data, textStatus, jqXHR){
				if(self.debugmode) console.log( 'received: ' + data );
				data = JSON.parse( data );
				
				msgs = data;
			})
			.fail(function(jqXHR, textStatus, errorThrown){
				self.onMsgFail( jqXHR, textStatus, errorThrown );
			})
			.complete(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown){
				self.onMsgComplete( data_or_jqXHR, textStatus, jqXHR_or_errorThrown );
			});
		
		return msgs;
	},
	postMsg : function( data, url, options ) {
		var ajaxpkg = {};
		
		for( var i in this.settings ) ajaxpkg[i] = this.settings[i];
		if( !! options ) for( var i in options ) ajaxpkg[i] = options[i];
		if( !! data ) ajaxpkg.data = data;
		if( !! url ) ajaxpkg.url = url;
		ajaxpkg.async = true;
		
		var self = this;
		
		$.ajax( ajaxpkg )
			.done(function(data, textStatus, jqXHR){
				if(self.debugmode) console.log( data );
				data = JSON.parse( data );
				
				self.onMsgComing( data, textStatus, jqXHR );
			})
			.fail(function(jqXHR, textStatus, errorThrown){
				self.onMsgFail( jqXHR, textStatus, errorThrown );
			})
			.complete(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown){
				self.onMsgComplete( data_or_jqXHR, textStatus, jqXHR_or_errorThrown );
			});
		
		return true;
	},
	onMsgFail : function( jqXHR, textStatus, errorThrown ) {
		if(this.debugmode) {
			console.log( "ajax fail" );
			console.log( jqXHR, textStatus, errorThrown );
		}
	},
	onMsgComplete : function( data_or_jqXHR, textStatus, jqXHR_or_errorThrown ) {
	},
	onMsgComing : function( data, textStatus, jqXHR ) {
		if( Array.isArray(data) ) {
			for( var i=0; i<data.length; i++ ) {
				this.onMsgParse( data[i] );
			}
		} else {
			this.onMsgParse( data );
		}
	},
	// TODO: sub class always override this function
	// to handle incoming message immediately.
	// check msg.api, then do something.
	onMsgParse : function( msg ) {
		
	},
	// input: { api: "api_name", key1: value1, key2: value2, ... }
	// output: { api: "api_name", key1: value1, key2: value2, ... }
	callAPI : function( api, param ) {
		var url = this.urls[ api ];
		if(! url) url = this.urls[ '_default_' ];
		
		var msg = this.requestMsg( {
			api: api,
			param: JSON.stringify(param) 
			}, url );
		if( typeof msg == "object" ) {
			//if( msg.api == api ) { // double check api, needed ? 
			return msg;
			//}
		}
		return false;
	},
	hello : function hello() {
		var msg = this.callAPI( 'hello', { name: 'hotjs' } );
		return (!! msg) ? msg.name : false;
	}
};

// TODO: User
var User = function(){
	hotjs.base(this);
	
	// login info
	this.username = "";
	this.password = "";
	this.app = "hotjs";
	this.version = hotjs.version;
	
	// generated by server after authentication.
	this.session = "";		

	this.profile = {};
	this.status = {};
	this.tag = [];
	this.friends = [];
	this.blocks = [];
	
	// by default, heartbeat interval is 5 sec.
	// can be changed when calling login()
	this.hb_interval = 5000;
};

hotjs.inherit( User, AjaxClient, {
	setHeartbeat : function( hb ) {
		this.hb_interval = hb;
	},
	registerAccount : function registerAccount(u, p, fn, e, c) {
		var msg = this.callAPI( 'registerAccount', {
			username : u,
			password : p,
			fullname : fn,
			email : e,
			cellphone : c
		} );
		
		return (!! msg) ? msg.done : false;
	},
	deleteAccount : function deleteAccount() {
		var msg = this.callAPI( 'deleteAccount', {
			username : u,
			password : p
		} );
		return (!! msg) ? msg.done : false;
	},
	// return username & password in msg
	autoRegister : function autoRegister(uuid, fn) {
		var msg = this.callAPI( 'autoRegister', {
			uuid : uuid,
			fullname: fn,
		});		
		return ((!! msg) && msg.done) ? msg : false;
	},
	
	login : function login(u, p, app, ver, hb) {
		var msg = this.callAPI( 'login', {
			username : u,
			password : p,
			app : app,
			version : ver
		} );

		if( (!!msg) && msg.done ) {
			this.session = msg.sid;
			
			// keep it for auto re-login
			this.username = u;
			this.password = p;
			this.app = app;
			this.version = ver;
			
			// set hb interval if needed.
			if(!! hb) this.hb_interval = hb;
			
			// start first hb.
			this.heartbeat();
			
			return true;
		}
		
		return false;
	},
	// override to pull message like push from server.
	heartbeat : function heartbeat() {
		if( !! this.session ) {
			// send heartbeat msg
			var api = 'heartbeat';
			var data = { sid:this.session, t:Date.now() };
			this.postMsg( { 
				api: api, 
				param: JSON.stringify(data) 
				}, this.urls[ api ] );
			
			var self = this;
			this.hb_timer = window.setTimeout( function(){
				self.heartbeat();
			}, this.hb_interval );
		}
		return true;
	},
	logout : function logout() {
		// stop heartbeat timer
		if(!! this.hb_timer) {
			clearTimeout( this.hb_tiemr );
		}
		
		// send logout msg
		var msg = this.callAPI( 'logout', {
			sid : this.session
		});
		this.session = "";
		return (!! msg) ? msg.done : false;
	},
	changeIdPassword : function changeIdPassword( u, oldpwd, newu, newpwd, newfn ) {
		if( u === newu ) newu = '';
		var param = {
				username : u,
				oldpwd : oldpwd,
				newusername : newu,
				newpwd : newpwd,
				newfullname : newfn
			};
		var msg = this.callAPI( 'changeIdPassword', param);
		return (!! msg) ? msg.done : false;
	},
	
	// { public: {}, protected: {}, private: {} }
	updateProfile : function updateProfile( data ) {
		var msg = this.callAPI( 'updateProfile', {
			sid : this.session,
			profile : data
		} );
		return (!! msg) ? msg.done : false;
	},
	// get own profile: {}
	getProfile : function getProfile() {
		var msg = this.callAPI( 'getProfile', {
			sid : this.session
		} );
		return ((!! msg) && msg.done) ? msg.profile : false;
	},
	// query profile of others, may be many [ user1, user2, user3, ... ]
	// return: msg.profile as a list: [ {}, {}, {} ]
	// only return public part & protected on situation, never return private profile
	queryProfile : function queryProfile( user ) {
		var msg = this.callAPI( 'queryProfile', {
			sid : this.session,
			user : user
		} );
		return ((!! msg) && msg.done) ? msg.profile : false;
	},
	
	// query profile of others, may be many [ user1, user2, user3, ... ]
	// return: msg.user as a list: [ { username:"user1", fullname: "David", presence: "online" }, ... ]
	listFriend : function listFriend() {
		var msg = this.callAPI( 'listFriend', {
			sid : this.session
		} );
		if ( (!! msg) && msg.done && Array.isArray(msg.user) ) {
			// sync the friend list
			this.friends.length = 0;
			for( var i=0; i<msg.user.length; i++ ) {
				this.friends.push( msg.user[i].username );
			}
			return msg.user;
		}
		return false;
	},
	addFriend : function addFriend( username, textmsg ) {
		if( this.friends.indexOf(username) > -1 ) {
			return false;
		}
		var msg = this.callAPI( 'addFriend', {
			sid : this.session,
			username : username,
			textmsg : textmsg
		});
		if( (!! msg) && msg.done ) {
			this.friends.push( username );
			return true;
		}
		return false;
	},
	confirmAddFriend : function confirmAddFriend( username ) {
		if( this.friends.indexOf(username) > -1 ) {
			return false;
		}
		var msg = this.callAPI( 'confirmAddFriend', {
			sid : this.session,
			username : username
		});
		if( (!! msg) && msg.done ) {
			this.friends.push( username );
			return true;
		}
		return false;
	},
	removeFriend : function removeFriend( username ) {
		if( this.friends.indexOf(username) == -1 ) {
			return false;
		}
		var msg = this.callAPI( 'removeFriend', {
			sid : this.session,
			username : username
		});
		if( (!! msg) && msg.done ) {
			var n = this.friends.indexOf(username);
			if( n > -1 ) {
				this.friends.splice(n, 1);
				return true;
			}
		}
		return false;
	},
	
	// query profile of others, may be many [ user1, user2, user3, ... ]
	// return: msg.user as a list: [ { username:"user1", fullname: "David", presence: "online" }, ... ]
	listBlock : function listBlock() {
		var msg = this.callAPI( 'listBlock', {
			sid : this.session
		} );
		if ( (!! msg) && msg.done && Array.isArray(msg.user) ) {
			// sync the friend list
			this.blocks.length = 0;
			for( var i=0; i<msg.user.length; i++ ) {
				this.blocks.push( msg.user[i].username );
			}
			return msg.user;
		}
		return false;
	},
	// block a user, and will not receive any activity notification like invite/chat/say/join/quit ...
	block : function block( u ) {
		if( this.friends.indexOf(u) > -1 ) {
			return false;
		}
		var msg = this.callAPI( 'block', {
			sid : this.session,
			username : u
		});
		if( (!! msg) && msg.done ) {
			this.blocks.push( u );
			return true;
		}
		return false;
	},
	unblock : function unblock( u ) {
		if( this.friends.indexOf(u) == -1 ) {
			return false;
		}
		var msg = this.callAPI( 'unblock', {
			sid : this.session,
			username : u
		});
		if( (!! msg) && msg.done ) {
			var n = this.friends.indexOf(u);
			if( n > -1 ) {
				this.blocks.splice(n, 1);
				return true;
			}
		}
		return false;
	},

	// set tags, [ "hacker", "swimming", "golf", ... ]
	setTag : function addTag( data ) {
		var msg = this.callAPI( 'setTag', {
			sid : this.session,
			tag : data
		} );
		if( (!! msg) && msg.done ) {
			// cache it
			this.tag.length = 0;
			for( var i=0; i<data.length; i++ ) this.tag.push( data[i] );
			return true;
		} 
		return false;
	},
	getTag : function getTag() {
		var msg = this.callAPI( 'getTag', {
			sid : this.session
		} );
		if( (!! msg) && msg.done ) {
			var data = msg.tag;
			// cache it
			this.tag.length = 0;
			for( var i=0; i<data.length; i++ ) this.tag.push( data[i] );
			return true;
		} 
		return false;
	},
	// { presence: "busy", location: [lat, lang] }
	updateStatus : function updateStatus( data ) {
		var msg = this.callAPI( 'updateStatus', {
			sid : this.session,
			status : data
		});
		if( (!! msg) && msg.done ) {
			// cache it
			for( var i in data ) this.status[i] = data[i];
			return true;
		} 
		return false;
	},
	// query presence of others, may be many [ user1, user2, user3, ... ]
	// return [ "available"/"busy"/"nodistrub"/"rightback"/"away"/"offline" ]
	queryPresence : function queryPresence( users ) {
		var msg = this.callAPI( 'queryPresence', {
			sid : this.session,
			user : users
		} );
		return ((!! msg) && msg.done) ? msg.presence : false;
	},
	
	// return: msg.user as a list: [ { username:"user1", fullname: "David", presence: "online" }, ... ]
	searchUser : function searchUser( tag, distance ) {
		var msg = this.callAPI( 'searchUser', {
			sid : this.session,
			tag : tag,
			distance : distance
		} );
		return ((!! msg) && msg.done) ? msg.user : false;
	},
	// filter is string with complex condition, like: "(age > 25) AND (age < 40) AND (tag CONTAIN 'reading')" :-)
	// return: msg.user as a list: [ { username:"user1", fullname: "David", presence: "online" }, ... ]
	searchUserComplex : function searchUserComplex( filter ) {
		var msg = this.callAPI( 'searchUserComplex', {
			sid : this.session,
			filter : filter
		} );
		return ((!! msg) && msg.done) ? msg.user : false;
	},
	
	// invite a friend to join a group
	inviteJoinGroup : function inviteJoinGroup( name, g ) {
		var msg = this.callAPI( 'inviteJoinGroup', {
			sid : this.session,
			name : name,
			group : g
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	quitGroup : function quitGroup( g ) {
		var msg = this.callAPI( 'quitGroup', {
			sid : this.session,
			group : g
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	// chat in a group
	chat : function chat( s, g ) {
		var msg = this.callAPI( 'chat', {
			sid : this.session,
			group : g,
			what : s
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	
	// return msg.room [ "room1", "room2", ... ], not all, limit to 20
	findRoom : function findRoom( name ) {
		var msg = this.callAPI( 'findRoom', {
			sid : this.session,
			name : name
		} );
		return ((!! msg) && msg.done) ? msg.room : false;
	},
	// if room not exist, then create it.
	// may need enter password, if required
	enterRoom : function enterRoom( name, pwd, appkey ) {
		var msg = this.callAPI( 'enterRoom', {
			sid : this.session,
			name : name,
			secret : pwd,
			appkey : appkey
		} );
		return ((!! msg) && msg.done) ? msg.rid : false;
	},
	// if no one in room after exist, then remove the password if there is.
	leaveRoom : function leaveRoom( name ) {
		var msg = this.callAPI( 'leaveRoom', {
			sid : this.session,
			name : name
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	// say something, anyone in the room can hear.
	say : function say( s ) {
		var msg = this.callAPI( 'say', {
			sid : this.session,
			what : s
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	
	// send short message, only between friends.
	sms : function sms( name, s ) {
		var msg = this.callAPI( 'sms', {
			sid : this.session,
			name : name,
			what : s
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	
	// return msg, { 'all':999, '1':10, '2':10, ..., 'vip':20 }
	countOnlineGamer : function countOnlineGamer( appkey ) {
		var msg = this.callAPI( 'countOnlineGamer', {
			sid : this.session,
			appkey : appkey
		});		
		return msg;
	},
	searchGamer : function searchGamer( appkey, level ) {
		var msg = this.callAPI( 'searchGamer', {
			sid : this.session,
			appkey : appkey,
			level : level
		});		
		return ((!! msg) && msg.done) ? true : false;
	},
	
	uploadGameData : function uploadGameData( appkey, md5key, result, steps ) {
		var msg = this.callAPI( 'uploadGameData', {
			sid : this.session,
			appkey : appkey,
			md5key : md5key,
			result : result,
			steps : steps
		});
		
		return ((!! msg) && msg.done) ? true : false;
	},
	listGameData : function listGameData( appkey, pagesize, pageindex ) {
		if( pageindex === undefined ) pageindex = 0;
		if( pagesize === undefined ) pagesize = 10;
		var msg = this.callAPI( 'listGameData', {
			sid : this.session,
			appkey : appkey,
			pagesize : pagesize,
			pageindex : pageindex
		});
		
		return msg;
	},
	// msg = { "md5key" : "xx", "result" : "xx", "steps" : "xx" }
	downloadGameData : function downloadGameData( appkey, md5key ) {
		var msg = this.callAPI( 'downloadGameData', {
			sid : this.session,
			appkey : appkey,
			md5key : md5key
		});
		
		return msg;
	},
	voteGameData : function voteGameData( appkey, md5key, rating ) {
		var msg = this.callAPI( 'voteGameData', {
			sid : this.session,
			appkey : appkey,
			md5key : md5key,
			rating : rating
		});

		return ((!! msg) && msg.done);
	},
	
	updateGameScore : function updateGameScore( appkey, data1, data2, data3 ) {
		var msg = this.callAPI( 'updateGameScore', {
			sid : this.session,
			appkey : appkey,
			data1 : data1,
			data2 : data2,
			data3 : data3
		});
		return ((!! msg) && msg.done);
	},
	// { "data1" : [ { "name" : "tom", "score" : 10 }, { ... } ], "data2" : [], "data3" : [] }
	getGameScoreTop10 : function getGameScoreTop10( appkey, data1, data2, data3 ) {
		var msg = this.callAPI( 'getGameScoreTop10', {
			sid : this.session,
			appkey : appkey,
			data1 : data1,
			data2 : data2,
			data3 : data3
		});
		return msg;
	},
	
	feedback : function feedback( appkey, txt ) {
		var msg = this.callAPI( 'feedback', {
			sid : this.session,
			msg : txt
		});
		return ((!! msg) && msg.done);
	}
	
});

hotjs.Social.AjaxClient = AjaxClient;
hotjs.Social.User = User;

})();

// ------- hotjs-util.js ------------- 


hotjs = hotjs || {};
hotjs.Util = hotjs.Util || {};

(function(){

// borrow from collie.js
var _htDeviceInfo = null;

hotjs.Util = {
		
getDeviceInfo : function (sAgent) {
	if (_htDeviceInfo !== null && typeof sAgent === "undefined") {
		return _htDeviceInfo;
	}
	
	var aMat = null;
	var bIsDesktop = false;
	var bSupportCanvas = typeof CanvasRenderingContext2D !== "undefined";
	var bIsAndroid = false;
	var bIsIOS = false;
	var bIsIE = false;
	var bHasChrome = (/chrome/i.test(sAgent)) ? true : false;
	var sAgent = sAgent || navigator.userAgent;
	var nVersion = 0;
	
	if (/android/i.test(sAgent)) { // android
		bIsAndroid = true;
		aMat = sAgent.toString().match(/android ([0-9]\.[0-9])\.?([0-9]?)/i);
		
		if (aMat && aMat[1]) {
			nVersion = (parseFloat(aMat[1]) + (aMat[2] ? aMat[2] * 0.01 : 0)).toFixed(2);
		}
	} else if (/(iphone|ipad|ipod)/i.test(sAgent)) { // iOS
		bIsIOS = true;
		aMat = sAgent.toString().match(/([0-9]_[0-9])/i);
		
		if (aMat && aMat[1]) {
			nVersion = parseFloat(aMat[1].replace(/_/, '.'));
		}
	} else { // PC
		bIsDesktop = true;
		
		if (/(MSIE)/i.test(sAgent)) { // IE
			bIsIE = true;
			aMat = sAgent.toString().match(/MSIE ([0-9])/i);
			
			if (aMat && aMat[1]) {
				nVersion = parseInt(aMat[1], 10);
			}
		}
	}
	
	_htDeviceInfo = {
		supportCanvas : bSupportCanvas,
		desktop : bIsDesktop,
		android : bIsAndroid ? nVersion : false,
		ios : bIsIOS ? nVersion : false,
		ie : bIsIE ? nVersion : false,
		chrome : bHasChrome
	};
	
	return _htDeviceInfo;
},

getBoundaryRect : function (aPoints) {
	var nMinX = aPoints[0][0];
	var nMaxX = aPoints[0][0];
	var nMinY = aPoints[0][1];
	var nMaxY = aPoints[0][1];
	
	for (var i = 1, len = aPoints.length; i < len; i++) {
		nMinX = Math.min(nMinX, aPoints[i][0]);
		nMaxX = Math.max(nMaxX, aPoints[i][0]);
		nMinY = Math.min(nMinY, aPoints[i][1]);
		nMaxY = Math.max(nMaxY, aPoints[i][1]);
	}
	
	return {
		left : nMinX,
		right : nMaxX,
		top : nMinY,
		bottom : nMaxY
	};
},

getRectPoints : function (rect) {
	return [[rect.left, rect.top], [rect.right, rect.top], [rect.right, rect.bottom], [rect.left, rect.bottom]];
},

cloneObject : function (oSource) {
	var oReturn = {};
	
	for (var i in oSource) {
		oReturn[i] = oSource[i];
	}
	
	return oReturn;
},

addEventListener : function (el, sName, fHandler, bUseCapture) {
	if ("addEventListener" in el) {
		el.addEventListener(sName, fHandler, bUseCapture);
	} else {
		el.attachEvent("on" + sName, fHandler, bUseCapture);
	}
},

removeEventListener : function (el, sName, fHandler, bUseCapture) {
	if ("removeEventListener" in el) {
		el.removeEventListener(sName, fHandler, bUseCapture);
	} else {
		el.detachEvent("on" + sName, fHandler, bUseCapture);
	}
},

stopEventDefault : function (e) {
	e = e || window.event;
	
	if ("preventDefault" in e) {
		e.preventDefault();
	}
	
	e.returnValue = false;
},

getClientRect : function (el) {
	var elDocument = el.ownerDocument || el.document || document;
	var elHtml = elDocument.documentElement;
	var elBody = elDocument.body;
	var rect = {};
	
	if ("getBoundingClientRect" in el) {
		var htBox = el.getBoundingClientRect();
		rect.left = htBox.left;
		rect.left += elHtml.scrollLeft || elBody.scrollLeft;
		rect.top = htBox.top;
		rect.top += elHtml.scrollTop || elBody.scrollTop;
		rect.width = htBox.width;
		rect.height = htBox.height;
		rect.right = htBox.right;
		rect.right += elHtml.scrollLeft || elBody.scrollLeft;
		rect.bottom = htBox.bottom;
		rect.bottom += elHtml.scrollTop || elBody.scrollTop;
	} else {
		rect.left = 0;
		rect.top = 0;
		rect.width = el.offsetWidth;
		rect.height = el.offsetHeight;
		
		for (var o = el; o; o = o.offsetParent) {
			rect.left += o.offsetLeft;
			rect.top += o.offsetTop;
		}

		for (var o = el.parentNode; o; o = o.parentNode) {
			if (o.tagName === 'BODY') {
				break;
			}
			
			if (o.tagName === 'TR') {
				rect.top += 2;
			}
								
			rect.left -= o.scrollLeft;
			rect.top -= o.scrollTop;
		}
		rect.right = rect.left + rect.width;
		rect.bottom = rect.top + rect.height;
	}
	
	return rect;
}

};

// iOS
/*
if (hotjs.Util.getDeviceInfo().ios) {
	// avoid error in web worker without window
	if(window && window.addEventListener && setTimeout && document && document.body ) {
		window.addEventListener("load", function () {
			setTimeout(function () {
				document.body.scrollTop = 0;
			}, 300);
		});
	}
}
*/

//bind polyfill, https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5 internal IsCallable function
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 1), 
			fToBind = this, 
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();
		return fBound;
	};
}


var BenchLab = function(){
	hotjs.base(this);
	
	this.nMin = 1;
	this.nMax = 500;
	this.loopBench = false;
	
	this.fpsData = [];
	this.dtSumB = 0;
	this.nCur = this.nMax;
	
	this.marginFormula = 40;
	this.formula = false;
};

hotjs.inherit(BenchLab, hotjs.View, {
	setBenchmarkRange : function(n1, n2) {
		this.nMin = Math.min( n1, n2 );
		this.nMax = Math.max( n1, n2 );
		this.nCur = this.nMax;
		return this;
	},
	showFormula : function(f) {
		if(f == undefined) f = (! this.formula);
		this.formula = f;
		return this;
	},
	benchFPS: function(min, max, loop) {
		this.nMin = min;
		this.nMax = max;
		this.fpsData = [];
		
		this.dtSumB = 0;
		this.nCur = this.nMin;
		
		this.loopBench = (!! loop);
		
		return true;
	},
	benchStop : function() {
		this.nCur = this.nMax;

		return true;
	},
	update : function(dt) {
		BenchLab.supClass.update.call(this, dt);
		
		if( this.nCur < this.nMax ) {
			this.dtSumB += dt;
			if( this.dtSumB >= 0.2 ) {
				this.dtSumB = 0;
				
				this.curScene.addItem();
				this.nCur ++;
				
				var f = (this.height()-this.marginFormula*2) / 60;
				this.fpsData.push( f * this.fps );

				if( this.nCur >= this.nMax ) {
					if (!! this.loopBench ) {
						this.nCur = this.nMin;
						this.fpsData.length = 0;
					}
				}
			}
		} 
		
		return true;
	},
	drawFormula : function(c) {
		c.save();
		
		// draw x, y axis 
		var x0 = this.marginFormula, 
			y0 = this.height() - this.marginFormula;
		var w = this.width() - this.marginFormula * 2, 
			h = this.height() - this.marginFormula * 2;
		
		c.beginPath();
		c.strokeStyle = "black";
		c.fillStyle = "black";
		for(var i=0; i<6; i++) {
			c.beginPath();
			c.moveTo(x0, this.marginFormula + i * h / 6);
			c.lineTo(x0 + w, this.marginFormula + i * h / 6);
			c.stroke();
		}
		c.beginPath();
		c.moveTo(x0,this.marginFormula); 
		c.lineTo(x0,y0); 
		c.lineTo(this.width()-this.marginFormula, y0);
		c.stroke();
		c.fillText( "60 fps", x0-20, this.marginFormula-10 );
		c.fillText( "" + this.nMax, this.width()-this.marginFormula-20, y0+20 );
		
		// draw graph
		c.beginPath();
		c.strokeStyle = "red";
		var f = w / (this.nMax-this.nMin);
		if( this.fpsData.length >0 ) {
			c.moveTo( x0, y0-this.fpsData[0] );
			for( var i=1; i<this.fpsData.length; i++) {
				c.lineTo( x0 + i * f, y0-this.fpsData[i] );
			}
		}
		c.stroke();
		
		c.restore();		
	},
	draw : function(c) {
		BenchLab.supClass.draw.call(this, c);

		if( this.formula ) this.drawFormula(c);
	}		
});

hotjs.Util.BenchLab = BenchLab;

})();


// ------- hotjs-ui.js ------------- 


(function(){
	
var ShowBoard = function() {
	hotjs.base(this);
	
	this.subnodes = [];
	
	this.param = {
		width : 300,
		height : 400,
		margin : 20,
		padding : 10,
		rows : 1, // 1 row per page
		cols : 1, // 1 col per page
		dir : 0 // scroll X
	};
};

hotjs.inherit(ShowBoard, hotjs.Node, {
	addNode : function(sub) {
		ShowBoard.supClass.addNode.call(this, sub);
		this.updateLayout();
		return this;
	},
	setParam : function(p) {
		for( var i in p ) {
			this.param[i] = p[i];
		}
		if( this.param.dir == 0 ) {
			this.setMoveable(true, false);
			//this.setThrowable(true, false);
		} else {
			this.setMoveable(false, true);
			//this.setThrowable(false, true);
		}
		this.updateLayout();
		return this;
	},
	fixPos : function() {
		if( this.pos[0] > 0 ) this.pos[0] = 0;
		if( this.pos[1] > 0 ) this.pos[1] = 0;

		var minX = this.container.width() - this.size[0];
		var minY = this.container.height() - this.size[1];
		if( this.pos[0] < minX ) this.pos[0] = minX;
		if( this.pos[1] < minY ) this.pos[1] = minY;
	},
	onTouchEnd : function(t) {
		ShowBoard.supClass.onTouchEnd.call(this,t);

		var anchor = this.pos;
		var p = this.param;
		if( p.dir == 0 ) {
			var left = Math.floor(this.pos[0]/p.width) * p.width;
			var right = left + p.width;
			if( right >= p.width ) right = 0;
			
			if( this.gesture[0] <= 0 ) {
				anchor = [ left, anchor[1] ];
			} else {
				anchor = [ right, anchor[1] ];
			}
		} else {
			var top = Math.floor(this.pos[1]/p.height) * p.height;
			var bottom = top + p.height;
			if( bottom > p.height ) bottom = 0;
			
			if( this.gesture[1] <= 0 ) {
				anchor = [ anchor[0], top ];
			} else {
				anchor = [ anchor[0], bottom ];
			}
		}

		hotjs.Anim.create( this, 'MoveTo', { to:anchor, duration:0.3 } ).play();
	},
	updateLayout : function(){
		var nodes = this.subnodes;
		
		var p = this.param;
		var mg = p.margin || 0;
		var pad = p.padding || 0;
		var sp = p.spacing || 0;
		var rows = p.rows || 1;
		var cols = p.cols || 1;
		var dir = p.dir ? 1 : 0;
		var w = p.width || 300; w -= mg * 2;
		var h = p.height || 400; h -= mg * 2;
		var cw = w / cols, ch = h / rows;
		
		var pgc=0, pgr=0;
		for( var i=0, row=0, col=0; i<nodes.length; i++ ) {
			var n = nodes[i];
			n.pos[0] = cw * (col + cols * pgc) + mg * (1+pgc*2) + (cw - n.size[0])/2;
			n.pos[1] = ch * (row + rows * pgr) + mg * (1+pgr*2) + (ch - n.size[1])/2;
			
			if( ++ col >= cols ) {
				col = 0;
				if( ++ row >= rows ) {
					row = 0;
					if( dir ) {
						pgr ++;
					} else {
						pgc ++;
					}
				}
			}
		}
		pgc ++;
		pgr ++;
		if( col==0 && row==0 ) {
			if( dir ) {
				if( pgr>1 ) pgr --;
			} else {
				if( pgc>1 ){
					pgc --;
				}
			}
		}
		this.size[0] = (cw * cols + mg * 2) * pgc;
		this.size[1] = (ch * rows + mg * 2) * pgr;
		
		return this;
	},
	draw : function(c) {
		c.save();
		var nodes = this.subnodes;
		
		var p = this.param;
		var mg = p.margin || 0;
		var pad = p.padding || 0;
		var sp = p.spacing || 0;
		var rows = p.rows || 1;
		var cols = p.cols || 1;
		var dir = p.dir ? 1 : 0;
		var wd = p.width || 300; wd -= mg * 2;
		var ht = p.height || 400; ht -= mg * 2;
		var cw = wd / cols, ch = ht / rows;
		
		for( var i=0, row=0, col=0, pgc=0, pgr=0; i<nodes.length; i++ ) {
			var x = cw * (col + cols * pgc) + mg * (1+pgc*2) + sp;
			var y = ch * (row + rows * pgr) + mg * (1+pgr*2) + sp;
			var w = cw - sp * 2; 
			var h = ch - sp * 2;
			
			if(!! this.bgcolor ) {
				c.fillStyle = this.bgcolor;
				c.fillRect(x, y, w, h);
			}
			if(!! this.color) {
				c.strokeStyle = this.color;
				c.strokeRect(x, y, w, h);
			}
			// or c.fillRect() with color/pattern
			
			if( ++ col >= cols ) {
				col = 0;
				if( ++ row >= rows ) {
					row = 0;
					if( dir ) {
						pgr ++;
					} else {
						pgc ++;
					}
				}
			}
		}
		
		c.restore();
		return this;
	}
});

hotjs.ShowBoard = ShowBoard;

})();

// ------- hotjs-domui.js ------------- 


hotjs.domUI = hotjs.domUI || {};

(function(){

var dismiss = function( id_or_obj ) {
	var o = id_or_obj;
	if( typeof o == 'string' ) {
		o = document.getElementById( o );
	}
	if( typeof o == 'object' && o && o.parentNode ) {
		o.parentNode.removeChild( o );
	}
};

var toggle = function( id_or_obj, direction ) {
	var o = id_or_obj;
	if( typeof o == 'string' ) {
		o = document.getElementById( o );
	}
	direction = direction || 'bottom';

	var win = $(o), w = win.width(), h = win.height();
	var scrw = $(window).width(), scrh = $(window).height();

	var in_css = { 'top': o.style.top, 'left': o.style.left };

	var out_css = {};
	if( direction.indexOf('top') >= 0 ) out_css['top'] = -h-20 + 'px';
	if( direction.indexOf('left') >= 0 ) out_css['left'] = -h-20 + 'px';
	if( direction.indexOf('bottom') >= 0 ) out_css['top'] = scrh + 'px';
	if( direction.indexOf('right') >= 0 ) out_css['left'] = scrw + 'px';
	
	if( o.style.display == 'none' ) {
		win.css( out_css ).show().animate( in_css, 'normal', 'swing', function(){} );
	} else {
		win.animate( out_css, 'normal', 'swing', function(){ win.hide().css(in_css); } );
	}
};
	
var showSplash = function( show, content, style ) {
	if(! show) {
		dismiss( 'hotjs_splash_win' );
		return;
	}
	
	var div = document.getElementById('hotjs_splash_win');
	if(! div) {
		div = document.createElement('div');
		div.setAttribute('id', 'hotjs_splash_win');
		div.style.position = 'absolute';
		div.style.display = 'none';
		document.body.appendChild( div );
	}
	
	var win = $(div);
	
	if( typeof content == 'string' ) {
		div.innerHTML = ( "<table style='width:100%;height:100%;'><tr><td height='20%'>&nbsp;</td></tr><tr><td class='m'>" 
				+ content + "</td></tr><tr><td height='20%' class='m'><div id='hotjs_res_loading_win'></div></td></tr></table>" );
	}
	
	if( typeof style == 'string' ){
		div.style = style;
	} else if ( typeof style == 'object' ) {
		win.css( style );
	}
	
	var w = window.innerWidth, h = window.innerHeight;
	win.css({
		'margin' : '0px',
		'padding' : '0px',
		'top' : '0px',
		'left' : '0px',
		'width' : w + 'px',
		'height' : h + 'px',
		'text-align' : 'center',
		'vertical-align' : 'middle',
		'position' : 'absolute',
		'z-index' : '999',
		'display' : 'block'
	});
};

var popupDialog = function( title, content, buttons, style, direction ) {
	title = title || '';
	content = content || '&nbsp;';
	style = style || {};
	buttons = buttons || {};
	direction = direction || '';
	
	var dlgId = 'DLG' + Date.now();
	var idX = dlgId + "X";

	var div = document.createElement('div');
	document.body.appendChild( div );
	
	var win = $(div);
	win.attr({'id':dlgId, 'class':'dialog'}).css({'position':'absolute', 'display':'none' });
	
	var xfunc = buttons[ 'x' ];
	x_img = ( xfunc !== null ) ? "<img id='" + idX + "' class='dlgx clickable' src='" + resources.getXPng() + "'>" : '';
	
	var html = 
"<table class='dialog' cellspacing='0' cellpadding='0'>\
<tr><td class='dlg00'></td><td class='dlg01 m'></td><td class='dlg02'>" + x_img + "</td></tr>";
	
	if( title != '' ) html += "<tr><td class='dlg10'></td><td class='dlg11 m'>" + title + "</td><td class='dlg12'></td></tr>";

	html += "<tr><td class='dlg10'></td><td class='dlg11 m'><div class='dlg11'>" + content + "</div></td><td class='dlg12'></td></tr>";

	var btnHtml = "";
	for( var i in buttons ) {
		if( i === 'x' ) continue;
		var btnId = dlgId + i;
		btnHtml += "<button class='dialog' id='" + btnId  + "' v='" + i + "'>" + hotjs.i18n.get(i) + "</button> ";
	}
	if( btnHtml != '') html += "<tr><td class='dlg10'></td><td class='dlg11 m'>" + btnHtml + "</td><td class='dlg12'></td></tr>";

	html += "<tr><td class='dlg20'></td><td class='dlg21'></td><td class='dlg22'></td></tr></table>";
	
	div.innerHTML = html;
	
	var w = win.width(), h = win.height();
	var scrw = $(window).width(), scrh = $(window).height();
	
	var autodismiss = 0;
	var css = { 'top': (scrh-h)/2 + 'px', 'left': (scrw-w)/2 + 'px', 'opacity':1 };
	for( var k in style ) {
		if(k === 'dismiss') autodismiss = style[k];
		else css[ k ] = style[ k ];
	}
	
	var out_css = {'opacity':0};
	if( direction.indexOf('top') >= 0 ) out_css['top'] = -h-20 + 'px';
	else if( direction.indexOf('bottom') >= 0 ) out_css['top'] = scrh + 'px';
	else out_css['top'] = css['top'];
	
	if( direction.indexOf('left') >= 0 ) out_css['left'] = -h-20 + 'px';
	else if( direction.indexOf('right') >= 0 ) out_css['left'] = scrw + 'px';	
	else out_css['left'] = css['left'];

	div.dismiss = function() {
		if(direction === '') {
			win.css( out_css );
			if( div && div.parentNode ) div.parentNode.removeChild( div );
		} else {
			win.animate( out_css,'normal','swing', function(){
				if( div && div.parentNode ) div.parentNode.removeChild( div );
			});
		}
	};
	
	div.popup = function() {
		win.css( css ).show();
		if(autodismiss) window.setTimeout(function(){div.dismiss();}, autodismiss);
	};
	
	if( xfunc !== null ) {
		$('img#' + idX).on('click', function(e){ e.preventDefault();
			if(typeof xfunc === 'function') xfunc();
			div.dismiss();
		});
	}

	for( var i in buttons ) {
		var btnId = dlgId + i;
		$('button#' + btnId).on('click', function(){
			var i = $(this).attr('v');
			var func = buttons[i];
			if((typeof(func)==='function') && func()) {
				div.dismiss();
			}
		});
	}	

	div.popup();
	
	return div;
};

var showChatBubble = function( type, content, style, direction ) {
	type = type || 'left';
	content = content || '&nbsp;';
	style = style || {};
	direction = direction || 'top';
	
	var dlgId = 'DLG' + Date.now();
	var div = document.createElement('div');
	document.body.appendChild( div );
	
	var win = $(div);
	win.attr({'id':dlgId, 'class':'dialog'}).css({'position':'absolute', 'display':'none' });
	div.innerHTML = "<p class='bubble "+ type +"'>" + content + "</p>";
	
	var w = win.width(), h = win.height();
	var scrw = $(window).width(), scrh = $(window).height();
	
	var css = { 'top': (scrh-h)/2 + 'px', 'left': (scrw-w)/2 + 'px', 'opacity':1 };
	for( var k in style ) {
		css[ k ] = style[ k ];
	}
	
	var out_css = {'opacity':0};
	if( direction.indexOf('top') >= 0 ) out_css['top'] = -h-20 + 'px';
	else if( direction.indexOf('bottom') >= 0 ) out_css['top'] = scrh + 'px';
	else out_css['top'] = css['top'];
	
	if( direction.indexOf('left') >= 0 ) out_css['left'] = -h-20 + 'px';
	else if( direction.indexOf('right') >= 0 ) out_css['left'] = scrw + 'px';	
	else out_css['left'] = css['left'];

	div.popup = function() {
		win.css( css ).show();
	};
	
	div.dismiss = function() {
		win.animate( out_css,'normal','swing', function(){
			if( div && div.parentNode ) {
				div.parentNode.removeChild( div );
			}
		}); 
	};

	div.popup();
	
	return div;
};

hotjs.domUI = {
	pngX: function(){ return resources.getXPng(); },
	dismiss: dismiss,
	toggle : toggle,
	showSplash : showSplash,
	popupDialog : popupDialog,
	showChatBubble : showChatBubble
};
	
})();
// ------- hotjs-i18n.js ------------- 


hotjs = hotjs || {};

hotjs.i18n = {

	defaultLang : 'en',
	cookievalid : 86400000, //1 day (1000*60*60*24)
	text : {},

	put: function(lang, text) {
		if( this.text[ lang ] === undefined ) {
			this.text[ lang ] = {};
		}
		var L = this.text[ lang ];
		for( var k in text ) {
			L[k] = text[k];
		}
		return this;
	},
	extractLang : function(kvl) {
		var lang;
		for ( var i in kvl) {
			var kv = kvl[i].split('=');
			if (kv[0] === 'lang')
				lang = kv[1].length > 2 ? (kv[1].charAt(0) + kv[1].charAt(1)) : kv[1];
		}
		return lang;
	},
	getUrlLang : function() {
		if (window.location.search.length < 2)
			return undefined;
		return this.extractLang(window.location.search.substring(1).split('&'));
	},
	getCookieLang : function() {
		return this.extractLang(document.cookie.split('; '));
	},
	getLang : function() {
		if (typeof this.lang !== 'string') {
			if (typeof (this.lang = this.getUrlLang()) === 'string')
				;
			else if (typeof (this.lang = this.getCookieLang()) === 'string')
				;
			else if (typeof (this.lang = navigator.language) === 'string')
				;
			else if (typeof (this.lang = navigator.userLanguage) === 'string')
				;
			else
				this.lang = this.defaultLang;
			
			if (this.lang.length > 2)
				this.lang = this.lang.charAt(0) + this.lang.charAt(1);
		}
		return this.lang;
	},
	setLang : function(lang, cook) {
		this.lang = lang;
		if (cook) {
			var wl = window.location, now = new Date(), time = now.getTime();
			time += this.cookievalid;
			now.setTime(time);
			document.cookie = 'lang=' + lang + ';path=' + wl.pathname + ';domain=' + wl.host + ';expires=' + now.toGMTString();
		}
		return this;
	},
	get : function(key) {
		var keys = key.split('.'), lang = this.getLang(), obj = this.text[lang];
		while (typeof obj !== 'undefined' && keys.length > 0)
			obj = obj[keys.shift()];
		return typeof obj === 'undefined' ? lang + '.' + key : obj;
	},
	t1 : function(item) {
		if (typeof item === 'object' && item instanceof Element) {
			var it = $(item), key = it.attr('i18n');
			it.removeClass('I18N');
			if (typeof key === 'undefined')
				key = it.text();
			it.attr('i18n', key).text(this.get(key));
		}
		return this;
	},
	translate : function(item) {
		//alert( JSON.stringify( this.text[this.getLang()] ) );
		var lang = this.getLang();
		if (typeof this.text[ lang ] === 'undefined') {
			resources.load('lang/' + lang + '.lang.js');
			return this;
		}
		if (typeof item === 'undefined') {
			item = $('[I18N]');
			$('.I18N').each(function() {
				if (!$.contains(item, this))
					item = item.add(this);
			});
		}
		if (item instanceof jQuery)
			for ( var i in item)
				this.t1(item[i]);
		else
			this.t1(item);
		return this;
	}

};

// ------- hotjs-ai.js ------------- 


hotjs = hotjs || {};
hotjs.AI = hotjs.AI || {};

(function(){

// TODO: AI Common Interface
var BasicAI = function(){
	hotjs.base(this);
};

hotjs.inherit( BasicAI, hotjs.Class, {
	init : function(conf) {
	},
	judge : function( puzzle ) {
	},
	solve : function( puzzle ) {
		return {};
	},
	reset : function() {
	},
	exit : function() {
	}
});

// TODO: Matrix
var Matrix = function(){
	hotjs.base(this);

	this.data = [];
	this.mapping = [];
};

hotjs.inherit(Matrix, BasicAI, {
	init : function(m, n, v) {
		this.data = hotjs.Matrix.create(m, n, v);
		this.resetMapping();
		
		return this;
	},
	setValue : function(v) {
		this.data = hotjs.Matrix.setValue( this.data, v );
		
		return this;
	},
	rows : function() {
		return this.data.length;
	},
	resetMapping : function() {
		var mtx = this.data;
		var map = [];
		for(var i=0, m=mtx.length; i<m; i++) {
			var r = mtx[i], mr = [];
			for(var j=0, n=r.length; j<n; j++) {
				mr.push( [j, i] );
			} 
			map.push( mr );
		}
		this.mapping = map;
		
		return this;
	},
	clone : function() {
		var o = new (this.constructor)();
		o.data = hotjs.Matrix.copy( this.data );
		o.mapping = hotjs.Matrix.copy( this.mapping );
		
		return o;
	},
	copy : function(mtx) {
		this.data = hotjs.Matrix.copy( mtx.data );
		this.mapping = hotjs.Matrix.copy( mtx.mapping );
		
		return this;
	},
	getData : function() {
		return this.data;
	},
	getMapping : function() {
		return this.mapping;
	},
	importData : function(data) {
		this.data = hotjs.Matrix.copy( data );
		this.resetMapping();
		
		return this;
	},
	importDataFromString : function(str, sep_col, sep_row) {
		this.data = hotjs.Matrix.fromString(str, sep_col, sep_row);
		this.resetMapping();
		
		return this;
	},
	toString : function(sep_col, sep_row){
		return hotjs.Matrix.toString(this.data, sep_col, sep_row);
	},
	exchangeValue : function(v1,v2){
		var mtx = this.data;
		for(var i=0, m=mtx.length; i<m; i++) {
			var r = mtx[i];
			for(var j=0, n=r.length; j<n; j++) {
				if( r[j] == v1 ) {
					r[j] = v2;
				} else if( r[j] == v2) {
					r[j] = v1;
				}
			}
		}
		return this;
	},
	countValue : function(v) {
		var c = 0;
		var mtx = this.data;
		for(var i=0, m=mtx.length; i<m; i++) {
			var r = mtx[i];
			for(var j=0, n=r.length; j<n; j++) {
				if( r[j] == v ) {
					c ++;
				}
			}
		}
		return c;
	},
	setValueByPos : function(x, y, v) {
		this.data[y][x] = v;
		return this;
	},
	getValuebyPos : function(x, y) {
		return this.data[y][x];
	},
	getPosByValue : function(v) {
		var points = [];
		var mtx = this.data;
		for(var i=0, m=mtx.length; i<m; i++) {
			var r = mtx[i];
			if(Number(r.join('')) === 0) continue;
			for(var j=0, n=r.length; j<n; j++) {
				if( r[j] === v ) {
					points.push([j,i]);
				}
			}
		}
		return points;
	},
	inverse : function() {
		this.data = hotjs.Matrix.inverse( this.data );
		this.mapping = hotjs.Matrix.inverse( this.mapping );
		
		return this;
	},
	flipLeftRight : function() {
		var dest = [], mapping = [];
		var mtx = this.data, mtxm = this.mapping;
		for(var i=0, m=mtx.length; i<m; i++) {
			var s = mtx[i], t = [], sm = mtxm[i], tm = [];
			for(var j=0, n=s.length; j<n; j++) {
				t.push( s[n-1 -j] );
				tm.push( sm[n-1 -j] );
			}
			dest.push( t );
			mapping.push( tm );
		}
		this.data = dest;
		this.mapping = mapping;
		
		return this;
	},
	flipUpDown : function() {
		var dest = [], mapping = [];
		var mtx = this.data, mtxm = this.mapping;
		for(var i=mtx.length-1; i>=0; i--) {
			dest.push( mtx[i] );
			mapping.push( mtxm[i] );
		}
		this.data = dest;
		this.mapping = mapping;
		
		return this;
	},
	leanRight45 : function() {
		var dest = [], mapping = [];
		var mtx = this.data, mtxm = this.mapping;
		var m = mtx.length, n = mtx[0].length;
		var mm = m + n -1;
		for(var i=0; i<mm; i++) {
			var t = [], tm = [];
			for(var j=0; j<=i; j++) {
				if( (i-j)<m && j<n ) {
					t.push( mtx[i-j][j] );
					tm.push( mtxm[i-j][j] ); // x,y || col,row
				}
			}
			dest.push(t);
			mapping.push(tm);
		}
		this.data = dest;
		this.mapping = mapping;
		
		return this;
	},
	leanLeft45 : function() {
		var dest = [], mapping = [];
		var mtx = this.data, mtxm = this.mapping;
		var m = mtx.length, n = mtx[0].length;
		var mm = m + n -1;
		for(var i=0; i<mm; i++) {
			var t = [], tm = [];
			for(var j=i; j>=0; j--) {
				if( (i-j)<m && j<n ) {
					t.push( mtx[i-j][n-1-j] );
					tm.push( mtxm[i-j][n-1-j] ); // x,y || col,row
				}
			}
			dest.push(t);
			mapping.push( tm );
		}
		this.data = dest;
		this.mapping = mapping;
		
		return this;
	}
});

//TODO: GoAI
var GoAI = function(){
	hotjs.base(this);
	
	this.char_style = {
			level: 1,
			think_time: 500,
			attack_factor: 1.2
	};
};

hotjs.inherit(GoAI, BasicAI, {
	setCharStyle : function( c ) {
		this.char_style = {
				level: c.level,
				think_time: c.think_time,
				attack_factor: c.attack_factor
		};
		return this;
	},
	getCharStyle : function() {
		return this.char_style;
	}	
});

//TODO: GomokuAI
var GomokuAI = function(){
	hotjs.base(this);
	
	// '10111', 1, 1000
	// '11100', 3, 100
	// 2^5 = 32, +1
	this.patterns = [];
	this.char_style = {
			level: 1,
			think_time: 500,
			attack_factor: 1.2
	};
};

hotjs.inherit(GomokuAI, GoAI, {
	genPattern : function genPattern(str) {
		if(str == undefined) str = '';
		if( str.length < 5 ) {
			var ar = genPattern(str+'2'), ar2 = genPattern(str+'.');
			while( s = ar2.shift() ) {
				ar.push( s );
			}
			return ar;
		}
		return [ str ];
	},
	initPattern : function() {
		var ar = this.genPattern();
		for(var i=ar.length-1; i>=0; i--) {
			var str = ar[i];
			
			var n = 0;
			var loc = [];
			for(var j=str.length-1; j>=0; j--) {
				if(str[j] == '2') n++;
				else loc.push(j);
			}
			if( n >= 1 ) {
				var pt = [ str, n, Math.pow(10,(n-1)), loc ];
				//console.log( pt[0], pt[1], pt[2], pt[3] );
				this.patterns.push( pt );
			} else {
				// ignore pattern '00000'
			}
		}
		
		// another patten that must or easy to win
		this.addPattern( ['.2222.', 0, 5000, [0,5] ] );
		this.addPattern( ['.222.', 3, 500, [0,4] ] );
		this.addPattern( ['.2.2.', 2, 50, [2,0,4] ] );
		
		return this;
	},
	addPattern : function( p ) {
		var pts = this.patterns;
		for(var i=pts.length-1; i>=0; i--) {
			var pt = pts[i];
			if(pt[0] == p[0]) {
				// replace the hit score
				pt[2] = p[2]; 
				pt[3] = p[3];
				return this;
			}
		}
		this.patterns.push(p);
		return this;
	},
	setColor : function( c ) {
		c = '' + c;
		var pts = this.patterns;
		for(var i=pts.length-1; i>=0; i--) {
			var pt = pts[i];
			if( pt[0].indexOf(c) == -1 ) {
				if( c == '1' ) {
					pt[0] = pt[0].replace(/2/g, c);
				} else {
					pt[0] = pt[0].replace(/1/g, c);
				}
			}
		}
		
		return this;
	},
	findHits : function( m1, hit_factor ) {
		var pts = this.patterns;
		
		// prepare 4 matrix to search the patterns
		//hotjs.Matrix.log( m1.getData() );
		var ms = [];
		ms.push( m1 );
		ms.push( m1.clone().inverse() );
		ms.push( m1.clone().leanRight45() );
		ms.push( m1.clone().leanLeft45() );
		
		// record hit score with priority of patterns
		var hitRating = hotjs.Matrix.setValue( hotjs.Matrix.copy(m1.getData()), 0 );
		var winHits = [];

		for( var k=0; k<ms.length; k++ ) {
			//var k = 0;
			var mtx = ms[k].getData();
			var mtxmap = ms[k].getMapping();
			var mtxhit = hotjs.Matrix.setValue( hotjs.Matrix.copy( mtx ), 0 );
			
			// calc hit for each matrix
			for( var i=mtx.length-1; i>=0; i-- ) { // row
				var r = mtx[i];
				var rstr = r.join('');
				var rhit = mtxhit[i];
				var rmap = mtxmap[i];

				// let's search the patterns in each row
				for(var j=pts.length-1; j>=0; j--) {
					var pt = pts[j];
					var pstr = pt[0]; // pattern str
					var pn = pt[1];
					var phit = pt[2] * hit_factor; //+ priority_plus;
					var ploc = pt[3];
					
					var n = -1;
					while( (n = rstr.indexOf(pstr,n+1)) != -1 ) {
						if( pn == 5 ) {
							var win_hit = [];
							for(var p=4; p>=0; p--) {
								win_hit.push( rmap[ n + p ] );
							}
							winHits.push( win_hit );
							//console.log( rmap );
							//console.log( n, ploc, pt );
							//console.log( win_hit );
						} else {
							for(var p=ploc.length-1; p>=0; p--) {
								var x = n + ploc[p];
								if( r[x] == '.' ) { // still empty slot
									rhit[ x ] += phit;
								}
							}
						}
					}
				}
				
				// sum to single matrix according to mapping
				for(var j=rhit.length-1; j>=0; j--) {
					var pos = rmap[j];
					hitRating[ pos[1] ][ pos[0] ] += rhit[j];
				}
			}
		}
		
		return { 
			hitRating : hitRating, 
			winHits : winHits 
			};
	},
	getBestMove : function( hits ) {
		// default move is the center point
		var x0 = Math.floor(hits.length/2);
		var x = x0, y = x0, hit = 1;
		
		for(var i=hits.length-1; i>=0; i--) {
			var r = hits[i];
			for(var j=r.length-1; j>=0; j--) {
				var h = r[j];
				if( h > hit ) {
					x = j;
					y = i;
					hit = h;
				}
			}
		}
		
		return [x,y,hit];
	},
	getTopMoves : function( hits, count ) {
		var x0 = Math.floor(hits.length/2);
		var moves = [ [x0,x0,1] ];
		
		for(var i=hits.length-1; i>=0; i--) {
			var r = hits[i];
			for(var j=r.length-1; j>=0; j--) {
				var h = r[j];
				var move = [j,i,h];
				
				var n = moves.length;
				for( var k=0; k<n; k++) {
					if( h > moves[k][2] ) {
						moves.splice(k, 0, move);
						break;
					}
				}
				if( moves.length == n ) {
					if( n < count ) moves.push(move);
				}
				if( moves.length > count ) {
					moves.pop();
				}
			}
		}
		
		return moves;
	},
	solve : function( mtx_or_str ) {
		var m1 = new hotjs.AI.Matrix();
		if( Array.isArray( mtx_or_str ) ) {
			m1.importData( mtx_or_str );
		} else { 
			m1.importDataFromString( mtx_or_str );
		}
		
		var myHits = this.findHits( m1, this.char_style.attack_factor );
		var peerHits = this.findHits( m1.clone().exchangeValue('1','2'), 1 );
		
		var mergedRating = hotjs.Matrix.add( myHits.hitRating, peerHits.hitRating );
		var topMoves = this.getTopMoves( mergedRating, 5 );
		var bestMove = (topMoves.length>0) ? topMoves[0] : [Math.floor(m1.rows()/2),Math.floor(m1.rows()/2),1];
		return {
			myWinHits : myHits.winHits,
			peerWinHits : peerHits.winHits,
			bestMove : bestMove,
			topMoves : topMoves,
			hitRating : mergedRating
		};
	},
	deepThinking : function( mtx_or_str, depth ) {
		if( typeof depth == 'undefined' ) {
			depth = this.char_style.level -1;
		}
		
		var m1 = new hotjs.AI.Matrix();
		if( Array.isArray( mtx_or_str ) ) {
			m1.importData( mtx_or_str );
		} else { 
			m1.importDataFromString( mtx_or_str );
		}
		
		var myHits = this.findHits( m1, this.char_style.attack_factor );
		var peerHits = this.findHits( m1.clone().exchangeValue('1','2'), 1 );
		
		var mergedRating = hotjs.Matrix.add( myHits.hitRating, peerHits.hitRating );
		var topMoves = this.getTopMoves( mergedRating, 5 );
		var bestMove = (topMoves.length>0) ? topMoves[0] : [Math.floor(m1.rows()/2),Math.floor(m1.rows()/2),1];

		var notWinNow = (myHits.winHits.length == 0) && (peerHits.winHits.length == 0);
		var notWinNextStep = (bestMove[2] < 10000);
		//console.log( notWin, notWinNextStep, myHits.winHits.length, peerHits.winHits.length );
		if( notWinNow && notWinNextStep && (depth > 1) ) {
			//console.log( 'depth = ' + depth );
			
			for( var i=0; i<topMoves.length; i++ ) {
				var move = topMoves[i];
				var m2 = m1.clone();
				m2.setValueByPos( move[0], move[1], (m2.countValue('1')<=m2.countValue('2') ? '1' :'2')  );
				var result = this.deepThinking(m2.data, depth-1);
				if( result.myWinHits.length > 0 ) {
					move[2] += 1000;
				} else if( result.peerWinHits.length > 0 ) {
					move[2] -= 1000;
				} else {
					move[2] += result.bestMove[2] / 10;
				}
				mergedRating[ move[1] ][ move[0] ] = move[2];
			}
			topMoves.sort(function(a,b){
				if(a[2] > b[2]) return -1;
				else if(a[2] < b[2]) return 1;
				return 0;
			});
			bestMove = (topMoves.length>0) ? topMoves[0] : [Math.floor(m1.rows()/2),Math.floor(m1.rows()/2),1];
		}
		
		return {
			myWinHits : myHits.winHits,
			peerWinHits : peerHits.winHits,
			bestMove : bestMove,
			topMoves : topMoves,
			hitRating : mergedRating
		};
	},
	solveDeep : function( mtx_or_str ) {
		var think_start = Date.now();
		var result = this.deepThinking(mtx_or_str, this.char_style.level);
		var used_time = Date.now() - think_start;
		//console.log( used_time );
		return result;
	}
});

// TODO: PathFinder
var PathFinder = function(){
	hotjs.base(this);
};

hotjs.inherit(PathFinder, BasicAI, {
	solve : function( puzzle ) {
		var matrix = puzzle.matrix;
		var from = puzzle.from;
		var to = puzzle.to;
		var path = [];
		
		
		return path;
	}
});

hotjs.AI.BasicAI = BasicAI;
hotjs.AI.Matrix = Matrix;
hotjs.AI.GomokuAI = GomokuAI;
hotjs.AI.PathFinder = PathFinder;

})();

// ------- md5.js ------------- 

/*
 * JavaScript MD5 1.0.1
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 * 
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*jslint bitwise: true */
/*global unescape, define */

(function ($) {
    'use strict';

    /*
    * Add integers, wrapping at 2^32. This uses 16-bit operations internally
    * to work around bugs in some JS interpreters.
    */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
    * Bitwise rotate a 32-bit number to the left.
    */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
    * These functions implement the four basic operations the algorithm uses.
    */
    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }
    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
    * Calculate the MD5 of an array of little-endian words, and a bit length.
    */
    function binl_md5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var i, olda, oldb, oldc, oldd,
            a =  1732584193,
            b = -271733879,
            c = -1732584194,
            d =  271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i],       7, -680876936);
            d = md5_ff(d, a, b, c, x[i +  1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i +  2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i +  3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i +  4],  7, -176418897);
            d = md5_ff(d, a, b, c, x[i +  5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i +  6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i +  7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i +  8],  7,  1770035416);
            d = md5_ff(d, a, b, c, x[i +  9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12],  7,  1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22,  1236535329);

            a = md5_gg(a, b, c, d, x[i +  1],  5, -165796510);
            d = md5_gg(d, a, b, c, x[i +  6],  9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i],      20, -373897302);
            a = md5_gg(a, b, c, d, x[i +  5],  5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10],  9,  38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i +  4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i +  9],  5,  568446438);
            d = md5_gg(d, a, b, c, x[i + 14],  9, -1019803690);
            c = md5_gg(c, d, a, b, x[i +  3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i +  8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i + 13],  5, -1444681467);
            d = md5_gg(d, a, b, c, x[i +  2],  9, -51403784);
            c = md5_gg(c, d, a, b, x[i +  7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i +  5],  4, -378558);
            d = md5_hh(d, a, b, c, x[i +  8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i +  1],  4, -1530992060);
            d = md5_hh(d, a, b, c, x[i +  4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i +  7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13],  4,  681279174);
            d = md5_hh(d, a, b, c, x[i],      11, -358537222);
            c = md5_hh(c, d, a, b, x[i +  3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i +  6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i +  9],  4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i +  2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i],       6, -198630844);
            d = md5_ii(d, a, b, c, x[i +  7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i +  5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12],  6,  1700485571);
            d = md5_ii(d, a, b, c, x[i +  3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i +  1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i +  8],  6,  1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i +  6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i +  4],  6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i +  2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i +  9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }

    /*
    * Convert an array of little-endian words to a string
    */
    function binl2rstr(input) {
        var i,
            output = '';
        for (i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
    }

    /*
    * Convert a raw string to an array of little-endian words
    * Characters >255 have their high-byte silently ignored.
    */
    function rstr2binl(input) {
        var i,
            output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0;
        }
        for (i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        return output;
    }

    /*
    * Calculate the MD5 of a raw string
    */
    function rstr_md5(s) {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }

    /*
    * Calculate the HMAC-MD5, of a key and some data (raw strings)
    */
    function rstr_hmac_md5(key, data) {
        var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
            bkey = binl_md5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }

    /*
    * Convert a raw string to a hex string
    */
    function rstr2hex(input) {
        var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) +
                hex_tab.charAt(x & 0x0F);
        }
        return output;
    }

    /*
    * Encode a string as utf-8
    */
    function str2rstr_utf8(input) {
        return unescape(encodeURIComponent(input));
    }

    /*
    * Take string arguments and return either raw or hex encoded strings
    */
    function raw_md5(s) {
        return rstr_md5(str2rstr_utf8(s));
    }
    function hex_md5(s) {
        return rstr2hex(raw_md5(s));
    }
    function raw_hmac_md5(k, d) {
        return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
    }
    function hex_hmac_md5(k, d) {
        return rstr2hex(raw_hmac_md5(k, d));
    }

    function md5(string, key, raw) {
        if (!key) {
            if (!raw) {
                return hex_md5(string);
            }
            return raw_md5(string);
        }
        if (!raw) {
            return hex_hmac_md5(key, string);
        }
        return raw_hmac_md5(key, string);
    }

    if (typeof define === 'function' && define.amd) {
        define(function () {
            return md5;
        });
    } else {
        $.md5 = md5;
    }
}(this));

// ------- base64.js ------------- 

/*
 * $Id: base64.js,v 2.12 2013/05/06 07:54:20 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *    http://opensource.org/licenses/mit-license
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */

(function(global) {
    'use strict';
    if (global.Base64) return;
    var version = "2.1.2";
    // if node.js, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
        buffer = require('buffer').Buffer;
    }
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                   + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                   + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var btoa = global.btoa ? function(b) {
        return global.btoa(b);
    } : function(b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = buffer
        ? function (u) { return (new buffer(u)).toString('base64') } 
    : function (u) { return btoa(utob(u)) }
    ;
    var encode = function(u, urisafe) {
        return !urisafe 
            ? _encode(u)
            : _encode(u).replace(/[+\/]/g, function(m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    };
    var encodeURI = function(u) { return encode(u, true) };
    // decoder stuff
    var re_btou = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',
        '[\xE0-\xEF][\x80-\xBF]{2}',
        '[\xF0-\xF7][\x80-\xBF]{3}'
    ].join('|'), 'g');
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var atob = global.atob ? function(a) {
        return global.atob(a);
    } : function(a){
        return a.replace(/[\s\S]{1,4}/g, cb_decode);
    };
    var _decode = buffer
        ? function(a) { return (new buffer(a, 'base64')).toString() }
    : function(a) { return btou(atob(a)) };
    var decode = function(a){
        return _decode(
            a.replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    // that's it!
})(this);