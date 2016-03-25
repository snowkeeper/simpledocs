import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Path from 'path';
import wrapListeners from './listen';
import Debug from 'debug';
import Menu from './common/components/menu';
import Menu2 from './common/components/menu2';
import Confirm from './common/components/confirm';
import routes from './routes';
import {Card, CardText, FontIcon, IconMenu, IconButton, AppBar, RaisedButton, LeftNav, MenuItem, Styles, Divider, List, ListItem} from 'material-ui/lib';

let debug = Debug('simpledocs:app:render');

class Main extends Component {
	constructor(props) {
		// we get props from Listener
		super(props);
		
		this.state = Object.assign({}, props);
		
		this._defaults = {
			leftNav: false,
			current: {},
			contents: false,
			allinone: false,
			search: '',
			forceUpdate: false,
			anchor: false,
			forceGrab: false,
		}
		
		debug('fresh state', this.state);
		
		this.handleLeftNav = this.handleLeftNav.bind(this);
		this.LeftNavClose = this.LeftNavClose.bind(this);
		this.goTo = this.goTo.bind(this);
		this.allInOne = this.allInOne.bind(this);
		this.goToAnchor = this.goToAnchor.bind(this);
		this.setAsset = this.setAsset.bind(this);
		this.appState = this.appState.bind(this);
		this.answerConfirm = this.answerConfirm.bind(this);
		this.switchTheme = this.switchTheme.bind(this);
		this.searchToggle = this.searchToggle.bind(this);
	}
	
	componentDidMount() {

		this.switchTheme(this.props.currentTheme, false);
		
		/* set the height of the menu and minimum height of content */
		var menu = document.getElementById('menu');
		let clientHeight = document.documentElement.clientHeight;
		let footer = document.getElementById('simpledocs-footer');
		let appbar = document.getElementById('appbar');
		
		menu.style.height = clientHeight - appbar.clientHeight + "px";	
		debug('menu height',  clientHeight, appbar.clientHeight, clientHeight - appbar.clientHeight, menu.style.height, menu.style);
		//snowUI.contentHeight = clientHeight - appbar.clientHeight - footer.clientHeight - 25;
	}
	
	componentWillReceiveProps(props) {
		// update from listener
		var p = { ...props };
		debug('listener props', p);
		if(props.page === snowUI.singlePage && !this.state.allinone) {
			p.allinone = true;
		}
		this.setState(p);	
	}
	
	componentWillUnmount() {
		
	}
	
	switchTheme(theme = 'blue', update = true) {
		let style = this.props.styles[theme];
		if(!style) {
			style = this.props.styles.blue;
		}
		if(theme == 'dark') {
			snowUI.setTheme('dark-theme');
			snowUI.shortenTitle = false;
		} else if(theme == 'graphite') {
			snowUI.setTheme('dark-theme graphite');
			snowUI.shortenTitle = true;
		} else if(theme == 'night') {
			snowUI.setTheme('dark-theme default');
			snowUI.shortenTitle = false;
		} else if(theme == 'cream') {
			snowUI.setTheme('');
			snowUI.shortenTitle = true;
		} else if(theme == 'light') {
			snowUI.setTheme('light-theme theme-light ');
			snowUI.shortenTitle = true;
		} else {
			snowUI.setTheme('light-theme blue');
			snowUI.shortenTitle = false;
		}
		if(update) {
			this.appState({
				theme: style,
				currentTheme: theme,
				forceUpdate: true
			}, function() {
				Prism.highlightAll();
			});
		}
	}
	
	getChildContext() {
		return {
			muiTheme: this.state.theme,
		};
	}
	
	handleLeftNav(e) {
		if(e && typeof e.preventDefault === 'function') {
			e.preventDefault();
		}
		if(this.state.desktop && (this.state.window.width > snowUI.breaks.sm.width)) {
			this.appState({desktopNav: !this.state.desktopNav});
		} else {
			this.appState({leftNav: !this.state.leftNav});
		}
	} 
	
	LeftNavClose () {
		this.appState({ leftNav: false });
	}
	
	searchToggle(e) { 
		let target = $(e.target).parent().prev();
		target.toggleClass('open');
		debug('searchToggle', target);
		let $input = target.find('input');
		$input.val('');
		$input.focus();
		$input.keypress((event) => {
			// keyboard Enter event
			if ( event.which == 13 ) {
				event.preventDefault();
				let state = {
					page: 'search::' + $input.val(),
					search:  $input.val()
				}
				
				this.appState(Object.assign({ ...this._defaults }, state), () => {
					this.state.history.push({
						pathname: 'search::',
						search: $input.val(),
					})
				});
			}
			
		});
	}
	
