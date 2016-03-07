/**
 * Sets multiple SimpleDocs options.
 *
 * ####Example:
 *
 *     keystone.options({test: value}) // sets the 'test' option to `value`
 *
 * @param {Object} options
 * @api public
 */

module.exports = function(options) {
	if (!arguments.length)
		return this._options;
	if (typeof options === 'object') {
		var keys = Object.keys(options),
			i = keys.length,
			k;
		while (i--) {
			k = keys[i];
			this.set(k, options[k]);
		}
	}
	return this._options;
};
