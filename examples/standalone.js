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
	
	
       var init = {
    
		    route: '/docs/simpledocs',

		    /* set standalone to true for a complete app
		     * only requires you to include SimpleDocs
		     * */	
		    standalone: true,

		    /* allow register and can admin are not available for express app
		     * turn on to add the first user
		     * */	
		    'new user can admin':true,
		    'allow register':true,
		    
		    /* port, mongo and ssl options are for standalone only
		     * set to false to ignore or use defaults
		     * */	
		    'port': 12111,
		    'ssl': false,
		    //'ssl key': 'key.pem',
		    //'ssl cert':'cert.pem',
		    //'ssl port': 12222,
		    'mongo': 'mongodb://localhost/simpledocs',

		    'name': 'standalone documents',
		    'brand': 'inquisive',
			
		    'simpledocs model': 'simpledocs-documentation',
		    'simpledocs model config': {
				label: 'SimpleDocs Documentation',
				path: 'simpledocs',
				singular: 'SimpleDocs Document',
				plural: 'SimpleDocs Documents',
		    },
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
		//console.log('start app on port 12111');
		/*start app for express*/
		//app.listen(12111);
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
