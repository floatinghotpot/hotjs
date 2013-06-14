(function(){
	
hotjs.Social = hotjs.Social || {};

// TODO: AjaxClient 
// using jQuery/AJAX to handle network request 
var AjaxClient = function(){
	this.settings = {
		url : 'http://msghub.hotjs.net/api',
		cache : false,
		data : {},
		processData : true,
		type : 'POST',
		async : false,
		timeout : 10000,	// 10 sec
		dataType : 'json',
		//dataType : 'html',
		crossDomain : false,
		context : document.body,
		statusCode : {
			403 : function(){ console.log('access denied.' ); },	
			404 : function(){ console.log('url not found.'); },
			405 : function(){ console.log('method not allowed.'); },
			500 : function(){ console.log('server error'); }
		}		
	};
	
	this.msgMax = 100;
	this.msgList = [];

	this.urls = {};
};

AjaxClient.prototype = {
	config : function( set ){
		if( set.msgMax != undefined ) {
			this.msgMax = set.msgMax;
			delete set.msgMax;
		}
		for( var s in set ) {
			this.settings[ s ] = set[ s ];
		}
		// $.ajaxSetup ( this.settings );
		// Set default values for future Ajax requests. Its use is not recommended (according to jQuery doc). 
		// (so we can just handle it by ourselves.)
	},
	// { api_name : "http://msghub.hotjs.net/api/default.py", ... }
	configAPI : function( urls ) {
		if( typeof urls == 'string' ) {
			this.urls[ '_default_' ] = urls;
		} else if( typeof urls == 'object' ){
			for( var api in urls ) this.urls[ api ] = urls[ api ];
		}
		this.settings.url = this.urls['_default_'];
		
		return true;
	},
	// list API in following format:
/*
{
	"module" : "usermgmt",
	"version" : 2.0,
	"base" : "http://msghub.hotjs.net/api/usermgmt/",
	"list" : [ 
		{ "api": "_default_", "url" : "default.py", "param": [ "param1", "param2",  ... ], "comment" : "whatever" }, ... 
		{ "api": "api_name", "url" : "hello.php", "param": [ "param1", "param2",  ... ], "comment" : "whatever" }, ... 
	]
} 
*/
	loadAPI : function( inf_url, mod, req_ver ) {
		var msg = this.requestMsg( { module: mod, version: req_ver }, inf_url, { type:'GET' } );
		
		if( ! msg ) return false;
		if( ! Array.isArray(msg.list) ) return false;
		//if( msg.module != mod ) return false;
		//if( msg.version < req_ver ) return false;
		
		// if no base specified, then assume the same server & folder
		var base_url = msg.base;
		if( base_url == "" ) {
			base_url = inf_url.substring(0, inf_url.lastIndexOf('/'));
		}
		
		for( var i=0; i<msg.list.length; i++ ) {
			var entry = msg.list[i];
			if( entry.url.indexOf("://") > -1)
				this.settings.url[ entry.api ] = entry.url;
			else
				this.settings.url[ entry.api ] = base_url + entry.url;
		}
		
		return true;
	},
	requestMsg : function( data, url, options ) {
		var ajaxpkg = {};
		
		for( var i in this.settings ) ajaxpkg[i] = this.settings[i];
		if( !! options ) for( var i in options ) ajaxpkg[i] = options[i];
		if( !! data ) ajaxpkg.data = data;
		if( !! url ) ajaxpkg.url = url;
		ajaxpkg.async = false;
		
		// we add a tag of timestamp, server should return it as it is.
		ajaxpkg.data.tag = Date.now();

		var me = this;
		var msgs = false;
		
		$.ajax( ajaxpkg )
			.done(function(data, textStatus, jqXHR){
				msgs = data;
			})
			.fail(function(jqXHR, textStatus, errorThrown){
				me.onMsgFail( jqXHR, textStatus, errorThrown );
			})
			.complete(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown){
				me.onMsgComplete( data_or_jqXHR, textStatus, jqXHR_or_errorThrown );
			});
		
		return msgs;
	},
	sendMsg : function( data, url, options ) {
		var ajaxpkg = {};
		
		for( var i in this.settings ) ajaxpkg[i] = this.settings[i];
		if( !! options ) for( var i in options ) ajaxpkg[i] = options[i];
		if( !! data ) ajaxpkg.data = data;
		if( !! url ) ajaxpkg.url = url;
		
		// we add a tag of timestamp, server should return it as it is.
		ajaxpkg.data.tag = Date.now();
		
		var me = this;
		
		$.ajax( ajaxpkg )
			.done(function(data, textStatus, jqXHR){
				me.onMsgComing( data, textStatus, jqXHR );
			})
			.fail(function(jqXHR, textStatus, errorThrown){
				me.onMsgFail( jqXHR, textStatus, errorThrown );
			})
			.complete(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown){
				me.onMsgComplete( data_or_jqXHR, textStatus, jqXHR_or_errorThrown );
			});
		
		return true;
	},
	onMsgFail : function( jqXHR, textStatus, errorThrown ) {
		console.log( "ajax fail" );
		console.log( jqXHR, textStatus, errorThrown );
	},
	onMsgComplete : function( data_or_jqXHR, textStatus, jqXHR_or_errorThrown ) {
	},
	onMsgComing : function( data, textStatus, jqXHR ) {
		if( typeof data == "array" ) {
			for( var i=0; i<data.length; i++ ) {
				this.onMsgParse( data[i] );
			}
		} else {
			this.onMsgParse( data );
		}
	},
	onMsgParse : function( msg ) {
		// remove some if queue full
		var n = this.msgList.length;
		if( n >= this.msgMax ) {
			this.msgList.splice(0, n-1 - this.msgMax);
		}
		
		this.msgList.push( msg );
	},
	pickMsg : function() {
		return ( this.msgList.length > 0 ) ? this.msgList.shift() : false;
	},
	pickAllMsg : function() {
		var msgs = this.msgList;
		this.msgList = [];
		return msgs;
	},
	// input: { api: "api_name", key1: value1, key2: value2, ... }
	// output: { api: "api_name", key1: value1, key2: value2, ... }
	callAPI : function( api, data ) {
		data.api = api;
		var url = this.urls[ api ];
		if(! url) url = this.urls[ '_default_' ];
		
		var msg = this.requestMsg( data, url );
		if( typeof msg == "object" ) {
			//if( msg.api == api ) { // double check api, needed ? 
			return msg;
			//}
		}
		return false;
	},
	hello : function hello() {
		var msg = this.callAPI( arguments.callee.name, { name: 'hotjs' } );
		return (!! msg) ? msg.name : false;
	}
};

