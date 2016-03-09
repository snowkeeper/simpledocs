var fs = require('fs-extra');
var path = require('path');
//var jade = require('jade');
var async = require('async');
var request = require('superagent');
var gulp = require('gulp');
var gulpif = require('gulp-if'); 
var replace = require('gulp-replace'); 
var less = require('gulp-less');
var path = require('path');
var insert = require('gulp-insert');
var prepend = require('prepend-file');
//var minifyCSS = require('gulp-minify-css');
//var concatCss = require('gulp-concat-css');
var rename = require('gulp-rename');
var jade = require('gulp-jade');
//var ghpages = require('gh-pages');
var source = require('vinyl-source-stream');
var dashes = '\n------------------------------------------------\n';

/**
 * build a gitHub Pages site
 * */

var GHPages =  {

}

GHPages.build = function() {
	
	var _this = this;
	var buildPath = this.get('build path ghpages');
	
	fs.ensureDir(buildPath, function() {
		fs.ensureDirSync(buildPath + '/js/bundles');
		fs.ensureDirSync(buildPath + '/styles');
		fs.ensureDirSync(buildPath + '/images');
		
		var tmp = _this.get('build path tmp');
		
		// get the docs
		this.model.getPublished(function(err, docs) {
			if(err) {
				console.log(dashes, 'ERROR getting pages for ghpages build \n', err, dashes);
				return;
			}
			
			// build and save pages
			GHPages.pages(docs);
			
			/* copy assets */
			var appPath = path.join(_this.get('moduleDir'), 'public');
			var mPath = path.join(_this.get('moduleDir'), 'app');
			// fonts
			GHPages.saveDir(path.join(appPath, 'fonts'), path.join(buildPath, 'fonts'), function(err) {
				if(err) {
					console.log("ERROR", err);
				}
				console.log('saved fonts dir');
			});
			// bootstrap css
			GHPages.saveFile(path.join(appPath, 'styles', 'bootstrap.css'), buildPath, path.join('styles', 'bootstrap.css'), function(err) {
				if(err) {
					console.log("ERROR", err);
				}
				console.log('saved bootstrap css');
			});
			// bootstrap-ui css
			GHPages.saveFile(path.join(appPath, 'styles', 'bootstrap-ui.css'), buildPath, path.join('styles', 'bootstrap-ui.css'), function(err) {
				if(err) {
					console.log("ERROR", err);
				}
				console.log('saved bootstrap-ui css');
			}, ['/_simpledocs_/', '../']);
			// prism css
			GHPages.saveFile(path.join(appPath, 'styles', 'prism.css'), buildPath, path.join('styles', 'prism.css'), function(err) {
				if(err) {
					console.log("ERROR", err);
				}
				console.log('saved prism css');
			});
			// material-ui css
			GHPages.saveLess(path.join(mPath, 'styles', 'material-ui.less'), path.join(mPath, 'styles'), 'material-ui.css', path.join(buildPath, 'styles'), function(err) {
				if(err) {
					console.log("ERROR", err);
				}
				console.log('saved material-ui css');
			})
			// bootstrap-ui js
			GHPages.saveFile(path.join(appPath, 'js', 'bundles', 'bootstrap-ui.js'), buildPath, path.join('js', 'bundles', 'bootstrap-ui.js'), function(err) {
				if(err) {
					console.log("ERROR", err);
				}
				console.log('saved bootstrap-ui js');
			});
			// material-ui js
			GHPages.saveFile(path.join(appPath, 'js', 'bundles', 'material-ui.js'), buildPath, path.join('js', 'bundles', 'material-ui.js'), function(err) {
				if(err) {
					console.log("ERROR", err);
				}
				console.log('saved material-ui js');
			});
			
		});
	});
}

