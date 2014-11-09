/**
 * @jsx React.DOM
 */
 
	var addroutes = {}	
	addroutes['*'] = "redirect";
	addroutes[''] = "redirect";
	var middleware = {
	    // Scroll back to the top of the page on route change
	    scrollTop: function(route, next) {
		$("#simpledocs").animate({ scrollTop: 0 }, 800);
		next();
	    },
	    // Track a page view with Google Analytics
	    analytics: function(route, next) {
		_gaq.push(['_trackPageview', '/' + route]);
		next();
	    },
	    logme: function(route, next) {
		  snow.log('see route',route,next)  
	    }  
	}
	bone.router({
	    routes: addroutes,
	    middleware: [
		middleware.scrollTop
	    ],
	    redirect: function() {
		var args = window.location.pathname.split('/').slice(1);
		if(window.location.pathname !== snowUI.path.root) {
			var page = args.pop();
			var moon = args.pop();
		} else {
			var page = snowUI.homepage;
			var moon = 'simpledocs';
		}	
		snowlog.warn('REDIRECT',moon,args)
		React.renderComponent(<snowUI.UI.UI moon={moon}  page={page}  params={args} />, document.getElementById('simpledocs'));
	    
	    },
	    
	});



