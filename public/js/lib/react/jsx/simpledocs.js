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

UI.Alert = React.createClass({
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
		    <Alert bsStyle={this.props.showclass} onDismiss={this.dismissAlert}>
			<p>{message}</p>
		    </Alert>
		);
	},

	dismissAlert: function() {
		this.setState({isVisible: false});
		if(this.props.clearintervals instanceof Array)this.props.clearintervals.map(Link.Interval.clearIntervals);
		if(this.props.cleartimeouts instanceof Array)this.props.cleartimeouts.map(clearTimeout);
	}
});

UI.Man = React.createClass({
	getDefaultProps: function() {
		return ({divstyle:{float:'right',}});
	},
	
	render: function() {
	    
	    return this.transferPropsTo(
		<div style={this.props.divstyle} dangerouslySetInnerHTML={{__html: snowText.logoman}} />
	    );
	}
});

//connect error component
UI.messageDisplay = React.createClass({
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
	    
	    return (<div  style={{padding:'5px 20px'}} >
			<div className={this.props.type}>
				<span> {this.props.title || 'I have an important message for you.'}</span>
				<div className="message">
					<p>{this.props.message}</p>
				</div>
			</div>
			
		</div>);
	}
});
UI.displayMessage = UI.messageDisplay

/* main content */
UI.Content = React.createClass({
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
			
			 renderMe = (<UI.displayMessage   message ={this.state.message} type = 'warning' />)
			
			
		} else if(!this.state.ready) {
			snowlog.warn('empty render for content')
			return (<div />)
		
		} else if(UI[showcomp]) {
			
			var po = UI[showcomp]
			renderMe = (<po config={this.props.config} />)
		
		} else {
			
			renderMe = (<UI.displayMessage  title = '404 Not Found' message = 'I could not find the page you are looking for. ' type = 'requesterror' />)
			 
		}     
		return renderMe;
	},
	componentDidMount: function() {
		// When the component is added let me know
		this.setState({mounted: yes})
	},
	
}); 

