import debugging from 'debug';
let	debug = debugging('simpledocs:app:lib:socketFunctions');

let randomNumber = Math.random;

function options() {
	 
	var exports = {};
	
	exports.trapResponse = function(socket, callback) {
		
		var unique = randomNumber();
		
		socket.once(unique, callback);
		
		return unique;
	}
	exports.trap = exports.trapResponse;
	
	exports.page = function(page, search) {
		var nowTime = new Date().getTime();
		var newTime = new Date(nowTime + 10000).getTime();
		
		if(snowUI.watingForPage && snowUI.waitTimeout > nowTime ) {
			console.warn('SOCKET not sent', snowUI.waitTimeout, nowTime);
			return false;
		}
		
		snowUI.watingForPage = true;
		snowUI.waitTimeout = newTime;
		
		if(page === snowUI.singlePage) {
			this.io.emit('allinone', page);
		} else if(page.search('search::') > -1) {
			this.io.emit('search', search);
		} else {
			this.io.emit('page', page);
		}
		
	};
	
	exports.status = function(callback) {
		debug('get status');
		if(!callback) {
			callback = ()=>{}
		}
		this.io.emit('status',{ 
			iden: this.trap(this.io, callback)
		});
	};
	
	
	
	return exports;
	
}

export default options;
