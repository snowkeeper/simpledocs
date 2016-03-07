/**
 * start
 * 
 * call start once you have attached to all the events you need
 *
 * ####Example:
 *
 *     SimpleDocs.start() // 
 *
 * @method get
 * @api public
 */ 
module.exports = function(userSuppliedKeystone, config) {
	/* global keystone */
	if(typeof userSuppliedKeystone  === 'Object' && userSuppliedKeystone.init) {
		this.set('keystone', userSuppliedKeystone);
	} else if(typeof userSuppliedKeystone  === 'Object') {
		config = userSuppliedKeystone;
	}
	
	if(!this.keystone) {
		this.set('keystone', require('keystone'));
	}
		
	/* we emit init who calls keystone */
	this.on('init', this._init)
	.on('model', this._model)
	.on('routes', this._routes)
	.on('complete', this._complete);
	
	this.emit('init', config);
	
	return this;
}