	goToAnchor(route, v) {
		debug('goToAnchor', route, v);
		var simple = document.getElementById("simpledocs");
		var goto = document.getElementById(route) ? document.getElementById(route).offsetTop : 0;
		simple.scrollTop = goto < 30 ? 0 : goto - 30;
			
		let state = {
			allinone: true,
			anchor: route,
			contents: this.props.contents
		}
		
		this.appState(Object.assign({ ...this._defaults }, state), () => {
			this.state.history.push({
				pathname: Path.join('/' , snowUI.singlePage, route),
				search: this.state.query,
			})
		});
		return false
	}
	
	allInOne(slug) {
		debug('goTo allinone')
		
		let state = {
			page: snowUI.singlePage,
			anchor: slug || snowUI.page,
			allinone: true
		}
		
		// fade the content div before its replaced
		snowUI.fadeOut('slow', () => {
			this.appState(Object.assign({ ...this._defaults }, state), () => {
				var simple = document.getElementById("simpledocs");
				simple.scrollTop = 0;
				debug('push history', '/', snowUI.singlePage, state.anchor);
				this.state.history.push({
					pathname: Path.join('/' , snowUI.singlePage, state.anchor),
					search: this.state.query,
				});
				
			});
		});
	}
	
	goTo(state) {
		debug('goTo state', state)
		
		if(typeof state === 'string') {
			// accept strings for the page
			state = {
				page: state,
			}
		}
		
		if(this.props.page === snowUI.singlePage) {
			state.forceGrab = true;
		}
		
		// fade the content div before its replaced
		snowUI.fadeOut('slow', () => {
			var send = Object.assign({ ...this._defaults }, state);
				
			this.appState(send, () => {
				debug('push history ', '/' , this.state.page, this._defaults, state, send)
				this.state.history.push({
					pathname: Path.join('/' , this.state.page),
					search: this.state.query,
				});
			});	
		});
		
	}
	
	setAsset(asset, callback) {
		this.appState(asset, callback);
	}
	
	appState(newState, callback) {
		this.props.appState(newState, callback);
	}
	
	dismissConfirm() {
		this.appState({ 
			newconfirm: {
				show: false
			}
		});
	}
	
	answerConfirm(success) {
		if(success) {
			if(typeof this.state.newconfirm.answer === 'function') {
				this.state.newconfirm.answer(this.state.answerConfirm);
			} else if(typeof this[this.state.answerMethod] === 'function') {
				this[this.state.answerMethod](this.state.answerConfirm);
			}
		}
		this.appState({
			newconfirm: {
				open: false,
			},
			answerConfirm: false
		});
		
	}
	
