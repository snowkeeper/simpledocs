/*
 * Inject user code
 */

snowUI.code = {
	__mountedUI: (callback) => {
		if(typeof snowUI.userjs.mountedUI === 'function') {
			snowUI.userjs.mountedUI(callback);
		}
	},
	__mountedPage: (callback) => {
		if(typeof snowUI.userjs.mountedPage === 'function') {
			snowUI.userjs.mountedPage(callback);
		}
	},
	__unmountUI: (callback) => {
		if(typeof snowUI.userjs.unmountUI === 'function') {
			snowUI.userjs.unmountUI(callback);
		}
	},
	__unmountPage: (callback) => {
		if(typeof snowUI.userjs.unmountPage === 'function') {
			snowUI.userjs.unmountPage(callback);
		}
	}
	
}

/* change the theme */
snowUI.toggleTheme = function() {
	$('body').toggleClass(snowUI.themeToToggle);
	return false;
}

snowUI.setTheme = function(setclass) {
	document.body.className = setclass;
	return false;
}

// fade the content div
snowUI.fadeOut = function(speed = 400, callback) {
	if(typeof callback !== 'function') {
		callback = function() {};
	}
	$("#content-fader").animate({opacity: 0}, speed, callback);
}
snowUI.fadeIn = function(speed = 400, callback) {
	if(typeof callback !== 'function') {
		callback = function() {};
	}
	$("#content-fader").animate({opacity: 1}, speed, callback);
}

// sticky menu
snowUI.unstickyMenu = function() {
	var simpledocs = document.getElementById('simpledocs');
	simpledocs.removeEventListeners();
}
snowUI.stickyMenu = function() {
	
	var simpledocs = document.getElementById('simpledocs');
	simpledocs.addEventListener("scroll", scroller);
	
	function scroller(){ 
		
		var clientWidth = document.documentElement.clientWidth;
		
		if(clientWidth < snowUI.breaks.sm.width) {
			var $stickyMenu = $('.stickyMenu');
			if (!!$stickyMenu.offset()) { 
				if (simpledocs.offsetTop > 35){
					$stickyMenu.css({ zIndex: 1000, position: 'fixed', top: 0 });;
				} else {
					$stickyMenu.css('position', 'relative');
				}
			} 
		}
		
		var appbarTitle = document.getElementById('appbarTitle');
		var menu = document.getElementById('menu');
		
		if(snowUI.shortenTitle && simpledocs.scrollTop > 35) {
			appbarTitle.style.width = menu.clientWidth - 60 +'px';
			appbarTitle.style.overflow = 'hidden';
		} else if(snowUI.shortenTitle) {
			appbarTitle.style.width = 'initial';
			appbarTitle.style.overflow = 'initial';
		}	
	}
}
