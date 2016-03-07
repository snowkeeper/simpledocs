module.exports = React.createClass({
	getInitialState: function() {
		return { 
			pagedata: false,
			allinone: false
		};
	},
	componentDidMount: function() {
		this.componentWillReceiveProps(this.props);
		snowlog.log('did mount')
		snowUI.loadApiCode();
		var $menu = $('#menu');
		var $home = $('#home');
		var clientHeight = document.documentElement.clientHeight;
		var appbar = document.getElementById('banner');
		$menu.css('height', clientHeight - appbar.clientHeight);
		$menu.css('marginTop',appbar.clientHeight);
		$home.css('maxHeight', clientHeight - appbar.clientHeight);
		$home.css('marginTop',appbar.clientHeight);
		snowlog.log('menu', menu.style.height , clientHeight - appbar.clientHeight);
	},
	componentDidUpdate() {
		
	},
	componentWillReceiveProps: function(props) {
		snowlog.log('update props',props)
		var _this = this;
		
		if(props.moon === snowUI.singlePage) {
			return;
		}
		
		this.getPage(props.page, props.moon);
		return;
	},
	getPage: function(getpage, moon) {
		this.setState({
			connecting:true,
			pagedata: false,
			searchdata: false,
		});
		var page = getpage ? getpage : snowUI.homepage;
		if(page === snowUI.singlePage) {
			page = 'allinone';
			var root = snowUI.api.allinone;
		} else if(moon === 'search:doc') {
			var root = snowUI.api.search;
		} else {
			var root = snowUI.api.page;
		}
		var _this = this,
			url = root + '/' + page
			data = {};
		
		
		var showLoadingIfTimer = setTimeout(function(){snowUI.flash('message','Loading ' + page,10000)},500);
		
		//snowlog.log('target',$(e.target)[0].dataset.snowslug);
		snowUI.ajax.GET(url, data, function(resp) {
			clearTimeout(showLoadingIfTimer);
			snowlog.info('page', resp)
			snowUI.killFlash('message');
			if(resp.search) {
				
				//console.log('got search results',resp);
				if(!_this.state.ready)snowUI.flash('message','Welcome to '+snowText.build.name+'.',8888);
				var _state={
					allinone: false
				}
				_state.searchdata = resp.search;
				_state.pagedata = false;
				_state.connecting = false;
				_state.ready = true; 
				document.title = 'Search Results';
				_this.setState(_state);
				
				var selector = $("#menu");
				if(selector.css('height') !== '45px' && selector.find('.dropdown').css('display') === 'block')_this.toggleMenu();
			
			} else if(resp.page) {

				if(!_this.state.ready) {
					snowUI.flash('message', 'Welcome to '+snowText.build.name+'.', 1000);
				}
				var _state={
					allinone: _this.props.allinone
				}
					
				_state.pagedata = resp.page;
				_state.searchdata = false;
				_state.connecting = false;
				_state.ready = true;
				document.title = resp.page.title || _this.props.page || snowUI.name;
				_this.setState(_state, function() {
					snowlog.log('### run new page js ###############################S');
					snowUI.apiCode();
					Prism.highlightAll();
				});
				bone.router.navigate(getpage, {trigger:false});
				var selector = $("#menu");
				if(selector.css('height') !== '45px' && selector.find('.dropdown').css('display') === 'block') {
					_this.toggleMenu();
				}
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
				_state.searchdata = false;
				_state.ready = true;
				_this.setState(_state);
			}
			return false;
		});
		
	},
	handleBannerChange: function(e) {
		e.preventDefault();
	},
	handleActionChange: function(e) {
		e.preventDefault();
	},
	hrefRoute: function(route) {
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
	},
	goToAnchor: function(route) {
		//$('#simpledocs').scrollTo('#' + route,{duration:'slow', offsetTop : '50'});		
		var simple = document.getElementById("simpledocs");
		var goto = document.getElementById(route).offsetTop;
		simple.scrollTop = goto - 20;
		bone.router.navigate(snowUI.singlePage + '/' + route, {trigger: false});
		snowlog.log('gotoanchor', route);
		this.setProps({
			page: route,
			moon: snowUI.singlePage,
			allinone: true,
		});
		return false
	},
	_toggled: false,
	toggleMenu: function(e) {
		if(e) {
			e.stopPropagation();
		}
		var _this = this;
		var selector = $("#menu");
		if(parseFloat($(document).width()) > snowUI.breaks.small.width) {
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
		snowlog.log('state', this.state);
		var page = this.state.searchdata || this.state.pagedata || {};
		var UI = snowUI.UI;
		
		return (
			<div>
				<UI.Banner title={page.title || this.props.page} page={page} onActionChange={this.handleBannerChange} />
				<div id="menuspy" />
				<div className="col-xs-12 col-sm-4 col-md-3 col-lg-2"  id="menu" >
					<div className="dropdown" onClick={this.toggleMenu}><span className="dropspan glyphicon glyphicon-chevron-down" /></div>
					<UI.Menu config={this.state} hrefRoute={this.hrefRoute} goToAnchor={this.goToAnchor}  getPage={this.getPage} toggleMenu={this.toggleMenu} page={this.props.page} moon={this.props.moon} />
				</div>
				<div className="col-xs-12 col-sm-offset-4 col-sm-8 col-md-offset-3 col-md-9 col-lg-offset-2 col-lg-10"  id="home">
					<UI.home config={this.state} goToAnchor={this.goToAnchor} getPage={this.hrefRoute} contents={this.state.searchdata || this.state.pagedata} page={this.props.page} moon={this.props.moon} />
				</div>
				
				
			</div>	
		);
	}
});	
