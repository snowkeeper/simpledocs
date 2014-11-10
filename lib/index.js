var 	keystone = require('keystone'),
	fs = require('fs'),
	path = require('path'),
	jade = require('jade'),
	util = require('util'),
	express = require('express'),
	async = require('async'),
	EventEmitter = require("events").EventEmitter,
	yes = true, 
	no = false,
	Types = keystone.Field.Types,
	start = {
		standalone : require('./start/standalone.js'),
		custom : require('./start/custom.js')
	},
	dashes = '\n------------------------------------------------\n';

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
	this.set('custom style',false);
	
	/* we have a standard user model for keystone if you need it */
	this.set('add user model',false)
	
	/* we can have multiple documentation sources on the same db.
	 * 
	 * they are split up by collection name 
	 * 
	 * to have multiple doc routes you need to set 'simpledoc model' and 'page'
	 * 
	 * */
	this.set('simpledocs model',config.model || 'SimpleDocs');
	this.set('simpledocs model config',config.modelConfig || {
		label: 'Simple Documentation',
		path: 'simple-documentation',
		singular: 'Document',
		plural: 'Simple Documents',
	});
	this.set('route', config.route || '/docs');
	
	this.set('standalone', false);
	this.set('app', false);
	this.set('mongoose', false);
	
	this.set('mongo','mongodb://localhost/simple-documentation');
	
	/* you can load the menu tree on reach request for development */
	this.set('always load tree',true);
	
	/* set the home page  */
	this.set('homepage','contents');
	
	/* set a custom theme on the body  */
	//this.set('theme','dark-theme');
	this.set('theme',false);
	/* wysiwyg in ui for html  */
	this.set('wysiwyg',false);
	
	/* wysiwyg in ui for html  */
	this.set('html height', 300);
	
	
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
SimpleDocs.prototype.start = function(config) {
	/* we emit init who calls keystone */
	this.on('init',this._init)
	.on('model',this._model)
	.on('routes',this._routes)
	.on('complete',this._complete);
	
	this.emit('init',config);
	return this;
	
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
		
		log('no config object so running model');
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
	var app = this.get('app'),
		mongoose = this.get('mongoose'),
		standalone = this.get('standalone'),
		route = this.get('route'),
		_this = this;
		
	if(standalone) {
		/*set the user model to on */
		this.set('add user model',true);
		if(route && route !== '/') {
			keystone.redirect({
				'/': route
			});
		}
		start.standalone.call(this,keystone,function(){_this.emit('model');});
		
	} else if(app && mongoose) {
		start.custom.call(this,function(){_this.emit('model');});
		
	} else {
		this.emit('model');
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
	/* User model if you want to add the greeter or something */
	if(this.get('add user model'))require('../models/User.js');
		
	this.emit('routes');
		
	
	
	
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
	this.add(function(){_this.emit('complete')});	
	
	
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
	
	var app = keystone.app;
	/* we use snowhub in the UI so we dont clash anywhere
	 * */
	app.use("/snowdocs", express.static(this.get('moduleDir') + "/public"));
	
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
SimpleDocs.prototype.model = function() {
	
	var simpledocs = this,
		model = simpledocs.get('simpledocs model'),
		config = simpledocs.get('simpledocs model config');
	
	if(typeof config !== 'object')config = {};
	//console.log('create simple doc source',model,config);
	/**
	 * User Model
	 * ==========
	 */

	var SimpleDocModel = new keystone.List(model,{
			track:true,
			autokey: { path: 'key', from: 'title', unique: true },
			map: { name: 'title' },
			label: config.label || 'Simple Documentation',
			path: config.path || model + '-documentation',
			singular: config.singular || 'Document',
			plural: config.plural || 'Simple Documents',
			drilldown: 'parent',
			
			sortContext: model+':parent',
			defaultSort: 'parent order', 
		});

	SimpleDocModel.add({
		parent: { type: Types.Relationship, ref: model, many:false , label: 'Parent Document', initial: true},
		title: { type: String,  index: true, initial: true,required: true},
		slug: { type: Types.Key,  index: true,note:'leave blank to auto-generate based on title.  Will be reformed if neccessary.'},
		
		display: {type: Types.Select, numeric: true, options: [{ value: 2, label: 'Html only' },{ value: 1, label: 'Markdown Only' },  { value: 3, label: 'Markdown then Html' }, { value: 4, label: 'Html then Markdown' }], label: 'Content is', emptyOption: false },
		html: { type: Types.Html,height:simpledocs.get('html height'), wysiwyg: simpledocs.get('wysiwyg'), label: 'Document HTML Contents'  },
		markdown: { type: Types.Markdown, label: 'Document Markdown Contents',height:250,note:'here is an editor you can use to copy/paste... <a href="http://jbt.github.io/markdown-editor/" target="_blank">http://jbt.github.io/markdown-editor/</a>' },
		
		links: {type: Types.Relationship, ref: model, many:true , label: 'Related Documents',  },
		externalLinks: {type: Types.Url,  many:true , label: 'Related External Links' ,note:'separate links with a comma or space.'  },
		type: {type: Types.Select, numeric: true, options: [{ value: 1, label: 'Document Contents' }, { value: 2, label: 'List of Child Root Documents' }, { value: 3, label: 'Contents then List of Child Root Documents' }], label: 'Show:', emptyOption: false },
		
		
		sortBy: {type: Types.Select, numeric: true, options: [{ value: 1, label: 'Current Order if defined' },{ value: 2, label: 'Enter Number' }, { value: 3, label: 'Before Document' }, { value: 4, label: 'After Document' }, { value: 5, label: 'Set Manually for this Document Only' }], label: 'Order Placement', emptyOption: false },
		sortNumber: { dependsOn: { sortBy: 2 },type: String, note: 'Accepts a number, prepend and append', default: 'append',  index: true,  label: 'Sort order among other child documents'},
		sortBefore: { dependsOn: { sortBy: 3 }, type: Types.Relationship, ref: model, label: 'Before this Document'}, 
		sortAfter: { dependsOn: { sortBy: 4 }, type: Types.Relationship, ref: model,  label: 'After this Document'},
		order: {dependsOn: { sortBy: 5 }, type: Types.Number, noedit:false, index:true,label:'Order Manually',note:'only change this value if you need to manully set the order.  Try and let Order Placement order for you'},	
		currentOrder: {type: Types.Number, noedit:true, label:'Current Order' }
	});

	SimpleDocModel.relationship({ ref: model, refPath: 'parent', path: 'childof' ,label:'Child Documents'});
	SimpleDocModel.relationship({ ref: model, refPath: 'links', path: 'linkedto',label:'Showing links to' });
	/**
	 *  Statics
	 * =====
	*/
	SimpleDocModel.schema.statics.getPage = function getPage(slug,cb) {
		var model = this;
		//console.log('page model request',slug);
		model.findOne({slug:slug}).select('-__v').populate('parent','parent title slug order').populate('links','parent title slug order').lean().exec(function(err,doc) {
			if(err)return cb(err);
			return cb(null,doc);
		});
	}	
	
	SimpleDocModel.schema.statics.getTree = function getTree(cb) {
		
		var 	model = this,
			menu = {},
			tree;
			
		var createMenu = function(pages,pushto,callback) {
			/* we get a object of menu items
			 * push results to pushto
			 * */
			//console.log('pages',pages)
			if(typeof pages === 'object') {
				//console.log('our list of documents');
				async.each(pages.docs,function(v,next) {
					//console.log('each document ',v.slug);
					var newv = v;
					newv.documents = [];
					var pushed = pushto.push(newv);
					//console.log('pushed ',pushed);
					if(menu[v._id]) {
						if(menu[v._id].docs instanceof Array) {
							//console.log(v.slug,' has child docs so create menu items');
							var tmenu = menu[v._id];
							createMenu(tmenu,pushto[pushed-1].documents,next);
						} else {
							next();
						}
					} else {
						next();
					}
				},function(err) {
					callback(tree)
				});
			}
		}
		// group our docs by parent, roots will be null
		model.aggregate(
		    //{ $match: {parent:'username'} },  // query the document
		    //{ $unwind: "$msgs" },   // break the 'msgs' array into subdocuments
		    //{ $match: { "msgs.s" : 'user1'} }, // match the filed in subdocuments
		    { $sort: {"parent" : -1} },
		    { $sort: {"order" : 1} },
		    { $project: { id: 1, title:1, parent:1 ,order:1, slug:1}}, // project the fileds 
		    { $group : { _id : "$parent", pages: { $push: "$title"}, slugs: { $push: "$slug"}, docs : { $push : "$$ROOT" } }},
		    //{ $sort: {"order" : -1} },
		    function (err, pages ) { 
			if(err) console.log(err);
			if(pages !== null && pages instanceof Array) {
				pages.reverse();
				
				pages.forEach(function(v) {
					//console.log(v._id);
					menu[v._id] = v;
					if(v._id === null) {
						//console.log('root documents');
						tree = v.docs.map(function(v) {
							return {id:v._id,title:v.title,slug:v.slug,documents:[]};
						}).filter(function(vv){return vv !== undefined});
					}	
				});
				//console.log('tree',tree);
				/* loop through the roots and run a recursive to build the menu into itself */
				if(tree instanceof Array) {
					tree.forEach(function(v,k) {
						if(menu[v.id]) {
							//console.log('we have menu items for ',v.slug,' so add to tree index ',k);
							var tmenu = menu[v.id];
							createMenu(tmenu,tree[k].documents,function(t) {});
							
						}
					});
					cb(null,tree,menu);
					
				} else {
					cb('no tree');
				}
				
				
			}
			
		});/*end aggregate*/
		   
		
		
	}	
	/**
	 *  Pre
	 * =====
	*/
	SimpleDocModel.schema.pre('save', function(next) {
		var doc = this,
			sort = doc.sortNumber,
			sortN = parseFloat(doc.sortNumber);
		
		if(isNaN(sortN))sortN = 0;
		
		if(!doc.slug)doc.slug=doc.title.toLowerCase();
		//*do the order sorting */
		if(doc.order && (doc.sortBy === '' || doc.sortBy === 5))next();
		
		/* increment the docs */
		var inc = function(doc,cb) {
			/* populate the parent object to get its order and updatre parentOrder then increment */
			//console.log('increment order',doc.order,doc.parent);
			var plus = doc.order;
			var minus = doc.order;
			keystone.list(model).model.find({ "parent" : doc.parent }).sort("order").exec(function(err,coll){
				if(err){
					console.log('increment failed',err);
					return cb("Error in incrementing." + err);
				}
				var l = {};
				var i = 1;
				coll.forEach(function(v,k) {					
					if(doc.order === i) i++;
					var nn = doc.key !== v.key ? i : doc.order;
					if(doc.key !== v.key) {
						//console.log('update',v.title,i,doc._id===v._id);
						keystone.list(model).model.update({ _id : v._id},{order:i,currentOrder:i,sortNumber:i}).exec(function(err){});
						i++;
					}
					l[nn] =  v.slug;
					
				});
				//console.log(l);
					
				return cb(null);
			});
					
			
		}
		
		var finish = function(err) {
			doc.sortNumber = doc.order;
			doc.currentOrder = doc.order;
			doc.sortBefore = undefined;
			doc.sortAfter = undefined;
			if(doc.sortBy === 1) {
				console.log('finished doc, skipped increment',doc.order);
				next();
			
			} else {
				doc.sortBy = 1;
				inc(doc,function(err){
					if(err)console.log('Erorr',err);
					console.log('finished doc',doc.order);
					next();
			
				});
				
			}
				
		}		
		
				
		/* set the sort order */
		if(doc.sortBy === 1 ) {
			
			console.log('use current sort order');
			return finish();
			
		} else if(doc.sortBy > 2) {
			
			console.log('sort before or after',doc.sortBefore,doc.sortAfter);
			
			if(!doc.sortBefore && !doc.sortAfter)return finish(); 
			
			// grab the order number of the selected doc
			var parent = doc.sortBy === 3 ? doc.sortBefore : doc.sortAfter;
			keystone.list(model).model.count({parent:doc.parent},function(err,count) {
				keystone.list(model).model.findOne({"_id":parent}).select('order title').exec(function(err,point) {
					if(err)return finish(err);
					
					if(!point || point === null) return finish();
					
					if(doc.sortBy === 3 ) {
						/* this is a before, set doc.order equal to point.order unless it is the last item then set to point-1*/
						if(point.order === count) {
							doc.order = point.order - 1;
						} else {
							doc.order = point.order;
						}
					} else {
						/* this is an after, set doc.order to point.order + 1 unless it is the last item then set to equal or if we are the first item then set to equal*/
						if(point.order === count || doc.order === 1) {
							doc.order = point.order;
						} else {
							doc.order = point.order + 1;
						}
					}
					console.log('parent sort',doc.sortBy,point.title,point.order,'total',count,'new order',doc.order);
					return finish()
				});
			});
			
		} else {
			console.log('sort by number');
			// grab the total number of rows for the parent
			keystone.list(model).model.count({parent:doc.parent},function(err,count) {
				//console.log(parent,'sort',sort,'sortN',sortN,'count',count);
				if(count === 0 && doc.parent != null && doc.parent != undefined) {
					doc.order = 1;	
				}
				if(sort	=== 'prepend' || (sortN === 0 && sort === '0')) {
					doc.order = doc.parent != null && doc.parent != undefined ? 1 : 0;
					
				} else if(sort === 'append' || (sortN === 0 && sort !== '0')) {
					doc.order = count;
					
				} else if(sortN) {
					if(sortN > count) {
						doc.order = count;
					} else {
						doc.order = sortN;
					}
				} else {
					doc.order = count + 1;
					
				}
				return finish(err);	
			});
		}
	});

	/**
	 * Registration
	 */

	SimpleDocModel.defaultColumns = 'name, order, sortNumber, parent, parentOrder, type, slug';
	SimpleDocModel.register();
	
}


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
	var 	app = keystone.app,
		view = this.get('route') || '/docs',
		setview = view,
		simpledocs = this,
		model = this.get('simpledocs model'),
		modelConfig = this.get('simpledocs model config');
	
	if(typeof modelConfig !== 'object')modelConfig = {};
	
	
	if(view.charAt(0) !== '/')view = '/'+view;
	
	/* add our static files as an additional directory
	 * */
	this.statics();
	
	/* reconfigure less
	 * */
	//if(keystone.get('simpldocs less config') !== true)this.lessSetup();
	 
	
	
	
	/* middleware to add snowpiResponse
	 * */
	var publicAPI = function(req, res, next) {
		res.snowpiResponse = function(status) {
			//add the requesting url back to the response
			status.url=req.protocol + '://' + req.get('host') + req.originalUrl; 
			/* you can customize the response here using the status object.  dont overwrite your existing props. */
			
			/* add in the response with json */
			if (req.query.callback)
				res.jsonp(status);
			else
				res.json(status);
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
	var apiRoute = function(req, res) {
				
		var tree,menu;
		
		if (!keystone.security.csrf.validate(req)) {
			//return res.snowpiResponse({action:'docs',command:'directions',success:'no',message:'Bad Token',code:501,data:{}});
		}
		if (req.params.type === 'tree' || simpledocs.get('always load tree')) {
			
			var locals = res.locals;
					
			async.series([
				function(next) {
					keystone.list(model).model.getTree(function(err,thetree,themenu) {
						tree = thetree;
						menu = themenu
						next();
					});
				},
			],function(err) {
				//console.log('tree');
				//console.log(util.inspect(tree,false,null));
				if(req.params.type === 'tree')return res.snowpiResponse({action:'simple documentation',command:'tree',success:true,message:'Good start',code:200,tree:tree,menu:menu});
		
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
			
		if(!ret)return res.snowpiResponse({action:'docs',command:'directions',success:false,message:'You are lost.  Try and send a command I understand.',code:501});
		
		
	}
	/* add the api controller */
	var api = view + '-json';
	var api2 = view + '-json/:type';
	var api3 = view + '-json/:type/:page';
	app.get(api, 
		publicAPI, //middleware to add api response
		apiRoute /* the route */	
	); //end
	app.get(api2, 
		publicAPI, //middleware to add api response
		apiRoute /* the route */	
	); //end
	app.get(api3, 
		publicAPI, //middleware to add api response
		apiRoute /* the route */	
	); //end
	
	var publicRoute = function(req, res) {
			 
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
				user: req.user,
				pathLogout: keystone.get('signout url'),
				section: {},
				title: modelConfig.label,
				theme: simpledocs.get('theme') || false,
				pathRoot: view,
				apiTree: api+'/tree',
				apiPage: api+'/page',
				csrf_token_key: keystone.security.csrf.TOKEN_KEY,
				csrf_token_value: keystone.security.csrf.getToken(req, res),
				csrf_query: '&' + keystone.security.csrf.TOKEN_KEY + '=' + keystone.security.csrf.getToken(req, res),
			};
	
			// Render the view
			var html = template(locals);
	
			res.send(html);
			
	}
	/* add the documentation front ui */
	app.get(view,publicRoute);
	app.get(view+'/*',publicRoute);
	
	
	if(typeof callback === 'function')callback();
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
	console.log(lessPaths);
	keystone.set('less',lessPaths);
	keystone.set('less middleware options',config);
	
	keystone.set('simpldocs less config',true);
		
	return;
	
}


SimpleDocs.prototype.set = function(key,value) {
	
	if (arguments.length === 1) {
		return this._options[key];
	}
	// old config used text instead of label
	if(key.trim().slice(-4) === 'text') {
		this._options[key] = value;
		var nn = key.trim().split(' ');
		key = nn[0] + ' label';
	}
	this._options[key] = value;
	
	return this._options[key];
	
}

SimpleDocs.prototype.get = SimpleDocs.prototype.set;

/**
 * Sets multiple keystone options.
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
