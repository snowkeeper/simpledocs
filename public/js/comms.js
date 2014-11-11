	/** 
	 * Add the nonce for ajax requests
	 * */
snowUI.hrefRoute = function() {
		
		this.preventDefault()
		
		var _this = this;
		var newroute = $(this);
		
		snowlog.log('href loader route',snowUI.path.root,newroute)
		var moon =  newroute[0] ? newroute.closest('a')[0].pathname : false
		if(moon) {
			moon = moon.replace((snowUI.path.root + "/"),'')
			snowlog.log('moon owner',moon)
			bone.router.navigate(moon, {trigger:true});
		} else {
			snowUI.flash('error','Link error',2000)
			_this.setState({showErrorPage:false}); //this is a quick way to rerender the page since we are mid laod
		}		
		
		return false
};
snowUI.ajax = {
		running: false,
		GET: function(url,data,callback) {
			snowUI.ajax._send('GET',url,data,callback)
		},
		request: function(url,data,callback) {
			this.GET(url,data,callback)
		},
		post: function(url,data,callback) {
			this.POST(url,data,callback)
		},
		POST: function(url,data,callback) {
			snowUI.ajax._send('POST',url,data,callback)
		},
		/* use call waiting if you want all requests to be ignored until you get a response
		 * does not block
		 * */
		callwaiting: function(type,url,data,callback) {
			if(!snowUI.ajax.running) snowUI.ajax.running = url
			snowUI.ajax._send(type,url,data,callback)
		},
		
		/* we do this so that we can use a nice ignore instead of an async block
		 * only use this method internally 
		 * */
		_send: function(type,url,data,callback) {
			if(!snowUI.ajax.running) {
				snowUI.ajax.forced(type,url,data,callback)
			} else {
				snowUI.flash('message','call in progress... ' + snowUI.ajax.running,2000)
			}
		},
		
		/* 
		 * sometimes you want to ignore the ignore
		 * hit forced directly to do so
		 * */
		forced: function(type,url,data,callback) {
			
			if(!type)var type = 'GET'
			
			$.ajax({type:type,url: url,data:data})
			.done(function( resp,status,xhr ) {
				
				_csrf = xhr.getResponseHeader("x-snow-token");
				snowUI.ajax.running = false
				snowlog.log(type + 'call return')
				callback(resp)	
			});					
				
		},
		
};/*end ajax*/
snowUI._flash = {}
snowUI.killFlash = function(who) {
	clearTimeout(snowUI._flash[who])
	$('.fade'+who).fadeOut();
};
snowUI.flash = function(type,msg,delay,kill) {
	if(isNaN(delay))delay=4000;
	
	var clear = function(who) {
		clearTimeout(snowUI._flash[who])
		$('.fade'+who).fadeOut();
	}
	var keys = Object.keys(snowUI._flash)
	keys.forEach(function(v) {
		if(kill || v === type)clear(v)
	})
	$('.fade'+type).fadeIn().find('.html').html(msg)
	snowUI._flash[type] = setTimeout(function() {
		$('.fade'+type).fadeOut();
	},delay);
	
}

/* change the theme */
snowUI.toggleTheme = function() {
	$('body').toggleClass(snowUI.themeToToggle);
	return false;
}

	/**
	 * 
	 * Setup the requests to add the token
	 * 
	 * */
	var dd = {data:{}};
	dd.data[snowUI.isKey]=snowUI.isMe; 
	$.ajaxSetup(dd);
 
	/**
	 * 
	 * Catch redirects for logouts and stuff and runs commands
	 * 
	 * */
	$(document).ajaxComplete(function(event, xhr, settings) {
		var data = $.parseJSON(xhr.responseText);
		if(data.redirect) {
			location.href=data.redirect;
		} 
		if(data.tree) {
			snowUI.tree = data.tree;
		}
		if(data.menu) {
			snowUI.menu = data.menu;
		}
		if(typeof snowUI.menu !== 'object')snowUI.menu = {};
		if(Object.prototype.toString.call(snowUI.tree) !== '[object Array]')snowUI.tree = [];
		
		snowlog.log(snowUI.tree,snowUI.menu);
	});
	
	
$(function() {	
	/* *  
	 * Run as soon as the page loads
	 * get the tree
	 * 
	 * */
	$.ajax({async:false,url: snowUI.api.tree})
		.done(function( resp,status,xhr ) {
			snowlog.info(resp)
			//start our app
			bone.set('log', false);
			bone.router.start({root:snowUI.path.root,pushState: true});	
	});
	$(document).on('affixed.bs.affix',function() {
		$('#menuspy').show();
	});
	$(document).on('affixed-top.bs.affix',function() {
		$('#menuspy').hide();
	});
	$(document).on('click','.sdlink',snowUI.hrefRoute);
	
});

/**
 * 2014 snowkeeper
 * github.com/snowkeeper
 * npmjs.org/snowkeeper
 * 
 * Peace :0)
 * 
 * */
