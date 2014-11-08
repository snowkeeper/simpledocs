// Load .env for development environments
require('dotenv')().load();

var express = require('express'),
    mongoose = require('mongoose'),
    app = express(),
    keystone = require('keystone'),
    simpledocs = require('simpledocs');
	
	/* set up simpledocs */
        //name the model
	simpledocs.set('simpledocs model','byoexpress-docs');
	//config the model
	simpledocs.set('simpledocs model config',{
		label: 'BYO Documentation',
		path: 'BYO-documentation',
		singular: 'BYO',
		plural: 'BYO Documents',
	});
	/* use the start method and pass it the type (byoexpress) and a config object with atleast mongoose and app objects 
	 * you can set the page through the config object as well as most keystone options
	 * */
	var configSimpleDocs = {
		mongoose:mongoose,
		app:app,
		page:'/byo-docs'
	}
	simpledocs.start('byoexpress',configSimpleDocs,function() {
			/*start app */
			app.listen(12555);
	});
 

 


/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
