var socketIO = require('socket.io')();
var fs = require('fs');
var path = require('path');
var jade = require('jade');
var util = require('util');
var async = require('async');
var EventEmitter = require("events").EventEmitter;
var yes = true;
var no = false;
var Types;
var dashes = '\n------------------------------------------------\n';
var less = require('express-less');
var Model = require('../models/SimpleDocs.js')

var templateCache = {};
/**
 * grabs the true app root
 * from Keystone:
 * Don't use process.cwd() as it breaks module encapsulation
 * Instead, let's use module.parent if it's present, or the module itself if there is no parent (probably testing keystone directly if that's the case)
 * This way, the consuming app/module can be an embedded node_module and path resolutions will still work
 * (process.cwd() breaks module encapsulation if the consuming app/module is itself a node_module)
 */
var appRoot = (function(_rootPath) {
	var parts = _rootPath.split(path.sep);
	parts.pop(); //get rid of /node_modules from the end of the path
	return parts.join(path.sep);
})(module.parent ? module.parent.paths[0] : module.paths[0]);
 
/**
 * Simpledocs - create a new documentation source
 * miltiples allowed
 * var simpledocs = require('simpledocs');
 * simpledocs.start('/docs');
 * var sd2 = new simpledocs.SimpleDocs(path,modelName,modelOptions);
 * sd2.start('/more-docs');
 *
 * #### Example:
 * var simpledocs = require('simpledocs');
 * simpledocs.start('/docs');
 * var sd2 = new simpledocs.SimpleDocs(path,modelName,modelOptions);
 * sd2.start('/more-docs');
 *
 * @param {Object} config
 * @method get
 * @api public
 */ 
var SimpleDocs = function(config) {
	
	/* set up the event system */
	EventEmitter.call(this);
	
	if(typeof config !== 'object')config = {};
	
	this._options = {}
	/* set the module variables
	 * */	
	// include directories
	var ddir = __dirname.split('/');
	ddir.pop();
	this.set('moduleDir',ddir.join('/'));
	this.set('appDir',process.cwd());
	
	/* you can add a custom style sheet that is called last of all stylesheets */
	this.set('custom style', false);
	
	/* we have a standard user model for keystone if you need it */
	this.set('add user model',false)
	
	/* we can have multiple documentation sources on the same db.
	 * 
	 * they are split up by collection name 
	 * 
	 * to have multiple doc routes you need to set 'simpledoc model' and 'page'
	 * 
	 * */
	this.set('simpledocs model', config.model || 'SimpleDocs');
	this.set('simpledocs model config', config.modelConfig || {
		label: 'SimpleDocs',
		path: 'simpledocs',
		singular: 'SimpleDocs Document',
		plural: 'SimpleDocs Documents',
	});
	this.set('route', config.route || '/simpledocs');
	
	this.set('standalone', false);
	this.set('app', false);
	this.set('mongoose', false);
	
	this.set('mongo', 'mongodb://localhost/SimpleDocs');
	
	/* you can load the menu tree on each request for development */
	this.set('always load tree', false);
	
	/* collapse the sub menus on load unless active */
	this.set('menu collapse', true);
	
	/* open a single branch when clicking a first level item */
	this.set('menu single branch', false);
	
	/* set the home page  */
	this.set('homepage', 'contents');
	
	/* set a custom theme on the body  */
	//this.set('theme','dark-theme');
	this.set('theme', false);
	
	/* wysiwyg in ui for html  */
	this.set('wysiwyg', false);
	
	/* height of the html input box  */
	this.set('html height', 300);
	
	/* ui & options */
	this.set('ui', 'bootstrap');
	this.set('ui options', {
		loadCodeFile: false, //
	});
	this.set('material main dark', {});
	this.set('material default light', {});
	this.set('material default dark', {});
	
	/* all in one view option */
	/* false, true, only */
	this.set('single page', false);
	
	this.options(config);
	
}

