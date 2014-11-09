/**
 * @jsx React.DOM
 */
 
React.initializeTouchEvents(true);

var yes = true, no = false;

snowUI.UI = {}

var UI = snowUI.UI;

UI.Interval = {
	  intervals: [],
	  setInterval: function() {
		return this.intervals.push(setInterval.apply(null, arguments));
	  },
	  clearIntervals: function(who) {
		who = who - 1;
		if(UI.Interval.intervals.length === 1) {
			//snowlog.log('clear all intervals',this.intervals)
			UI.Interval.intervals.map(clearInterval);
			UI.Interval.intervals = [];
		} else if(who && UI.Interval.intervals[who]) {
			//snowlog.log('clear intervals',who,this.intervals[who])
			clearInterval(UI.Interval.intervals[who]);
		} else {
			//snowlog.log('map intervals',this.intervals)
			UI.Interval.intervals.map(clearInterval);
			UI.Interval.intervals = [];
		}
	  }
};


var Alert = ReactBootstrap.Alert;

UI.Alert = React.createClass({displayName: 'Alert',
	getInitialState: function() {
		return {
			isVisible: true
		};
	},
	getDefaultProps: function() {
		return ({showclass:'info'});
	},
	render: function() {
		if(!this.state.isVisible)
		    return null;

		var message = this.props.children;
		return (
		    Alert({bsStyle: this.props.showclass, onDismiss: this.dismissAlert}, 
			React.DOM.p(null, message)
		    )
		);
	},

	dismissAlert: function() {
		this.setState({isVisible: false});
		if(this.props.clearintervals instanceof Array)this.props.clearintervals.map(Link.Interval.clearIntervals);
		if(this.props.cleartimeouts instanceof Array)this.props.cleartimeouts.map(clearTimeout);
	}
});

UI.Man = React.createClass({displayName: 'Man',
	getDefaultProps: function() {
		return ({divstyle:{float:'right',}});
	},
	
	render: function() {
	    
	    return this.transferPropsTo(
		React.DOM.div({style: this.props.divstyle, dangerouslySetInnerHTML: {__html: snowText.logoman}})
	    );
	}
});

//connect error component
UI.messageDisplay = React.createClass({displayName: 'messageDisplay',
	componentDidMount: function() {
		//snowUI.loaderRender();
	},
	componentDidUpdate: function() {
		
	},
	componentDidMount: function() {
		this.componentDidUpdate()
	},	
	render: function() {
	    
	    snowlog.log('warning message component')
	    
	    return (React.DOM.div({style: {padding:'5px 20px'}}, 
			React.DOM.div({className: this.props.type}, 
				React.DOM.span(null, " ", this.props.title || 'I have an important message for you.'), 
				React.DOM.div({className: "message"}, 
					React.DOM.p(null, this.props.message)
				)
			)
			
		));
	}
});
UI.displayMessage = UI.messageDisplay

/* main content */
UI.Content = React.createClass({displayName: 'Content',
	getInitialState: function() {
		return {ready: yes,register: no,mounted: no,response:no,data:{}};
	},
	componentWillReceiveProps: function(props) {
		snowlog.log(props)
	},
	render: function() {
		
		var renderMe,
			showcomp = this.props.config.page || 'home'
		
		snowlog.log('content component')
		
		if(this.state.error ) {
			
			 renderMe = (UI.displayMessage({message: this.state.message, type: "warning"}))
			
			
		} else if(!this.state.ready) {
			snowlog.warn('empty render for content')
			return (React.DOM.div(null))
		
		} else if(UI[showcomp]) {
			
			var po = UI[showcomp]
			renderMe = (po({config: this.props.config}))
		
		} else {
			
			renderMe = (UI.displayMessage({title: "404 Not Found", message: "I could not find the page you are looking for. ", type: "requesterror"}))
			 
		}     
		return renderMe;
	},
	componentDidMount: function() {
		// When the component is added let me know
		this.setState({mounted: yes})
	},
	
}); 