GHPages.userFile = function(saveAs, callback) {
	if(!callback) {
		callback = function() {};
	}
	var theFile = this.get('ui js file');
	if(!theFile) {
		console.log('No user file to copy');
		return callback();
	}
	var userpath = path.join(this.get('appDir'), theFile);
	fs.stat(userpath, function(err) {
		if(err) {
			console.log('USER FILES does NOT EXIST \n', userpath);
		}
		
		GHPages.saveDir(userpath, saveAs, function (err) {
			console.log('saved user supplied file ' + userpath + ' to ' + saveAs);
			callback();
		});
	});
}

GHPages.saveConfig = function (saveAs, callback) {		
	
	if(!callback) {
		callback = function() {};
	}
	this.expose.sdConfig({}, false, function(err, config) {
		if(!err) {
			var contents = "var snowUI = " + JSON.stringify(config) + ";"; 
			fs.writeFile(saveAs,  contents, function (err) {
				console.log(err, 'saved config js ' + saveAs);
				callback();
			});
		} else {
			console.log('config grab error');
		}
	});
		
}

GHPages.savePage = function (template, locals, buildPath, saveAs, permalink, callback) {		
	
	if(!callback) {
		callback = function() {};
	}
	gulp.src(template)
	.pipe(jade({ locals: locals }))
	.pipe(gulpif((permalink !== false),insert.prepend("---\npermalink: " + permalink + "\n---\n")))
	.pipe(rename(saveAs))
	.pipe(gulp.dest(buildPath))
	.on('error', function(err) {
		console.log('ERROR', err);
	})
	.on('end', function() {
		if(callback) callback();
		console.log('saved ' + buildPath + saveAs);
	});
}

GHPages.prototype.saveJson = function (source, saveAs, callback) {		
	if(!callback) {
		callback = function() {};
	}
	fs.writeJson(saveAs, source, callback);
}

GHPages.saveDir = function (source, saveAs, callback) {		
	
	if(!callback) {
		callback = function(err) {
			if(err) console.log('ERROR', err);
		};
	}
	fs.copy(source, saveAs, callback);
}

GHPages.saveFile = function (source, savePath, saveAs, callback, repl) {		
	
	if(!callback) {
		callback = function(err) {
			if(err) console.log('ERROR', err);
		};
	}
	//fs.copy(source, saveAs, callback);
	
	var doing = gulp.src(source);
	
	if(repl) {
		doing.pipe(replace(repl[0], repl[1]));
	}
	doing.pipe(rename(saveAs))
	.pipe(gulp.dest(savePath))
	.on('error', function(err) {
		console.log('ERROR', err);
	})
	.on('end', function() {
		if(callback) callback();
		console.log('saved ' + savePath + saveAs);
	});
	
}

GHPages.saveLess = function (source, sourcePath, saveAs, savePath, callback) {
	gulp.src(source)
		.pipe(less({
			 paths: [ sourcePath ]
		}))
		.pipe(rename(saveAs))
		.pipe(gulp.dest(savePath))
		.on('error', function(err) {
			if(callback) callback(err);
		})
		.on('end', function() {
			if(callback) callback();
		});
}

