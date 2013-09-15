
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

var toggle = function( id_or_obj, direction ) {
	var o = id_or_obj;
	if( typeof o == 'string' ) {
		o = document.getElementById( o );
	}
	direction = direction || 'bottom';

	var win = $(o), w = win.width(), h = win.height();
	var scrw = $(window).width(), scrh = $(window).height();

	var in_css = { 'top': o.style.top, 'left': o.style.left };

	var out_css = {};
	if( direction.indexOf('top') >= 0 ) out_css['top'] = -h-20 + 'px';
	if( direction.indexOf('left') >= 0 ) out_css['left'] = -h-20 + 'px';
	if( direction.indexOf('bottom') >= 0 ) out_css['top'] = scrh + 'px';
	if( direction.indexOf('right') >= 0 ) out_css['left'] = scrw + 'px';
	
	if( o.style.display == 'none' ) {
		win.css( out_css ).show().animate( in_css, 'normal', 'swing', function(){} );
	} else {
		win.animate( out_css, 'normal', 'swing', function(){ win.hide().css(in_css); } );
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
				+ content + "</td></tr><tr><td height='20%' class='m'><div id='hotjs_res_loading_win'></div></td></tr></table>" );
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

var popupDialog = function( title, content, buttons, style, direction ) {
	title = title || '';
	content = content || '&nbsp;';
	style = style || {};
	buttons = buttons || {};
	direction = direction || 'top';
	
	var dlgId = 'DLG' + Date.now();
	var idX = dlgId + "X";

	var div = document.createElement('div');
	document.body.appendChild( div );
	
	var win = $(div);
	win.attr({'id':dlgId, 'class':'dialog'}).css({'position':'absolute', 'display':'none' });
	
	x_img = "<img id='" + idX + "' class='dlgx clickable' src='" + resources.getXPng() + "'>";
	var html = 
"<table class='dialog' cellspacing='0' cellpadding='0'>\
<tr><td class='dlg00'></td><td class='dlg01 m'></td><td class='dlg02'>" + x_img + "</td></tr>";
	
	if( title != '' ) html += "<tr><td class='dlg10'></td><td class='dlg11 m'>" + title + "</td><td class='dlg12'></td></tr>";

	html += "<tr><td class='dlg10'></td><td class='dlg11 m'><div class='dlg11'>" + content + "</div></td><td class='dlg12'></td></tr>";

	var btnHtml = "";
	for( var i in buttons ) {
		var btnId = dlgId + i;
		btnHtml += "<button class='dialog' id='" + btnId  + "' v='" + i + "'>" + hotjs.i18n.get(i) + "</button> ";
	}
	if( btnHtml != '') html += "<tr><td class='dlg10'></td><td class='dlg11 m'>" + btnHtml + "</td><td class='dlg12'></td></tr>";

	html += "<tr><td class='dlg20'></td><td class='dlg21'></td><td class='dlg22'></td></tr></table>";
	
	div.innerHTML = html;
	
	var w = win.width(), h = win.height();
	var scrw = $(window).width(), scrh = $(window).height();
	
	var css = { 'top': (scrh-h)/2 + 'px', 'left': (scrw-w)/2 + 'px', 'opacity':1 };
	for( var k in style ) {
		css[ k ] = style[ k ];
	}
	
	var out_css = {'opacity':0};
	if( direction.indexOf('top') >= 0 ) out_css['top'] = -h-20 + 'px';
	else if( direction.indexOf('bottom') >= 0 ) out_css['top'] = scrh + 'px';
	else out_css['top'] = css['top'];
	
	if( direction.indexOf('left') >= 0 ) out_css['left'] = -h-20 + 'px';
	else if( direction.indexOf('right') >= 0 ) out_css['left'] = scrw + 'px';	
	else out_css['left'] = css['left'];

	div.popup = function() {
		win.css( out_css ).show().animate( css, 'normal','swing',function(){} );
	};
	
	div.dismiss = function() {
		win.animate( out_css,'normal','swing', function(){
			if( div && div.parentNode ) {
				div.parentNode.removeChild( div );
			}
		}); 
	};
	
	$('img#' + idX).on('click', div.dismiss);

	for( var i in buttons ) {
		var btnId = dlgId + i;
		$('button#' + btnId).on('click', function(){
			var i = $(this).attr('v');
			var func = buttons[i];
			if(func()) {
				div.dismiss();
			}
		});
	}	

	div.popup();
	
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