/* home content */
UI.home = React.createClass({displayName: 'home',
	getInitialState: function() {
		return {ready: no,register: no,mounted: no,response:no,data:{}};
	},
	componentWillReceiveProps: function(props) {
		snowlog.log('home got props',props)
		if(props.contents.slug) {
			this.setState({ready:yes});
		} else {
			this.setState({ready:no});
		}
	},
	render: function() {
		var _this = this;
		var printMenu = function(pages) {
			//snowlog.log('print menu', pages);
			var list = pages.map(function(v) {
				return (React.DOM.div({key: v.slug, className: "link"}, 
						React.DOM.a({onClick: _this.props.getPage, href: snowUI.path.root + '/' + v.slug}, v.title), 
						React.DOM.div({className: "link"}, 
							v.documents.length > 0  ? printMenu(v.documents): ''
						)
					))
			});
			return list;
		}
		if(this.state.ready && this.props.contents) {
			
			var doc = this.props.contents;
			if(typeof doc !== 'object')doc = {}
			if(typeof doc.parent !== 'object')doc.parent = {}
			var content = 
				doc.display === 1 ? 
					this.props.contents.markdown ? 
						React.DOM.div({key: "fullcontent", dangerouslySetInnerHTML: {__html: this.props.contents.markdown.html}}) 
						: React.DOM.span(null) : doc.display === 2 ? React.DOM.div({dangerouslySetInnerHTML: {__html: this.props.contents.html}}) 
					: doc.display === 3 ? 
						(React.DOM.div(null, " ", React.DOM.div({dangerouslySetInnerHTML: {__html: this.props.contents.markdown.html}}), React.DOM.div({dangerouslySetInnerHTML: {__html: this.props.contents.html}}))) 
						: doc.display === 4 ? 
							(React.DOM.div(null, " ", React.DOM.div({dangerouslySetInnerHTML: {__html: this.props.contents.html}}), React.DOM.div({dangerouslySetInnerHTML: {__html: this.props.contents.markdown.html}})) 
							): React.DOM.span(null)  
			
			
			if(doc.type === 1) {
				/* show the content only */
				var display = content;
				
			} else if(doc.type === 2) {
				/* show list of child root documents */
				if(snowUI.menu[doc._id]) {
					var list = snowUI.menu[doc._id].docs;
					var display = printMenu(list)			
				}
				
			} else {
				/* show the contents then a list of child root documents */
				//snowlog.info('show content and child doc list',snowUI.menu,doc._id);
				var display = [];
				if(snowUI.menu[doc._id]) {
					var list = snowUI.menu[doc._id].docs;
					var display = printMenu(list)			
				}
				display.unshift(React.DOM.div({key: "dualpage"}, content));
			}
			if(snowUI.menu[doc._id]) {
				var prev = snowUI.menu[doc.parent._id] ? 
					typeof snowUI.menu[doc.parent._id].docs[doc.order-2] === 'object' ? 
						(React.DOM.li({className: "previous"}, React.DOM.a({href: snowUI.path.root + '/' + snowUI.menu[doc.parent._id].docs[doc.order-2].slug, onClick: _this.props.getPage}, "← ", snowUI.menu[doc.parent._id].docs[doc.order-2].title))) 
						: React.DOM.span(null) 
					: React.DOM.span(null);
				var next = snowUI.menu[doc._id] ? 
					typeof snowUI.menu[doc._id].docs[0] === 'object' ? 
						(React.DOM.li({className: "next"}, React.DOM.a({href: snowUI.path.root + '/' + snowUI.menu[doc._id].docs[0].slug, onClick: _this.props.getPage}, "→ ", snowUI.menu[doc._id].docs[0].title))) 
						: React.DOM.span(null) 
					: React.DOM.span(null);
			} else {
				var prev = snowUI.menu[doc.parent._id] ?
					typeof snowUI.menu[doc.parent._id].docs[doc.order-2] === 'object' ?
						(React.DOM.li({className: "previous"}, React.DOM.a({href: snowUI.path.root + '/' + snowUI.menu[doc.parent._id].docs[doc.order-2].slug, onClick: _this.props.getPage}, "← ", snowUI.menu[doc.parent._id].docs[doc.order-2].title))) 
						:  snowUI.menu[doc.parent.parent] ?
							typeof snowUI.menu[doc.parent.parent].docs[doc.parent.order-1] === 'object' ?
								(React.DOM.li({className: "previous"}, React.DOM.a({href: snowUI.path.root + '/' + snowUI.menu[doc.parent.parent].docs[doc.parent.order-1].slug, onClick: _this.props.getPage}, "← ", snowUI.menu[doc.parent.parent].docs[doc.parent.order-1].title))) 
								: React.DOM.span(null)
							: React.DOM.span(null) 
					: React.DOM.span(null);
				var next = snowUI.menu[doc.parent._id] ?
					typeof snowUI.menu[doc.parent._id].docs[doc.order] === 'object' ? 
						(React.DOM.li({className: "next"}, React.DOM.a({href: snowUI.path.root + '/' + snowUI.menu[doc.parent._id].docs[doc.order].slug, onClick: _this.props.getPage}, "→  ", snowUI.menu[doc.parent._id].docs[doc.order].title))) 
						: snowUI.menu[doc.parent.parent] ?
							typeof snowUI.menu[doc.parent.parent].docs[doc.parent.order] === 'object' ? 
								(React.DOM.li({className: "next"}, React.DOM.a({href: snowUI.path.root + '/' + snowUI.menu[doc.parent.parent].docs[doc.parent.order].slug, onClick: _this.props.getPage}, "→  ", snowUI.menu[doc.parent.parent].docs[doc.parent.order].title))) 
								: React.DOM.span(null)
							: React.DOM.span(null)
					: React.DOM.span(null);
			}
			var related = [];
			if(doc.links.length > 0) {
				related = doc.links.map(function(v){
					return (React.DOM.div({className: "related-bubble", key: v.slug + 'related'}, React.DOM.a({className: "badge bg-primary", onClick: _this.props.getPage, href: snowUI.path.root + '/' + v.slug}, v.title)));
				});
			}
			if(doc.externalLinks) {
				var ll = doc.externalLinks.replace(',',' ').split(' ');
				ll.forEach(function(v){
					related.push(React.DOM.div({className: "related-bubble", key: v + 'linksE'}, React.DOM.a({className: "badge bg-primary", target: "_blank", href: v}, v)));
				});
			}
			if(related.length>0)related.unshift(React.DOM.div({className: "related", key: "related"}, "Related"));
			return ( React.DOM.div({id: "showconent"}, 
					UI.AppInfo(null), 
				display, 
				React.DOM.div({className: "clearfix "}, 
					related
				), 
				React.DOM.div({className: "clearfix linkPager"}, 
					React.DOM.nav({className: ""}, 
						React.DOM.ul({className: "pager"}, 
							prev, 
							React.DOM.li(null, React.DOM.a({href: snowUI.path.root + '/', onClick: _this.props.getPage}, React.DOM.span({className: "glyphicon glyphicon-home"}))), 
							next
							
						)
					)
				)
			));
		} else {
			var menu;
			if(snowUI.tree>0) {
				menu = snowUI.tree.map(function(v) {
					
					return (React.DOM.div({className: "", key: v.slug}, 
							
							React.DOM.a({className: "", onClick: _this.props.getPage, href: snowUI.path.root + '/' + v.slug}, v.title), 
							
							v.documents.length > 0  ? printMenu(v.documents): ''
						)
					);
					
				});
			}
			return ( React.DOM.div({id: ""}, 
				UI.AppInfo(null), 
				menu
			));
		}
	},
	componentDidMount: function() {
		// When the component is added let me know
		this.setState({mounted: yes})
	},
	
	
});

