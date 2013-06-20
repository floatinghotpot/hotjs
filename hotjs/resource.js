
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

	function isVideo(url) {
		var ext = url.substring( url.lastIndexOf('.') +1 );
		if( (ext == 'ogg') ) {
			return ( url.indexOf('video') > -1 );
		} else {
			return ( ['mp4', 'webm'].indexOf(ext) > -1);
		}
	}
	
	function isAudio(url) {
		var ext = url.substring( url.lastIndexOf('.') +1 );
		if( (ext == 'ogg') ) {
			return ( url.indexOf('video') == -1 );
		} else {
			return ( ['mp3', 'wav'].indexOf(ext) > -1);
		}
	}
	
	function _load(url) {
		if (resourceCache[url]) {
			return resourceCache[url];
		} else {
			resourceCache[url] = false;
			total ++;

			var res;
			var isvideo = isVideo(url), isaudio = isAudio(url);
			if( isvideo ) {
				res = new Video();
			} else if( isaudio ) {
				res = new Audio();
			} else {
				res = new Image();
			}
			
			var onload = function(){
				resourceCache[url] = res;
				loaded ++;

				loadingCallbacks.forEach(function(func){
					func(res.src, loaded, total);
				});

				if (isReady()) {
					readyCallbacks.forEach(function(func) {
						func();
					});
				}
			};
			var onerror = function() {
				errorCallbacks.forEach(function(func){
					func(res.src);
				});
			};
			
			if( isvideo || isaudio ) {
				res.addEventListener('canplaythrough', onload);
				res.addEventListener('error', onerror);
				res.setAttribute('src', url);
				res.load();
			} else {
				res = new Image();
				res.onload = onload;
				res.onerror = onerror;
				res.setAttribute('src', url);
			}
			
			return res;
		}
	}

	function get(url) {
		var res = resourceCache[url];
		if(! res) {
			var isvideo = isVideo(url), isaudio = isAudio(url);
			if( isvideo ) {
				res = new Video();
				res.setAttribute('src', url);
				res.load();
			} else if( isaudio ) {
				res = new Audio();
				res.setAttribute('src', url);
				res.load();
			} else {
				res = new Image();
				res.setAttribute('src', url);
			}			
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
