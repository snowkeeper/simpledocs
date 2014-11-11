// Load .env for development environments
require('dotenv')().load();

var express = require('express'),
    mongoose = require('mongoose'),
    app = express(),
    keystone = require('keystone'),
    simpledocs = require('simpledocs');
	
var init = {
    
	    route: '/docs/simpledocs',

	    /* For a current express setup pass app and mongoose
	     * do not include or set false for a keystone or standalone app
	     * */
	    app:app,
	    mongoose:mongoose,
	    
	    'name': 'standalone documents',
	    'brand': 'inquisive',
		
	    'simpledocs model': 'simpledocs-documentation',
	    'simpledocs model config': {
			label: 'SimpleDocs Documentation',
			path: 'simpledocs',
			singular: 'SimpleDocs Document',
			plural: 'SimpleDocs Documents',
	    }
}
	simpledocs
	.on('init',function(config) {
		/* we get the config object we pass to start */
		
	})
	.on('keystone',function(keystone) {
		/* add your own keystone options before mount 
                 * this event is not fired if you are mounting inside a current Keystone app
                 * */
		
	})
	.on('model',function() {
		/* add your own models and register them with keystone */
		
	})
	.on('routes',function() {
		/* add your own routes */
		
	})
	.on('complete',function() {
		/* app is configured */
		console.log('start app on port 12111');
		/*start app for express*/
		app.listen(12111);
	});		
	simpledocs.start(init);
 

 


/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