/* shortcut content */
UI.Menu = React.createClass({displayName: 'Menu',
	getInitialState: function() {
		return {ready: yes,register: no,mounted: no,response:no,data:{}};
	},
	componentWillReceiveProps: function(props) {
		snowlog.log(props)
	},
	render: function() {
		snowlog.info('menu tree',snowUI.tree);
		var _this = this;
		
		var printMenu = function(pages) {
			var list = pages.map(function(v) {
				var active = _this.props.page === v.slug ? 'active' : '';
				return (React.DOM.div({key: v.slug, className: ""}, 
						React.DOM.a({className: "list-group-item " + active, onClick: _this.props.getPage, href: snowUI.path.root + '/' + v.slug}, v.title), 
						React.DOM.div({className: "link"}, 
							printMenu(v.documents)
						)
					))
			});
			return list;
		}
		var menu = snowUI.tree.map(function(v) {
			var active = _this.props.page === v.slug ? 'active' : '';
			return (React.DOM.div({className: "list-group", key: v.slug}, 
					
					React.DOM.a({className: "list-group-item head", onClick: _this.props.toggleMenu}, snowText.menu), 
					React.DOM.div({key: v.slug, className: ""}, 
						React.DOM.a({className: "list-group-item " + active, onClick: _this.props.getPage, href: snowUI.path.root + '/' + v.slug}, v.title)
						
					), 
					printMenu(v.documents)
				)
			);
			
		});
		return ( React.DOM.div(null, 
				menu
			));
	},
	componentDidMount: function() {
		// When the component is added let me know
		this.setState({mounted: yes})
	},
	
});

