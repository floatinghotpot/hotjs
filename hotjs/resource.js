
// merged into hotjs.js as a basic class.

(function() {

	var resourceCache = {};
	
	var total = 0;
	var loaded = 0;

	function getTotal() {
		return total;
	}
	function getLoaded() {
		return loaded;
	}
	
	function loadingProgress(url, n, all) {
		var per = Math.round( 100 * n / all );
		var d = document.getElementById('loading_msg');
		if( d ) {
			d.innerHTML = per + "% (" + n + '/' + all + ')';
		}
	}
	
	function loadingError(url){
		var d = document.getElementById('loading_msg');
		if( d ) {
			d.innerHTML = 'error loading: ' + url.substring(url.lastIndexOf('/')+1); 
		}
	}

	function loadingDone(){
		d = document.getElementById('res_loading_msg_win');
		if( d ) {
			d.setAttribute('style', 'display:none');
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
	
	function showLoadingDialog(){
		var w = window.innerWidth, h = window.innerHeight;
		var tw = 100, th = 300;
		var x = (w-tw)/2, y = (h-th)/2;
		var d = document.createElement('div');
		d.setAttribute('id', 'res_loading_msg_win');
		d.setAttribute('style', 
				'left:' +x + 'px;top:' +y+'px;width:'+tw+'px;text-align:center;alpha:0.5;background:silver;border:solid silver 1px;padding:10px;font-family:Verdana,Geneva,sans-serif;font-size:9pt;display:solid;position:absolute;'
				+ '-moz-border-radius:10px;-webkit-border-radius: 10px;-khtml-border-radius: 10px;border-radius: 10px;'
				);
		d.innerHTML += "<br><img id='loading_img' src='data:image/gif;base64,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'/>";
		d.innerHTML += "<br><br><div id='loading_msg'>0%</div>";
		document.body.appendChild( d );
	}
	
	// Load an resource url or an array of resource urls
	function load( urlOrArr, callbacks ) {
		showLoadingDialog();
		
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
	
	function isScript(url) {
		return url.endsWith('.js');
	}
	
	function _load(url) {
		if ( url in resourceCache ) {
			return;
			
		} else {
			var res;
			
			var is_video = isVideo(url), is_audio = isAudio(url), is_script = isScript(url);
			if( is_video ) {
				res = new Video();
			} else if( is_audio ) {
				res = new Audio();
			} else if( is_script ){
				var abs_url = hotjs.getAbsPath(url, document.location.href);
				var ss = document.getElementsByTagName('script');
				for(var i=0; i<ss.length; i++) {
					if( ss[i].src == abs_url ) return ss[i];
				}
				res = document.createElement('script');
			} else {
				res = new Image();
			}
			
			resourceCache[url] = false;
			total ++;

			var onload = function(){
				resourceCache[url] = res;
				loaded ++;
				console.log( url + ' preloaded (' + loaded + '/' + total + ')'  );

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
			
			if( is_video || is_audio ) {
				res.addEventListener('canplay', onload);
				res.setAttribute('preload', 'auto');
				//document.body.appendChild( res );
			} else if ( is_script ) {
				res.async = true;
				res.addEventListener('load', onload);
				var ss = document.getElementsByTagName('script');
				ss[0].parentNode.insertBefore(res, ss[0]);
			} else {
				res.addEventListener('load', onload);
			}
			
			res.addEventListener('error', onerror);
			res.setAttribute('src', url);
			
			return res;
		}
	}

	function get(url) {
		var res = resourceCache[url];
		if(! res) {
			var is_video = isVideo(url), is_audio = isAudio(url), is_script = isScript(url);
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
				ss[0].parentNode.insertBefore(res, ss[0]);				
			} else {
				res = new Image();
				res.setAttribute('src', url);
			}
			resourceCache[ url ] = res;
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
