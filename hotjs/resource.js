
// merged into hotjs.js as a basic class.

(function() {

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
					'left:' +x + 'px;top:' +y+'px;width:'+tw+'px;text-align:center;alpha:0.5;background:silver;border:solid silver 1px;padding:10px;display:solid;position:absolute;'
					+ '-moz-border-radius:10px;-webkit-border-radius: 10px;-khtml-border-radius: 10px;border-radius: 10px;'
					);
			document.body.appendChild( d );
		}
		d.style['font-family'] = 'Verdana,Geneva,sans-serif';
		d.style['font-size'] = '9pt';
		d.innerHTML = "<img id='loading_img' src='data:image/gif;base64,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'/>";
		d.innerHTML += "<br><br><div id='loading_msg'>0%</div>";
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
				ss[0].parentNode.insertBefore(res, ss[0]);
				res.setAttribute('src', url);
			} else if ( is_css ) {
				res.async = true;
				res.addEventListener('load', onload);
				var ss = document.getElementsByTagName('script');
				ss[0].parentNode.insertBefore(res, ss[0]);
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
				ss[0].parentNode.insertBefore(res, ss[0]);				
			} else {
				res = new Image();
				res.setAttribute('src', url);
			}
			resourceCache[ url ] = res;
		}
		return res;
	}
	
	var audio_muted = false;
	
	function muteAudio(b) {
		audio_muted = b;
	}
	function playAudio(url) {
		if( ! audio_muted ) {
			get(url).play();
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
		get : get,
		load : load,
		unload : unload,

		isReady : isReady,
		onReady : onReady,
		onLoading : onLoading,
		onError : onError,
		
		playAudio : playAudio,
		muteAudio : muteAudio,

		regApp : regApp,
		runAppFromJs : runAppFromJs,
		
		setDebug : function( true_or_false ) { resDebug = true_or_false; },
		getAll : function() { return resourceCache; },
		getActiveApp : function() { return activeApp; }
	};

})();