/* home content */
UI.home = React.createClass({
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
				return (<div key={v.slug} className="link">
						<a onClick={_this.props.getPage} href={snowUI.path.root + '/' + v.slug}>{v.title}</a>
						<div className="link">
							{v.documents.length > 0  ? printMenu(v.documents): ''}
						</div>
					</div>)
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
						(<div key="fullcontent"><div dangerouslySetInnerHTML={{__html: this.props.contents.markdown.html}} /> </div>)
						: <span /> 
					: doc.display === 2 ? 
						(<div key="fullcontent" ><div dangerouslySetInnerHTML={{__html: this.props.contents.html}} /> </div>)
						: doc.display === 3 ? 
							(<div key="fullcontent"> <div key="fullcontentB"  dangerouslySetInnerHTML={{__html: this.props.contents.markdown.html}} /><div  key="fullcontentA"  dangerouslySetInnerHTML={{__html: this.props.contents.html}} /></div>) 
							: doc.display === 4 ? 
								(<div key="fullcontent"> <div key="fullcontentA"  dangerouslySetInnerHTML={{__html: this.props.contents.html}} /><div  key="fullcontentB"  dangerouslySetInnerHTML={{__html: this.props.contents.markdown.html}} /></div>)
								: <span />  
			
			
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
				display.unshift(<div key="dualpage">{content}</div>);
			}
			if(snowUI.menu[doc._id]) {
				var prev = snowUI.menu[doc.parent._id] ? 
					typeof snowUI.menu[doc.parent._id].docs[doc.order-2] === 'object' ? 
						(<li className="previous"><a href={snowUI.path.root + '/' + snowUI.menu[doc.parent._id].docs[doc.order-2].slug}  onClick={_this.props.getPage}  >&larr; {snowUI.menu[doc.parent._id].docs[doc.order-2].title}</a></li>) 
						: <span /> 
					: <span />;
				var next = snowUI.menu[doc._id] ? 
					typeof snowUI.menu[doc._id].docs[0] === 'object' ? 
						(<li className="next"><a href={snowUI.path.root + '/' + snowUI.menu[doc._id].docs[0].slug}  onClick={_this.props.getPage}  >&rarr; {snowUI.menu[doc._id].docs[0].title}</a></li>) 
						: <span /> 
					: <span />;
			} else {
				var prev = snowUI.menu[doc.parent._id] ?
					typeof snowUI.menu[doc.parent._id].docs[doc.order-2] === 'object' ?
						(<li className="previous"><a href={snowUI.path.root + '/' + snowUI.menu[doc.parent._id].docs[doc.order-2].slug}  onClick={_this.props.getPage}  >&larr; {snowUI.menu[doc.parent._id].docs[doc.order-2].title}</a></li>) 
						:  snowUI.menu[doc.parent.parent] ?
							typeof snowUI.menu[doc.parent.parent].docs[doc.parent.order-1] === 'object' ?
								(<li className="previous"><a href={snowUI.path.root + '/' + snowUI.menu[doc.parent.parent].docs[doc.parent.order-1].slug}  onClick={_this.props.getPage}  >&larr; {snowUI.menu[doc.parent.parent].docs[doc.parent.order-1].title}</a></li>) 
								: <span />
							: <span /> 
					: <span />;
				var next = snowUI.menu[doc.parent._id] ?
					typeof snowUI.menu[doc.parent._id].docs[doc.order] === 'object' ? 
						(<li className="next"><a href={snowUI.path.root + '/' + snowUI.menu[doc.parent._id].docs[doc.order].slug}  onClick={_this.props.getPage}  >&rarr;  {snowUI.menu[doc.parent._id].docs[doc.order].title}</a></li>) 
						: snowUI.menu[doc.parent.parent] ?
							typeof snowUI.menu[doc.parent.parent].docs[doc.parent.order] === 'object' ? 
								(<li className="next"><a href={snowUI.path.root + '/' + snowUI.menu[doc.parent.parent].docs[doc.parent.order].slug}  onClick={_this.props.getPage}  >&rarr;  {snowUI.menu[doc.parent.parent].docs[doc.parent.order].title}</a></li>) 
								: <span />
							: <span />
					: <span />;
			}
			var related = [];
			if(doc.links.length > 0) {
				related = doc.links.map(function(v){
					return (<div className="related-bubble" key={v.slug + 'related'} ><a className="badge bg-primary" onClick={_this.props.getPage} href={snowUI.path.root + '/' + v.slug}>{v.title}</a></div>);
				});
			}
			if(doc.externalLinks) {
				var ll = doc.externalLinks.replace(',',' ').split(' ');
				ll.forEach(function(v){
					related.push(<div className="related-bubble" key={v + 'linksE'}><a  className="badge bg-primary" target="_blank" href={v}>{v}</a></div>);
				});
			}
			if(related.length>0)related.unshift(<div className="related" key="related">Related</div>);
			return ( <div id="showconent"> 
					<UI.AppInfo  />
				{display}
				<div className="clearfix ">
					{related}
				</div>
				<div className="clearfix linkPager">
					<nav className="">
						<ul className="pager">
							{prev}
							<li><a href={snowUI.path.root + '/'} onClick={_this.props.getPage}><span className="glyphicon glyphicon-home" /></a></li>
							{next}
							
						</ul>
					</nav>
				</div>
			</div>);
		} else {
			var menu;
			if(snowUI.tree>0) {
				menu = snowUI.tree.map(function(v) {
					
					return (<div className="" key={v.slug}>
							
							<a className="" onClick={_this.props.getPage} href={snowUI.path.root + '/' + v.slug}>{v.title}</a>
							
							{v.documents.length > 0  ? printMenu(v.documents): ''}
						</div>
					);
					
				});
			}
			return ( <div id=""> 
				<UI.AppInfo  />
				{menu}
			</div>);
		}
	},
	componentDidMount: function() {
		// When the component is added let me know
		this.setState({mounted: yes})
	},
	
	
});

