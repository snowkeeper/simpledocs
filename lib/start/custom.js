var	dashes = '\n------------------------------------------------\n',
	keystone = require('keystone');

module.exports = function(app,mongoose,callback) {
	
	var simpledocs = this;
	
	if(typeof config !== 'object'){
		console.log(dashes,'No config object found',dashes);
		return false;
	}
	
	//console.log('custom config',config)
	
	var page = simpledocs.get('route');
	
	keystone.connect(mongoose,app);
	
	keystone.init({

		'name': config.name || simpledocs.get('name') || 'simple documentation',
		'brand': config.brand || simpledocs.get('brand') || 'inquisive',

		'favicon': config.favicon || simpledocs.get('favicon') || '/snowdocs/favicon.ico',
		'less': config.less || simpledocs.get('less') || false,
		'static': config.static || simpledocs.get('static') || simpledocs.get('moduleDir') + "/public",

		'views': config.views ||  simpledocs.get('views') || simpledocs.get('moduleDir') + '/templates/views',
		'view engine': config.viewengine || simpledocs.get('view engine') || 'jade',
		
		'auth': config.auth || simpledocs.get('auth') || false,
		'signin url': config.signin ||  simpledocs.get('signin url') || '/',
		
		'cookie secret': config.cookiesecret ||  process.env.COOKIE_SECRET || this.get('cookie secret') || 'oi87BTI6R(^*%$89r9C55ER8658E6w5754wsv754csw75',
		
		'trust proxy': config.trustproxy || simpledocs.get('trust proxy') || true,
		
		'allow register': config.register || this.get('allow register') || false,
		
		// the default mandrill api key is a *test* key. it will 'work', but not send emails.
		'mandrill api key': config.mandrill || process.env.MANDRILL_KEY || this.get('mandrill api key') || 'v17RkIoARDkqTqPSbvrmkw',
		
		'wysiwyg override toolbar': false,
		'wysiwyg menubar': true,
		'wysiwyg skin': 'lightgray',
		'wysiwyg images': true,
		'wysiwyg cloudinary images': false,
		'wysiwyg additional buttons': 'searchreplace visualchars,'
		 + ' charmap ltr rtl pagebreak paste, forecolor backcolor,'
		 +' emoticons media, preview print ',
		'wysiwyg additional plugins': 'example, table, advlist, anchor,'
		 + ' autolink, autosave, bbcode, charmap, contextmenu, '
		 + ' directionality, emoticons, fullpage, hr, media, pagebreak,'
		 + ' paste, preview, print, searchreplace, textcolor,'
		 + ' visualblocks, visualchars, wordcount',

		
	});

	keystone.set('locals', {
		
		env: this.get('env'),
		ssl: this.get('ssl'),
		sslport: this.get('ssl port'),
		sslhost: this.get('ssl host'),
		host: this.get('host'),
		title: config.title || this.get('name') || 'simple documentation'
	
	});
	
	simpledocs.emit('keystone',keystone)
	
	keystone.mount({
		onMount: function() {
			console.log('mount docs',page);
			callback()
		}
	});
}
/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
