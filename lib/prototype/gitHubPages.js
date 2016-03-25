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
var ghpages = require('gh-pages');
var source = require('vinyl-source-stream');
var dashes = '\n------------------------------------------------\n';

var emit = function(to, data) {
	var _this = this;
	process.nextTick(function() {
		//console.log('namespace', _this.get('namespace'));
		_this.io.of(_this.get('namespace')).emit(to, data);
	});
};

/**
 * build a gitHub Pages site
 * */

var GHPages =  function(context){
	if(context) {
		this.context = context;
		emit = emit.bind(context);
	}
}

GHPages.prototype.build = function(callback) {
	//console.log(this)
	var _this = this;
	var buildPath = this.context.get('build path ghpages');
	
	fs.ensureDir(buildPath, function() {
		fs.ensureDirSync(buildPath + '/js/bundles');
		fs.ensureDirSync(buildPath + '/styles');
		fs.ensureDirSync(buildPath + '/images');
		
		var tmp = _this.context.get('build path tmp');
		
		// get the docs
		this.context.model.getPublished(function(err, docs) {
			if(err) {
				console.log(dashes, 'ERROR getting pages for ghpages build \n', err, dashes);
				return;
			}
			/* copy assets */
			var appPath = path.join(_this.context.get('moduleDir'), 'public');
			var mPath = path.join(_this.context.get('moduleDir'), 'app');
			
			async.parallel({
				pages: function(done) {
					// build and save pages
					_this.pages(docs, function() {
						emit('buildPages', {
							message: 'Built HTML and JSON Pages',
						});
						done();
					});
						
				},
				assets: function(done) {
					done();
					
				},
				fonts: function(done) {
					// fonts
					_this.saveDir(path.join(appPath, 'fonts'), path.join(buildPath, 'fonts'), function(err) {
						if(err) {
							console.log("ERROR", err);
						}
						console.log('saved fonts dir');
						emit('buildPages', {
							message: 'Saved ' + path.join(buildPath, 'fonts')
						});
						done();
					});
				},
				css: function(done) {
					// bootstrap css
					_this.saveFile(path.join(appPath, 'styles', 'bootstrap.css'), buildPath, path.join('styles', 'bootstrap.css'), function(err) {
						if(err) {
							console.log("ERROR", err);
						}
						console.log('saved bootstrap css');
						emit('buildPages', {
							message: 'Saved ' + path.join(buildPath, 'styles', 'bootstrap.css')
						});
						
					});
					// bootstrap-ui css
					_this.saveFile(path.join(appPath, 'styles', 'bootstrap-ui.css'), buildPath, path.join('styles', 'bootstrap-ui.css'), function(err) {
						if(err) {
							console.log("ERROR", err);
						}
						console.log('saved bootstrap-ui css');
						emit('buildPages', {
							message: 'Saved ' + path.join(buildPath, 'styles', 'bootstrap-ui.css')
						});
					}, ['/_simpledocs_/', '../']);
					// prism css
					_this.saveFile(path.join(appPath, 'styles', 'prism.css'), buildPath, path.join('styles', 'prism.css'), function(err) {
						if(err) {
							console.log("ERROR", err);
						}
						console.log('saved prism css');
						emit('buildPages', {
							message: 'Saved ' + path.join(buildPath, 'styles', 'prism.css')
						});
					});
					// material-ui css
					_this.saveLess(path.join(mPath, 'styles', 'material-ui.less'), path.join(mPath, 'styles'), 'material-ui.css', path.join(buildPath, 'styles'), function(err) {
						if(err) {
							console.log("ERROR", err);
						}
						emit('buildPages', {
							message: 'Saved ' + path.join(buildPath, 'styles', 'material-ui.less')
						});
						console.log('saved material-ui css');
						done();
					})
				},
				js: function(done) {
					// bootstrap-ui js
					_this.saveFile(path.join(appPath, 'js', 'bundles', 'bootstrap-ui.js'), buildPath, path.join('js', 'bundles', 'bootstrap-ui.js'), function(err) {
						if(err) {
							console.log("ERROR", err);
						}
						emit('buildPages', {
							message: 'Saved ' + path.join(buildPath, 'js', 'bundles', 'bootstrap-ui.js')
						});
						console.log('saved bootstrap-ui js');
						// material-ui js
						_this.saveFile(path.join(appPath, 'js', 'bundles', 'material-ui.js'), buildPath, path.join('js', 'bundles', 'material-ui.js'), function(err) {
							if(err) {
								console.log("ERROR", err);
							}
							console.log('saved material-ui js');
							emit('buildPages', {
								message: 'Saved ' + path.join(buildPath, 'js', 'bundles', 'material-ui.js')
							});
							done();
						});
					});
						
				}			
			}, 
			function(err) {
				emit('buildPages', {
					message: 'Done!',
					success: true,
				});
			});
		});
	}.bind(this));
}