// TODO: User
var User = function(){
	hotjs.base(this);
	
	this.username = null;
	this.passwd = null;
	
	this.session = null;

	this.profile = null;
	this.status = null;
	
	this.friends = null;
	this.blacklist = null;
};

hotjs.inherit( User, AjaxClient, {

	registerAccount : function registerAccount(u, p, e, c) {
		var msg = this.callAPI( arguments.callee.name, {
			username : u,
			password : p,
			email : e,
			cellphone : c
		} );
		
		return (!! msg) ? msg.done : false;
	},
	deleteAccount : function deleteAccount() {
		
	},
	login : function(username, passwd, app, ver) {
		this.username = username;
		this.passwd = passwd;
		this.app = app;
		this.ver = ver;
		
	},
	logout : function() {
		this.sendMsg({
			sid : this.session,
			cmd : "logout"
		});
		this.session = null;
	},
	changePassword : function( oldpwd, newpwd ) {
		
	},
	// { public: {}, protected: {}, private: {} }
	updateProfile : function( data ) {
		
	},
	// get own profile
	getProfile : function() {
		
	},
	// query profile of others, may be many [ user1, user2, user3, ... ]
	queryProfile : function( users ) {
		
	},
	listFriend : function() {
		
	},
	addFriend : function( username, msg ) {
		
	},
	removeFriend : function( username ) {
		
	},
	updateStatus : function( s ) {
		
	},
	// query profile of others, may be many [ user1, user2, user3, ... ]
	queryStatus : function( users ) {
		
	},
});

hotjs.Social.AjaxClient = AjaxClient;
hotjs.Social.User = User;

})();