
hotjs = hotjs || {};
hotjs.Social = hotjs.Social || {};

(function(){

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
		dataType : 'html',
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
	this.debugmode = false;
};

AjaxClient.prototype = {
	setDebugMode : function(d) {
		if(d === undefined) d = true;
		this.debugmode = d;
		return true;
	},
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
		if( base_url.indexOf("://") < 0 ) {
			base_url = inf_url.substring(0, inf_url.lastIndexOf('/')+1) + base_url;
		}
		
		for( var i=0; i<msg.list.length; i++ ) {
			var entry = msg.list[i];
			var url = ( entry.url.indexOf("://") > -1) ? entry.url : (base_url + entry.url);
			url = url.replace('/./', '/');
			this.urls[ entry.api ] =  url;
		}
		
		return true;
	},
	requestMsg : function( data, url, options ) {
		if(this.debugmode) console.log( 'sending: ' + JSON.stringify(data) );
		var ajaxpkg = {};		
		for( var i in this.settings ) ajaxpkg[i] = this.settings[i];
		if( !! options ) for( var i in options ) ajaxpkg[i] = options[i];
		if( !! data ) ajaxpkg.data = data;
		if( !! url ) ajaxpkg.url = url;
		ajaxpkg.async = false;
		
		var self = this;
		var msgs = false;
		
		$.ajax( ajaxpkg )
			.done(function(data, textStatus, jqXHR){
				if(self.debugmode) console.log( 'received: ' + data );
				data = JSON.parse( data );
				
				msgs = data;
			})
			.fail(function(jqXHR, textStatus, errorThrown){
				self.onMsgFail( jqXHR, textStatus, errorThrown );
			})
			.complete(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown){
				self.onMsgComplete( data_or_jqXHR, textStatus, jqXHR_or_errorThrown );
			});
		
		return msgs;
	},
	postMsg : function( data, url, options ) {
		var ajaxpkg = {};
		
		for( var i in this.settings ) ajaxpkg[i] = this.settings[i];
		if( !! options ) for( var i in options ) ajaxpkg[i] = options[i];
		if( !! data ) ajaxpkg.data = data;
		if( !! url ) ajaxpkg.url = url;
		ajaxpkg.async = true;
		
		var self = this;
		
		$.ajax( ajaxpkg )
			.done(function(data, textStatus, jqXHR){
				if(self.debugmode) console.log( data );
				data = JSON.parse( data );
				
				self.onMsgComing( data, textStatus, jqXHR );
			})
			.fail(function(jqXHR, textStatus, errorThrown){
				self.onMsgFail( jqXHR, textStatus, errorThrown );
			})
			.complete(function(data_or_jqXHR, textStatus, jqXHR_or_errorThrown){
				self.onMsgComplete( data_or_jqXHR, textStatus, jqXHR_or_errorThrown );
			});
		
		return true;
	},
	onMsgFail : function( jqXHR, textStatus, errorThrown ) {
		if(this.debugmode) {
			console.log( "ajax fail" );
			console.log( jqXHR, textStatus, errorThrown );
		}
	},
	onMsgComplete : function( data_or_jqXHR, textStatus, jqXHR_or_errorThrown ) {
	},
	onMsgComing : function( data, textStatus, jqXHR ) {
		if( Array.isArray(data) ) {
			for( var i=0; i<data.length; i++ ) {
				this.onMsgParse( data[i] );
			}
		} else {
			this.onMsgParse( data );
		}
	},
	// TODO: sub class always override this function
	// to handle incoming message immediately.
	// check msg.api, then do something.
	onMsgParse : function( msg ) {
		
	},
	// input: { api: "api_name", key1: value1, key2: value2, ... }
	// output: { api: "api_name", key1: value1, key2: value2, ... }
	callAPI : function( api, param ) {
		var url = this.urls[ api ];
		if(! url) url = this.urls[ '_default_' ];
		
		var msg = this.requestMsg( {
			api: api,
			param: JSON.stringify(param) 
			}, url );
		if( typeof msg == "object" ) {
			//if( msg.api == api ) { // double check api, needed ? 
			return msg;
			//}
		}
		return false;
	},
	hello : function hello() {
		var msg = this.callAPI( 'hello', { name: 'hotjs' } );
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
	this.blocks = [];
	
	// by default, heartbeat interval is 5 sec.
	// can be changed when calling login()
	this.hb_interval = 5000;
};