GHPages.pages = function (docs, finished) {
	var _this = this;
	var buildPath = this.get('build path ghpages');
	var indexHTML = path.join(buildPath, 'index.html');
	var template = this.get('template path');
	var treepath = (_this.paths.ghpages.tree).replace(/\//g, '_');
	// create each ui index page... one will be index.html
	var bs = this.get('ui') === 'bootstrap'; 
	var bsPath = bs ? 'index.html' : 'bootstrap_index.html';
	var m = this.get('ui') === 'material'; 
	var mPath = m ? 'index.html' : 'material_index.html';
	var locals = {
		pretty: true,
		customeStyle: this.get('custom style'),
		development: false,
		env: this.keystone.get('env'),
		pathConfig: path.join("js/" + this.paths.ghpages.materialPath.replace(/\//g, '-') + "-config.js"),
		pathUser: path.join("js/" + this.paths.ghpages.materialPath.replace(/\//g, '-') + "-user.js"),
		title: this.get('simpledocs model config').label,
		theme: this.get('theme') != '' ? this.get('theme') : '',
		ui: 'material',
		user: { user: {} }			
	};
	var bsLocals = {
		pretty: true,
		customeStyle: this.get('custom style'),
		development: false,
		env: this.keystone.get('env'),
		pathConfig: path.join("js/", this.paths.ghpages.bootstrapPath.replace(/\//g, '-') + "-config.js"),
		pathUser: path.join("js/", this.paths.ghpages.bootstrapPath.replace(/\//g, '-') + "-user.js"),
		title: this.get('simpledocs model config').label,
		theme: this.get('theme') != '' ? this.get('theme') : '',
		ui: 'bootstrap',
		user: { user: {} }			
	}; 
	GHPages.userFile( path.join(buildPath, "js" , (this.paths.ghpages.bootstrapPath.replace(/\//g, '-') + "-user.js")));
	GHPages.saveConfig(path.join(buildPath, "js" , (this.paths.ghpages.bootstrapPath.replace(/\//g, '-') + "-config.js")));
	GHPages.userFile(path.join(buildPath, "js" , (this.paths.ghpages.materialPath.replace(/\//g, '-') + "-user.js")));
	GHPages.saveConfig(path.join(buildPath, "js" , (this.paths.ghpages.materialPath.replace(/\//g, '-') + "-config.js")));
	
	// bootstrap
	GHPages.savePage(template, bsLocals, buildPath, bsPath, !bs ? this.paths.ghpages.bootstrap : false);
	// material
	GHPages.savePage(template, locals, buildPath, mPath, !m ? this.paths.ghpages.material : false, function(err) {
		if(err) {
			console.log(dashes, err, dashes);	
		}
		console.log(dashes, 'Cycle documents ', dashes);
		docs.forEach(function(doc, k){
			var filename = doc.slug;
			var jsonpath = path.join(buildPath , path.join(_this.paths.ghpages.page, filename).replace(/\//g, '_') + '.json');
			
			var bfile = path.join(_this.paths.ghpages.bootstrapPath, filename).replace(/\//g, '_') + '.html';
			var mfile = path.join(_this.paths.ghpages.materialPath, filename).replace(/\//g, '_') + '.html';
			
			// save fake pages
			GHPages.savePage(template, bsLocals, buildPath, bfile, path.join(_this.paths.ghpages.bootstrap, doc.slug));
			GHPages.savePage(template, locals, buildPath, mfile, path.join(_this.paths.ghpages.material, doc.slug));
			
			// do json
			var save = {
				action: 'simple documentation',
				command: 'page',
				success: true,
				message: 'Have a great day!',
				code: 200,
				title: doc.title,
				slug: doc.slug,
				page: doc
			}
			GHPages.saveJson(save, jsonpath, function(err) {
				if(err) console.log(err, 'json document not saved ', jsonpath);
				var permalink = path.join(_this.paths.ghpages.page, filename + '.json');
				prepend(jsonpath, "---\npermalink: " + permalink + "\n---\n", function(err) {
					if(err) console.log(err);
				});
			});
					
		});
	});
		
}

GHPages.publishGitHubPages = function () {
	ghpages.publish(
		path.join(__dirname, 'build'),
		{
			logger: function(message) {
				gutil.log(message);
			},
			repo: 'https://github.com/keystonejs/keystone.git',
			branch: 'gh-pages',
			clone: './dev/.gh-pages-production',
			tag: Args.tag,
			add: !!Args.add,
			message: Args.message
		},
		function() {
			gutil.log('-------------------------------------')
			gutil.log('published to:')
			gutil.log('branch: gh-pages')
			gutil.log('cloned to: ./dev/.gh-pages-production')
			gutil.log('It may take a few minutes for the server to refresh.')			
			gutil.log('-------------------------------------')
			cb()
		}
	);
}

module.exports = GHPages;
