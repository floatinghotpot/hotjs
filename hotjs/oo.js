// define a namespace for packaging
var PKG = {};

// parent class
PKG.A = function() {
	// private variable & function
	var m_Var0 = "var0";
	function func0() {
		m_Var0 = "var00";
	}
	// privileged variable & function
	this.m_Var1 = 'var1';
	this.funcM = function() {
		return m_Var0;
	}
}
// public variable & function
PKG.A.prototype.VarPub = 2;
PKG.A.prototype.func1 = function() {
	return 'a';
}
PKG.A.prototype.func2 = function() {
	return this.m_Var1;
}

// child class
PKG.B = function() {
	this.m_Var2 = 'var2';
}
// inherit
PKG.B.prototype = new PKG.A;
PKG.B.prototype.constructor = PKG.B;
PKG.B.prototype.parent = PKG.A;

// or write a tool func for inherit
Function.prototype.inheritsFrom = function(parentClassOrObject) {
	if (parentClassOrObject.constructor == Function) {
		//Normal Inheritance 
		this.prototype = new parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	} else {
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	}
	return this;
}

//PKG.B.inheritsFrom( PKG.A );

// override
PKG.B.prototype.func1 = function() {
	// call parent function
	var ret = this.parent.func1.call(this);
	return ret + '->' + 'b';
}

PKG.B.prototype.func3 = function() {
	return this.m_Var2;
}

// ---------------------------------------------------

var rnj = {};

