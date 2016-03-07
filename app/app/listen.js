import React from 'react';
import { isObject, isArray } from 'lodash';
import Debug from 'debug';
import Gab from './common/gab';
import Sockets from './lib/sockets';
import { createHistory, useBasename  } from 'history';
import Path from 'path';

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
			
			this.state = { 
				sockets: Sockets,
				forceGrab: false,
				history,
				location,
				query: location.search,
				
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
		
		componentWillUnmount() {
			debug('remove all socket listeners');
			Sockets.removeAllListeners();
			snowUI.unstickyMenu();
			snowUI.code.__unmountUI();
		}
		
		componentDidMount() {
			//this.onMount();
			this.onUpdate();
			snowUI.stickyMenu();
			// run user code
			snowUI.code.__mountedUI();
			debug('##  RUN __mountedUI js  ############');
		}
		
		onUpdate() {
			let thisComponent = this;
			this._update = false;
			debug('update listeners');	
		} 
		
		initiate() {
			debug('INITIATE SOCKERT LISTENERS')
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
				debug('got page request data', data);
				thisComponent.pageResults(data);
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
				});
			} // end socket init
		} // end initiate
		
		render() {
			// return React.cloneElement(Component, this.props)
			debug('render listeners state', this.state);
			return  <Component { ...this.props } { ...this.state } setState={this.newState} />;
		}
		
	}

	Listeners.propTypes = {};

	return Listeners
}