/**
 * attach the event system to SimpleDocs 
 * */
 util.inherits(SimpleDocs, EventEmitter);
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
SimpleDocs.prototype.start = function(userSuppliedKeystone, config) {
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

/**
 * sockets
 * 
 * add the socket once server starts
 *
 * ####Example:
 *
 *     SimpleDocs.sockets(Live.io) // 
 *
 * @method get
 * @api public
 */ 
SimpleDocs.prototype.sockets = function(UserIO) {
	
	if(UserIO) {
		this.set('io', UserIO);
	}
	
	if(!this.io) {
		this.set('io', socketIO.attach(this.keystone.httpServer));
	}
	
	var keystone = this.keystone;
	var io = this.io;
	var model = this.get('simpledocs model');
	this.socket =  io.of(this.get('namespace'));
	this.socket.on("connection", function(socket) {
		
		socket.on("disconnect", function(s) {
			
		});
		
		/* single page */
		socket.on("page", function(page) {
			if(!page) {
				return socket.emit('page', {action:'simple documentation',command:'page',success:false,message:'Please include a page slug.',code:501});
			}

			async.series([
				function(next) {
					if (page === 'tree' || simpledocs.get('always load tree')) {
						keystone.list(model).model.getTree(function(err, thetree, themenu, thelist) {
							
							next(null, {
								extra: true,
								tree: thetree,
								menu: themenu,
								pageList: thelist
							});
						});
					} else {
						next(null, {
							extra: false
						});
					}
				},
			],function(err, pass) {
				keystone.list(model).model.getPage(page, function(err, page) {
					if(err) {
						return socket.emit('page', {
							action:'simple documentation',
							command:'page',
							success:false,
							message:err,
							code:501
						});
					}					
					if(page === null) {
						return socket.emit('page', {
							action:'simple documentation',
							command:'page',
							success:false,
							error:'Page not found',
							code:404
						});
					}
					
					var result = {
						action:'simple documentation',
						command:'page',
						success:true,
						message:'Have a great day!',
						code:200,
						title:page.title,
						slug:page.slug,
						page:page,
					};
					if(pass.extra) {
						result.pagelist = pass.pagelist;
						result.tree = pass.tree;
						result.menu = pass.menu;
					}
					return socket.emit('page', result);				
				});
				
			});
				
			console.log('page socket', page);
		}); 
		
		/* search */
		socket.on("search", function(page) {
			if(!page) {
				return socket.emit('page', {action:'simple documentation',command:'page',success:false,message:'Please include a search term.',code:501});
			}
			keystone.list(model).model.search(page, function(err, searchedPages) {
				if(err) {
					return socket.emit('page', { action:'simple documentation', command:'search', success:false, message:err, code:501 });
				}
				if(page === null) {
					return socket.emit('page', { action:'simple documentation', command:'search', success:false, error:'Page not found', code:404 });
				}
				console.log('search socket', page, searchedPages);
				return socket.emit('page', { action:'simple documentation', command:'search', success:true, title:'Search', code:200, page:searchedPages, search:searchedPages});				
			});
			
			
		}); 
		
		/* allinone */
		socket.on("allinone", function() {			
			keystone.list(model).model.getTree(function(err, tree, menu, pageList) {
				keystone.list(model).model.allInOne('', pageList, function(err,page) {
					if(err) {
						return socket.emit('page', {
							action: 'simple documentation',
							command: 'allinone',
							success: false,
							message: err,
							code: 501
						});
					}
					if(page === null) {
						return socket.emit('page', {
							action: 'simple documentation',
							command: 'allinone',
							success: false,
							error: 'Page not found',
							code: 404
						});
					}
					return socket.emit('page', {
						action: 'simple documentation', 
						command: 'allinone', 
						success: true, 
						message: 'Have a great day!',
						code: 200, 
						page: page,
					});				
				});
			});
			
			console.log('page socket allinone');
		}); 
		
		socket.on("status", function() {
			socket.emit('status', { connected: true });
		});
		
	});

}

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
SimpleDocs.prototype._init = function(config) {
	
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
SimpleDocs.prototype._keystone = function() {
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
		var standalone = require('./start/standalone.js');
		standalone.call(this, keystone, function(app){ 
			/* emit an event for you to add your own keystone */
			_this.emit('keystone', keystone);
			_this.emit('model', keystone);
		});
		
	} else if(app && mongoose) {
		var custome =  require('./start/custom.js');
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
SimpleDocs.prototype._model = function(config) {
	/* add our models */
	this.model();
	/* User model if you want to access the keystone admin UI and dont currently have a user model*/
	if(this.get('add user model')) {
		require('../models/User.js')(this.keystone);
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
SimpleDocs.prototype._routes = function() {
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
SimpleDocs.prototype._complete = function(errors) {
	console.log(dashes,'New documentation site started on ',this.get('route'),dashes);	
}

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
SimpleDocs.prototype.statics = function() {
	
	var keystone = this.keystone;
	var app = this.keystone.app;
	var SD = this;
	
	//console.log('simpledocs-files', path.join(SD.get('moduleDir'), 'app'));
	/* we use snowhub in the UI so we dont clash anywhere
	 * */
	app.use("/snowdocs", keystone.express.static(SD.get('moduleDir') + "/public"));
	/* material ui */
	app.use('/simpledocs-files', keystone.express.static(path.join(SD.get('moduleDir'), 'app')));
	app.use(
		'/simpledocs-css',
		less(
			path.join(SD.get('moduleDir'), 'app','styles'),
			{ 
				compress: app.get('env') == 'production',
				debug: app.get('env') == 'development'
			}
		)
	);
}

/**
 * model
 * 
 * create and register a model for this doc source
 *
 * ####Example:
 *
 *     SimpleDocs.model() 
 *
 * @method get
 * @api public
 */ 
SimpleDocs.prototype.model = Model

/**
 * create the routes on path
 *
 * ####Example:
 *
 *     SimpleDocs.add(setview,callback) // 
 *
 * @param {String} path
 * @param {Function} callback
 * @method get
 * @api public
 */ 
SimpleDocs.prototype.add = function(callback) {
	/* add the docs page
	 * */
	var SD = this;
	var keystone = this.keystone;
	var app = this.keystone.app;
	var	route = this.get('route');
	var wild = (route === '/' || route === '*' || route === '') ? '' : route;
	var ui = this.get('ui');
	var	bootstrap = wild + '/bootstrap';
	var material = wild + '/material';
	var customPack = wild + '/' + ui;
	if(!ui) {
		ui = 'bootstrap';
	}
	var	simpledocs = this;
	var	model = this.get('simpledocs model');
	var	modelConfig = this.get('simpledocs model config');

	simpledocs.set('namespace', '/' + this.keystone.utils.slug(route));
	
	if(typeof modelConfig !== 'object') {
		modelConfig = {};
	}
	
	if(route.charAt(0) !== '/') {
		route = '/' + route;
	}
	
	/* reconfigure less
	 * currently we just run less in the static setup
	 * */
	//if(keystone.get('simpldocs less config') !== true)this.lessSetup();
	
	/* add our static files as an additional directory
	 * */
	this.statics();
	
	/* add the api controller */
	var api = route + '-json';
	var api2 = route + '-json/:type';
	var api3 = route + '-json/:type/:page';
	app.get(api, 
		publicAPI, //middleware to add api response
		apiRoute /* the route */	
	);
	app.get(api2, 
		publicAPI, //middleware to add api response
		apiRoute /* the route */	
	);
	app.get(api3, 
		publicAPI, //middleware to add api response
		apiRoute /* the route */	
	);
	
	/* add the configuration javascript */
	app.get("*/__simpledocs/config", sdConfig); 
	app.get(bootstrap + "/__simpledocs/config", sdConfig);
	app.get(material + "/__simpledocs/config", sdConfig);
	
	/* routes */
	var mainView = (ui === 'material') ? materialView : bootstrapView;
	
	/* add a ui as main route */
	app.get(route, mainView);
	
	/* add the bootstrap ui */
	app.get(bootstrap, bootstrapView);
	app.get(bootstrap + '/*', bootstrapView);
	
	/* add the material-ui ui */
	app.get(material, materialView);
	app.get(material + '/*', materialView);
	
	/* add wildcard routes */
	app.get(wild  + '/*', mainView);	
	
	if(typeof callback === 'function') {
		callback();
	}
	
	/** functions **/
	/* middleware to add snowpiResponse */
	function publicAPI(req, res, next) {
		res.snowpiResponse = function(status) {
			//add the requesting url back to the response
			status.url = req.protocol + '://' + req.get('host') + req.originalUrl; 
			/* you can customize the response here using the status object.  dont overwrite your existing props. */
			
			/* add in the response with json */
			if (req.query.callback) {
				res.jsonp(status);
			} else {
				res.json(status);
			}
		};
		res.snowpiError = function(key, err, msg, code) {
			msg = msg || 'Error';
			key = key || 'unknown error';
			msg += ' (' + key + ')';
			if (keystone.get('logger')) {
				console.log(msg + (err ? ':' : ''));
				if (err) {
					console.log(err);
				}
			}
			res.status(code || 500);
			res.snowpiResponse({ error: key || 'error', detail: err });
		};
		next();
	};
	/* build the route for tree and pages */
	function apiRoute(req, res) {
				
		var tree;
		var menu;
		var pageList;
		
		if (!keystone.security.csrf.validate(req)) {
			//return res.snowpiResponse({action:'docs',command:'directions',success:'no',message:'Bad Token',code:501,data:{}});
		}
		
		var locals = res.locals;
				
		async.series([
			function(next) {
				if (req.params.type === 'allinone' || req.params.type === 'tree' || simpledocs.get('always load tree')) {
					keystone.list(model).model.getTree(function(err, thetree, themenu, thelist) {
						tree = thetree;
						menu = themenu;
						pageList = thelist;
						next();
					});
				} else {
					next();
				}
			},
		],function(err) {
			//console.log('tree');
			//console.log(util.inspect(tree,false,null));
			if(req.params.type === 'tree') {
				return res.snowpiResponse({action:'simple documentation',command:'tree',success:true,message:'Good start',code:200,tree:tree,menu:menu});
			}
			var ret = true;
			
			if (req.params.type === 'search') {
				console.log('search request',req.params);
				if(!req.params.page) {
					return res.snowpiResponse({action:'simple documentation',command:'page',success:false,message:'Please include a search term.',code:501});
				}
				keystone.list(model).model.search(req.params.page,function(err,page) {
					if(err)return res.snowpiResponse({action:'simple documentation',command:'search',success:false,message:err,code:501});
					if(page === null)return res.snowpiResponse({action:'simple documentation',command:'search',success:false,error:'Page not found',code:404});
					page.term = req.params.page;
					return res.snowpiResponse({action:'simple documentation',command:'search',success:true,message:'Have a great day!',code:200,search:page,tree:tree,menu:menu});				
				});
				
				var ret = true;
			}
			if (req.params.type === 'page') {
				//console.log('page request',req.params.page);
				if(!req.params.page) {
					return res.snowpiResponse({action:'simple documentation',command:'page',success:false,message:'Please include a page slug.',code:501});
				}
				keystone.list(model).model.getPage(req.params.page,function(err,page) {
					if(err)return res.snowpiResponse({action:'simple documentation',command:'page',success:false,message:err,code:501});
					if(page === null)return res.snowpiResponse({action:'simple documentation',command:'page',success:false,error:'Page not found',code:404});
					return res.snowpiResponse({action:'simple documentation',command:'page',success:true,message:'Have a great day!',code:200,title:page.title,slug:page.slug,page:page,tree:tree,menu:menu});				
				});
				var ret = true;
			} 
			
			if (req.params.type === 'allinone') {
				//console.log('page request',req.params.page);
				keystone.list(model).model.allInOne(req.params.page, pageList, function(err,page) {
					if(err) {
						return res.snowpiResponse({action:'simple documentation',command:'allinone',success:false,message:err,code:501});
					}
					if(page === null) {
						return res.snowpiResponse({action:'simple documentation',command:'allinone',success:false,error:'Page not found',code:404});
					}
					return res.snowpiResponse({action:'simple documentation', command:'allinone', success:true, message:'Have a great day!',code:200, page:page, tree:tree, menu:menu});				
				});
				var ret = true;
			} 
				
			if(!ret) {
				return res.snowpiResponse({action:'docs',command:'directions',success:false,message:'You are lost.  Try and send a command I understand.',code:501});
			}
		}); // end async series
	}
	
	function sdConfig (req, res) {
		var tree;
		var menu;
		var pagelist;
		
		//send a javascript header and file contents
		res.set('Content-Type', 'text/javascript');
		keystone.list(model).model.getTree(function(err, thetree, themenu, thelist) {
			tree = thetree;
			menu = themenu;
			pagelist = thelist;
			snowdone(); 
		});	
		function snowdone() {
			var config = {
				singleBranch: simpledocs.get('menu single branch'),
				collapse: simpledocs.get('menu collapse'),
				name: modelConfig.label,
				port: keystone.get('port'),
				ui: simpledocs.get('ui'),
				options: simpledocs.get('ui options'),
				namespace: simpledocs.get('namespace'),
				alwaysloadtree: simpledocs.get('always load tree'),
				homepage: simpledocs.get('homepage'),
				allinone: simpledocs.get('single page'),
				singlePage: 'single-page',
				materialStyle: {
					mainDark : simpledocs.get('material main dark'),
					defaultLight : simpledocs.get('material default light'),
					defaultDark : simpledocs.get('material default dark'),
				},
				api: {
					page: api + '/page',
					tree: api + '/tree',
					search: api + '/search',
					allinone: api + '/allinone'
				},
				path: {
					root: wild,
					material: (ui === 'material') ? route : material,
					bootstrap: (ui === 'bootstrap') ? wild : bootstrap,
					logout: keystone.get('signout url')
				},
				isMe: keystone.security.csrf.getToken(req, res),
				isKey: keystone.security.csrf.getToken(req, res),
				breaks: {
					small: {
						width:768
					}
				},
				tree: tree,
				menu: menu,
				pagelist: pagelist,
				themeToToggle:simpledocs.get('theme') || 'dark-theme',
				waitingForPage: false,
			};
			
			var contents = "var snowUI = " + JSON.stringify(config) + ";"; 
			
			return res.send(contents); 
		}		
	}//end
	
	function bootstrapView(req, res) {		 
		//send our own result here
		var templatePath = simpledocs.get('moduleDir') + '/templates/views/simpledocs.jade';
		
		var jadeOptions = {
			filename: templatePath,
			pretty: keystone.get('env') !== 'production'
		};

		var compileTemplate = function() {
			return jade.compile(fs.readFileSync(templatePath, 'utf8'), jadeOptions);
		};
		
		var template = keystone.get('viewCache')
			? templateCache[view] || (templateCache[view] = compileTemplate())
			: compileTemplate();
		
		var locals = {
			env: keystone.get('env'),
			brand: keystone.get('brand'),
			customeStyle: simpledocs.get('custom style'),
			homepage: simpledocs.get('homepage'),
			allinone: simpledocs.get('single page'),
			singleBranch: simpledocs.get('menu single branch'),
			collapse: simpledocs.get('menu collapse'),
			user: req.user,
			pathLogout: keystone.get('signout url'),
			section: {},
			title: modelConfig.label,
			theme: simpledocs.get('theme') || false,
			pathConfig: wild + "/__simpledocs/config",
			apiTree: api + '/tree',
			apiPage: api + '/page',
			csrf_token_key: keystone.security.csrf.TOKEN_KEY,
			csrf_token_value: keystone.security.csrf.getToken(req, res),
			csrf_query: '&' + keystone.security.csrf.TOKEN_KEY + '=' + keystone.security.csrf.getToken(req, res),
		}; 
		// Render the view
		var html = template(locals);

		res.send(html);		 
	}
	
	function materialView( req, res ) {
		var options = {
			root: path.join(SD.get('moduleDir'), 'app'),
			dotfiles: 'deny',
			headers: {
				'x-timestamp': Date.now(),
				'x-sent': true
			}
		};
		var fileName = 'index.html';
		res.sendFile(fileName, options, function (err) {
			if (err) {
				debug(err);
				res.status(err.status).end();
			}
		});
	}
}

/**
 * 
 * add our path to the less setup path 
 * 
 * 
 * */
SimpleDocs.prototype.lessSetup = function() {
	var dir = this.get('moduleDir');
	var config = {
		dest: path.join(dir, 'public'),
		preprocess: {
			path: function(pathname, req) {
				return pathname.replace(/\/snowdocs\//, '/');
			},
			
		}, 
		storeCss: function(pathname, css, next) {
			var newpath = pathname.replace(/\/snowdocs\//, '/');
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


SimpleDocs.prototype.set = function(key, value) {
	
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
	}
	
	this._options[key] = value;
	
	return this._options[key];
	
}

SimpleDocs.prototype.get = SimpleDocs.prototype.set;

/**
 * Sets multiple SimpleDocs options.
 *
 * ####Example:
 *
 *     keystone.set({test: value}) // sets the 'test' option to `value`
 *
 * @param {Object} options
 * @api public
 */

SimpleDocs.prototype.options = function(options) {
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

/**
 * Simpledocs 
 * 
 * create a new instance
 * 
 * ####Example:
 * var simpledocs = require('simpledocs');
 * simpledocs.start('/docs');
 * var sd2 = new simpledocs.SimpleDocs(path,modelName,modelOptions);
 * sd2.start('/more-docs');
 *
 * @param {String} text
 * @param {String} password
 * @method get
 * @api public
 */ 

SimpleDocs.prototype.SimpleDocs = SimpleDocs;



var simpledocs = module.exports = exports = new SimpleDocs();
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
