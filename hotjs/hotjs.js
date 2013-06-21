// name space
var hotjs = hotjs || {};

(function(){

hotjs.version = 1.0;

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
		throw Error('goog.base called from a method of one name '
				+ 'to a method of a different name');
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

//[].indexOf(value)
if (!Array.prototype.indexOf) {
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
	addTo : function(container, id) {
		container.addNode(this, id);
		return this;
	}	
};
		
// ----------------------
// TODO: class App

var App = function(){
	hotjs.base(this);
	
	hotjs_app = this;
	hotjs_lastTime = Date.now();
	
	this.views = [];
	this.runningTime = 0;
};

hotjs.inherit(App, hotjs.Class, {
	addNode : function(v) {
		this.views.push(v);
		return this;
	},
	start : function() {
		for(var i=0; i<this.views.length; i++) {
			this.views[i].start();
		}
		return this;
	},
	resume : function( true_or_false ) {
		for(var i=0; i<this.views.length; i++) {
			this.views[i].resume( true_or_false );
		}
		return this;
	},	
	pause : function() {
		for(var i=0; i<this.views.length; i++) {
			this.views[i].resume( false );
		}
		return this;
	}
});

// TODO: export to external

hotjs.HashMap = HashMap;
hotjs.App = App;

})(); 

