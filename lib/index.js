var EventEmitter = require("events").EventEmitter;
var path = require('path');
var util = require('util');
var _ = require('lodash');
var GHPages = require('./prototype/gitHubPages');

var templateCache = {};
var appRoot = (function(_rootPath) {
	var parts = _rootPath.split(path.sep);
	parts.pop(); //get rid of /node_modules from the end of the path
	return parts.join(path.sep);
})(module.parent ? module.parent.paths[0] : module.paths[0]);
 
/**
 * Simpledocs - create a new documentation source
 * 
 * multiple doc sources per app allowed
 *
 * #### Example:
 * var simpledocs = require('simpledocs');
 * simpledocs.start('/docs');
 * 
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
	
	/* reserved */
	this.list;
	this.model;
	this._options = {}
	this.io;
	this.keystone;
	this.paths = {
		api: {},
		paths: {},
		exports: {}
	}
	this.expose = {};
	
	if(typeof config !== 'object')config = {};
	
	/* set the module variables
	 * */	
	// include directories
	var ddir = __dirname.split('/');
	ddir.pop();
	this.set('moduleDir', ddir.join('/'));
	this.set('appDir', process.cwd());
	this.set('appRoot', appRoot);
	
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
	/* some build options set when route is set*/
	// this.set('build path', path.join(this.get('appDir'), this.get('route'), '__build/'));
	// this.set('build path ghpages', path.join(this.get('build path') , 'gh-pages/'));
	// this.set('build path tmp', path.join(this.get('build path') , 'tmp/'));
	// this.set('build ghpages cloneTo', path.join(this.get('build path') , 'cloneGHPages/' );
	this.set('build ghpages repo', false);
	this.set('build ghpages branch', 'gh-pages');
	this.set('build ghpages tag', '');
	this.set('build ghpages add', false);
	this.set('build ghpages user', {});
	this.set('build ghpages message', 'SimpleDocs gh-pages build');
	
	this.set('ghpages permalink route', false);
	this.set('ghpages route', false);
	
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
	
	/* jade template path */
	this.set('template path', this.get('moduleDir') + '/templates/views/ghpages.jade');
	
	/* set the home page  */
	this.set('homepage', 'contents');
	
	/* set a custom theme on the body  */
	this.set('theme', 'light-theme');
	// this might override theme
	this.set('material theme', 'blue');	
	
	/* wysiwyg in ui for html  */
	this.set('wysiwyg', false);
	
	/* height of the html input box  */
	this.set('html height', 300);
	
	/* ui & options */
	this.set('ui', 'bootstrap');
	this.set('ui js file', false);
	this.set('ui menu width', [12,4,3,3]);
	this.set('ui content width', [12,8,9,9]);
	this.set('ui banner menu width', [6,4,3,3]);
	this.set('ui banner content width', [6,8,9,9]);
	this.set('material cream', {
		appBar: {
			textColor: '#616161',
		},
		toolbar: {
			backgroundColor: '#fff',
		},
	});
	this.set('material light', {
		appBar: {
			textColor: '#616161',
		},
		toolbar: {
			backgroundColor: '#fff',
		},
	});
	this.set('material blue', {
		toolbar: {
			backgroundColor: '#fff',
		},
	});
	this.set('material graphite', {
		appBar: {
			textColor: '#D6D6D6',
		},
		toolbar: {
			textColor: '#D6D6D6',
			backgroundColor: '#303234',
		},
	});
	this.set('material night', {
		toolbar: {
			textColor: '#D6D6D6',
			backgroundColor: '#303234',
		},
	});
	this.set('material dark', {
		toolbar: {
			textColor: '#D6D6D6',
			backgroundColor: '#303234', 
		},
	});
	
	/* all in one view option */
	/* false, true, only */
	this.set('single page', false);
	
	/* use sockets or request */
	this.set('use sockets', true);
	
	this.options(config);
	
	this.gitHubPages = GHPages;
	
}

/**
 * attach the event system to SimpleDocs 
 * */
util.inherits(SimpleDocs, EventEmitter);

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

/* methods */
_.extend(SimpleDocs.prototype, require('./prototype/events.js'));
SimpleDocs.prototype.lessSetup = require('./prototype/lessSetup');
SimpleDocs.prototype.model = require('../models/SimpleDocs.js')
SimpleDocs.prototype.options = require('./prototype/options');
SimpleDocs.prototype.routes = require('./prototype/routes');
SimpleDocs.prototype.add = SimpleDocs.prototype.routes;
SimpleDocs.prototype.sockets = require('./prototype/sockets');
SimpleDocs.prototype.start = require('./prototype/start');
SimpleDocs.prototype.statics = require('./prototype/statics');
SimpleDocs.prototype.set = require('./prototype/set');
SimpleDocs.prototype.get = SimpleDocs.prototype.set;

var simpledocs = module.exports = exports = new SimpleDocs();


/**
 * 2016 inquisive
 * github.com/inquisive
 * npmjs.org/inquisive
 * 
 * Peace :0)
 * 
 * */
