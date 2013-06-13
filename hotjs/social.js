(function(){
	
hotjs.Social = hotjs.Social || {};

// will use jQuery/AJAX to handle network request 
var AjaxClient = function(){
	this.settings = {
		url : 'http://hotjshub.appspot.com/hotjsapi',
		cache : false,
		data : {},
		processData : true,
		type : 'POST',
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
	sendMsg : function( data, url ) {
		var ajaxpkg = {};
		
		for( var i in this.settings ) ajaxpkg[i] = this.settings[i];
		if(!! data) ajaxpkg.data = data;
		if(!! url) ajaxpkg.url = url;
		
		// we add a tag of timestamp, server should return it as it is.
		ajaxpkg.data.timestamp = Date.now();
		console.log( ajaxpkg );
		
		var me = this;
		
		$.ajax( ajaxpkg )
			.done(function(data, textStatus, jqXHR){
				console.log( "ajax done" );
				me.onMsgDone( data, textStatus, jqXHR );
			})
			.fail(function(jqXHR, textStatus, errorThrown){
				console.log( "ajax fail" );
				me.onMsgFail( jqXHR, textStatus, errorThrown );
			})
			.complete(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown){
				console.log( " ajax complete" );
				me.onMsgComplete( data_or_jqXHR, textStatus, jqXHR_or_errorThrown );
			});
		
		return true;
	},
	onMsgDone : function( data, textStatus, jqXHR ) {
		for( var i=0; i<data.length; i++ ) {
			this.parseMsg( data[i] );
		}
	},
	onMsgFail : function( jqXHR, textStatus, errorThrown ) {
	},
	onMsgComplete : function( data_or_jqXHR, textStatus, jqXHR_or_errorThrown ) {
	},
	parseMsg : function( msg ) {
		console.log( msg );
		
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
	}
};

var User = function(){
	this.urls = {};

	this.username = null;
	this.passwd = null;
	
	this.session = null;

	this.profile = null;
	this.status = null;
	
	this.friends = null;
	this.blacklist = null;
};

User.prototype = {
	// { purpose : "", ... }
	configURL : function( urls ) {
		
	},
	registerAccount : function(username, passwd, email, cellphone) {
		
	},
	deleteAccount : function() {
		
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
};

hotjs.Social.AjaxClient = AjaxClient;
hotjs.Social.User = User;

})();