	render() {
		debug('render state', this.state);
		
		let title = this.state.current.title || this.state.page;
		
		let isConnectedIcon = ( this.state.connected === true || !snowUI.usesockets )
			? 
				<IconButton onClick={(e)=>{e.preventDefault();this.goTo('status');}} ><FontIcon className="material-icons"  >info_outline</FontIcon></IconButton>
			:
				<span><IconButton onClick={(e)=>{e.preventDefault();this.goTo('status');}} ><FontIcon className="material-icons" style={{fontSize:'20px'}} color={Styles.Colors.red900} hoverColor={Styles.Colors.red500} title="Connection to server lost">cloud_offline</FontIcon></IconButton></span>
		
		let appBarRightIcons = (<span>
			
			{isConnectedIcon}
			
			<span style={{ cursor: 'pointer' }}>
				<IconMenu
					iconButtonElement={<FontIcon className="material-icons" >invert_colors</FontIcon>}
					onItemTouchTap={(e, val) => {
						debug(e, val);
						if(val.props.value === 'boot') {
							return location.href = snowUI.path.bootstrap;
						}
						this.switchTheme(val.props.value);
					}}
				>
				  <MenuItem primaryText="Cream" value="cream"/>
				  <MenuItem primaryText="Light" value="light" />
				  <MenuItem primaryText="Blue" value="blue"/>
				  <MenuItem primaryText="Graphite" value="graphite"/>
				  <MenuItem primaryText="Night" value="night"/>
				  <MenuItem primaryText="Dark" value="dark" />
				  <MenuItem primaryText="Bootstrap" value="boot" />
				</IconMenu>
			</span>
			
			<IconButton onClick={(e)=>{e.preventDefault();this.goTo(snowUI.homepage);}} ><FontIcon className="material-icons"  >home</FontIcon></IconButton>
			
			<div style={{width:20,height:20,display:'inline-block'}} />
		</span>);
		
		let appbar = (<div id="appbar"> 
			<div style={{zIndex:1101, width: '100%', height: '64px' ,position: 'fixed', }} >
				<AppBar
					title={<div id="appbarTitle" >{title}</div>}
					onLeftIconButtonTouchTap={this.handleLeftNav} 
					iconElementRight={appBarRightIcons}
					style={{boxShadow: 'none'}}
				/>
			</div>
			<div style={{height:65,width:'100%'}} />
		</div>);
        
        const Page = routes(this.state.page);
        
		const xs = snowUI.breaks.menu[0] === 12 ? 'hidden-xs' : 'col-xs-' + snowUI.breaks.menu[0];
		const sm = snowUI.breaks.menu[1] === 12 ? 'hidden-sm' : 'col-sm-' + snowUI.breaks.menu[1];
		const md = snowUI.breaks.menu[2] === 0 ? 'hidden-md' : 'col-md-' + snowUI.breaks.menu[2];
		const lg = snowUI.breaks.menu[3] === 0 ? 'hidden-lg' : 'col-lg-' + snowUI.breaks.menu[3];
		const xsC = snowUI.breaks.content[0] === 0 ? 'hidden-xs' : 'col-xs-' + snowUI.breaks.content[0];
		const smC = snowUI.breaks.content[1] === 0 ? 'hidden-sm' : 'col-sm-' + snowUI.breaks.content[1];
		const mdC = snowUI.breaks.content[2] === 0 ? 'hidden-md' : 'col-md-' + snowUI.breaks.content[2];
		const lgC = snowUI.breaks.content[3] === 0 ? 'hidden-lg' : 'col-lg-' + snowUI.breaks.content[3];
		
		let overrideMenu = (this.state.desktop && this.state.desktopNav) || !this.state.desktop ? xs + " " + sm + " " + md + " " + lg : ' hidden-xs hidden-sm hidden-md hidden-lg ';
		let overrideContent = this.state.desktop && this.state.desktopNav ? xsC + " " + smC + " " + mdC + " " + lgC : ' col-xs-12 col-sm-12 col-md-12 col-lg-12 ';
		
        return (<div>
			{appbar}
			
			<Menu2 update={snowUI.alwaysloadtree} docked={true}  searchToggle={this.searchToggle}  goTo={this.goTo} handleLeftNav={this.handleLeftNav} goToAnchor={this.goToAnchor} allInOne={this.allInOne} { ...this.state } />
			
			<div className="clearfix" />
			<div className="simpledocs-container" >
				<div className={overrideMenu}  style={{padding:0}} >
					<div  id="menu" className={xs + " " + sm + " " + md + " " + lg + " no-padding"}  >
						<Menu2 update={snowUI.alwaysloadtree} docked={false} searchToggle={this.searchToggle} goTo={this.goTo} handleLeftNav={this.handleLeftNav} goToAnchor={this.goToAnchor} allInOne={this.allInOne} { ...this.state } />
					</div>
				</div>
				<div style={{paddingRight:0, paddingLeft:0}} className={overrideContent}>
					<div id="content-fader">
						<Page { ...this.state } assets={this.appState} appState={this.appState} switchTheme={this.switchTheme} goTo={this.goTo} handleLeftNav={this.handleLeftNav} goToAnchor={this.goToAnchor} allInOne={this.allInOne} />
					</div>
				</div>
			</div>
			<div className="clearfix" />
			<div className="simpledocs-footer" id="simpledocs-footer" >
				
			</div>
			<Confirm 
				html={this.state.newconfirm.html}
				title={this.state.newconfirm.title}
				answer={this.answerConfirm}
				open={this.state.newconfirm.open}
				yesText={this.state.newconfirm.yesText}
				noText={this.state.newconfirm.noText}
				theme={this.state.theme}
			/>
        </div>);

	}
}

Main.childContextTypes = {
    muiTheme: React.PropTypes.object
};

export let myComponent =  wrapListeners(Main);

export default myComponent;
