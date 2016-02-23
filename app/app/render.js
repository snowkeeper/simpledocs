import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Path from 'path';
import wrapListeners from './listen';
import Debug from 'debug';
import Gab from './common/gab';
import { pickIcon } from './common/utils';
import Snackbar from './common/components/snackbar';
import Menu from './common/components/menu';
import Confirm from './common/components/confirm';
import routes from './routes';
import {FontIcon, IconMenu, IconButton, AppBar, RaisedButton, LeftNav, MenuItem, Styles, Divider, List, ListItem} from 'material-ui/lib';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Alert from './common/alert';

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
	textColor: Styles.Colors.blue100,
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
class Main extends Component {
	constructor(props) {
		// we get props from Listener
		super(props);
		
		debug(props, 'location', location,)
		
		this.styles = {
			main: Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme), myStylesLight),
			main2: Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme), myStyles),
			light: Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme),
			dark: Styles.ThemeManager.getMuiTheme(Styles.DarkRawTheme)
		}
		
		this.state = Object.assign({
			leftNav: false,
			theme: this.styles.main,
			query: location.search,
			location: { ...location },
			current: {},
			newalert: {},
			newconfirm: {
				open: false
			},
		}, props);
		
		debug('fresh state', this.state);
		
		this.handleLeftNav = this.handleLeftNav.bind(this);
		this.LeftNavClose = this.LeftNavClose.bind(this);
		this.goTo = this.goTo.bind(this);
		this.setAsset = this.setAsset.bind(this);
		this.dismissAlert = this.dismissAlert.bind(this);
		this.answerConfirm = this.answerConfirm.bind(this);
		this.showAlert = this.showAlert.bind(this);
		this.switchTheme = this.switchTheme.bind(this);
	}
	
	componentWillReceiveProps(props) {
		// update from listener
		debug('listener props', props);
		this.setState(props);	
	}
	
	switchTheme(theme = 'main') {
		let style = this.styles[theme];
		if(!style) {
			style = this.styles.main;
		}
		this.setState({
			theme: style
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
	
	goTo(state, legacyChild = '', legacyLineup = '') {
		debug('goTo state', state)
		
		if(typeof state === 'string') {
			// accept strings for the page
			state = {
				page: state
			}
		}
		
		let _defaults = {
			leftNav: false,
			current: {},
			location: location,
			query: '',
		}
		
		this.setState(Object.assign(_defaults, state), () => {
			debug('push history', '/' , this.state.page)
			this.state.history.push({
				pathname: Path.join('/' , this.state.page),
				search: this.state.query,
				state: {
					page: this.state.page,
					current: this.state.current
				}
			})
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
		
		let title = this.state.current.name || this.state.page;
		
		let isConnectedIcon = this.state.connected === true ? 
			<span />
		:
			<span><IconButton onClick={(e)=>{e.preventDefault();this.goTo('disconnected');}} ><FontIcon className="material-icons" style={{fontSize:'20px'}} color={Styles.Colors.amber100} hoverColor={Styles.Colors.red900} title="Connection to server lost">cloud_off</FontIcon></IconButton> <span style={{color:Styles.Colors.amber100,fontSize:'20px'}}>Connection Lost </span></span>
		
		let appBarRightIcons = (<span>
			<IconButton onClick={(e)=>{e.preventDefault();this.goTo(snowUI.homepage);}} ><FontIcon className="material-icons" color={Styles.Colors.lightBlue600} hoverColor={Styles.Colors.lightBlue300} >home</FontIcon></IconButton>
			<IconButton onClick={(e)=>{e.preventDefault();this.goTo('main-about');}} ><FontIcon className="material-icons" color={Styles.Colors.lightBlue600} hoverColor={Styles.Colors.lightBlue300} >info_outline</FontIcon></IconButton>
			<IconMenu
				iconButtonElement={<FontIcon className="material-icons" color={Styles.Colors.lightBlue600} hoverColor={Styles.Colors.lightBlue300} >invert_colors</FontIcon>}
				onItemTouchTap={(e, val) => {
					debug(e, val);
					this.switchTheme(val.props.value);
				}}
			>
			  <MenuItem primaryText="Main" value="main"/>
			  <MenuItem primaryText="Main 2" value="main2"/>
			  <MenuItem primaryText="Default Light" value="light" />
			  <MenuItem primaryText="Default Dark" value="dark" />
			</IconMenu>
			{isConnectedIcon}
		</span>);
		
		let appbar = <div><AppBar
			title={title}
			onLeftIconButtonTouchTap={this.handleLeftNav} 
			iconElementRight={appBarRightIcons}
			style={{boxShadow: 'none',position: 'fixed',background: this.state.connected ? '#26282D' : '#FF6F00'}}
		/><div style={{height:65,width:'100%'}} /></div>;
        
       
        const Page = routes(this.state.page);
        const colors = {
			danger: {
				bg: Styles.Colors.deepOrangeA700,
				color: Styles.Colors.grey50
			},
			warning: {
				bg: Styles.Colors.amber800,
				color: Styles.Colors.grey50
			},
			info: {
				bg: Styles.Colors.blue800,
				color: Styles.Colors.grey50
			},
			success: {
				bg: Styles.Colors.limeA700,
				color: Styles.Colors.grey900
			}
		};
        const bodyStyle =  {
			backgroundColor: colors[this.state.newalert.style] ? colors[this.state.newalert.style].bg : colors.info.bg,
			color: colors[this.state.newalert.style] ? colors[this.state.newalert.style].color : colors.info.color,
		};
		
        return (<div>
			{appbar}
			
			<Menu docked={true} goTo={this.goTo} handleLeftNav={this.handleLeftNav} { ...this.state } />
			
			<div className="clearfix" />
			<div className="epg-container" >
				<div >
					<Page { ...this.state } assets={this.setAsset} showAlert={this.showAlert} goTo={this.goTo} handleLeftNav={this.handleLeftNav} />
				</div>
			</div>
			<Confirm 
				html={this.state.newconfirm.html}
				title={this.state.newconfirm.title}
				answer={this.answerConfirm}
				open={this.state.newconfirm.open}
				yesText={this.state.newconfirm.yesText}
				noText={this.state.newconfirm.noText}
			/>
			{this.state.newalert.show ? 
				<Snackbar 
					bodyStyle={bodyStyle}
					setParentState={this.setAsset}
					html={'<div style="color:' +bodyStyle.color+ '">' +this.state.newalert.html+ '</div>'}
					data={this.state.newalert.data}
					component={this.state.newalert.component}
					open={this.state.newalert.show}
					autoHideDuration={this.state.newalert.duration >= 0 ? this.state.newalert.duration : 5000}
					onRequestClose={() => {this.setState({ newalert: { show: false }});}}
				/> 
			: 
				''
			}
        </div>);

	}
}

Main.childContextTypes = {
    muiTheme: React.PropTypes.object
};

export default wrapListeners(Main);