/* main banner */
UI.Banner = React.createClass({displayName: 'Banner',
	getInitialState: function() {
		var now = new Date();
		return {mounted: false};
	},
	openEgg: function() {
		$('#easter-egg').slideToggle();
		$("#simpledocs").animate({ scrollTop: 0 }, 200);
		return false;
	},
	render: function() {
		var banner =	React.DOM.div({className: "banner-inside"}, 
					React.DOM.div({id: "name", className: "col-xs-4 col-sm-4 col-md-3 col-lg-2"}, 
						React.DOM.div({className: "inside"}, snowUI.name)
					), 
					React.DOM.div({id: "title", className: "col-xs-6 col-sm-4 col-md-9 col-lg-10"}, 
						typeof this.props.page === 'object' ? this.props.page.title : ''
					), 
					React.DOM.div({id: "logo"}, 
						React.DOM.a({onClick: this.openEgg})
					)
				);
			   
		return ( React.DOM.div({id: "banner"}, " ", banner, " "));
	},
	componentDidMount: function() {
		// When the component is added, turn it into a modal
		this.setState({mounted: !this.state.mounted});
		
	}
});
	

/* main div */
UI.UI = React.createClass({displayName: 'UI',
	
	getInitialState: function() {
		return { 
			pagedata: false,
		};
	},
	getPage: function(getpage) {
		this.setState({connecting:true});
		var page = getpage ? getpage : snowUI.homepage;
		var _this = this,
			url = snowUI.api.page + '/' + page
			data = {};
		//snowlog.log('target',$(e.target)[0].dataset.snowslug);
		snowUI.ajax.GET(url,data,function(resp) {
			if(resp.page) {
				snowlog.info('get page',resp);
				if(!_this.state.ready)snowUI.flash('message','Welcome to '+snowText.build.name+'. Please select a document.',8888);
				var _state={}
				_state.pagedata = resp.page;
				_state.connecting = false;
				_state.ready = true;
				document.title = resp.page.title;
				_this.setState(_state);
				
				var selector = $("#menu");
				if(selector.css('height') !== '45px' && selector.find('.dropdown').css('display') === 'block')_this.toggleMenu();
			} else {
				snowlog.error(resp);
				if(!getpage || !_this.state.ready) {
					snowUI.flash('message','Welcome to '+snowText.build.name+'. Please select a document.',8888);
				} else {
					snowUI.flash('error','' + resp.error) ;
				}
				var _state={}
				_state.connecting = false;
				_state.pagedata = {};
				_state.ready = true;
				_this.setState(_state);
			}
			return false;
		})
		
	},
	
	handleBannerChange: function(e) {
		e.preventDefault();
	},
	handleActionChange: function(e) {
		e.preventDefault();
	},
	componentDidMount: function() {
		this.componentWillReceiveProps(this.props);
	},
	componentWillReceiveProps: function(props) {
		snowlog.log('update props',props)
		var _this = this;
		
		this.getPage(props.page);
		return false;
		
		this.setState({pagedata:{}});
		return false;
	},
	hrefRoute: function(route) {
		route.preventDefault();
		var _this = this
		var newroute = $(route.target)	
		
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
	},
	_toggled: false,
	toggleMenu: function(e) {
		if(e)e.stopPropagation();
		var _this = this;
		var selector = $("#menu");
		if(parseFloat($(document).width()) > snowUI.breaks.small.width) return false; 
		if(!this._toggled) {
			selector
				.data('oHeight',selector.height())
				.css('height','auto')
				.data('nHeight',selector.height())
				.height(selector.data('oHeight'))
				.animate({height: selector.data('nHeight')},400, function() {
					selector.find('.dropdown').addClass('open');
					selector.find('.dropspan').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
					_this._toggled = true;
				});
			
		} else {
			selector.animate({height: 45}, 'slow', function(){ 
				snowlog.info('Slide Up Transition Complete');
				selector.css("height","");
				selector.find('.dropdown').removeClass('open');
				selector.find('.dropspan').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
				_this._toggled = false;
			});
			
		}
		return false;	
	},	
	render: function() {
		snowlog.log('state',this.state)
		return (
			React.DOM.div(null, 
				UI.Banner({page: this.state.pagedata, onActionChange: this.handleBannerChange}), 
				React.DOM.div({className: "col-xs-12 col-sm-4 col-md-3 col-lg-2", id: "menu", 'data-spy': "affix", 'data-offset-top': "44"}, 
					React.DOM.div({className: "dropdown", onClick: this.toggleMenu}, React.DOM.span({className: "dropspan glyphicon glyphicon-chevron-down"})), 
					UI.Menu({config: this.state, getPage: this.hrefRoute, toggleMenu: this.toggleMenu, page: this.props.page})
				), 
				React.DOM.div({className: "col-xs-12 col-sm-offset-4 col-sm-8 col-md-offset-3 col-md-9 col-lg-offset-2 col-lg-10", id: "home"}, 
					UI.home({config: this.state, getPage: this.hrefRoute, contents: this.state.pagedata})
				)
				
				
			)	
		);
	}
});	

