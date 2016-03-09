snowUI.userjs =  {
	mountedPage: function(callback) {
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
		
		if(typeof callback === 'function') {
			callback();
		}
		Prism.highlightAll();
	},
	
	mountedUI: function() { 
		snowUI.userspace._cached = {}
		snowUI.userspace.create_cached = function(version) {
			if(typeof snowUI.userspace._cached[version] !== 'Object') {
				snowUI.userspace._cached[version] = {}
			}
		}
		$(document).on('click', '.loadCode', function(e) {
			e.preventDefault();
			var $this = $(this);
			var target = $this.parent().data();
			
			if(target.file) {
				
				var url = 'https://raw.githubusercontent.com/keystonejs/keystone/v0.3.x/' +  target.file;
				var $pre = $this.parent().next();
				if(snowUI.userspace._cached[target.file]) {
					$pre.text(snowUI.userspace._cached[target.file]);
				} else {
					
					$.ajax({
						url: url,
						dataType: 'text',
						success: function(results) {
							snowUI.userspace.create_cached(target.file);
							snowUI.userspace._cached[target.file] = results;
							$pre.text(results);
						},
						error: function(err) {
							console.log('Load error', err);
							$pre.text('File not found');
						}
					});
				}
				$pre.slideToggle();		
			}
		});
		
	}
}
