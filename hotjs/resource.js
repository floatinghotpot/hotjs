
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
			d.innerHTML = per + "% (" + n + '/' + all + ')';
			if( resDebug ) {
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
				res.currentTime = 0;
			} else {
				window.plugins.LowLatencyAudio.stop( url );
			}
			audioCache[ url ] = 'stop';
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
		getXPng : function() { return pngX; },
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

		regApp : regApp,
		runAppFromJs : runAppFromJs,
		
		setDebug : function( true_or_false ) { resDebug = true_or_false; },
		getAll : function() { return resourceCache; },
		getActiveApp : function() { return activeApp; }
	};

})();
