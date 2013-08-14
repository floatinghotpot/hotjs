
hotjs.domUI = hotjs.domUI || {};

(function(){

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
	title = title || '';
	content = content || '';
	style = style || {};
	buttons = buttons || {};
	x_img = x_img || "<img class='dlgx clickable' src='" + resources.getXPng() + "'>";
	
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
<tr><td class='dlg10'></td><td class='dlg11 m'><div class='dlg11'>" + content + "</div></td><td class='dlg12'></td></tr>\
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
	pngX: function(){ return resources.getXPng(); },
	dismiss: dismiss,
	toggle : toggle,
	showSplash : showSplash,
	popupDialog : popupDialog
};
	
})();