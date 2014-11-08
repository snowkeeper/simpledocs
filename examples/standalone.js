// Load .env for development environments
require('dotenv')().load();

/**
 * Application Initialisation
 */

var simpledocs = require('simpledocs');
	/* set up simpledocs 
	 * most keystone setup options pass through
	 * 
	 * new user can admin and allow register should be on by default so you can register to use Keystone UI
	 * */
	simpledocs.set('new user can admin',true);
	simpledocs.set('allow register',true);
	
	/* ssl options */
	//simpledocs.set('ssl',true);
	//simpledocs.set('ssl key', 'key.pem');
	//simpledocs.set('ssl cert','cert.pem');
	
	/* name the web pages and set the mongo db url */
	simpledocs.set('name','standalone documents');
	simpledocs.set('brand','ralph');
	simpledocs.set('mongo','mongodb://localhost/standalone-documentation');
	
	
        //name the model
	simpledocs.set('simpledocs model','standalone-docs');
	// config the model
	simpledocs.set('simpledocs model config',{
		label: 'Standalone Documentation',
		path: 'standalone-documentation',
		singular: 'Standalone Document',
		plural: 'Standalone Documents',
	});
	/* set the route and any keystone config options in the config object */
	var configSimpleDocs = {
		page:'/docs',
		//ssl: true,
		//sslport: 12222,
		//sslkey: '',
		//sslcert: ''
	}
	/* use the start method and pass it the type (standalone) and a config object
	 * */
	simpledocs.start('standalone',configSimpleDocs,function(){
			/*done setting up */
			
		
	});

/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
