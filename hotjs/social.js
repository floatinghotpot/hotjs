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
	
	// login info
	this.username = "";
	this.password = "";
	this.app = "hotjs";
	this.version = hotjs.version;
	
	// generated by server after authentication.
	this.session = "";		

	this.profile = {};
	this.status = {};
	this.tag = [];
	this.friends = [];
};

hotjs.inherit( User, AjaxClient, {

	registerAccount : function registerAccount(u, p, fn, e, c) {
		var msg = this.callAPI( arguments.callee.name, {
			username : u,
			password : p,
			fullname : fn,
			email : e,
			cellphone : c
		} );
		
		return (!! msg) ? msg.done : false;
	},
	deleteAccount : function deleteAccount() {
		var msg = this.callAPI( arguments.callee.name, {
			username : u,
			password : p
		} );
		return (!! msg) ? msg.done : false;
	},
	
	login : function login(u, p, app, ver) {
		var msg = this.callAPI( arguments.callee.name, {
			username : u,
			password : p,
			app : app,
			version : ver
		} );

		if( (!!msg) && msg.done ) {
			this.session = msg.sessionKey;
			
			// keep it for auto re-login
			this.username = u;
			this.password = p;
			this.app = app;
			this.version = ver;
			return true;
		}
		
		return false;
	},
	logout : function logout() {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session
		});
		this.session = "";
		return (!! msg) ? msg.done : false;
	},
	changePassword : function changePassword( u, oldpwd, newpwd ) {
		var msg = this.callAPI( arguments.callee.name, {
			username : u,
			oldpwd : oldpwd,
			newpwd : newpwd
		} );
		return (!! msg) ? msg.done : false;
	},
	
	// { public: {}, protected: {}, private: {} }
	updateProfile : function updateProfile( data ) {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session,
			profile : data
		} );
		return (!! msg) ? msg.done : false;
	},
	// get own profile: {}
	getProfile : function getProfile() {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session
		} );
		return ((!! msg) && msg.done) ? msg.profile : false;
	},
	// query profile of others, may be many [ user1, user2, user3, ... ]
	// return: msg.profile as a list: [ {}, {}, {} ]
	// only return public part & protected on situation, never return private profile
	queryProfile : function queryProfile( user ) {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session,
			user : user
		} );
		return ((!! msg) && msg.done) ? msg.profile : false;
	},
	
	// query profile of others, may be many [ user1, user2, user3, ... ]
	// return: msg.user as a list: [ { username:"user1", fullname: "David", presence: "online" }, ... ]
	listFriend : function listFriend() {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session
		} );
		return ((!! msg) && msg.done) ? msg.user : false;
	},
	addFriend : function addFriend( username, textmsg ) {
		if( this.friends.indexOf(username) > -1 ) {
			return false;
		}
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session,
			username : username,
			textmsg : textmsg
		});
		if( (!! msg) && msg.done ) {
			this.friends.push( username );
			return true;
		}
		return false;
	},
	confirmAddFriend : function confirmAddFriend( username ) {
		if( this.friends.indexOf(username) > -1 ) {
			return false;
		}
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session,
			username : username
		});
		if( (!! msg) && msg.done ) {
			this.friends.push( username );
			return true;
		}
		return false;
	},
	removeFriend : function removeFriend( username ) {
		if( this.friends.indexOf(username) == -1 ) {
			return false;
		}
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session,
			username : username
		});
		if( (!! msg) && msg.done ) {
			var n = this.friends.indexOf(username);
			if( n > -1 ) {
				this.friends.splice(n, 1);
				return true;
			}
		}
		return false;
	},
	
	// set tags, [ "hacker", "swimming", "golf", ... ]
	setTag : function addTag( data ) {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session,
			tag : data
		} );
		if( (!! msg) && msg.done ) {
			// cache it
			this.tag.length = 0;
			for( var i=0; i<data.length; i++ ) this.tag.push( data[i] );
			return true;
		} 
		return false;
	},
	getTag : function getTag() {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session
		} );
		if( (!! msg) && msg.done ) {
			var data = msg.tag;
			// cache it
			this.tag.length = 0;
			for( var i=0; i<data.length; i++ ) this.tag.push( data[i] );
			return true;
		} 
		return false;
	},
	// { presence: "busy", location: [lat, lang] }
	updateStatus : function updateStatus( data ) {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session,
			status : data
		});
		if( (!! msg) && msg.done ) {
			// cache it
			for( var i in data ) this.status[i] = data[i];
			return true;
		} 
		return false;
	},
	// query presence of others, may be many [ user1, user2, user3, ... ]
	// return [ "available"/"busy"/"nodistrub"/"rightback"/"away"/"offline" ]
	queryPresence : function queryPresence( users ) {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session,
			user : users
		} );
		return ((!! msg) && msg.done) ? msg.presence : false;
	},
	
	// return: msg.user as a list: [ { username:"user1", fullname: "David", presence: "online" }, ... ]
	searchUser : function searchUser( tag, distance ) {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session,
			tag : tag,
			distance : distance
		} );
		return ((!! msg) && msg.done) ? msg.user : false;
	},
	// filter is string with complex condition, like: "(age > 25) AND (age < 40) AND (tag CONTAIN 'reading')" :-)
	// return: msg.user as a list: [ { username:"user1", fullname: "David", presence: "online" }, ... ]
	searchUserComplex : function searchUserComplex( filter ) {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session,
			filter : filter
		} );
		return ((!! msg) && msg.done) ? msg.user : false;
	}
});

// TODO: Gomoku Player

var Gomoku = function(){
	hotjs.base(this);
};

hotjs.inherit( Gomoku, User, {
	// override to pull message like push from server.
	listenPush : function listenPush() {
		
		return true;
	},
	// override to handle incoming msessages
	onMsgParse : function onMsgParse() {
		
	},
	// return msg.room [ "room1", "room2", ... ]
	findRoom : function findRoom( name ) {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session,
			name : name
		} );
		return ((!! msg) && msg.done) ? msg.room : false;
	},
	// if room not exist, then create it.
	// may need enter password, if required
	enterRoom : function enterRoom( name, pwd ) {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session,
			name : name,
			password : pwd
		} );
		return ((!! msg) && msg.done) ? msg.name : false;
	},
	// if no one in room after exist, then remove the password if there is.
	leaveRoom : function leaveRoom( name ) {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session,
			name : name
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	
	getColor : function getColor() {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session
		} );
		if( (!! msg) && msg.done ) {
			// cache it
			this.mycolor = msg.color;
			return this.mycolor;
		} 
		return false;
	},
	
	setBoardSize : function setBoardSize( n ) {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session,
			size : n
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	go : function go( x, y ) {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session,
			x: x,
			y: y,
			color : this.mycolor
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	undo : function undo() {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session
		});
		return ((!! msg) && msg.done) ? true : false;
	},
	confirmUndo : function confurmUndo() {
		var msg = this.callAPI( arguments.callee.name, {
			sessionKey : this.session
		});
		return ((!! msg) && msg.done) ? true : false;
	}
});

hotjs.Social.AjaxClient = AjaxClient;
hotjs.Social.User = User;
hotjs.Social.Gomoku = Gomoku;

})();