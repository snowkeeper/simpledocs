var path = require('path');
var less = require('express-less');

/**
 * statics
 * 
 * static files served from snowdocs
 *
 * ####Example:
 *
 *     SimpleDocs.statics(text,password) // 
 *
 * @method get
 * @api public
 */ 
module.exports = function() {
	
	var keystone = this.keystone;
	var app = this.keystone.app;
	var SD = this;
	
	//console.log('simpledocs-files', path.join(SD.get('moduleDir'), 'app'));
	/* we use snowhub in the UI so we dont clash anywhere
	 * */
	app.use("/_simpledocs_", keystone.express.static(SD.get('moduleDir') + "/public"));
	/* material ui */
	app.use('/_simpledocs-files_', keystone.express.static(path.join(SD.get('moduleDir'), 'app')));
	app.use(
		'/_simpledocs-css_',
		less(
			path.join(SD.get('moduleDir'), 'app','styles'),
			{ 
				compress: app.get('env') == 'production',
				debug: app.get('env') == 'development'
			}
		)
	);
}
