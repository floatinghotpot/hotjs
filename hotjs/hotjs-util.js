
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