hotjs.inherit( User, AjaxClient, {
	setHeartbeat : function( hb ) {
		this.hb_interval = hb;
	},
	registerAccount : function registerAccount(u, p, fn, e, c) {
		var msg = this.callAPI( 'registerAccount', {
			username : u,
			password : p,
			fullname : fn,
			email : e,
			cellphone : c
		} );
		
		return (!! msg) ? msg.done : false;
	},
	deleteAccount : function deleteAccount() {
		var msg = this.callAPI( 'deleteAccount', {
			username : u,
			password : p
		} );
		return (!! msg) ? msg.done : false;
	},
	// return username & password in msg
	autoRegister : function autoRegister(uuid, fn) {
		var msg = this.callAPI( 'autoRegister', {
			uuid : uuid,
			fullname: fn,
		});		
		return ((!! msg) && msg.done) ? msg : false;
	},
	
	login : function login(u, p, app, ver, hb) {
		var msg = this.callAPI( 'login', {
			username : u,
			password : p,
			app : app,
			version : ver
		} );

		if( (!!msg) && msg.done ) {
			this.session = msg.sid;
			
			// keep it for auto re-login
			this.username = u;
			this.password = p;
			this.app = app;
			this.version = ver;
			
			// set hb interval if needed.
			if(!! hb) this.hb_interval = hb;
			
			// start first hb.
			this.heartbeat();
			
			return true;
		}
		
		return false;
	},
	// override to pull message like push from server.
	heartbeat : function heartbeat() {
		if( !! this.session ) {
			// send heartbeat msg
			var api = 'heartbeat';
			var data = { sid:this.session, t:Date.now() };
			this.postMsg( { 
				api: api, 
				param: JSON.stringify(data) 
				}, this.urls[ api ] );
			
			var self = this;
			this.hb_timer = window.setTimeout( function(){
				self.heartbeat();
			}, this.hb_interval );
		}
		return true;
	},
	logout : function logout() {
		// stop heartbeat timer
		if(!! this.hb_timer) {
			clearTimeout( this.hb_tiemr );
		}
		
		// send logout msg
		var msg = this.callAPI( 'logout', {
			sid : this.session
		});
		this.session = "";
		return (!! msg) ? msg.done : false;
	},
	changeIdPassword : function changeIdPassword( u, oldpwd, newu, newpwd ) {
		if( u === newu ) newu = '';
		var param = {
				username : u,
				oldpwd : oldpwd,
				newusername : newu,
				newpwd : newpwd
			};
		var msg = this.callAPI( 'changeIdPassword', param);
		return (!! msg) ? msg.done : false;
	},
	
	// { public: {}, protected: {}, private: {} }
	updateProfile : function updateProfile( data ) {
		var msg = this.callAPI( 'updateProfile', {
			sid : this.session,
			profile : data
		} );
		return (!! msg) ? msg.done : false;
	},
	// get own profile: {}
	getProfile : function getProfile() {
		var msg = this.callAPI( 'getProfile', {
			sid : this.session
		} );
		return ((!! msg) && msg.done) ? msg.profile : false;
	},
	// query profile of others, may be many [ user1, user2, user3, ... ]
	// return: msg.profile as a list: [ {}, {}, {} ]
	// only return public part & protected on situation, never return private profile
	queryProfile : function queryProfile( user ) {
		var msg = this.callAPI( 'queryProfile', {
			sid : this.session,
			user : user
		} );
		return ((!! msg) && msg.done) ? msg.profile : false;
	},
	
	// query profile of others, may be many [ user1, user2, user3, ... ]
	// return: msg.user as a list: [ { username:"user1", fullname: "David", presence: "online" }, ... ]
	listFriend : function listFriend() {
		var msg = this.callAPI( 'listFriend', {
			sid : this.session
		} );
		if ( (!! msg) && msg.done && Array.isArray(msg.user) ) {
			// sync the friend list
			this.friends.length = 0;
			for( var i=0; i<msg.user.length; i++ ) {
				this.friends.push( msg.user[i].username );
			}
			return msg.user;
		}
		return false;
	},
	addFriend : function addFriend( username, textmsg ) {
		if( this.friends.indexOf(username) > -1 ) {
			return false;
		}
		var msg = this.callAPI( 'addFriend', {
			sid : this.session,
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
		var msg = this.callAPI( 'confirmAddFriend', {
			sid : this.session,
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
		var msg = this.callAPI( 'removeFriend', {
			sid : this.session,
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
	
	// query profile of others, may be many [ user1, user2, user3, ... ]
	// return: msg.user as a list: [ { username:"user1", fullname: "David", presence: "online" }, ... ]
	listBlock : function listBlock() {
		var msg = this.callAPI( 'listBlock', {
			sid : this.session
		} );
		if ( (!! msg) && msg.done && Array.isArray(msg.user) ) {
			// sync the friend list
			this.blocks.length = 0;
			for( var i=0; i<msg.user.length; i++ ) {
				this.blocks.push( msg.user[i].username );
			}
			return msg.user;
		}
		return false;
	},
	// block a user, and will not receive any activity notification like invite/chat/say/join/quit ...
	block : function block( u ) {
		if( this.friends.indexOf(u) > -1 ) {
			return false;
		}
		var msg = this.callAPI( 'block', {
			sid : this.session,
			username : u
		});
		if( (!! msg) && msg.done ) {
			this.blocks.push( u );
			return true;
		}
		return false;
	},
	unblock : function unblock( u ) {
		if( this.friends.indexOf(u) == -1 ) {
			return false;
		}
		var msg = this.callAPI( 'unblock', {
			sid : this.session,
			username : u
		});
		if( (!! msg) && msg.done ) {
			var n = this.friends.indexOf(u);
			if( n > -1 ) {
				this.blocks.splice(n, 1);
				return true;
			}
		}
		return false;
	},

	// set tags, [ "hacker", "swimming", "golf", ... ]
	setTag : function addTag( data ) {
		var msg = this.callAPI( 'setTag', {
			sid : this.session,
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
		var msg = this.callAPI( 'getTag', {
			sid : this.session
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
		var msg = this.callAPI( 'updateStatus', {
			sid : this.session,
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
		var msg = this.callAPI( 'queryPresence', {
			sid : this.session,
			user : users
		} );
		return ((!! msg) && msg.done) ? msg.presence : false;
	},
	
	// return: msg.user as a list: [ { username:"user1", fullname: "David", presence: "online" }, ... ]
	searchUser : function searchUser( tag, distance ) {
		var msg = this.callAPI( 'searchUser', {
			sid : this.session,
			tag : tag,
			distance : distance
		} );
		return ((!! msg) && msg.done) ? msg.user : false;
	},
	// filter is string with complex condition, like: "(age > 25) AND (age < 40) AND (tag CONTAIN 'reading')" :-)
	// return: msg.user as a list: [ { username:"user1", fullname: "David", presence: "online" }, ... ]
	searchUserComplex : function searchUserComplex( filter ) {
		var msg = this.callAPI( 'searchUserComplex', {
			sid : this.session,
			filter : filter
		} );
		return ((!! msg) && msg.done) ? msg.user : false;
	},
	
	// invite a friend to join a group
	inviteJoinGroup : function inviteJoinGroup( name, g ) {
		var msg = this.callAPI( 'inviteJoinGroup', {
			sid : this.session,
			name : name,
			group : g
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	quitGroup : function quitGroup( g ) {
		var msg = this.callAPI( 'quitGroup', {
			sid : this.session,
			group : g
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	// chat in a group
	chat : function chat( s, g ) {
		var msg = this.callAPI( 'chat', {
			sid : this.session,
			group : g,
			what : s
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	
	// return msg.room [ "room1", "room2", ... ], not all, limit to 20
	findRoom : function findRoom( name ) {
		var msg = this.callAPI( 'findRoom', {
			sid : this.session,
			name : name
		} );
		return ((!! msg) && msg.done) ? msg.room : false;
	},
	// if room not exist, then create it.
	// may need enter password, if required
	enterRoom : function enterRoom( name, pwd, appkey ) {
		var msg = this.callAPI( 'enterRoom', {
			sid : this.session,
			name : name,
			secret : pwd,
			appkey : appkey
		} );
		return ((!! msg) && msg.done) ? msg.rid : false;
	},
	// if no one in room after exist, then remove the password if there is.
	leaveRoom : function leaveRoom( name ) {
		var msg = this.callAPI( 'leaveRoom', {
			sid : this.session,
			name : name
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	// say something, anyone in the room can hear.
	say : function say( s ) {
		var msg = this.callAPI( 'say', {
			sid : this.session,
			what : s
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	
	// send short message, only between friends.
	sms : function sms( name, s ) {
		var msg = this.callAPI( 'sms', {
			sid : this.session,
			name : name,
			what : s
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	
	// return msg, { 'all':999, '1':10, '2':10, ..., 'vip':20 }
	countOnlineGamer : function countOnlineGamer( appkey ) {
		var msg = this.callAPI( 'countOnlineGamer', {
			sid : this.session,
			appkey : appkey
		});		
		return msg;
	},
	searchGamer : function searchGamer( appkey, level ) {
		var msg = this.callAPI( 'searchGamer', {
			sid : this.session,
			appkey : appkey,
			level : level
		});		
		return ((!! msg) && msg.done) ? true : false;
	},
	
	uploadGameData : function uploadGameData( appkey, md5key, result, steps ) {
		var msg = this.callAPI( 'uploadGameData', {
			sid : this.session,
			appkey : appkey,
			md5key : md5key,
			result : result,
			steps : steps
		});
		
		return ((!! msg) && msg.done) ? true : false;
	},
	listGameData : function listGameData( appkey, pagesize, pageindex ) {
		if( pageindex === undefined ) pageindex = 0;
		if( pagesize === undefined ) pagesize = 10;
		var msg = this.callAPI( 'listGameData', {
			sid : this.session,
			appkey : appkey,
			pagesize : pagesize,
			pageindex : pageindex
		});
		
		return msg;
	},
	// msg = { "md5key" : "xx", "result" : "xx", "steps" : "xx" }
	downloadGameData : function downloadGameData( appkey, md5key ) {
		var msg = this.callAPI( 'downloadGameData', {
			sid : this.session,
			appkey : appkey,
			md5key : md5key
		});
		
		return msg;
	},
	voteGameData : function voteGameData( appkey, md5key, rating ) {
		var msg = this.callAPI( 'voteGameData', {
			sid : this.session,
			appkey : appkey,
			md5key : md5key,
			rating : rating
		});

		return ((!! msg) && msg.done);
	},
	
	updateGameScore : function updateGameScore( appkey, data1, data2, data3 ) {
		var msg = this.callAPI( 'updateGameScore', {
			sid : this.session,
			appkey : appkey,
			data1 : data1,
			data2 : data2,
			data3 : data3
		});
		return ((!! msg) && msg.done);
	},
	// { "data1" : [ { "name" : "tom", "score" : 10 }, { ... } ], "data2" : [], "data3" : [] }
	getGameScoreTop10 : function getGameScoreTop10( appkey, data1, data2, data3 ) {
		var msg = this.callAPI( 'getGameScoreTop10', {
			sid : this.session,
			appkey : appkey,
			data1 : data1,
			data2 : data2,
			data3 : data3
		});
		return msg;
	},
	
	feedback : function feedback( appkey, txt ) {
		var msg = this.callAPI( 'feedback', {
			sid : this.session,
			msg : txt
		});
		return ((!! msg) && msg.done);
	}
	
});

hotjs.Social.AjaxClient = AjaxClient;
hotjs.Social.User = User;

})();
