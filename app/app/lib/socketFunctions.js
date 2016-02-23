import randomNumber from 'hat';
import debugging from 'debug';
let	debug = debugging('simpledocs:app:lib:socketFunctions');

function options() {
	 
	var exports = {};
	
	exports.trapResponse = function(socket, callback) {
		
		var unique = randomNumber();
		
		socket.once(unique, callback);
		
		return unique;
	}
	exports.trap = exports.trapResponse;
	
	exports.page = function(page) {
		this.io.emit('page', page);
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