GHPages.prototype.userFile = function(saveAs, callback) {
	
	var _this = this;
	
	if(!callback) {
		callback = function() {};
	}
	
	var theFile = this.context.get('ui js file');
	if(!theFile) {
		console.log('No user file to copy');
		return callback();
	}
	
	var userpath = path.join(this.context.get('appDir'), theFile);
	fs.stat(userpath, function(err) {
		if(err) {
			console.log('USER FILES does NOT EXIST \n', userpath);
		}
		
		_this.saveDir(userpath, saveAs, function (err) {
			console.log('saved user supplied file ' + userpath + ' to ' + saveAs);
			callback();
			
		});
	});
}

GHPages.prototype.saveConfig = function (saveAs, callback) {		
	
	var _this = this;
	
	if(!callback) {
		callback = function() {};
	}
	this.context.expose.sdConfig({}, false, function(err, config) {
		if(!err) {
			
			config.path = {
				root: _this.context.paths.ghpages.root,
				material: _this.context.paths.ghpages.material,
				bootstrap: _this.context.paths.ghpages.bootstrap,
				logout: config.path.logout
			};
			config.api = {
				page: _this.context.paths.ghpages.page,
				search: _this.context.paths.ghpages.search,
				allinone: _this.context.paths.ghpages.allinone
			};
			config.search = false;
			config.usesockets = false;
			var contents = "var simpleDocsUI; var snowUI = simpleDocsUI = " + JSON.stringify(config) + ";"; 
			fs.writeFile(saveAs,  contents, function (err) {
				console.log(err, 'saved config js ' + saveAs);
				callback();
				
			});
		} else {
			console.log('config grab error');
		}
	});
		
}

