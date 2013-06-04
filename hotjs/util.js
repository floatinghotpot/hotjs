(function(){
	
hotjs.Util = hotjs.Util || {};

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
if (hotjs.Util.getDeviceInfo().ios) {
	window.addEventListener("load", function () {
		setTimeout(function () {
			document.body.scrollTop = 0;
		}, 300);
	});
}

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

})();

