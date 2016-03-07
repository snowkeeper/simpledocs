import React from 'react';

let yes = true;
let no = false;

export default class UI extends React.Component {
	constructor(props) {
		super(props);
		this.displayName = 'UI Component';	
		this.state = {
			pagedata: false,
			allinone: props.allinone
		};
		
		this._toggled = false;
		this.goToAnchor = this.goToAnchor.bind(this);
		this.getPage = this.getPage.bind(this);
		this.hrefRoute = this.hrefRoute.bind(this);
		this.toggleMenu = this.toggleMenu.bind(this);
	}
	
	componentDidMount() {
		
		this.componentWillReceiveProps(this.props);
		
		snowlog.log('did mount', '## run __mountedUI js ############################')
		snowUI.code.__mountedUI();
		
		var $menu = $('#menu');
		var $home = $('#home');
		
		var clientHeight = document.documentElement.clientHeight;
		var clientWidth = document.documentElement.clientWidth;
		var appbar = document.getElementById('banner');
		
		$menu.css('height', clientHeight - appbar.clientHeight);
		if(clientWidth > snowUI.breaks.sm.width) {
			$menu.css('marginTop',appbar.clientHeight);
			$home.css('marginTop', appbar.clientHeight);
		}
		
		snowUI.stickyMenu();
		
	}
	
	componentWIllUnmount() {
		snowUI.unstickyMenu();			
	}
	
	componentDidUpdate() {
			
	}
	
	componentWillReceiveProps(props) {
		snowlog.log('got props', props, this.state)
		var _this = this;
		if(this.state.page !== props.page || this.state.moon != props.moon) {
			if(this.state.moon === snowUI.singlePage && props.allinone === true) {
				return
			} 
			snowlog.log('update props', props, this.state)
			this.setState({
				page: props.page,
				moon: props.moon,
				allinone: props.allinone
			}, () => {
				snowlog.log('updated props get page')
				this.getPage(props.page, props.moon);
			});	
			return		
		} 
		if(this.state.moon === snowUI.singlePage && props.moon !== snowUI.singlePage) {
			this.setState({
				page: props.page,
				moon: props.moon,
				allinone: props.allinone
			}, () => {
				snowlog.log('updated props get page')
				this.getPage(props.page, props.moon);
			});	
			return
		} 	
	}
	
	getPage(getpage, moon) {
		this.setState({
			connecting:true,
			pagedata: false,
			searchdata: false,
		});
		var page = getpage ? getpage : snowUI.homepage;
		if(moon === snowUI.singlePage) {
			page = 'allinone';
			var root = snowUI.api.allinone;
		} else if(moon === 'search') {
			var root = snowUI.api.search;
		} else {
			var root = snowUI.api.page;
		}
		let _this = this;
		let	url = root + '/' + page;
		let data = {};		
		
		var showLoadingIfTimer = setTimeout(function(){snowUI.flash('message','Loading ' + page,10000)},500);
		
		snowUI.fadeOut('fast', () => {
			snowlog.log('request page', url, data);
			snowUI.ajax.GET(url, data, (resp) => {
				clearTimeout(showLoadingIfTimer);
				snowlog.info('page', resp)
				snowUI.killFlash('message');
				if(resp.search) {
					
					//console.log('got search results',resp);
					if(!_this.state.ready) {
						snowUI.flash('message', 'Welcome to '+ snowUI.text.build.name + '.', 2000);
					}
					var _state={
						pagedata: false,
						searchdata: resp.search,
						connecting: false,
						ready: true,
						allinone: false,
					}
					
					document.title = 'Search Results';
					
					_this.setState(_state, () => {
						snowUI.fadeIn();
					});
					
					var selector = $("#menu");
					if(selector.css('height') !== '45px' && selector.find('.dropdown').css('display') === 'block') {
						_this.toggleMenu();
					}
				
				} else if(resp.page) {

					if(!_this.state.ready) {
						snowUI.flash('message', 'Welcome to ' + snowUI.text.build.name + '.', 1000);
					}
					
					var _state={
						pagedata: resp.page,
						searchdata: false,
						connecting: false,
						ready: true,
					}
					
					document.title = resp.page.title || snowUI.name;
					
					_this.setState(_state, () => {
						snowlog.log('### run __mountedPage js ###');
						snowUI.fadeIn();
						snowUI.code.__mountedPage(() => {
							if(_this.state.allinone) {
								_this.scrollToAnchor();
							}
						});
						
					});
					
					bone.router.navigate(getpage, {trigger:false});
					
					var selector = $("#menu");
					if(selector.css('height') !== '45px' && selector.find('.dropdown').css('display') === 'block') {
						_this.toggleMenu();
					}
				} else {
					snowlog.error(resp);
					
					if(!getpage || !_this.state.ready) {
						snowUI.flash('message','Welcome to ' + snowUI.text.build.name + '. Please select a document.',2000);
					} else {
						snowUI.flash('error','' + resp.error) ;
					}
					
					var _state={
						pagedata: {},
						searchdata: false,
						connecting: false,
						ready: true,
					}
					
					_this.setState(_state, () => {
						snowUI.fadeIn();
					});
				}
				return false;
			});
		});
	}
	