//app info
UI.AppInfo = React.createClass({displayName: 'AppInfo',
	changeTheme: function() {
		$('body').toggleClass('dark-theme');
		return false;
	},
	render: function() {
		return (
			React.DOM.div({id: "easter-egg", style: {display:'none'}}, 
				React.DOM.div({className: "col-xs-offset-1 col-md-offset-1"}, 
					React.DOM.div({className: "col-xs-10 col-md-5"}, 
						React.DOM.h4(null, "Get SimpleDocs"), 
						React.DOM.div({className: "row"}, 
							React.DOM.div({className: "col-sm-offset-1 col-sm-11"}, "GitHub    ", React.DOM.a({href: "https://github.com/snowkeeper/simpledocs", target: "_blank"}, "source"), "   |   ", React.DOM.a({href: "https://github.com/snowkeeper/simpledocs/archive/latest.zip", target: "_blank"}, "latest.zip"), "  |  ", React.DOM.a({href: "https://github.com/snowkeeper/simpledocs/archive/latest.tar.gz", target: "_blank"}, "latest.tar.gz")), 
							React.DOM.div({className: "col-sm-offset-1 col-sm-11"}, React.DOM.a({href: "https://npmjs.org/package/simpledocs", target: "_blank"}, "NPMJS")), 
							React.DOM.div({className: "col-sm-offset-1 col-sm-11"}, "Standalone ", React.DOM.a({href: "https://github.com/snowkeeper/simpledocs-standalone", target: "_blank"}, "source"), " | ", React.DOM.a({href: "https://github.com/snowkeeper/simpledocs-standalone/archive/latest.zip", target: "_blank"}, "zip"), " | ", React.DOM.a({href: "https://github.com/snowkeeper/simpledocs-standalone/archive/latest.tar.gz", target: "_blank"}, "gz"))
							
						), 
						React.DOM.div({style: {borderBottom:'transparent 15px solid'}})
					), 
					React.DOM.div({className: "col-xs-11 col-md-5"}, 
						React.DOM.h4(null, "Share"), 
						React.DOM.div({className: "row"}, 
							React.DOM.div({title: "inquisive.link/.simpledocs", className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"}, " ", React.DOM.a({href: "https://inquisive.link/.simpledocs", target: "_blank"}, ".simpledocs")), 
							React.DOM.br(null)
						)
					), 
					React.DOM.div({className: "clearfix"}), 
					React.DOM.div({className: "col-xs-11 col-md-5"}, 
						React.DOM.h4(null, "Built With"), 
						React.DOM.div({className: "row"}, 
							React.DOM.div({className: "col-xs-6 col-sm-4 col-md-3"}, React.DOM.a({href: "http://nodejs.org", target: "_blank"}, "nodejs")), 
							React.DOM.div({className: "col-xs-6 col-sm-4 col-md-3"}, React.DOM.a({href: "http://keystonejs.com", target: "_blank"}, "KeystoneJS")), 
							React.DOM.div({className: "col-xs-6 col-sm-4 col-md-3"}, React.DOM.a({href: "http://getbootstrap.com/", target: "_blank"}, "Bootstrap")), 
							React.DOM.div({className: "col-xs-6 col-sm-4 col-md-3"}, React.DOM.a({href: "http://facebook.github.io/react/docs/thinking-in-react.html", target: "_blank"}, "ReactJS"))
							
						), 
					   
						React.DOM.div({style: {borderBottom:'transparent 15px solid'}})
					), 
					React.DOM.div({className: "clearfix"}), 
					React.DOM.div({className: "col-xs-11 col-md-5"}, 
						React.DOM.h4(null, "About"), 
						React.DOM.div({className: "row"}, 
							React.DOM.div({className: "col-sm-offset-1"}, React.DOM.a({href: "https://inquisive.link/docs/simpledocs", target: "_blank"}, "About / Documents / Demo"))
						)
					), 
					React.DOM.div({className: "col-xs-11 col-md-5"}, 
						React.DOM.h4(null, "Donate"), 
						React.DOM.div({className: "row"}, 
							React.DOM.div({title: "inquisive.link/.simpledocs.donate", className: "col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"}, " ", React.DOM.a({href: "https://inquisive.link/.simpledocs.donate", target: "_blank"}, ".simpledocs.donate")), 
							React.DOM.br(null)
						)
					), 
					React.DOM.div({className: "clearfix", style: {borderBottom:'transparent 15px solid'}}), 
					React.DOM.div({className: "col-xs-11 col-md-10"}, 
						React.DOM.h4(null, "Theme"), 
						React.DOM.div({className: "row"}, 
							React.DOM.div({title: "change theme", className: "col-sm-offset-1 col-sm-10 col-md-offset-1 col-md-10"}, " ", React.DOM.a({style: {cursor:'pointer'}, onClick: this.changeTheme}, "Switch between light and dark themes")), 
							React.DOM.br(null)
						)
					), 
					React.DOM.div({className: "clearfix", style: {borderBottom:'transparent 15px solid'}})
			      )
			)
		);
	}
});



	