/* shortcut content */
UI.Menu = React.createClass({
	getInitialState: function() {
		return {ready: yes,register: no,mounted: no,response:no,data:{}};
	},
	componentWillReceiveProps: function(props) {
		snowlog.log(props)
	},
	render: function() {
		snowlog.info('menu tree',snowUI.tree);
		var _this = this;
		var runTree = function(slug,children) {
			console.log(children);
			/* run through the kids and see if one of them is active so we can show the kid links */
			if(Object.prototype.toString.call( children ) === '[object Array]' ) {
				
				var ret =  children.reduce(function(runner, current) {
					
					if(current.slug === slug) {
						console.log(true,current.slug,slug);
						runner = true
						return runner;
					}
					return runTree(slug,current.documents); 
				}, false); 
				console.log(ret,runner)
				return ret;
			} else {
				return false;
			}
		};
		var printMenu = function(pages,skiptree) {
			var list = pages.map(function(v) {
				var active = _this.props.page === v.slug ? 'active' : '';
				var rantree = skiptree === undefined ? runTree(_this.props.page,v.documents) : skiptree;
				console.log(v.slug,rantree);
				var collapse = snowUI.collapse ? rantree === true ? ' ': ' hidden' : ' hidden';
				return (<div key={v.slug} className="">
						<a className={"list-group-item " + active} onClick={_this.props.getPage} href={snowUI.path.root + '/' + v.slug}>{v.title}</a>
						<div className={"link " + collapse}>
							{printMenu(v.documents,rantree)}
						</div>
					</div>)
			});
			return list;
		}
		var menu = snowUI.tree.map(function(v) {
			var active = _this.props.page === v.slug ? 'active' : '';
			/* our first entry is the root document
			 * printMenu takes care of the children
			* */
			return (<div className="list-group" key={v.slug}>
					
					<a className="list-group-item head" onClick={_this.props.toggleMenu} >{snowText.menu}</a>
					<div key={v.slug} className="">
						<a className={"list-group-item " + active} onClick={_this.props.getPage} href={snowUI.path.root + '/' + v.slug}>{v.title}</a>
						
					</div>
					{printMenu(v.documents)}
				</div>
			);
			
		});
		return ( <div> 
				{menu}
			</div>);
	},
	componentDidMount: function() {
		// When the component is added let me know
		this.setState({mounted: yes})
	},
	
});

/* main banner */
UI.Banner = React.createClass({
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
		var banner =	<div className="banner-inside" >
					<div id="name" className="col-xs-4 col-sm-4 col-md-3 col-lg-2">
						<div className="inside">{snowUI.name}</div>
					</div>
					<div id="title" className="col-xs-6 col-sm-4 col-md-9 col-lg-10">
						<div className="inside">{typeof this.props.page === 'object' ? this.props.page.title : ''}</div>
					</div>
					<div id="logo">
						<a onClick={this.openEgg} />
					</div>
				</div>;
			   
		return ( <div id="banner" > {banner} </div>);
	},
	componentDidMount: function() {
		// When the component is added, turn it into a modal
		this.setState({mounted: !this.state.mounted});
		
	}
});
	

/* main div */
UI.UI = React.createClass({
	
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
		console.log(route);
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
				.animate({height: selector.data('nHeight')+50},400, function() {
					selector.find('.dropdown').addClass('open');
					selector.find('.dropspan').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
					selector.css('overflow','auto');
					_this._toggled = true;
				})
				
			
		} else {
			selector.animate({height: 45}, 'slow', function(){ 
				snowlog.info('Slide Up Transition Complete');
				selector.css("height","");
				selector.find('.dropdown').removeClass('open');
				selector.find('.dropspan').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
				selector.css('overflow','hidden');
				_this._toggled = false;
			});
			
		}
		return false;	
	},	
	render: function() {
		snowlog.log('state',this.state)
		return (
			<div>
				<UI.Banner page={this.state.pagedata} onActionChange={this.handleBannerChange} />
				<div id="menuspy" />
				<div className="col-xs-12 col-sm-4 col-md-3 col-lg-2"  id="menu" data-target="#simpledocs" data-spy="affix"  data-offset-top="65" >
					<div className="dropdown" onClick={this.toggleMenu}><span className="dropspan glyphicon glyphicon-chevron-down" /></div>
					<UI.Menu config={this.state}  getPage={this.hrefRoute} toggleMenu={this.toggleMenu} page={this.props.page}/>
				</div>
				<div className="col-xs-12 col-sm-offset-4 col-sm-8 col-md-offset-3 col-md-9 col-lg-offset-2 col-lg-10"  id="home">
					<UI.home config={this.state}  getPage={this.hrefRoute} contents={this.state.pagedata} />
				</div>
				
				
			</div>	
		);
	}
});	

