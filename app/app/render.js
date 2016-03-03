import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Path from 'path';
import wrapListeners from './listen';
import Debug from 'debug';
import Gab from './common/gab';
import Snackbar from './common/components/snackbar';
import Menu from './common/components/menu';
import Menu2 from './common/components/menu2';
import Confirm from './common/components/confirm';
import routes from './routes';
import {Card, CardText, FontIcon, IconMenu, IconButton, AppBar, RaisedButton, LeftNav, MenuItem, Styles, Divider, List, ListItem} from 'material-ui/lib';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Alert from './common/alert';
import { Col } from 'react-bootstrap';

//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

let debug = Debug('simpledocs:app:render');

debug('dark raw theme', Styles.DarkRawTheme);
debug('dark  base theme', Styles.darkBaseTheme);

let myStyles = {
	primary1Color: '#223E77',
	textColor: Styles.Colors.blueGrey200,
	alternateTextColor: Styles.Colors.lightBlue50,
	primary2Color: '#3B71E2',
	canvasColor: '#303234',
	accent1Color: Styles.Colors.blueGrey50,
	accent2Color: Styles.Colors.blueGrey400,
	accent3Color: "#FA905C",
	disabledColor: Styles.Colors.grey600,
}
let myStylesLight = {
	primary1Color: 'initial',
	primary2Color: Styles.Colors.lightBlue700,
	textColor: Styles.Colors.grey700,
	accent1Color: Styles.Colors.blueGrey50,
    accent2Color: Styles.Colors.blueGrey500,
    accent3Color: Styles.Colors.lightBlack,
}
let myStylesDefault = {
	primary1Color: '#0C87C1',
}
let myStylesDefaultDark = {

}
class Main extends Component {
	constructor(props) {
		// we get props from Listener
		super(props);
		
		debug(props, 'location', location,)
		
		this.styles = {
			main: Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme), myStylesLight),
			maindark: Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme), Object.assign(myStyles, snowUI.materialStyle.mainDark)),
			light: Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme), Object.assign(myStylesDefault, snowUI.materialStyle.defaultLight) ),
			dark: Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.DarkRawTheme), Object.assign(myStylesDefaultDark, snowUI.materialStyle.defaultDark) ),
		}
		
		this.styles.main.appBar.textColor = Styles.Colors.grey700;
		
		this.state = Object.assign({
			leftNav: false,
			theme: this.styles.main,
			query: location.search,
			location: { ...location },
			current: {},
			contents: false,
			newalert: {},
			allinone: (snowUI.allinone === 'only'),
			newconfirm: {
				open: false
			},
		}, props);
		
		this._defaults = {
			leftNav: false,
			current: {},
			contents: false,
			location: location,
			query: '',
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
		this.dismissAlert = this.dismissAlert.bind(this);
		this.answerConfirm = this.answerConfirm.bind(this);
		this.showAlert = this.showAlert.bind(this);
		this.switchTheme = this.switchTheme.bind(this);
		this.searchToggle = this.searchToggle.bind(this);
	}
	
	componentDidMount() {
		// load external github files
		snowUI.loadApiCode();
		
		/* set the height of the menu and minimum height of content */
		let menu = document.getElementById('menu');
		
		let clientHeight = document.documentElement.clientHeight;
		let footer = document.getElementById('simpledocs-footer').clientHeight;
		let appbar = document.getElementById('appbar').clientHeight;
		
		//debug(menu, clientHeight, appbar.clientHeight);
		menu.style.height = clientHeight - appbar;	
		snowUI.contentHeight = clientHeight - appbar - footer - 25;
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
	
	switchTheme(theme = 'main') {
		let style = this.styles[theme];
		if(!style) {
			style = this.styles.main;
		}
		if(theme.search('dark') > -1) {
			snowUI.setTheme('dark-theme');
		} else if(theme == 'main') {
			snowUI.setTheme('default');
		} else {
			snowUI.setTheme('light-theme');
		}
		this.setState({
			theme: style,
			forceUpdate: true
		}, function() {
			Prism.highlightAll();
		});
		
	}
	
	showAlert(style, message, type = 'html') {
		this.setState({
			newalert: {
				show: true,
				[type]: message,
				style
			}
		});
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
		this.setState({leftNav: !this.state.leftNav});
	}
	
	LeftNavClose () {
		this.setState({ leftNav: false });
	}
	
	searchToggle(e) {
		let target = $(e.target).parent().prev();
		target.toggleClass('open');
		debug('searchToggle', target);
		let $input = target.find('input');
		$input.val('');
		$input.focus();
		$input.keypress((event) => {
			if ( event.which == 13 ) {
				event.preventDefault();
				let state = {
					page: 'search::' + $input.val(),
					search:  $input.val()
				}
				
				this.props.setState(Object.assign({...this._defaults}, state), () => {
					this.state.history.push({
						pathname: 'search::',
						search: $input.val(),
						state: {
							page: this.state.page,
							current: this.state.current
						}
					})
				});
			}
			
		});
	}
	
	goToAnchor(route, v) {
		//$('#simpledocs').scrollTo('#' + route,{duration:'slow', offsetTop : '50'});		
		console.log('goToAnchor', route, v);
		var simple = document.getElementById("simpledocs");
		var goto = document.getElementById(route) ? document.getElementById(route).offsetTop : 0;
		simple.scrollTop = goto < 30 ? 0 : goto - 30;
			
		let state = {
			allinone: true,
			anchor: route,
			contents: this.props.contents
		}
		
		this.props.setState(Object.assign({...this._defaults}, state), () => {
			this.state.history.push({
				pathname: Path.join('/' , snowUI.singlePage, route),
				search: this.state.query,
				state: {
					page: this.state.page,
					current: this.state.current
				}
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
		
		this.props.setState(Object.assign({...this._defaults}, state), () => {
			var simple = document.getElementById("simpledocs");
			simple.scrollTop = 0;
			debug('push history', '/', snowUI.singlePage, state.anchor);
			this.state.history.push({
				pathname: Path.join('/' , snowUI.singlePage, state.anchor),
				search: this.state.query,
				state: {
					page: this.state.page,
					current: this.state.current
				}
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
		var send = Object.assign({...this._defaults}, state);
		debug('goTo send', this._defaults, state, send);
		this.props.setState(send, () => {
			debug('push history ', '/' , this.state.page)
			this.state.history.push({
				pathname: Path.join('/' , this.state.page),
				search: this.state.query,
				state: {
					page: this.state.page,
					current: this.state.current
				}
			});
		});	
	}
	
	setAsset(asset, callback) {
		this.setState(asset, callback);
	}
	
	dismissAlert() {
		this.setState({ 
			newalert: {
				show: false
			}
		});
	}
	
	dismissConfirm() {
		this.setState({ 
			newconfirm: {
				show: false
			}
		});
	}
	
	answerConfirm(success) {
		if(success) {
			this[this.state.answerMethod](this.state.answerConfirm);
		}
		this.setState({
			newconfirm: {
				open: false,
			},
			answerConfirm: false
		});
		
	}
	
	render() {
		debug('render state', this.state);
		
		let title = this.state.current.title || this.state.page;
		
		let isConnectedIcon = this.state.connected === true ? 
			<IconButton onClick={(e)=>{e.preventDefault();this.goTo('status');}} ><FontIcon color={Styles.Colors.green900} className="material-icons"  >airplanemode_active</FontIcon></IconButton>
		:
			<span><IconButton onClick={(e)=>{e.preventDefault();this.goTo('Status');}} ><FontIcon className="material-icons" style={{fontSize:'20px'}} color={Styles.Colors.amber100} hoverColor={Styles.Colors.red900} title="Connection to server lost">airplanemode_inactive</FontIcon></IconButton> <span style={{color:Styles.Colors.amber100,fontSize:'20px'}}></span></span>
		
		let appBarRightIcons = (<span>
			<IconButton onClick={(e)=>{e.preventDefault();this.goTo(snowUI.homepage);}} ><FontIcon className="material-icons"  >home</FontIcon></IconButton>
			
			{isConnectedIcon}
			<span >
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
				  <MenuItem primaryText="Main" value="main"/>
				  <MenuItem primaryText="Main Dark" value="maindark"/>
				  <MenuItem primaryText="Default Light" value="light" />
				  <MenuItem primaryText="Default Dark" value="dark" />
				  <MenuItem primaryText="Bootstrap" value="boot" />
				</IconMenu>
			</span>
			
			<div style={{width:20,height:20,display:'inline-block'}} />
		</span>);
		
		let appbar =<div id="appbar"> <div style={{zIndex:1101, width: '100%', height: '64px' ,position: 'fixed', }} ><AppBar
			title={title}
			onLeftIconButtonTouchTap={this.handleLeftNav} 
			iconElementRight={appBarRightIcons}
			style={{boxShadow: 'none'}}
		/></div><div style={{height:65,width:'100%'}} /></div>;
        
        const Page = routes(this.state.page);
		
        return (<div>
			{appbar}
			
			<Menu2 update={snowUI.alwaysloadtree} docked={true}  searchToggle={this.searchToggle}  goTo={this.goTo} handleLeftNav={this.handleLeftNav} goToAnchor={this.goToAnchor} allInOne={this.allInOne} { ...this.state } />
			
			<div className="clearfix" />
			<div className="simpledocs-container" >
				<Col className="stickyMenu-not" style={{padding:0}} xsHidden={true} smHidden={true} md={3} lg={2} >
					<Col  id="menu" className="no-padding" xsHidden={true} smHidden={true} md={3} lg={2} >
						<Menu2 update={snowUI.alwaysloadtree} docked={false} searchToggle={this.searchToggle} goTo={this.goTo} handleLeftNav={this.handleLeftNav} goToAnchor={this.goToAnchor} allInOne={this.allInOne} { ...this.state } />
					</Col>
				</Col>
				<Col style={{paddingRight:7, paddingLeft:7}} xs={12} sm={12} md={9} lg={10} >
					<Page { ...this.state } assets={this.setAsset} showAlert={this.showAlert} goTo={this.goTo} handleLeftNav={this.handleLeftNav} goToAnchor={this.goToAnchor} allInOne={this.allInOne} />
				</Col>
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
			/>
        </div>);

	}
}

Main.childContextTypes = {
    muiTheme: React.PropTypes.object
};

export default wrapListeners(Main);