GHPages.prototype.savePage = function (template, locals, buildPath, saveAs, permalink, callback) {		
	
	var _this = this;
	
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

GHPages.prototype.saveDir = function (source, saveAs, callback) {		
	
	if(!callback) {
		callback = function(err) {
			if(err) console.log('ERROR', err);
		};
	}
	fs.copy(source, saveAs, callback);
	
}

GHPages.prototype.saveFile = function (source, savePath, saveAs, callback, repl) {		
	
	var _this = this;
	
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

GHPages.prototype.saveLess = function (source, sourcePath, saveAs, savePath, callback) {
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

GHPages.prototype.pages = function (docs, finished) {
	var _this = this;
	var buildPath = this.context.get('build path ghpages');
	var indexHTML = path.join(buildPath, 'index.html');
	var template = this.context.get('template path');
	var treepath = (_this.context.paths.ghpages.tree).replace(/\//g, '_');
	// create each ui index page... one will be index.html
	var bs = this.context.get('ui') === 'bootstrap'; 
	var bsPath = bs ? 'index.html' : 'bootstrap_index.html';
	var m = this.context.get('ui') === 'material'; 
	var mPath = m ? 'index.html' : 'material_index.html';
	var locals = {
		pretty: true,
		customeStyle: this.context.get('custom style'),
		development: false,
		ghroute: this.context.get('ghpages route'),
		env: this.context.keystone.get('env'),
		pathConfig: path.join(this.context.get('ghpages route') + "/js/" + this.context.paths.ghpages.permalink.materialPath.replace(/\//g, '-') + "-config.js"),
		pathUser: path.join(this.context.get('ghpages route') + "/js/" + this.context.paths.ghpages.permalink.materialPath.replace(/\//g, '-') + "-user.js"),
		title: this.context.get('simpledocs model config').label,
		theme: this.context.get('theme') != '' ? this.context.get('theme') : '',
		ui: 'material',
		user: { user: {} }			
	};
	var bsLocals = {
		pretty: true,
		customeStyle: this.context.get('custom style'),
		development: false,
		ghroute: this.context.get('ghpages route') ,
		env: this.context.keystone.get('env'),
		pathConfig: path.join(this.context.get('ghpages route') + "/js/", this.context.paths.ghpages.permalink.bootstrapPath.replace(/\//g, '-') + "-config.js"),
		pathUser: path.join(this.context.get('ghpages route') + "/js/", this.context.paths.ghpages.permalink.bootstrapPath.replace(/\//g, '-') + "-user.js"),
		title: this.context.get('simpledocs model config').label,
		theme: this.context.get('theme') != '' ? this.context.get('theme') : '',
		ui: 'bootstrap',
		user: { user: {} }			
	}; 
	_this.userFile( path.join(buildPath, "js" , (this.context.paths.ghpages.permalink.bootstrapPath.replace(/\//g, '-') + "-user.js")));
	emit('buildPages', {
		message: 'Saving user javascript.'
	});
	_this.saveConfig(path.join(buildPath, "js" , (this.context.paths.ghpages.permalink.bootstrapPath.replace(/\//g, '-') + "-config.js")));
	emit('buildPages', {
		message: 'Saving documentation configuration.'
	});
	_this.userFile(path.join(buildPath, "js" , (this.context.paths.ghpages.permalink.materialPath.replace(/\//g, '-') + "-user.js")));
	_this.saveConfig(path.join(buildPath, "js" , (this.context.paths.ghpages.permalink.materialPath.replace(/\//g, '-') + "-config.js")));
	
	emit('buildPages', {
		message: 'Saving root index.html.'
	});
	// bootstrap
	_this.savePage(template, bsLocals, buildPath, path.join(_this.context.paths.ghpages.permalink.bootstrapPath, bsPath).replace(/\//g, '_') + '', !bs ? this.context.paths.ghpages.permalink.bootstrap : false);
	// material
	_this.savePage(template, locals, buildPath, path.join(_this.context.paths.ghpages.permalink.materialPath, mPath).replace(/\//g, '_') + '', !m ? this.context.paths.ghpages.permalink.material : false);
	
	// allinone bootstrap
	_this.savePage(template, bsLocals, buildPath, path.join(_this.context.paths.ghpages.permalink.bootstrapPath, 'single-page').replace(/\//g, '_') + '.html', path.join(_this.context.paths.ghpages.permalink.bootstrap, 'single-page'));
	// allinone material
	_this.savePage(template, locals, buildPath, path.join(_this.context.paths.ghpages.permalink.materialPath, 'single-page').replace(/\//g, '_') + '.html', path.join(_this.context.paths.ghpages.permalink.material, 'single-page'), function(err) {
		if(err) {
			console.log(dashes, err, dashes);	
		}
		
		// allinone json
		_this.context.model.getTree(function(err, thetree, themenu, thelist) {
			_this.context.model.allInOne(false, thelist, function(err, page) {
				// do json
				var save = {
					action: 'simple documentation',
					command: 'allinone',
					success: true,
					message: 'Have a great day!',
					code: 200,
					page: page
				}
				var jsonpath = path.join(buildPath , path.join(_this.context.paths.ghpages.permalink.allinone, 'single-page').replace(/\//g, '_') + '.json');
				_this.saveJson(save, jsonpath, function() {
					emit('buildPages', {
						message: 'Saved allinone JSON.'
					});
				});
							
			});
		});
		
		console.log(dashes, 'Cycle documents ', dashes);
		emit('buildPages', {
			message: 'Building HTML and JSON pages.'
		});
		async.forEachOf(docs, function(doc, k, done){
			var filename = doc.slug;
			var jsonpath = path.join(buildPath , path.join(_this.context.paths.ghpages.permalink.page, filename).replace(/\//g, '_') + '.json');
			
			var bfile = path.join(_this.context.paths.ghpages.permalink.bootstrapPath, filename).replace(/\//g, '_') + '.html';
			var mfile = path.join(_this.context.paths.ghpages.permalink.materialPath, filename).replace(/\//g, '_') + '.html';
			
			// save fake pages
			
			_this.savePage(template, bsLocals, buildPath, bfile, path.join(_this.context.paths.ghpages.permalink.bootstrap, doc.slug));
			_this.savePage(template, locals, buildPath, mfile, path.join(_this.context.paths.ghpages.permalink.material, doc.slug));
			
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
			_this.saveJson(save, jsonpath, function(err) {
				if(err) console.log(err, 'json document not saved ', jsonpath);
				var permalink = path.join(_this.context.paths.ghpages.permalink.page, filename + '.json');
				prepend(jsonpath, "---\npermalink: " + permalink + "\n---\n", function(err) {
					if(err) console.log(err);
					
					done();
					
				});
			});
					
		}, function(err) {
			// FINISHED
			if(finished) {
				finished();
			}
		});
	});
		
}

GHPages.prototype.publish = function (callback) {
	var repo = this.context.get('build ghpages repo');
	var buildPath = this.context.get('build path ghpages');
	var branch = this.context.get('build ghpages branch');
	var cloneTo = this.context.get('build ghpages cloneTo');
	var tag = this.context.get('build ghpages tag');
	var add = this.context.get('build ghpages add');
	var user = this.context.get('build ghpages user');
	var message = this.context.get('build ghpages message');
	
	if(repo && branch && buildPath && cloneTo) {
		emit('buildPages', {
			message: 'Starting to publish.'
		});
		emit('buildPages', {
			message: 'Remove ' + cloneTo
		});
		fs.remove(cloneTo, function() {
			emit('buildPages', {
				message: 'Publishing to ' + repo + '#' + branch
			});
			emit('buildPages', {
				message: 'ALERT: Check the console to enter credentials.'
			});
			ghpages.publish(
				buildPath,
				{
					logger: function(message) {
						console.log(message);
					},
					repo: repo,
					branch: branch,
					clone: cloneTo,
					user: user,
					tag: tag,
					add: !!add,
					message: message
				},
				function(err) {
					console.log(err);
					console.log('-------------------------------------');
					console.log('published to: ');
					console.log('repo: ' + repo);
					console.log('branch: ' + branch);
					console.log('cloned to: ' + cloneTo);
					console.log('It may take a few minutes for the server to refresh.');			
					console.log('-------------------------------------');
					if(callback) {
						callback();
					
					}
					emit('buildPages', {
						message: 'GitHub Pages published',
						published: true
					});
				}
			);
		});
	}
}

var gitHubPages = module.exports = GHPages;

