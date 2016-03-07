var dashes = '\n------------------------------------------------\n';

/**
 * attach the event system to SimpleDocs 
 * */
var theExport = {};

/**
 * _init
 * 
 * attach init event to set path, standalone or add the byo express and mongoose object
 *
 * ####Example:
 *
 *     SimpleDocs.on('init',config) // 
 *
 * @method get
 * @api public
 */ 
theExport._init = function(config) {
	
	var log = function(msg) {
		console.log(dashes,msg,dashes);
	} 
	if(typeof config === 'object') {
		this.options(config);
		this._keystone();
	} else {
		//log('no config object so running model');
		this._keystone();
	}
}
/**
 * _keystone
 * 
 * check for a app and mongoose object or for standalone
 *
 * ####Example:
 *
 *     SimpleDocs.on('keystone') // 
 *
 * @method get
 * @api public
 */ 
theExport._keystone = function() {
	var app = this.get('app');
	var mongoose = this.get('mongoose');
	var standalone = this.get('standalone');
	var route = this.get('route');
	var materialRoute = this.get('material route');
	var keystone = this.keystone;
	var _this = this;
		
	if(standalone) {
		/*set the user model to on */
		this.set('add user model',true);
		if(route !== '/' && materialRoute !== '/') {
			keystone.redirect({
				'/': route
			});
		}
		var standalone = require('../start/standalone.js');
		standalone.call(this, keystone, function(app){ 
			/* emit an event for you to add your own keystone */
			_this.emit('keystone', keystone);
			_this.emit('model', keystone);
		});
		
	} else if(app && mongoose) {
		var custome =  require('../start/custom.js');
		custome.call(this, app, mongoose, function() {
			_this.emit('keystone', keystone);
			_this.emit('model',keystone);
		});
		
	} else {
		this.emit('model', this.keystone);
	}
	
	
}

/**
 * _model
 * 
 * attach the model on the model event
 *
 * ####Example:
 *
 *     SimpleDocs.on('model') // 
 *
 * @method get
 * @api public
 */ 
theExport._model = function(config) {
	/* add our models */
	this.model();
	/* User model if you want to access the keystone admin UI and dont currently have a user model*/
	if(this.get('add user model')) {
		require('../../models/User.js')(this.keystone);
	}
	this.emit('routes', this.keystone);
}

/**
 * _routes
 * 
 * attach the model on the model event
 *
 * ####Example:
 *
 *     SimpleDocs.on('routes',function(){}) // 
 *
 * @method get
 * @api public
 */ 
theExport._routes = function() {
	var _this = this;
	/* add our models */
	this.add(function() {
		_this.emit('complete', this.keystone);
	});	
}

/**
 * _complete
 * 
 * attach to the complete event
 *
 * ####Example:
 *
 *     SimpleDocs.on('complete',function(errors){}) // 
 *
 * @method get
 * @api public
 */ 
theExport._complete = function(errors) {
	console.log(dashes, 'New documentation site started on ' + this.get('route'), dashes);	
}

module.exports = theExport;
