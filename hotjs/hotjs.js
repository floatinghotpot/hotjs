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
		if(true_or_false === null) true_or_false = true;
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

