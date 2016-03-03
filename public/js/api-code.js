/*
 * Inject current code reference and sticky menu
 */
$(function() {
	var _cached = {}
	var create_cached = function(version) {
		if(typeof _cached[version] !== 'Object') {
			_cached[version] = {}
		}
	}
	snowUI.apiCode = function() {
		$("#simpledocs .addGitHubLink").each(function() {
			var $this = $(this);
			var file = $this.data("file");
			
			var branch = 'v0.3.x';
			var append = '<div data-file=' + file + ' style="float:right" ><a href="http://github.com/keystonejs/keystone/blob/' + branch + '/' + file + '" target="_blank"> /' + file + '  <i class="entypo entypo-social entypo-github"></i></a></div>';
			$this.append(append);
		});
		$("#simpledocs .hiddenTitle").each(function() {
			var $this = $(this);
			var name = $this[0].value;
			var append = '<a class="anchor" name="' + name + '" id="' + name + '" />';
			$this.before(append);
		});
		
	};
	snowUI.loadApiCode = function() { 
		if(snowUI.options.loadCodeFile) {
			$(document).on('click', '.loadCode', function(e) {
				e.preventDefault();
				var $this = $(this);
				var target = $this.parent().data();
				
				if(target.file) {
					create_cached(target.file);
					var url = snowUI.options.loadCodeFile +  target.file;
					var $pre = $this.parent().next();
					if(_cached[target.file]) {
						$pre.text(_cached[target.file]);
					} else {
						$.ajax({
							url: url,
							dataType: 'text',
							success: function(results) {
								_cached[target.file] = results;
								$pre.text(results);
							}
						});
					}
					$pre.slideToggle();
							
				}
			});
		}
	}
	// sticky menu
	snowUI.stickyMenu = function() {
		var $simpledocs = $('#simpledocs');
		var $stickyMenu = $('.stickyMenu');
		var $docsFooter = $('.simpledocs-footer');
		console.log('sticky menu', $stickyMenu, $stickyMenu.offset());
		
			$simpledocs.scroll(function(){ 
				if (!!$stickyMenu.offset()) { 
					var stickyTop = $stickyMenu.offset().top;  
					//console.log('scroll', $stickyMenu);
					var windowTop = $simpledocs.scrollTop(); 
					if (stickyTop-40 < windowTop){
						var docFooterView = $docsFooter[0].getBoundingClientRect();
						var height = (($(window).height() - docFooterView.top) < 0) ? $(window).height()-65+'px' : docFooterView.top-65 + 'px';
						var width = $stickyMenu.parent().width()
						$stickyMenu.css({ position: 'fixed', top: 65, overflow: 'auto', marginTop: '0', paddingBottom: '80px',  'height': height, 'width': width });
					} else {
						$stickyMenu.css('position','static');
					}
				}
			});
		
	}
	
	/* change the theme */
	snowUI.toggleTheme = function() {
		$('body').toggleClass(snowUI.themeToToggle);
		return false;
	}
	
	snowUI.setTheme = function( setclass ) {
		document.body.className = setclass;
		return false;
	}
});