//app info
UI.AppInfo = React.createClass({
	render: function() {
		return (
			<div id="easter-egg" style={{display:'none'}} >
				<div className="col-xs-offset-1 col-md-offset-1">
					<div className="col-xs-10 col-md-5">
						<h4>Get SimpleDocs</h4>
						<div className="row">
							<div className="col-sm-offset-1 col-sm-11">GitHub &nbsp;&nbsp;&nbsp;<a href="https://github.com/snowkeeper/simpledocs" target="_blank">source</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;<a href="https://github.com/snowkeeper/simpledocs/archive/latest.zip" target="_blank">latest.zip</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="https://github.com/snowkeeper/simpledocs/archive/latest.tar.gz" target="_blank">latest.tar.gz</a></div>
							<div className="col-sm-offset-1 col-sm-11"><a href="https://npmjs.org/package/simpledocs" target="_blank">NPMJS</a></div>
							<div className="col-sm-offset-1 col-sm-11">Standalone <a href="https://github.com/snowkeeper/simpledocs-standalone" target="_blank">source</a>&nbsp;|&nbsp;<a href="https://github.com/snowkeeper/simpledocs-standalone/archive/latest.zip" target="_blank">zip</a>&nbsp;|&nbsp;<a href="https://github.com/snowkeeper/simpledocs-standalone/archive/latest.tar.gz" target="_blank">gz</a></div>
							
						</div>
						<div style={{borderBottom:'transparent 15px solid'}} />
					</div>
					<div className="col-xs-11 col-md-5">
						<h4>Share</h4>
						<div className="row">
							<div title="inquisive.link/.simpledocs" className="col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"> <a href="https://inquisive.link/.simpledocs" target="_blank">.simpledocs</a></div>
							<br />
						</div>
					</div>
					<div className="clearfix" />
					<div className="col-xs-11 col-md-5">
						<h4>Built With</h4>
						<div className="row">
							<div className="col-xs-6 col-sm-4 col-md-3"><a href="http://nodejs.org" target="_blank">nodejs</a></div>
							<div className="col-xs-6 col-sm-4 col-md-3"><a href="http://keystonejs.com" target="_blank">KeystoneJS</a></div>
							<div className="col-xs-6 col-sm-4 col-md-3"><a href="http://getbootstrap.com/" target="_blank">Bootstrap</a></div>
							<div className="col-xs-6 col-sm-4 col-md-3"><a href="http://facebook.github.io/react/docs/thinking-in-react.html" target="_blank">ReactJS</a></div>
							
						</div>
					   
						<div style={{borderBottom:'transparent 15px solid'}} />
					</div>
					<div className="clearfix" />
					<div className="col-xs-11 col-md-5">
						<h4>About</h4>
						<div className="row">
							<div className="col-sm-offset-1"><a href="https://inquisive.link/docs/simpledocs" target="_blank">About / Documents / Demo</a></div>
						</div>
					</div>
					<div className="col-xs-11 col-md-5">
						<h4>Donate</h4>
						<div className="row">
							<div title="inquisive.link/.simpledocs.donate" className="col-sm-offset-1 col-sm-5 col-md-offset-1 col-md-5"> <a href="https://inquisive.link/.simpledocs.donate" target="_blank">.simpledocs.donate</a></div>
							<br />
						</div>
					</div>
					<div className="clearfix" style={{borderBottom:'transparent 15px solid'}} />
					<div className="col-xs-11 col-md-10">
						<h4>Theme</h4>
						<div className="row">
							<div title="change theme" className="col-sm-offset-1 col-sm-10 col-md-offset-1 col-md-10"> <a style={{cursor:'pointer'}} onClick={snowUI.toggleTheme}>Switch between light and dark themes</a></div>
							<br />
						</div>
					</div>
					<div className="clearfix" style={{borderBottom:'transparent 15px solid'}} />
			      </div>
			</div>
		);
	}
});



	
