var path = require('path');

/**
 * Sets SimpleDocs option.
 *
 * ####Example:
 *
 *     keystone.set('test', value) // sets the 'test' option to `value`
 *
 * @param {String} key
 * @param {String|Object|Array} value
 * @api public
 */
module.exports = function(key, value) {
	
	var _this = this;
	
	if (arguments.length === 1) {
		return this._options[key];
	}
	// old config used text instead of label
	if(key.trim().slice(-4) === 'text') {
		this._options[key] = value;
		var nn = key.trim().split(' ');
		key = nn[0] + ' label';
	}
	
	switch(key) {
		case "io":
			this.io = value;
			break;
		case "keystone":
			this.keystone = value;
			break;
		case "ui js":
			this._options['ui js file'] = value; 
			break;
		case "ui menu width":
			var content = [12,12,9,9];
			var menu = [0,0,3,3];
			if(!Array.isArray( value )) {
				value = menu;
			} else {
				content = [];
				for(var i=0;i<value.length;i++) {
					content.push(12-value[i]);
				}
			}
			this._options['ui content width'] = content;
			break;
		case "ui banner menu width":
			var content = [6,8,9,9];
			var menu = [6,4,3,3];
			if(!Array.isArray( value )) {
				value = menu;
			} else {
				content = [];
				for(var i=0;i<value.length;i++) {
					content.push(12-value[i]);
				}
			}
			this._options['ui banner content width'] = content;
			break;	
		case "route":
			this.set('build path', path.join(this.get('appDir'), '__build/', value));
			this.set('build path ghpages', path.join(this.get('appDir'), '__build/', value , 'gh-pages/'));
			this.set('build path tmp', path.join(this.get('appDir'), '__build/', value , 'tmp/'));
			break;
	}
	
	this._options[key] = value;
	
	return this._options[key];
	
}
