// TODO: GoPlayer, also works for Gomoku.

var NetPlayer = function(){
	hotjs.base(this);
	
	this.mycolor = 2;
};

hotjs.inherit( NetPlayer, hotjs.Social.User, {
	// override to handle incoming msessages
	onMsgParse : function() {

		return true;
	},
	getColor : function getColor() {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session
		} );
		if( (!! msg) && msg.done ) {
			// cache it
			this.mycolor = msg.color;
			return this.mycolor;
		} 
		return false;
	},
	setGoColor : function() {
		
		return true;
	},
	changeColor : function changeColor() {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session
		} );
		return ( (!! msg) && msg.done );
	},
	confirmChangeColor : function confirmChangeColor( yn ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			agree : yn
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
			sid : this.session,
			size : n
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	go : function go( x, y ) {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session,
			x: x,
			y: y,
			color : this.mycolor
		} );
		return ((!! msg) && msg.done) ? true : false;
	},
	undo : function undo() {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session
		});
		return ((!! msg) && msg.done) ? true : false;
	},
	confirmUndo : function confurmUndo() {
		var msg = this.callAPI( arguments.callee.name, {
			sid : this.session
		});
		return ((!! msg) && msg.done) ? true : false;
	}
});

