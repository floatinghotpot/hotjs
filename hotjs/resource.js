
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
	
	function clearCallback() {
		readyCallbacks = [];
		loadingCallbacks = [];
		errorCallbacks = [];
	}

	function loadingProgress(url,n,all) {
		var per = Math.round( n * 100 / all );
		var d = document.getElementById('loading_bar');
		if( d ) {
			d.style.width = 300 * per / 100 + 'px';
			d.innerHTML = per + "%";
		}
	}
	
	function loadingError(url){
		var d = document.getElementById('loading_msg');
		if( d ) {
			d.innerHTML += '<br>' + url.substring(url.lastIndexOf('/')+1) + ' not found.'; 
		}
	}

	function loadingDone(){
		d = document.getElementById('res_loading_msg_win');
		if( d ) {
			d.setAttribute('style', 'display:none');
		}
	}

	function showLoadingDialog(){
		var w = window.innerWidth, h = window.innerHeight;
		var tw = 300, th = 300;
		var x = (w-tw)/2, y = (h-th)/2;
		var d = document.createElement('div');
		d.setAttribute('id', 'res_loading_msg_win');
		d.setAttribute('style', 'width:'+tw+'px;text-align:center;border:solid black 1px;padding:10px;font-family:Verdana,Geneva,sans-serif;font-size:9pt;display:solid;position:absolute;left:' +x + 'px;top:' +y+'px;'  );
		d.innerHTML += "<br><img id='loading_img' src='data:image/gif;base64,R0lGODlhNgA3APMAAP///wAAAHh4eBwcHA4ODtjY2FRUVNzc3MTExEhISIqKigAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAANgA3AAAEzBDISau9OOvNu/9gKI5kaZ4lkhBEgqCnws6EApMITb93uOqsRC8EpA1Bxdnx8wMKl51ckXcsGFiGAkamsy0LA9pAe1EFqRbBYCAYXXUGk4DWJhZN4dlAlMSLRW80cSVzM3UgB3ksAwcnamwkB28GjVCWl5iZmpucnZ4cj4eWoRqFLKJHpgSoFIoEe5ausBeyl7UYqqw9uaVrukOkn8LDxMXGx8ibwY6+JLxydCO3JdMg1dJ/Is+E0SPLcs3Jnt/F28XXw+jC5uXh4u89EQAh+QQJCgAAACwAAAAANgA3AAAEzhDISau9OOvNu/9gKI5kaZ5oqhYGQRiFWhaD6w6xLLa2a+iiXg8YEtqIIF7vh/QcarbB4YJIuBKIpuTAM0wtCqNiJBgMBCaE0ZUFCXpoknWdCEFvpfURdCcM8noEIW82cSNzRnWDZoYjamttWhphQmOSHFVXkZecnZ6foKFujJdlZxqELo1AqQSrFH1/TbEZtLM9shetrzK7qKSSpryixMXGx8jJyifCKc1kcMzRIrYl1Xy4J9cfvibdIs/MwMue4cffxtvE6qLoxubk8ScRACH5BAkKAAAALAAAAAA2ADcAAATOEMhJq7046827/2AojmRpnmiqrqwwDAJbCkRNxLI42MSQ6zzfD0Sz4YYfFwyZKxhqhgJJeSQVdraBNFSsVUVPHsEAzJrEtnJNSELXRN2bKcwjw19f0QG7PjA7B2EGfn+FhoeIiYoSCAk1CQiLFQpoChlUQwhuBJEWcXkpjm4JF3w9P5tvFqZsLKkEF58/omiksXiZm52SlGKWkhONj7vAxcbHyMkTmCjMcDygRNAjrCfVaqcm11zTJrIjzt64yojhxd/G28XqwOjG5uTxJhEAIfkECQoAAAAsAAAAADYANwAABM0QyEmrvTjrzbv/YCiOZGmeaKqurDAMAlsKRE3EsjjYxJDrPN8PRLPhhh8XDMk0KY/OF5TIm4qKNWtnZxOWuDUvCNw7kcXJ6gl7Iz1T76Z8Tq/b7/i8qmCoGQoacT8FZ4AXbFopfTwEBhhnQ4w2j0GRkgQYiEOLPI6ZUkgHZwd6EweLBqSlq6ytricICTUJCKwKkgojgiMIlwS1VEYlspcJIZAkvjXHlcnKIZokxJLG0KAlvZfAebeMuUi7FbGz2z/Rq8jozavn7Nev8CsRACH5BAkKAAAALAAAAAA2ADcAAATLEMhJq7046827/2AojmRpnmiqrqwwDAJbCkRNxLI42MSQ6zzfD0Sz4YYfFwzJNCmPzheUyJuKijVrZ2cTlrg1LwjcO5HFyeoJeyM9U++mfE6v2+/4PD6O5F/YWiqAGWdIhRiHP4kWg0ONGH4/kXqUlZaXmJlMBQY1BgVuUicFZ6AhjyOdPAQGQF0mqzauYbCxBFdqJao8rVeiGQgJNQkIFwdnB0MKsQrGqgbJPwi2BMV5wrYJetQ129x62LHaedO21nnLq82VwcPnIhEAIfkECQoAAAAsAAAAADYANwAABMwQyEmrvTjrzbv/YCiOZGmeaKqurDAMAlsKRE3EsjjYxJDrPN8PRLPhhh8XDMk0KY/OF5TIm4qKNWtnZxOWuDUvCNw7kcXJ6gl7Iz1T76Z8Tq/b7/g8Po7kX9haKoAZZ0iFGIc/iRaDQ40Yfj+RepSVlpeYAAgJNQkIlgo8NQqUCKI2nzNSIpynBAkzaiCuNl9BIbQ1tl0hraewbrIfpq6pbqsioaKkFwUGNQYFSJudxhUFZ9KUz6IGlbTfrpXcPN6UB2cHlgfcBuqZKBEAIfkECQoAAAAsAAAAADYANwAABMwQyEmrvTjrzbv/YCiOZGmeaKqurDAMAlsKRE3EsjjYxJDrPN8PRLPhhh8XDMk0KY/OF5TIm4qKNWtnZxOWuDUvCNw7kcXJ6gl7Iz1T76Z8Tq/b7yJEopZA4CsKPDUKfxIIgjZ+P3EWe4gECYtqFo82P2cXlTWXQReOiJE5bFqHj4qiUhmBgoSFho59rrKztLVMBQY1BgWzBWe8UUsiuYIGTpMglSaYIcpfnSHEPMYzyB8HZwdrqSMHxAbath2MsqO0zLLorua05OLvJxEAIfkECQoAAAAsAAAAADYANwAABMwQyEmrvTjrzbv/YCiOZGmeaKqurDAMAlsKRE3EsjjYxJDrPN8PRLPhfohELYHQuGBDgIJXU0Q5CKqtOXsdP0otITHjfTtiW2lnE37StXUwFNaSScXaGZvm4r0jU1RWV1hhTIWJiouMjVcFBjUGBY4WBWw1A5RDT3sTkVQGnGYYaUOYPaVip3MXoDyiP3k3GAeoAwdRnRoHoAa5lcHCw8TFxscduyjKIrOeRKRAbSe3I9Um1yHOJ9sjzCbfyInhwt3E2cPo5dHF5OLvJREAOwAAAAAAAAAAAA=='/>";
		d.innerHTML += "<br><div id='loading_msg'></div>";
		d.innerHTML += "<br><div style='border:solid black 1px;'><div id='loading_bar' style='text-align:center;width:0px;height:16px;background:#008800;color:white;border:solid silver 1px;'></div></div>";
		document.body.appendChild( d );
	}
	
	// Load an resource url or an array of resource urls
	function load( urlOrArr, callbacks ) {
		showLoadingDialog();
		
		if( callbacks != undefined ) {
			readyCallbacks = [];
			loadingCallbacks = [];
			errorCallbacks = [];
			
			readyCallbacks.push( loadingDone );
			loadingCallbacks.push( loadingProgress );
			errorCallbacks.push( loadingError );

			if( typeof callbacks.ready == 'function' ) {
				readyCallbacks.push( callbacks.ready );
			}
			if( typeof callbacks.loading == 'function' ) {
				loadingCallbacks.push( callbacks.loading );
			}
			if( typeof callbacks.error == 'function' ) {
				errorCallbacks.push( callbacks.error );
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
		clearCallback : clearCallback,
		isReady : isReady
	};
})();
