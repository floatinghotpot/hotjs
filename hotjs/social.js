(function(){
	
hotjs.Social = hotjs.Social || {};

// TODO: AjaxClient 
// using jQuery/AJAX to handle network request 
var AjaxClient = function(){
	this.settings = {
		url : 'http://hotjshub.appspot.com/hotjsapi',
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
			403 : function(){ alert('access denied.' ); },		
			404 : function(){ alert('url not found.'); },
			405 : function(){ alert('method not allowed.'); },
			500 : function(){ alert('server error'); }
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
		// Set default values for future Ajax requests. 
		// Its use is not recommended. (according to jQuery doc, however, we can still handle it by ourselves.)
		// $.ajaxSetup ( this.settings );
	},
	sendMsg : function( data, url, options ) {
		var ajaxpkg = {};
		
		for( var i in this.settings ) ajaxpkg[i] = this.settings[i];
		if( !! options ) {
			for( var i in options ) ajaxpkg[i] = options[i];
		}
		if(!! data) ajaxpkg.data = data;
		if(!! url) ajaxpkg.url = url;
		
		// we add a tag of timestamp, server should return it as it is.
		ajaxpkg.data.tag = Date.now();
		console.log( ajaxpkg );
		
		var me = this;
		
		$.ajax( ajaxpkg )
			.done(function(data, textStatus, jqXHR){
				me.onMsgDone( data, textStatus, jqXHR );
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
	},
	onMsgComplete : function( data_or_jqXHR, textStatus, jqXHR_or_errorThrown ) {
		//console.log( "ajax complete" );
	},
	onMsgDone : function( data, textStatus, jqXHR ) {
		//console.log( "ajax done" );
		for( var i=0; i<data.length; i++ ) {
			this.parseMsg( data[i] );
		}
	},
	parseMsg : function( msg ) {
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
	requestMsg : function( data, url, options ) {
		var ajaxpkg = {};
		
		for( var i in this.settings ) ajaxpkg[i] = this.settings[i];
		if( !! options ) {
			for( var i in options ) ajaxpkg[i] = options[i];
		}
		if(!! data) ajaxpkg.data = data;
		if(!! url) ajaxpkg.url = url;
		ajaxpkg.async = false;
		
		// we add a tag of timestamp, server should return it as it is.
		ajaxpkg.data.tag = Date.now();
		console.log( ajaxpkg );
		
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
	// { api_name : "", ... }
	configURL : function( urls ) {
		if( typeof urls == 'string' ) {
			this.urls[ '_default_' ] = urls;
			this.settings.url = urls;
		} else if( typeof urls == 'object' ){
			for( var api in urls ) this.urls[ api ] = urls[ api ];
			this.settings.url = urls['_default_'];
		}
		console.log( this.urls );
		return this;
	},
	// interface: { api: "api_name", key1: value1, key2: value2, ... }
	callAPI : function( api, data ) {
		data.api = api;
		var url = this.urls[ api ];
		if(! url) url = this.urls[ '_default_' ];
		
		var msgs = this.requestMsg( data, url );
		if( msgs.length > 0 ) {
			var msg = msgs[0];
			//if( msg.api == api ) { // double check
				//delete msg.api;
				return msg;
			//}
		}
		return false;
	},
	hello : function hello() {
		var msg = this.callAPI( "hello", { name: 'hostjs' } );
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