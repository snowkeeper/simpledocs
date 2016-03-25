import React from 'react';
import { isObject, isArray } from 'lodash';
import Debug from 'debug';
import Gab from './common/gab';
import Sockets from './lib/sockets';
import { createHistory, useBasename  } from 'history';
import Path from 'path';
import { myStyles, myStylesLight, myStylesDefault, myStylesDefaultDark } from './common/styles';
import { Styles } from 'material-ui/lib';

let debug = Debug('simpledocs:app:listen');

let history = useBasename(createHistory)({
	basename: simpleDocsUI.path.material || 'simpledocs'
});

var styles = {
	'light': Object.assign(Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme), myStylesLight), simpleDocsUI.materialStyle.light),
	'cream': Object.assign(Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme), myStylesLight), simpleDocsUI.materialStyle.cream),
	'graphite': Object.assign(Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.DarkRawTheme), myStylesLight), simpleDocsUI.materialStyle.graphite),
	'night': Object.assign(Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.DarkRawTheme), myStyles), simpleDocsUI.materialStyle.night),
	'blue': Object.assign(Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme), myStylesDefault), simpleDocsUI.materialStyle.blue),
	'dark': Object.assign(Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.DarkRawTheme), myStylesDefaultDark), simpleDocsUI.materialStyle.dark),
}

export default (Component) => {
	class Listeners extends React.Component {
		constructor(props){
			super(props);
			this.displayName = 'Listeners';
			
			debug('listener',props);
			
			const clean = location.pathname;
			
			let pages = clean.replace(snowUI.path.material, '').split('/');
			let page = pages[1] || snowUI.homepage;
			let anchor = pages[2] || false;
			
			debug('clean page', page, pages, anchor) 
			
			if(page.charAt(0) == '/') {
				page = page.substring(1);
			}
		
			var search = false;
			if(page.search('::') > -1 ) {
				var ss = page.split('::');
				search = ss[1];
			}
			
			this.state = Object.assign({ 
				allinone: (snowUI.allinone === 'only'),
				anchor,
				connected: false,
				contents: false,
				current: {},
				currentTheme: snowUI.materialTheme,
				forceGrab: false,
				history,
				leftNav: false,
				desktop: true,
				desktopNav: true,
				location,
				newalert: {},
				newconfirm: {
					open: false
				},
				page: page || snowUI.homepage,
				query: location.search,
				sockets: Sockets,
				styles,
				search: search || history.search || false,
				theme: styles[snowUI.materialTheme] || styles.blue
				
			}, snowUI.__state);
			
			snowUI.page = this.state.page;
			
			this._update = false;
			this._limiters = {};
			this._mounted = false;
			
			this.newState = this.newState.bind(this);
		}
		
		componentWillReceiveProps(props) {
			const clean = props.page
			if(clean !== this.state.page) {
				this.setState({
					page: clean,
					prev: this.state.page
				});
				this._update = true;
			}
		}
		
		componentDidUpdate() {
			if(this._update) {
				this.onUpdate();
			}
		}
		componentWillMount() {
			
		}
		componentWillUnmount() {
			//debug('remove all socket listeners', Sockets);
			if(Sockets.connected.io) {
				Sockets.io.removeAllListeners();
			}
			Gab.removeAllListeners();
			this._mounted = false;
			snowUI.unstickyMenu();
			snowUI.code.__unmountUI();
		}
		
		componentDidMount() {
			//this.onMount();
			this.initiate();
			this._mounted = true;
			this.onUpdate();
			snowUI.stickyMenu();
			// run user code
			snowUI.code.__mountedUI();
			debug('##  RUN __mountedUI js  ############');
		}

		initiate() {
			debug('INITIATE SOCKET LISTENERS')
			let thisComponent = this;
			
			// listen for error
			Gab.on('error',(data) => {
				this.setState({
					newalert: {
						style: 'danger',
						html: data.error,
						show: true
					}
				});
			});
			
			// receive page from request
			Gab.on('request',(data) => {
				debug('gab got page request data', data);
				thisComponent.pageResults(data);
			});
			
			// update desktop
			Gab.on('resize', (e) => {
				debug('RESIZE #####', e);
				var desktop = true;
				if(e.width < snowUI.breaks.sm.width) {
					desktop = false;
				}
				debug('RESIZE #####', e, desktop);
				this.setState({ desktop, window: e });
			});
			
			if(snowUI.usesockets) {
				Sockets.init(() => {
					debug('set heartbeat');
					// setup a 15 sec heartbeat for socket connection loss
					this.heartbeat = setInterval(() => {
						//debug('heartbeat', Sockets.io.connected);
						if(!Sockets.io.connected && this.state.connected) {
							debug('io connect-error');
							this.setState({
								connected: false,
								newalert: {},
							});
						}
						if(Sockets.io.connected && !this.state.connected) {
							debug('io connect');
							this.setState({
								connected: true,
								newalert: {},
							});
						}
					},2500);
					
					// receive page from server
					Sockets.io.on('page', (data) => {
						debug('got page socket data', data);
						thisComponent.pageResults(data);
					});
					
					// listen for a server error event
					Sockets.io.on('error', (data) => {
						debug('received socket error event', data);
						this.setState({
							newalert: {
								show: true,
								style: 'danger',
								html: data.error
							}
						});
					});
					
					Sockets.io.on('buildPages', (data) => {
						debug('got build data');
						Gab.emit('buildPages', data);
					});
					
				});
			} // end socket init
			
			// window resize emitter
			function _resizing() {
				var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0],x=w.innerWidth||e.clientWidth||g.clientWidth,y=w.innerHeight||e.clientHeight||g.clientHeight;
				
				Gab.emit('resize', {width:x,height:y});
			}
			window.addEventListener('resize', _resizing, true);
			_resizing();
			
		} // end initiate
		
		newState(state, cb) {
			this.setState(state, () => {
				snowUI.__state = this.state;
				if(cb) {
					cb();
				}
			});		
		}
		
		onUpdate() {
			let thisComponent = this;
			this._update = false;
			
			debug('update listeners');	
		} 
		
		pageResults(data) {
			snowUI.watingForPage = false;
			if(!data.success) {
				this.setState({
					page: '404',
					contents: {
						title: 'Page not found',
						slug: '404'
					},
					newalert: {
						style: 'danger',
						html: data.message,
						show: true,
						duration: 1500
					},
					forceGrab: false,
				});
			} else {
				this.setState({ 
						page: data.page.slug || snowUI.page,
						contents: data.page,
						forceGrab: false
					}, 
					function() {
						/* run page js for new content */
						debug('##  RUN __mountedPage() js  ############');
						snowUI.code.__mountedPage();				
					}
				);
				
				if(isObject(data.menu)) {
					snowUI.menu = data.menu;
				}
				if(isArray(data.tree)) {
					snowUI.tree = data.tree;
				}
			}
		}
		
		render() {
			// return React.cloneElement(Component, this.props)
			debug('render listeners state', this.state);
			return  <Component { ...this.props } { ...this.state } appState={this.newState} />;
		}
		
	}

	Listeners.propTypes = {};

	return Listeners
}
