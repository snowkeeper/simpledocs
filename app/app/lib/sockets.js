import { extend, isFunction, isObject } from 'lodash';
import debugging from 'debug';
import SF from  './socketFunctions';
import io from 'socket.io-client';
import Gab from '../common/gab';

let	debug = debugging('simpledocs:app:lib:sockets');

let Sockets = function() {
	
	// connected
	this.connected = {
		io: false,
		open: false
	}
	this.proxy = 'proxy';
}


Sockets.prototype.connectAuth = function(callback) {
	this.io = io('//' + this.host + ':' + this.port + snowUI.namespace, { 'forceNew': true });
	this.auth = this.io;
	debug('reconnect open', this.auth);
	
	this.io.on('connect',(data) => {
		debug('open connected', snowUI.namespace);
		this.connected.open = true;
		this.connected.io =  {
			get() {
				this.io.socket.isConnected();
			}
		}
		if(isFunction(callback)) {
			callback(null,true);
		}
	});
	this.io.on('connect-error',(err) => {
		debug('auth connect-error',err);
	});
	
	
	
}

Sockets.prototype.init = function(opts, callback) {
	let _opts = {
		host: snowUI.host || '@',
		port: snowUI.port,
		namespace: snowUI.namespace
	};
	if(isFunction(opts)) {
		callback = opts;
		opts = _opts;
	}
	
	if(isObject(opts)) {
		opts = _opts;
	}
	
	this.port = opts.port;
	this.host = opts.host;
	
	let _this = this;
	
	// connection
	this.io = io('//' + this.host + ':' + this.port + snowUI.namespace, { 'forceNew': true });
	
	this.io.on('connect',(data) => {
		debug('io connected', snowUI.namespace);
		this.connected.open = true;
		this.connected.io =  {
			get() {
				this.io.socket.isConnected();
			}
		}
		
		if(isFunction(callback)) {
			callback(null,true);
		}
	});
	this.io.on('connect-error',(err) => {
		debug('io connect-error',err);
		if(isFunction(callback)) {
			callback(err);
		}
	});	
	
}

extend(Sockets.prototype, SF());


export default new Sockets();
