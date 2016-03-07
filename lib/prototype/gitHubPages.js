var fs = require('fs-extra');
var path = require('path');
var jade = require('jade');
var async = require('async');

/**
 * 
 * build a gitHub Pages site
 * 
 * 
 * */
module.exports = function() {
	var dir = this.get('moduleDir');
	var dest = path.join(dir, 'public');
	var config = {
		preprocess: {
			path: function(pathname, req) {
				return pathname.replace(/\/_simpledocs_\//, '/');
			},
			
		}, 
		storeCss: function(pathname, css, next) {
			var newpath = pathname.replace(/\/_simpledocs_\//, '/');
			var mkdirSync = function () {
				try {
					fs.mkdirSync(path.dirname(newpath), 511);
					return writeFile();
				} catch(e) {
					if ( e.code !== 'EEXIST' ) return next();
					return writeFile();
				}
			}
			var writeFile = function(){
				console.log('write css file')
				return fs.writeFile(newpath, css, 'utf8', next);
			};
			//save css
			return mkdirSync();
		}	
	}
	
	var lessPaths = keystone.get('less') || [];
	if (typeof lessPaths === 'string') {
		lessPaths = [lessPaths];
	}
	
	lessPaths.push(path.join(dir, 'public'));
	keystone.set('less', lessPaths);
	keystone.set('less middleware options', config);
	keystone.set('simpldocs less config', true);
		
	return;
	
}
