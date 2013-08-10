
hotjs.domUI = hotjs.domUI || {};

(function(){
var pngX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpFNTQ4MDYzRUUzRjcxMUUyOURFRUYzMDcwRjUyN0U4OSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpFNTQ4MDYzRkUzRjcxMUUyOURFRUYzMDcwRjUyN0U4OSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjJGRTkyMTc1RTNGMDExRTI5REVFRjMwNzBGNTI3RTg5IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjJGRTkyMTc2RTNGMDExRTI5REVFRjMwNzBGNTI3RTg5Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8++2P9ygAACSZJREFUeNrkV3uM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';

var dismiss = function( id_or_obj ) {
	var o = id_or_obj;
	if( typeof o == 'string' ) {
		o = document.getElementById( o );
	}
	if( typeof o == 'object' && o && o.parentNode ) {
		o.parentNode.removeChild( o );
	}
};

var toggle = function( id_or_obj ) {
	var o = id_or_obj;
	if( typeof o == 'string' ) {
		o = document.getElementById( o );
	}
	if( o.style.display == 'none' ) {
		o.style.display = 'block';
	} else {
		o.style.display = 'none';
	}
};
	
var showSplash = function( show, content, style ) {
	if(! show) {
		dismiss( 'hotjs_splash_win' );
		return;
	}
	
	var div = document.getElementById('hotjs_splash_win');
	if(! div) {
		div = document.createElement('div');
		div.setAttribute('id', 'hotjs_splash_win');
		div.style.position = 'absolute';
		div.style.display = 'none';
		document.body.appendChild( div );
	}
	
	var win = $(div);
	
	if( typeof content == 'string' ) {
		div.innerHTML = ( "<table style='width:100%;height:100%;'><tr><td class='m'>" 
				+ content + "<br/><div id='hotjs_res_loading_win'></div></td></tr></table>" );
	}
	
	if( typeof style == 'string' ){
		div.style = style;
	} else if ( typeof style == 'object' ) {
		win.css( style );
	}
	
	var w = window.innerWidth, h = window.innerHeight;
		win.css({
			'margin' : '0px',
			'padding' : '0px',
			'top' : '0px',
			'left' : '0px',
			'width' : w + 'px',
			'height' : h + 'px',
			'text-align' : 'center',
			'vertical-align' : 'middle',
			'position' : 'absolute',
			'z-index' : '999',
			'display' : 'block'
		});
};

var popupDialog = function( title, content, buttons, style, x_img ) {
	title = title || 'dialog';
	content = content || '';
	style = style || {};
	buttons = buttons || {};
	x_img = x_img || "<img class='dlgx' src='" + pngX + "'>";
	
	var dlgId = 'DLG' + Date.now();
	var div = document.createElement('div');
	document.body.appendChild( div );
	
	var win = $(div);
	win.attr('id', dlgId);
	win.attr('class', 'dialog');
	win.css({'position':'absolute', 'display':'none'});
	
	var btnHtml = "";
	for( var i in buttons ) {
		var btnId = dlgId + i;
		btnHtml += "<button class='dialog' id='" + btnId  + "' v='" + i + "'>" + hotjs.i18n.get(i) + "</button> ";
	}

	var idX = dlgId + "X";
	x_img = x_img.replace( '<img', "<img id='" + idX + "'" );
	div.innerHTML = 
"<table class='dialog' cellspacing='0' cellpadding='0'>\
<tr><td class='dlg00'></td><td class='dlg01 m'></td><td class='dlg02'>" + x_img + "</td></tr>\
<tr><td class='dlg10'></td><td class='dlg11 m'>" + title + "</td><td class='dlg12'></td></tr>\
<tr><td class='dlg10'></td><td class='dlg11 m'>" + content + "</td><td class='dlg12'></td></tr>\
<tr><td class='dlg10'></td><td class='dlg11 m'>" + btnHtml + "</td><td class='dlg12'></td></tr>\
<tr><td class='dlg20'></td><td class='dlg21'></td><td class='dlg22'></td></tr>\
</table>";
	
	$('img#' + idX).on('click', function(){ dismiss(dlgId); });

	for( var i in buttons ) {
		var btnId = dlgId + i;
		$('button#' + btnId).on('click', function(){
			var i = $(this).attr('v');
			var func = buttons[i];
			if(func()) dismiss( dlgId );
		});
	}	

	var w = window.innerWidth, h = window.innerHeight;
	win.css({ 'top': ((h-win.height())/2-10) + 'px', 'left': (w-win.width())/2 + 'px', 'display':'block' });

	if( typeof style == 'string' ) {
		div.style = style + ';position:absolute;';
	} else {
		win.css( style );
	}
	
	return div;
};

hotjs.domUI = {
	pngX: pngX,
	dismiss: dismiss,
	toggle : toggle,
	showSplash : showSplash,
	popupDialog : popupDialog
};
	
})();