	handleBannerChange(e) {
		e.preventDefault();
	}
	
	handleActionChange(e) {
		e.preventDefault();
	}
	
	hrefRoute(route) {
		route.preventDefault();
		var _this = this;
		var newroute = $(route.target);
		
		snowlog.log('href loader route',snowUI.path.root,newroute);
		var moon =  newroute[0] ? newroute.closest('a')[0].pathname : false;
		if(moon) {
			moon = moon.replace((snowUI.path.root + "/"), '');
			snowlog.log('moon owner', moon);
			bone.router.navigate(moon, {trigger:true});
		} else {
			snowUI.flash('error','Link error',2000);
			_this.setState({showErrorPage:false});
		}		
		
		return false
	}
	
	scrollToAnchor(anchor) {
		var route = anchor || this.state.page;
		snowlog.log('scroll to anchor', route);
		var simple = document.getElementById("simpledocs");
		var goto = document.getElementById(route).offsetTop;
		simple.scrollTop = goto - 20;
		//$('#simpledocs').scrollTo('#' + route,{duration:'slow', offsetTop : '50'});
	}
	
	goToAnchor(route) {
		//$('#simpledocs').scrollTo('#' + route,{duration:'slow', offsetTop : '50'});
		bone.router.navigate(snowUI.singlePage + '/' + route, {trigger: false});
		
		this.setState({
			moon: snowUI.singlePage,
			page: route,
			allinone: true
		}, () => {
			this.scrollToAnchor(route);
		});
		return false;
	}

	toggleMenu(e) {
		if(e) {
			e.stopPropagation();
		}
		var _this = this;
		var selector = $("#menu");
		if(parseFloat($(document).width()) > snowUI.breaks.sm.width) {
			return false;
		}
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
				});
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
	}
	render() {
		snowlog.log('state', this.state);
		var page = this.state.searchdata || this.state.pagedata || {};
		var UI = snowUI.UI;
		var xs = snowUI.breaks.menu[0] === 0 ? 'hidden-xs' : 'col-xs-' + snowUI.breaks.menu[0];
		var sm = snowUI.breaks.menu[1] === 0 ? 'hidden-sm' : 'col-sm-' + snowUI.breaks.menu[1];
		var md = snowUI.breaks.menu[2] === 0 ? 'hidden-md' : 'col-md-' + snowUI.breaks.menu[2];
		var lg = snowUI.breaks.menu[3] === 0 ? 'hidden-lg' : 'col-lg-' + snowUI.breaks.menu[3];
		var xsC = snowUI.breaks.content[0] === 0 ? 'hidden-xs' : 'col-xs-' + snowUI.breaks.content[0];
		var smC = snowUI.breaks.content[1] === 0 ? 'hidden-sm' : 'col-sm-' + snowUI.breaks.content[1];
		var mdC = snowUI.breaks.content[2] === 0 ? 'hidden-md' : 'col-md-' + snowUI.breaks.content[2];
		var lgC = snowUI.breaks.content[3] === 0 ? 'hidden-lg' : 'col-lg-' + snowUI.breaks.content[3];
		return (<div>
			<UI.Banner title={page.title || this.state.page} page={page} onActionChange={this.handleBannerChange} /> 
			<div id="menuspy" />
			<div className={xs + " " + sm + " " + md + " " + lg + " stickyMenu"}  id="menu" >
				<div className="dropdown" onClick={this.toggleMenu}><span className="dropspan glyphicon glyphicon-chevron-down" /></div>
				<UI.Menu config={this.state} hrefRoute={this.hrefRoute} goToAnchor={this.goToAnchor}  getPage={this.getPage} toggleMenu={this.toggleMenu} page={this.state.page} moon={this.state.moon} />
			</div>
			<div className={xsC + " col-sm-offset-" + snowUI.breaks.menu[1] + " " + smC + " col-md-offset-" + snowUI.breaks.menu[2] + " " + mdC + " col-lg-offset-" + snowUI.breaks.menu[3] + " " + lgC + ""}  id="home"> 
				<div id="content-fader">
					<UI.home config={this.state} goToAnchor={this.goToAnchor} getPage={this.hrefRoute} contents={this.state.searchdata || this.state.pagedata} page={this.state.page} moon={this.state.moon} />
				</div> 
			</div>
			<div className="simpledocs-footer" />
		</div>);
	}
};	
