var socketIO = require('socket.io')();


/**
 * sockets
 * 
 * add the socket once server starts
 *
 * ####Example:
 *
 *     SimpleDocs.sockets(Live.io) // 
 *
 * @method get
 * @api public
 */ 
module.exports = function(UserIO) {
	
	if(UserIO) {
		this.set('io', UserIO);
	}
	
	if(!this.io) {
		this.set('io', socketIO.attach(this.keystone.httpServer));
	}
	
	var keystone = this.keystone;
	var io = this.io;
	var model = this.get('simpledocs model');
	this.socket =  io.of(this.get('namespace'));
	this.socket.on("connection", function(socket) {
		
		socket.on("disconnect", function(s) {
			
		});
		
		/* single page */
		socket.on("page", function(page) {
			if(!page) {
				return socket.emit('page', {action:'simple documentation',command:'page',success:false,message:'Please include a page slug.',code:501});
			}

			async.series([
				function(next) {
					if (page === 'tree' || simpledocs.get('always load tree')) {
						keystone.list(model).model.getTree(function(err, thetree, themenu, thelist) {
							
							next(null, {
								extra: true,
								tree: thetree,
								menu: themenu,
								pageList: thelist
							});
						});
					} else {
						next(null, {
							extra: false
						});
					}
				},
			],function(err, pass) {
				keystone.list(model).model.getPage(page, function(err, page) {
					if(err) {
						return socket.emit('page', {
							action:'simple documentation',
							command:'page',
							success:false,
							message:err,
							code:501
						});
					}					
					if(page === null) {
						return socket.emit('page', {
							action:'simple documentation',
							command:'page',
							success:false,
							error:'Page not found',
							code:404
						});
					}
					
					var result = {
						action:'simple documentation',
						command:'page',
						success:true,
						message:'Have a great day!',
						code:200,
						title:page.title,
						slug:page.slug,
						page:page,
					};
					if(pass.extra) {
						result.pagelist = pass.pagelist;
						result.tree = pass.tree;
						result.menu = pass.menu;
					}
					return socket.emit('page', result);				
				});
				
			});
				
			console.log('page socket', page);
		}); 
		
		/* search */
		socket.on("search", function(page) {
			if(!page) {
				return socket.emit('page', {action:'simple documentation',command:'page',success:false,message:'Please include a search term.',code:501});
			}
			keystone.list(model).model.search(page, function(err, searchedPages) {
				if(err) {
					return socket.emit('page', { action:'simple documentation', command:'search', success:false, message:err, code:501 });
				}
				if(page === null) {
					return socket.emit('page', { action:'simple documentation', command:'search', success:false, error:'Page not found', code:404 });
				}
				console.log('search socket', page, searchedPages);
				return socket.emit('page', { action:'simple documentation', command:'search', success:true, title:'Search', code:200, page:searchedPages, search:searchedPages});				
			});
			
			
		}); 
		
		/* allinone */
		socket.on("allinone", function() {			
			keystone.list(model).model.getTree(function(err, tree, menu, pageList) {
				keystone.list(model).model.allInOne('', pageList, function(err,page) {
					if(err) {
						return socket.emit('page', {
							action: 'simple documentation',
							command: 'allinone',
							success: false,
							message: err,
							code: 501
						});
					}
					if(page === null) {
						return socket.emit('page', {
							action: 'simple documentation',
							command: 'allinone',
							success: false,
							error: 'Page not found',
							code: 404
						});
					}
					return socket.emit('page', {
						action: 'simple documentation', 
						command: 'allinone', 
						success: true, 
						message: 'Have a great day!',
						code: 200, 
						page: page,
					});				
				});
			});
			
			console.log('page socket allinone');
		}); 
		
		socket.on("status", function() {
			socket.emit('status', { connected: true });
		});
		
	});

}
