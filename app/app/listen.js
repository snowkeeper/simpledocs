import React from 'react';
import _ from 'lodash';
import Debug from 'debug';
import Gab from './common/gab';
import Sockets from './lib/sockets';
import { createHistory, useBasename  } from 'history';
import Path from 'path';

// add the context menu
// import './common/contextMenu';

let debug = Debug('simpledocs:app:listen');

let history = useBasename(createHistory)({
	basename: snowUI.path.material || 'simpledocs'
});

export default (Component) => {
	class Listeners extends React.Component {
		constructor(props){
			super(props);
			this.displayName = 'Listeners';
			
			debug('listener',props);
			
			const clean = location.pathname;
			
			let pages = clean.replace(snowUI.path.material, '').split('/');
			let page = pages[1];
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
			this.state = { 
				sockets: Sockets,
				forceGrab: false,
				history,
				location,
				anchor,
				search: search || history.search || false,
				page: page || snowUI.homepage,
				connected: false
			}
			
			snowUI.page = this.state.page;
			
			this._update = false;
			this._limiters = {};
						
			this.initiate();
			this.newState = this.newState.bind(this);
		}
		
		newState(state, cb) {
			this.setState(state, cb);		
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
					}
				});
			} else {
				this.setState({ 
					page: data.slug || snowUI.page,
					contents: data.page
				}, function() {
					/* run page js for new content */
					debug('##  RUN page js  ############');
					snowUI.apiCode();
					Prism.highlightAll();
				});
				if(_.isObject(data.menu)) {
					snowUI.menu = data.menu;
				}
				if(_.isArray(data.tree)) {
					snowUI.tree = data.tree;
				}
			}
		}
		
		// add static listeners here
		initiate() {
			debug('INITIATE SOCKERT LISTENERS')
			let thisComponent = this;
			
			// Listen for changes to the current location. The 
			// listener is called once immediately. 
			/*
			function checkPath(a, b) {
				return a.page === b.page;
			}
			let unlisten = history.listenBefore((newLocation) => {
				debug('locationBefore change listener  .. current, new, state ', location, newLocation, this.state)
				if(!checkPath(newLocation.state, this.state)) {
					// new path from a browser action
					debug('location changed... old then new', location, newLocation)
					this.setState(newLocation.state);
				}
			})
			*/
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
			
			Gab.on('request',(data) => {
				debug('got page request data', data);
				thisComponent.pageResults(data);
			});
			
			// sockets
			// initialize
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
				
				// page
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
			});
		} // end initiate	
		
		render() {
			// return React.cloneElement(Component, this.props)
			debug('render listeners state', this.state, this.props);
			return  <Component { ...this.props } { ...this.state } setState={this.newState} />;
		}
		componentWillReceiveProps(props) {
			const clean = props.path
			if(clean !== this.state.route) {
				this.setState({
					route: clean,
					prev: this.state.route
				});
				this._update = true;
			}
		}
		componentDidUpdate() {
			if(this._update) {
				this.onUpdate();
			}
		}
		componentWillUnmount() {
			debug('remove all socket listeners');
			Sockets.removeAllListeners();
		}
		componentDidMount() {
			//this.onMount();
			this.onUpdate();
		}
		// add dynamic listeners here
		onUpdate() {
			let thisComponent = this;
			this._update = false;
			debug('update listeners')
			 		
		} // end onUpdate
	}

	Listeners.propTypes = {};

	return Listeners
}



