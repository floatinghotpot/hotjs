
// merged into hotjs.js as a basic class.

(function() {
	var resourceCache = {};
	//var loading = [];
	
	var readyCallbacks = [];
	var loadingCallbacks = [];
	var errorCallbacks = [];
	
	var total = 0;
	var loaded = 0;

	function getTotal() {
		return total;
	}
	function getLoaded() {
		return loaded;
	}
	
	// func() {}
	function onReady(func) {
		readyCallbacks.push(func);
	}

	// func( url, loaded, total ) {}
	function onLoading(func) {
		loadingCallbacks.push(func);
	}
	
	// func( url ) {}
	function onError(func) {
		errorCallbacks.push(func);
	}

	// Load an resource url or an array of resource urls
	function load(urlOrArr) {
		if (urlOrArr instanceof Array) {
			urlOrArr.forEach(function(url) {
				_load(url);
			});
		} else {
			_load(urlOrArr);
		}
	}
	
	function unload(urlOrArr) {
		if (urlOrArr instanceof Array) {
			urlOrArr.forEach(function(url) {
				if ( resourceCache.hasOwnProperty(url) ) {
					delete resourceCache[ url ];
				}
			});
		} else {
			if ( resourceCache.hasOwnProperty(urlOrArr) ) {
				delete resourceCache[ url ];				
			}
		}
	}

	function newResByUrl(url) {
		var ext = url.substring( url.lastIndexOf('.') +1 );
		if( ext == 'ogg' ) {
			// we cannot tell audio/ogg or video/ogg only by ext name
			// so give us the hint in url, like: http://which.com/video/file.ogg
			if( url.indexOf('video') > -1 ) {
				res = new Video();
			} else {
				res = new Audio();
			}
		} else if( ['mp4', 'webm'].indexOf(ext) > -1) {
			res = new Video();
		} else if( ['mp3', 'wav'].indexOf(ext) > -1) {
			res = new Audio();
		} else {
			res = new Image();
		}
		return res;
	}
	
	function _load(url) {
		if (resourceCache[url]) {
			return resourceCache[url];
		} else {
			resourceCache[url] = false;
			total ++;

			var res = newResByUrl( url );
			res.onload = function() {
				resourceCache[url] = res;

				loaded ++;
				var me = this;
				loadingCallbacks.forEach(function(func){
					func(me.src, loaded, total);
				});

				if (isReady()) {
					readyCallbacks.forEach(function(func) {
						func();
					});
				}
			};
			res.onerror = function() {
				var me = this;
				errorCallbacks.forEach(function(func){
					func(me.src);
				});
			};
			
			// start async loading
			res.src = url;
			
			return res;
		}
	}

	function get(url) {
		var res = resourceCache[url];
		if(! res) {
			// if not found, async load it, but will not cache it.
			res = newResByUrl(url);
			
			// start async loading
			res.src = url;
		}
		return res;
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

	window.resources = {
		load : load,
		unload : unload,
		get : get,
		getTotal : getTotal,
		getLoaded : getLoaded,
		onReady : onReady,
		onLoading : onLoading,
		onError : onError,
		isReady : isReady
	};
})();
