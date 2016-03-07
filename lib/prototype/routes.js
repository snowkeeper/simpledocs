var dashes = '\n------------------------------------------------\n';
var PKG = require('../../package.json');
var yes = true;
var no = false;
var jade = require('jade');
var async = require('async');
var fs = require('fs-extra');
var path = require('path');

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
module.exports = function(callback) {
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
	simpledocs._routes = 
		api: {
			page: api + '/page',
			tree: api + '/tree',
			search: api + '/search',
			allinone: api + '/allinone'
		},
		paths: {
			root: wild,
			material: (ui === 'material') ? route : material,
			bootstrap: (ui === 'bootstrap') ? route : bootstrap,
		},
		export: {
			material: (ui === 'material') ? '/' : '/material/',
			bootstrap: (ui === 'bootstrap') ? '/' : '/bootstrap/',
			page: '-json' + '/page/',
			tree: '-json' + '/tree/',
			search: '-json' + '/search/',
			allinone: '-json' + '/allinone/'
		},
	}
	
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
	//app.get("*/__simpledocs__/config", sdConfig);
	app.get(wild + "/__simpledocs__/user.js", userConfig); 
	//app.get(material + "/__simpledocs__/user", userConfig); 
	app.get(wild + "/__simpledocs__/config.js", sdConfig);
	//app.get(material + "/__simpledocs__/config", sdConfig);
	
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
	
	function userConfig (req, res) {
		res.set('Content-Type', 'text/javascript');
		var theFile = simpledocs.get('ui js file');
		if(!theFile) {
			return res.send('');
		}
		var userpath = path.join(simpledocs.get('appDir'), theFile);
		fs.stat(userpath, function(err) {
			if(err) {
				console.log('USER FILES does NOT EXIST \n', userpath);
				res.send('');
			}
			
			fs.createReadStream(userpath).pipe(res);
		});
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
				allinone: simpledocs.get('single page'),
				alwaysloadtree: simpledocs.get('always load tree'),
				api: {
					page: api + '/page',
					tree: api + '/tree',
					search: api + '/search',
					allinone: api + '/allinone'
				},
				breaks: {
					xs: {
						width: 480
					},
					sm: {
						width: 768
					},
					md: {
						width: 992
					},
					lg: {
						width: 1200
					},
					content: simpledocs.get('ui content width'),
					menu: simpledocs.get('ui menu width'),
					bannerMenu: simpledocs.get('ui banner menu width'),
					bannerContent: simpledocs.get('ui banner content width')
				},
				chief: typeof req.user === 'object' ? req.user.isAdmin : false,
				collapse: simpledocs.get('menu collapse'),
				homepage: simpledocs.get('homepage'),
				isMe: keystone.security.csrf.getToken(req, res),
				isKey: keystone.security.csrf.getToken(req, res),
				materialStyle: {
					main: simpledocs.get('material main'),
					mainDark: simpledocs.get('material main dark'),
					defaultLight: simpledocs.get('material default light'),
					defaultDark: simpledocs.get('material default dark'),
				},
				materialTheme: simpledocs.set('material theme'),
				menu: menu,
				name: modelConfig.label,
				namespace: simpledocs.get('namespace'),
				options: simpledocs.get('ui options'),
				pagelist: pagelist,
				path: {
					root: wild,
					material: (ui === 'material') ? route : material,
					bootstrap: (ui === 'bootstrap') ? wild : bootstrap,
					logout: keystone.get('signout url')
				},
				port: keystone.get('port'),
				search: simpledocs.get('ui search'),
				singleBranch: simpledocs.get('menu single branch'),
				singlePage: 'single-page',
				text: {
					'single page': 'single page',
					'multi page': 'multi page',
					build: PKG,
					menu: 'Menu',
				},
				tree: tree,
				ui: simpledocs.get('ui'),
				usesockets: simpledocs.get('use sockets'),
				userjs: {},
				userspace: {},
				waitingForPage: false
			};
			
			var contents = "var snowUI = " + JSON.stringify(config) + ";"; 
			
			return res.send(contents); 
		}		
	}//end
	
	function materialView( req, res ) {
		uiView(req, res, 'material');
	}
	function bootstrapView( req, res ) {
		uiView(req, res, '');
	}
	function uiView(req, res, ui) {		 
		//send our own result here
		if(ui == 'material') {
			var templatePath = simpledocs.get('moduleDir') + '/templates/views/simpledocs.jade';
		} else {
			var templatePath = simpledocs.get('moduleDir') + '/templates/views/simpledocs.jade';
		}
		
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
		
		var theme = simpledocs.get('theme');
		
		var locals = {
			allinone: simpledocs.get('single page'),
			apiTree: api + '/tree',
			apiPage: api + '/page',
			brand: keystone.get('brand'),
			collapse: simpledocs.get('menu collapse'),
			csrf_token_key: keystone.security.csrf.TOKEN_KEY,
			csrf_token_value: keystone.security.csrf.getToken(req, res),
			csrf_query: '&' + keystone.security.csrf.TOKEN_KEY + '=' + keystone.security.csrf.getToken(req, res),
			customeStyle: simpledocs.get('custom style'),
			development: req.query.dev ? true : false,
			env: keystone.get('env'),
			homepage: simpledocs.get('homepage'),
			pathLogout: keystone.get('signout url'),
			pathConfig: wild + "/__simpledocs__/config.js",
			pathUser: wild + "/__simpledocs__/user.js",
			section: {},
			singleBranch: simpledocs.get('menu single branch'),
			title: modelConfig.label,
			theme: theme != '' ? theme : '',
			ui: ui,
			user: req.user			
		}; 
		// Render the view
		var html = template(locals);

		res.send(html);		 
	}
}
