System.register('app/lib/socketFunctions.js', ['npm:babel-runtime@5.8.34/core-js/object/assign', 'npm:react@0.14.5', 'github:jspm/nodelibs-path@0.1.0', 'npm:lodash@3.10.1', 'npm:hat@0.0.3', 'app/common/gab.js', 'npm:debug@2.2.0'], function (_export) {
	var _Object$assign, React, path, _, randomNumber, Gab, debugging, debug;

	function options() {

		var exports = {};

		exports.trapResponse = function (socket, callback) {

			var unique = randomNumber();

			socket.once(unique, callback);

			return unique;
		};
		exports.trap = exports.trapResponse;

		exports.headends = function (postal, callback) {
			this.io.emit('headends', {
				postal: postal,
				iden: this.trap(this.io, callback)
			});
		};

		exports.lineupMap = function (headend, callback) {
			headend.iden = this.trap(this.io, callback);
			this.io.emit('lineupMap', headend);
		};

		exports.grabLineupMap = function (headend, callback) {
			headend.iden = this.trap(this.io, callback);
			this.io.emit('grabLineupMap', headend);
		};

		exports.updateChannel = function (channel, update, callback) {
			if (callback) {
				channel.iden = this.trap(this.io, callback);
			} else {
				channel.iden = randomNumber();
			}
			this.io.emit('updateChannel', { channel: channel, update: update });
		};

		exports.updateHeadend = function (headend, update, callback) {
			if (callback) {
				headend.iden = this.trap(this.io, callback);
			} else {
				headend.iden = randomNumber();
			}
			this.io.emit('updateHeadend', { headend: headend, update: update });
		};

		exports.schedules = function (headend, callback) {
			headend.iden = this.trap(this.io, callback);
			this.io.emit('schedules', headend);
		};

		exports.lineups = function (callback) {
			if (!callback) {
				callback = function () {};
			}
			this.io.emit('lineups', {
				iden: this.trap(this.io, callback)
			});
		};

		exports.guide = function (guideData, callback) {
			if (!callback) {
				callback = function () {};
			}
			this.io.emit('guide', _Object$assign(guideData, {
				iden: this.trap(this.io, callback)
			}));
		};

		exports.lineupRemove = function (lineup, callback) {
			// lineup should be a string and the access uri
			this.io.emit('lineupRemove', {
				lineup: lineup,
				iden: this.trap(this.io, callback)
			});
		};

		exports.lineupAdd = function (lineup, callback) {
			lineup.iden = this.trap(this.io, callback);
			this.io.emit('lineupAdd', lineup);
		};

		exports.refreshGuide = function (lineup, callback) {
			var _this = this;

			Gab.reset();
			lineup.iden = this.trap(this.io, function () {});
			this.io.emit('refreshGuide', lineup);
			var readData = function readData(data) {

				debug('guide refresh updates', data);
				callback(data);
				if (data.end) {
					_this.io.removeListener('refreshGuide', readData);
				}
			};

			this.io.on('refreshGuide', readData);
		};

		exports.status = function (callback) {
			debug('get status');
			if (!callback) {
				callback = function () {};
			}
			this.io.emit('status', {
				iden: this.trap(this.io, callback)
			});
		};

		return exports;
	}

	return {
		setters: [function (_npmBabelRuntime5834CoreJsObjectAssign) {
			_Object$assign = _npmBabelRuntime5834CoreJsObjectAssign['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_githubJspmNodelibsPath010) {
			path = _githubJspmNodelibsPath010['default'];
		}, function (_npmLodash3101) {
			_ = _npmLodash3101['default'];
		}, function (_npmHat003) {
			randomNumber = _npmHat003['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_npmDebug220) {
			debugging = _npmDebug220['default'];
		}],
		execute: function () {
			'use strict';

			debug = debugging('epg:app:lib:socketFunctions');

			_export('default', options);
		}
	};
});
System.register('app/lib/sockets.js', ['npm:lodash@3.10.1', 'npm:debug@2.2.0', 'app/lib/socketFunctions.js', 'npm:socket.io-client@1.3.7', 'app/common/gab.js'], function (_export) {
	'use strict';

	var _, debugging, SF, io, Gab, debug, port, host, Sockets;

	return {
		setters: [function (_npmLodash3101) {
			_ = _npmLodash3101['default'];
		}, function (_npmDebug220) {
			debugging = _npmDebug220['default'];
		}, function (_appLibSocketFunctionsJs) {
			SF = _appLibSocketFunctionsJs['default'];
		}, function (_npmSocketIoClient137) {
			io = _npmSocketIoClient137['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}],
		execute: function () {
			debug = debugging('epg:app:lib:sockets');
			port = undefined;
			host = undefined;

			Sockets = function Sockets() {

				// connected
				this.connected = {
					io: false,
					open: false
				};

				this.proxy = 'proxy';
			};

			Sockets.prototype.connectAuth = function (callback) {
				var _this2 = this;

				this.io = io('//' + this.host + ':' + this.port + '/epg', { 'force new connection': true });
				this.auth = this.io;
				debug('reconnect auth', this.auth);

				this.io.on('connect', function (data) {
					debug('auth connected', 'epg');
					_this2.connected.auth = true;
				});
				this.io.on('connect-error', function (err) {
					debug('auth connect-error', err);
					//Gab.emit('error', err)
					// location.href = '/client/signin';
					// router.transitionTo('signin');
				});

				if (_.isFunction(callback)) {
					callback(null, true);
				}
			};

			Sockets.prototype.init = function (opts, callback) {
				var _this3 = this;

				var _opts = {
					host: '@',
					port: '11000'
				};
				if (_.isFunction(opts)) {
					callback = opts;
					opts = _opts;
				}

				if (!_.isObject(opts)) {
					opts = _opts;
				}

				if (typeof window !== 'undefined') {
					this.port = window.socketPort;
					this.host = window.socketHost;
				} else {
					this.port = opts.port;
					this.host = opts.host;
				}

				var _this = this;

				// connection
				this.io = io('//' + this.host + ':' + this.port + '/epg', { 'force new connection': true });

				this.io.on('connect', function (data) {
					debug('io connected', 'epg');
					_this3.connected.io = {
						get: function get() {
							this.io.socket.isConnected();
						}
					};

					if (_.isFunction(callback)) {
						callback(null, true);
					}
				});
				this.io.on('connect-error', function (err) {
					debug('io connect-error', err);
					// Gab.emit('error', err);
					//location.href = '/client/signin';
					if (_.isFunction(callback)) {
						callback(err);
					}
				});

				function updateConsole() {
					debug.apply(undefined, arguments);
				}
			};

			_.extend(Sockets.prototype, SF());

			_export('default', new Sockets());
		}
	};
});
System.register('app/listen.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:babel-runtime@5.8.34/helpers/extends', 'npm:babel-runtime@5.8.34/core-js/object/assign', 'npm:react@0.14.5', 'npm:lodash@3.10.1', 'npm:debug@2.2.0', 'app/common/gab.js', 'app/lib/sockets.js', 'npm:history@1.17.0', 'github:jspm/nodelibs-path@0.1.0'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, _extends, _Object$assign, React, _, Debug, Gab, Sockets, createHistory, useBasename, Path, debug, history;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmBabelRuntime5834HelpersExtends) {
			_extends = _npmBabelRuntime5834HelpersExtends['default'];
		}, function (_npmBabelRuntime5834CoreJsObjectAssign) {
			_Object$assign = _npmBabelRuntime5834CoreJsObjectAssign['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmLodash3101) {
			_ = _npmLodash3101['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_appLibSocketsJs) {
			Sockets = _appLibSocketsJs['default'];
		}, function (_npmHistory1170) {
			createHistory = _npmHistory1170.createHistory;
			useBasename = _npmHistory1170.useBasename;
		}, function (_githubJspmNodelibsPath010) {
			Path = _githubJspmNodelibsPath010['default'];
		}],
		execute: function () {

			// add the context menu
			// import './common/contextMenu';

			'use strict';

			debug = Debug('epg:app:listen');
			history = useBasename(createHistory)({
				basename: '/epg'
			});

			_export('default', function (Component) {
				var Listeners = (function (_React$Component) {
					_inherits(Listeners, _React$Component);

					function Listeners(props) {
						_classCallCheck(this, Listeners);

						_get(Object.getPrototypeOf(Listeners.prototype), 'constructor', this).call(this, props);
						this.displayName = 'Listeners';

						debug('listener', props);

						var clean = location.pathname;

						var paths = location.pathname.split('/').filter(function (v) {
							return v !== '';
						});

						this.state = {
							route: clean,
							prev: clean,
							paths: paths,
							sockets: Sockets,
							history: history,
							location: location,
							page: paths[1] || 'home',
							child: paths[3] || '',
							lineup: paths[2] || '',
							guideRefresh: {
								download: false,
								who: []
							}
						};
						this._update = false;
						this._limiters = {};
						Gab.guideUpdates = [];

						this.getLineups = this.getLineups.bind(this);
						this.lineupListener = this.lineupListener.bind(this);

						this.initiate();
					}

					// add static listeners here

					_createClass(Listeners, [{
						key: 'initiate',
						value: function initiate() {
							var _this = this;

							debug('INITIATE SOCKERT LISTENERS');
							var thisComponent = this;

							// Listen for changes to the current location. The
							// listener is called once immediately.
							function checkPath(a, b) {
								return Path.join(a.page, a.child, a.lineup) === Path.join(b.page, b.child, b.lineup);
							}
							var unlisten = history.listenBefore(function (newLocation) {
								debug('locationBefore change listener  .. current, new, state ', location, newLocation, _this.state);
								if (!checkPath(newLocation.state, _this.state)) {
									// new path from a browser action
									debug('location changed... old then new', location, newLocation);
									_this.setState(newLocation.state);
								}
							});

							// listen for error
							Gab.on('error', function (data) {
								_this.setState({
									newalert: {
										style: 'danger',
										html: data.error,
										show: true
									}
								});
							});

							// sockets
							// initialize
							Sockets.init(function () {
								debug('set heartbeat');
								// setup a 15 sec heartbeat for socket connection loss
								_this.heartbeat = setInterval(function () {
									//debug('heartbeat', this.io.connected);
									if (Sockets.io.connected === false) {
										debug('io connect-error');
										_this.setState({
											faked: 'for a render',
											newalert: {}
										});
									}
								}, 15000);

								// status report
								debug('get status');
								Sockets.status();
								Sockets.io.on('status', function (data) {
									debug('got status data', data);
									if (data.err) {
										_this.setState({
											newalert: {
												style: 'danger',
												html: data.err.message,
												show: true,
												duration: 1500
											}
										});
									} else {
										_this.setState({ status: data });
									}
								});

								// grab current lineups
								_this.getLineups();

								// listen for a server error event
								Sockets.io.on('error', function (data) {
									debug('received socket error event', data);
									_this.setState({
										newalert: {
											show: true,
											style: 'danger',
											html: data.error.message
										}
									});
								});
								// listen for a server error event
								Sockets.io.on('globalUpdate', function (data) {
									debug('received socket global update event', data);
									if (data.stderr) data.message = data.stderr;
									_this.setState({
										newalert: {
											show: true,
											style: data.style,
											html: data.message,
											duration: 0
										}
									});
								});

								//guide refresh updata data
								Sockets.io.on('guideRefreshDownload', function (data) {
									debug('received guide download state event', data);
									var guideRefresh = _this.state.guideRefresh;
									if (data.lineup) {
										if (!data.downloading) {
											_.pull(guideRefresh.who, data.lineup);
										} else {
											guideRefresh.who.push(data.lineup);
										}
									}
									guideRefresh.download = guideRefresh.who.length === 0 && !data.downloading ? false : true;
									_this.setState({ guideRefresh: guideRefresh });
								});
								Sockets.io.on('guideRefreshUpdate', function (data) {
									//debug('received guide refresh update event', data);
									Gab.guideUpdates.push(data.message);
								});

								//listen for new lineups
								Sockets.io.on('lineups', _this.lineupListener);

								// updatre events
								Sockets.io.on('updateChannel', function (data) {
									debug('updateChannel on event', data);
									Gab.emit('updateChannel', data);
								});

								//listen for schedule updates
								Sockets.io.on('schedules', _this.scheduleListener);
							});
						}
						// end initiate	

					}, {
						key: 'render',
						value: function render() {
							// return React.cloneElement(Component, this.props)
							debug('render listeners state', this.state, this.props);
							return React.createElement(Component, _extends({}, this.props, this.state));
						}
					}, {
						key: 'componentWillReceiveProps',
						value: function componentWillReceiveProps(props) {
							var clean = props.path;
							if (clean !== this.state.route) {
								this.setState({
									route: clean,
									prev: this.state.route
								});
								this._update = true;
							}
						}
					}, {
						key: 'componentDidUpdate',
						value: function componentDidUpdate() {
							if (this._update) {
								this.onUpdate();
							}
						}
					}, {
						key: 'componentWillUnmount',
						value: function componentWillUnmount() {
							debug('remove all socket listeners');
							Sockets.removeAllListeners();
						}
					}, {
						key: 'componentDidMount',
						value: function componentDidMount() {
							//this.onMount();
							this.onUpdate();
						}

						// add dynamic listeners here
					}, {
						key: 'onUpdate',
						value: function onUpdate() {
							var thisComponent = this;
							this._update = false;
							debug('update listeners');
						}
						// end onUpdate

					}, {
						key: 'schedulesListener',
						value: function schedulesListener(data) {
							debug('got lineups data', data.lineups);
							var headends = {};
							if (data.error) {
								this.setState({
									newalert: {
										style: 'danger',
										html: data.error.message,
										show: true
									}
								});
							} else {
								this.setState({
									newalert: {
										style: 'success',
										html: data,
										show: true
									}
								});
							}
						}
					}, {
						key: 'lineupListener',
						value: function lineupListener(data) {
							var _this2 = this;

							debug('got lineups data', data.lineups);
							var headends = {};
							if (data.error) {
								this.setState({
									newalert: {
										style: 'danger',
										html: data.error.message,
										show: true
									}
								});
							} else {
								if (Array.isArray(data.lineups) && data.lineups.length > 0) {
									data.lineups.forEach(function (head, k) {
										headends[head.lineup] = _Object$assign({ index: k }, head);
									});
									debug('save lineups data', headends, data);
									this.setState({
										headends: headends,
										lineups: data
									});
								} else if (data.lineups.length === 0) {
									debug('no lineups data', data);
									this.setState({
										newalert: {
											style: 'danger',
											component: React.createElement(
												'div',
												null,
												'You do not have any lineups... ',
												React.createElement(
													'a',
													{ href: '#', onClick: function (e) {
															e.preventDefault();_this2.goTo('add');
														} },
													' Add One'
												)
											),
											show: true
										},
										lineups: {
											lineups: []
										},
										headends: {}
									});
								} else {
									debug('failed lineups data', data);
									this.setState({
										newalert: {
											style: 'danger',
											component: React.createElement(
												'div',
												null,
												'Failed to get lineups... ',
												React.createElement(
													'a',
													{ href: '#', onClick: this.getLineups },
													' Retry'
												)
											),
											show: true
										}
									});
								}
							}
						}
					}, {
						key: 'getLineups',
						value: function getLineups(e) {
							if (e && typeof e.preventDefault === 'function') {
								e.preventDefault();
							}
							Sockets.lineups(this.lineupListener);
						}
					}]);

					return Listeners;
				})(React.Component);

				Listeners.propTypes = {};

				return Listeners;
			});
		}
	};
});
System.register('app/common/components/snackbar.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:react@0.14.5', 'npm:material-ui@0.14.0/lib/snackbar', 'npm:material-ui@0.14.0/lib/text-field', 'npm:material-ui@0.14.0/lib/raised-button', 'npm:debug@2.2.0'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Snackbar, TextField, RaisedButton, debugging, debug, SnackbarExampleSimple;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmMaterialUi0140LibSnackbar) {
			Snackbar = _npmMaterialUi0140LibSnackbar['default'];
		}, function (_npmMaterialUi0140LibTextField) {
			TextField = _npmMaterialUi0140LibTextField['default'];
		}, function (_npmMaterialUi0140LibRaisedButton) {
			RaisedButton = _npmMaterialUi0140LibRaisedButton['default'];
		}, function (_npmDebug220) {
			debugging = _npmDebug220['default'];
		}],
		execute: function () {
			'use strict';

			debug = debugging('epg:app:common:components:snackbar');

			SnackbarExampleSimple = (function (_React$Component) {
				_inherits(SnackbarExampleSimple, _React$Component);

				function SnackbarExampleSimple(props) {
					_classCallCheck(this, SnackbarExampleSimple);

					_get(Object.getPrototypeOf(SnackbarExampleSimple.prototype), 'constructor', this).call(this, props);
					this.state = {
						autoHideDuration: 10,
						message: 'Error Event',
						open: false
					};

					// binders
					this.handleChangeDuration = this.handleChangeDuration.bind(this);
					this.handleRequestClose = this.handleRequestClose.bind(this);
				}

				_createClass(SnackbarExampleSimple, [{
					key: 'handleTouchTap',
					value: function handleTouchTap() {
						this.setState({
							open: true
						});
					}
				}, {
					key: 'handleActionTouchTap',
					value: function handleActionTouchTap() {
						alert('We removed the event from your calendar.');
					}
				}, {
					key: 'handleChangeDuration',
					value: function handleChangeDuration(event) {
						var value = event.target.value;
						this.setState({
							autoHideDuration: value.length > 0 ? parseInt(value) : 0
						});
					}
				}, {
					key: 'handleRequestClose',
					value: function handleRequestClose() {
						this.setState({
							open: false
						});
					}
				}, {
					key: 'renderError',
					value: function renderError(data) {
						try {
							var myerror = JSON.stringify(data.error, null, 4);
						} catch (e) {
							var myerror = 'I encountered an error. Please check the console for the error object';
							debug(data);
						}
						var senderror = React.createElement(
							'pre',
							null,
							myerror
						);
						return senderror;
					}
				}, {
					key: 'renderSuccess',
					value: function renderSuccess(data) {
						return data;
					}
				}, {
					key: 'renderHTML',
					value: function renderHTML() {
						debug(this.props);
						if (this.props.data) {
							if (this.props.data.error) {
								return this.renderError(this.props.data);
							}
							return this.renderSuccess(this.props.data);
						} else if (this.props.component) {
							return this.props.component;
						} else {
							return React.createElement('div', { dangerouslySetInnerHTML: { __html: this.props.html } });
						}
					}
				}, {
					key: 'render',
					value: function render() {
						var _this = this;

						var message = this.renderHTML();

						return React.createElement(
							'div',
							null,
							React.createElement(Snackbar, {
								bodyStyle: this.props.bodyStyle || {},
								open: this.props.open,
								message: message,
								action: this.props.action,
								autoHideDuration: this.props.autoHideDuration,
								onActionTouchTap: function () {
									alert('touchtap');
								},
								onRequestClose: function () {
									_this.props.setParentState({
										newalert: {
											show: false
										}
									});
								}
							})
						);
					}
				}]);

				return SnackbarExampleSimple;
			})(React.Component);

			SnackbarExampleSimple.propTypes = {
				open: React.PropTypes.bool,
				action: React.PropTypes.string,
				autoHideDuration: React.PropTypes.number,
				setParentState: React.PropTypes.func
			};
			SnackbarExampleSimple.defaultProps = {
				open: false,
				html: 'Hi!',
				action: 'undo',
				autoHideDuration: 0
			};

			_export('default', SnackbarExampleSimple);
		}
	};
});
System.register('app/pages/component/any.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:react@0.14.5', 'npm:debug@2.2.0', 'app/common/gab.js'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Debug, Gab, debug, Any;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}],
		execute: function () {
			'use strict';

			debug = Debug('epg:app:pages:component:any');

			Any = (function (_React$Component) {
				_inherits(Any, _React$Component);

				function Any(props) {
					_classCallCheck(this, Any);

					_get(Object.getPrototypeOf(Any.prototype), 'constructor', this).call(this, props);
					this.displayName = 'Any Component';
					this.state = {
						html: props.children || props.html || React.createElement('span', null)
					};
					this._update = false;
					debug('Any');
				}

				_createClass(Any, [{
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						debug('receiveProps');
						this.setState({ html: props.children || props.html });
						this._update = true;
					}
				}, {
					key: 'componentDidUpdate',
					value: function componentDidUpdate() {
						debug('didUpdate');
					}
				}, {
					key: 'componentDidMount',
					value: function componentDidMount() {
						debug('did mount');
					}
				}, {
					key: 'render',
					value: function render() {
						debug('any', this.state);
						if ('function' === typeof this.state.html) {

							// render a component
							return React.createElement(
								'div',
								null,
								' ',
								React.createElement(this.state.html, null),
								' '
							);
						} else if ('object' === typeof this.state.html) {

							// this is a rendered componenet
							return React.createElement(
								'div',
								null,
								' ',
								this.state.html,
								' '
							);
						} else {
							debug('any leftover', this.state);
							// add anything else
							return React.createElement('div', { dangerouslySetInnerHTML: { __html: this.state.html } });
						}
					}
				}]);

				return Any;
			})(React.Component);

			_export('default', Any);
		}
	};
});
System.register('app/pages/home.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:react@0.14.5', 'npm:debug@2.2.0', 'app/common/gab.js', 'app/common/utils.js', 'npm:material-ui@0.14.0/lib/card/card', 'npm:material-ui@0.14.0/lib/card/card-actions', 'npm:material-ui@0.14.0/lib/card/card-header', 'npm:material-ui@0.14.0/lib/card/card-media', 'npm:material-ui@0.14.0/lib/card/card-title', 'npm:material-ui@0.14.0/lib', 'npm:material-ui@0.14.0/lib/menus/menu', 'npm:material-ui@0.14.0/lib/menus/menu-item', 'npm:material-ui@0.14.0/lib/divider', 'npm:material-ui@0.14.0/lib/card/card-text', 'npm:react-bootstrap@0.28.1', 'app/assets/icons.js'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Debug, Gab, pickIcon, Card, CardActions, CardHeader, CardMedia, CardTitle, Styles, List, ListItem, FlatButton, FontIcon, Menu, MenuItem, Divider, CardText, Col, Icons, debug, Home;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_appCommonUtilsJs) {
			pickIcon = _appCommonUtilsJs.pickIcon;
		}, function (_npmMaterialUi0140LibCardCard) {
			Card = _npmMaterialUi0140LibCardCard['default'];
		}, function (_npmMaterialUi0140LibCardCardActions) {
			CardActions = _npmMaterialUi0140LibCardCardActions['default'];
		}, function (_npmMaterialUi0140LibCardCardHeader) {
			CardHeader = _npmMaterialUi0140LibCardCardHeader['default'];
		}, function (_npmMaterialUi0140LibCardCardMedia) {
			CardMedia = _npmMaterialUi0140LibCardCardMedia['default'];
		}, function (_npmMaterialUi0140LibCardCardTitle) {
			CardTitle = _npmMaterialUi0140LibCardCardTitle['default'];
		}, function (_npmMaterialUi0140Lib) {
			Styles = _npmMaterialUi0140Lib.Styles;
			List = _npmMaterialUi0140Lib.List;
			ListItem = _npmMaterialUi0140Lib.ListItem;
			FlatButton = _npmMaterialUi0140Lib.FlatButton;
			FontIcon = _npmMaterialUi0140Lib.FontIcon;
		}, function (_npmMaterialUi0140LibMenusMenu) {
			Menu = _npmMaterialUi0140LibMenusMenu['default'];
		}, function (_npmMaterialUi0140LibMenusMenuItem) {
			MenuItem = _npmMaterialUi0140LibMenusMenuItem['default'];
		}, function (_npmMaterialUi0140LibDivider) {
			Divider = _npmMaterialUi0140LibDivider['default'];
		}, function (_npmMaterialUi0140LibCardCardText) {
			CardText = _npmMaterialUi0140LibCardCardText['default'];
		}, function (_npmReactBootstrap0281) {
			Col = _npmReactBootstrap0281.Col;
		}, function (_appAssetsIconsJs) {
			Icons = _appAssetsIconsJs['default'];
		}],
		execute: function () {
			'use strict';

			debug = Debug('epg:app:pages:home');

			Home = (function (_React$Component) {
				_inherits(Home, _React$Component);

				function Home(props) {
					_classCallCheck(this, Home);

					_get(Object.getPrototypeOf(Home.prototype), 'constructor', this).call(this, props);
					this.displayName = 'Home Component';
					this.state = {};
					this._update = false;
				}

				_createClass(Home, [{
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						debug('receiveProps');
						this._update = true;
					}
				}, {
					key: 'componentDidUpdate',
					value: function componentDidUpdate() {
						debug('didUpdate');
					}
				}, {
					key: 'componentDidMount',
					value: function componentDidMount() {
						debug('did mount');
					}
				}, {
					key: 'render',
					value: function render() {
						var _this = this;

						debug('home render', this.state, this.props);

						var mylineups = this.props.lineups.lineups.map(function (v) {
							return React.createElement(
								'span',
								{ key: v.lineup + 'home' },
								React.createElement(ListItem, {
									key: v.lineup + 'home',
									style: { fontSize: '16px' },
									primaryText: v.name,
									secondaryText: v.lineup,
									leftIcon: React.createElement(
										FontIcon,
										{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.greenA200 },
										pickIcon(v.transport)
									),
									onTouchTap: function (e) {
										e.preventDefault(e);
										_this.props.goTo({
											current: v,
											page: 'lineup',
											child: '',
											lineup: v.lineup,
											newalert: {
												show: true,
												html: 'Manage ' + v.name,
												style: 'info',
												duration: 2500
											}
										});
									}

								})
							);
						});

						var content = React.createElement(
							'div',
							null,
							React.createElement(
								List,
								null,
								React.createElement(ListItem, { primaryText: 'Add Lineup', secondaryText: this.props.status.account.maxLineups - this.props.status.lineups.length + " of " + this.props.status.account.maxLineups + " lineups available.", leftIcon: React.createElement(
										FontIcon,
										{ className: 'material-icons', color: Styles.Colors.lightBlue500, hoverColor: Styles.Colors.greenA200 },
										'plus_one'
									), onTouchTap: function (e) {
										e.preventDefault(e);
										_this.props.goTo({
											page: 'add-lineup',
											child: ''

										});
									} }),
								React.createElement(ListItem, { onTouchTap: function () {
										_this.goTo('home');
									}, primaryText: 'Settings', secondaryText: 'misc options', leftIcon: React.createElement(
										FontIcon,
										{ className: 'material-icons', color: Styles.Colors.lightBlue500, hoverColor: Styles.Colors.greenA200 },
										'settings_applications'
									) })
							),
							React.createElement(
								List,
								{ subheader: 'My Lineups' },
								mylineups
							)
						);

						return React.createElement(
							Col,
							{ xs: 12, md: 8, mdOffset: 2, lg: 6, lgOffset: 3 },
							React.createElement(
								Card,
								null,
								React.createElement(
									CardText,
									null,
									content
								)
							)
						);
					}
				}]);

				return Home;
			})(React.Component);

			_export('default', Home);
		}
	};
});
System.register('app/pages/settings/index.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:react@0.14.5', 'npm:debug@2.2.0', 'app/common/gab.js', 'app/common/utils.js', 'app/routes.js', 'npm:material-ui@0.14.0/lib/card', 'npm:material-ui@0.14.0/lib', 'app/common/alert.js', 'npm:react-select@1.0.0-beta8', 'npm:react-bootstrap@0.28.1', 'app/assets/icons.js', 'npm:lodash@3.10.1'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Debug, Gab, pickIcon, Button, Routes, CardText, Card, CardActions, CardHeader, CardMedia, CardTitle, FontIcon, Toggle, SelectField, MenuItem, Styles, Divider, FlatButton, TextField, GridList, GridTile, List, ListItem, Alert, Select, Col, Icons, sortBy, debug, Settings;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_appCommonUtilsJs) {
			pickIcon = _appCommonUtilsJs.pickIcon;
			Button = _appCommonUtilsJs.Button;
		}, function (_appRoutesJs) {
			Routes = _appRoutesJs['default'];
		}, function (_npmMaterialUi0140LibCard) {
			CardText = _npmMaterialUi0140LibCard.CardText;
			Card = _npmMaterialUi0140LibCard.Card;
			CardActions = _npmMaterialUi0140LibCard.CardActions;
			CardHeader = _npmMaterialUi0140LibCard.CardHeader;
			CardMedia = _npmMaterialUi0140LibCard.CardMedia;
			CardTitle = _npmMaterialUi0140LibCard.CardTitle;
		}, function (_npmMaterialUi0140Lib) {
			FontIcon = _npmMaterialUi0140Lib.FontIcon;
			Toggle = _npmMaterialUi0140Lib.Toggle;
			SelectField = _npmMaterialUi0140Lib.SelectField;
			MenuItem = _npmMaterialUi0140Lib.MenuItem;
			Styles = _npmMaterialUi0140Lib.Styles;
			Divider = _npmMaterialUi0140Lib.Divider;
			FlatButton = _npmMaterialUi0140Lib.FlatButton;
			TextField = _npmMaterialUi0140Lib.TextField;
			GridList = _npmMaterialUi0140Lib.GridList;
			GridTile = _npmMaterialUi0140Lib.GridTile;
			List = _npmMaterialUi0140Lib.List;
			ListItem = _npmMaterialUi0140Lib.ListItem;
		}, function (_appCommonAlertJs) {
			Alert = _appCommonAlertJs['default'];
		}, function (_npmReactSelect100Beta8) {
			Select = _npmReactSelect100Beta8['default'];
		}, function (_npmReactBootstrap0281) {
			Col = _npmReactBootstrap0281.Col;
		}, function (_appAssetsIconsJs) {
			Icons = _appAssetsIconsJs['default'];
		}, function (_npmLodash3101) {
			sortBy = _npmLodash3101.sortBy;
		}],
		execute: function () {
			'use strict';

			debug = Debug('epg:app:pages:settings:index');

			Settings = (function (_React$Component) {
				_inherits(Settings, _React$Component);

				function Settings(props) {
					_classCallCheck(this, Settings);

					_get(Object.getPrototypeOf(Settings.prototype), 'constructor', this).call(this, props);
					this.displayName = 'Settings Component';
					this.state = {
						html: props.children || props.html || React.createElement('span', null),
						durationError: 2000,
						durationSuccess: 1500,
						parent: props,
						step: 1,
						headends: [],
						headendsMap: {},
						lineups: {},
						lineupMap: {
							channel: {},
							id: {}
						}
					};
					this._update = false;

					this.submit = this.submit.bind(this);
					this.headends = this.headends.bind(this);
				}

				_createClass(Settings, [{
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						//debug('receiveProps');
						this.setState({ html: props.children || props.html });
						this._update = true;
					}
				}, {
					key: 'componentDidUpdate',
					value: function componentDidUpdate() {
						//debug('didUpdate');
					}
				}, {
					key: 'componentDidMount',
					value: function componentDidMount() {
						//debug('did mount');

					}
				}, {
					key: 'dismissAlert',
					value: function dismissAlert() {
						this.setState({
							newalert: {
								show: false
							}
						});
					}
				}, {
					key: 'headends',
					value: function headends() {
						var _this = this;

						debug('do headends', postal, this.state, 'props', this.props);
						var postal = this.state.postal;

						this.props.sockets.headends(postal, function (data) {
							debug('got headends data', data);
							if (data.error) {
								_this.props.assets({
									newalert: {
										style: 'danger',
										html: data.error.message,
										show: true
									}
								});
								_this.refs.manage.error();
							} else {
								(function () {
									_this.refs.manage.success();
									var headendsMap = {};
									data.forEach(function (v) {
										return headendsMap[v.uri] = v;
									});
									_this.setState({
										headends: sortBy(data, 'name'),
										headendsMap: headendsMap,
										step: 2
									});
									_this.props.assets({
										newalert: {
											html: 'Select a lineup to add',
											show: true,
											style: 'info',
											duration: 2000
										}
									});
								})();
							}
						});
					}
				}, {
					key: 'lineupAdd',
					value: function lineupAdd(uri) {
						this.props.lineupAdd(uri);
					}
				}, {
					key: 'lineupRemove',
					value: function lineupRemove(lineup) {
						this.props.lineupRemove(lineup);
					}
				}, {
					key: 'submit',
					value: function submit() {
						debug('submit', this.state, this.props);

						if (this.refs.manage) this.refs.manage.loading();

						if (this.state.step === 1) {
							this.headends();
						} else {
							this.props.assets({
								newalert: {
									style: 'danger',
									html: 'error',
									show: true
								}
							});
						}
					}
				}, {
					key: 'render',
					value: function render() {
						var _this2 = this;

						debug('render', this.state, this.props);

						var typeOptions = this.state.headends.map(function (v) {
							if (v) {
								return React.createElement(
									'span',
									null,
									React.createElement(ListItem, {
										key: v.uri + 'add',
										style: { fontSize: '14px' },
										primaryText: v.name,
										title: 'Add ' + v.name + ' to your account',
										secondaryText: v.lineup,
										leftIcon: React.createElement(
											FontIcon,
											{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.greenA200 },
											pickIcon(v.transport)
										),
										onTouchTap: function (e) {
											e.preventDefault();
											_this2.lineupAdd(v);
										}
									}),
									React.createElement(Divider, { inset: false })
								);
							}
						}).filter(function (n) {
							return true;
						});

						var type = React.createElement(
							List,
							null,
							typeOptions
						);

						var btnText = undefined;
						var btnText2 = false;
						switch (this.state.step) {
							case 1:
								btnText = 'Search';
								break;

							default:
								btnText = 'Submit';
								break;
						}

						var thebutton = this.state.step === 8 ? React.createElement(Col, { xs: 6 }) : React.createElement(
							Col,
							{ xs: 6 },
							React.createElement(
								'div',
								{ className: 'pull-left' },
								React.createElement(
									Button,
									{ className: " ", ref: 'manage', onClick: this.submit, durationSuccess: this.state.durationSuccess, durationError: this.state.durationError },
									'Search'
								)
							)
						);

						var buttons = React.createElement(
							'div',
							{ className: 'no-gutter', style: { marginTop: 20, marginBottom: 20 } },
							thebutton,
							React.createElement(
								Col,
								{ xs: 6 },
								React.createElement(
									'div',
									{ className: 'pull-right' },
									React.createElement(
										Button,
										{ ref: 'reset', className: "", durationSuccess: 2000, style: { color: '#666' }, href: '#', onClick: function (e) {
												e.preventDefault();
												if (_this2.refs.reset) _this2.refs.reset.success();
												if (_this2.refs.manage) _this2.refs.manage.loading();
												_this2.setState({
													step: 1,
													headends: [],
													lineups: {},
													lineupMap: {
														channel: {},
														id: {}
													},
													type: '',
													postal: ''
												});
												_this2.props.assets({
													newalert: {
														show: true,
														html: 'Form Reset',
														style: 'success',
														duration: 2000
													}
												}, function () {
													if (_this2.refs.manage) _this2.refs.manage.enable;
												});
											} },
										'Reset'
									)
								)
							),
							React.createElement('div', { className: 'clearfix' })
						);

						return React.createElement(
							Col,
							{ xs: 12, md: 8, mdOffset: 2, lg: 6, lgOffset: 3 },
							React.createElement(
								Card,
								null,
								React.createElement(CardTitle, {
									title: 'Add a new lineup',
									subtitle: this.props.status.account.maxLineups - this.props.status.lineups.length + " of " + this.props.status.account.maxLineups + " lineups available.",
									titleColor: Styles.Colors.blue400,
									subtitleColor: Styles.Colors.grey500
								}),
								React.createElement(
									CardText,
									null,
									React.createElement(TextField, {
										type: 'number',
										hintText: '30126',
										floatingLabelText: 'Enter a Postal code',
										ref: 'postal',
										onFocus: function () {
											_this2.refs.manage.enable();
										},
										onChange: function (e) {
											_this2.setState({ postal: e.target.value });
										},
										value: this.state.postal
										//onBlur={this.headends}
									}),
									React.createElement('div', { style: { marginTop: 20 } }),
									buttons,
									React.createElement('div', { className: 'clearfix' }),
									this.state.step > 1 ? type : ''
								)
							)
						);
					}
				}]);

				return Settings;
			})(React.Component);

			_export('default', Settings);
		}
	};
});
System.register('app/pages/tables/channels.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:babel-runtime@5.8.34/helpers/extends', 'npm:react@0.14.5', 'npm:fixed-data-table@0.6.0', 'app/common/utils.js', 'npm:lodash@3.10.1', 'npm:object-property-natural-sort@0.0.4', 'npm:debug@2.2.0'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, _extends, React, Table, Column, Cell, DateCell, ImageCell, LinkCell, TextCell, ChannelCheckbox, sortByOrder, naturalSort, Debug, debug, ChannelsTable;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmBabelRuntime5834HelpersExtends) {
			_extends = _npmBabelRuntime5834HelpersExtends['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmFixedDataTable060) {
			Table = _npmFixedDataTable060.Table;
			Column = _npmFixedDataTable060.Column;
			Cell = _npmFixedDataTable060.Cell;
		}, function (_appCommonUtilsJs) {
			DateCell = _appCommonUtilsJs.DateCell;
			ImageCell = _appCommonUtilsJs.ImageCell;
			LinkCell = _appCommonUtilsJs.LinkCell;
			TextCell = _appCommonUtilsJs.TextCell;
			ChannelCheckbox = _appCommonUtilsJs.ChannelCheckbox;
		}, function (_npmLodash3101) {
			sortByOrder = _npmLodash3101.sortByOrder;
		}, function (_npmObjectPropertyNaturalSort004) {
			naturalSort = _npmObjectPropertyNaturalSort004['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}],
		execute: function () {
			'use strict';

			debug = Debug('epg:app:pages:tables:channels');

			ChannelsTable = (function (_React$Component) {
				_inherits(ChannelsTable, _React$Component);

				function ChannelsTable(props) {
					_classCallCheck(this, ChannelsTable);

					_get(Object.getPrototypeOf(ChannelsTable.prototype), 'constructor', this).call(this, props);
					if (props.list) props.list.sort(naturalSort('channel'));
					this.state = {
						list: props.list,
						sortPath: 'channel',
						order: 'asc'
					};

					this.reverseOrder = this.reverseOrder.bind(this);
					this.sortHD = this.sortHD.bind(this);
				}

				_createClass(ChannelsTable, [{
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						debug('got props', this.state, props);
						if (props.list && this.state.sortPath !== 'hd') {
							this.reverseOrder(false, props.list, this.state.order);
							//this.setState(props);
						} else {
								this.sortHD(false, props.list, this.state.order);
							}
					}
				}, {
					key: 'reverseOrder',
					value: function reverseOrder(e, list, order) {

						var path = undefined;

						if (e) {
							e.preventDefault();
							path = e.target.dataset.path;
						} else {
							path = this.state.sortPath;
						}
						debug('sort', Array.isArray(list), order, path);
						if (!Array.isArray(list)) {
							list = this.state.list;
						}

						order = typeof order === 'string' ? order : this.state.order === 'asc' ? 'desc' : 'asc';

						var sorted = list.sort(naturalSort(path));

						if (order === 'desc') sorted.reverse();

						debug('sort channels', sorted.map(function (e) {
							return e[path];
						}));
						this.setState({
							list: sorted,
							order: order,
							sortPath: path
						});
					}
				}, {
					key: 'sortHD',
					value: function sortHD(e, list, order) {

						if (e) {
							e.preventDefault();
						}

						if (!Array.isArray(list)) {
							list = this.state.list;
						}

						order = typeof order === 'string' ? order : this.state.order === 'asc' ? 'desc' : 'asc';

						this.setState({
							list: sortByOrder(list, [function (n) {
								var search = n.name ? n.name : n.callsign ? n.callsign : 'sd';
								var searchedForHD = search.toLowerCase().search('hd') > -1;
								var returnValue = searchedForHD ? 'HD' : search.toLowerCase().search('dt') > -1 ? 'HD' : 'SD';
								return returnValue;
							}, 'channel'], order),
							order: order,
							sortPath: 'hd'
						});
					}
				}, {
					key: 'render',
					value: function render() {
						debug('render channels table', 'props', this.props);
						var channels = this.state.list;

						return React.createElement(
							'div',
							{ style: { margin: '0 auto' } },
							React.createElement(
								Table,
								_extends({
									rowHeight: 40,
									headerHeight: 40,
									rowsCount: channels.length,
									width: document.body.offsetWidth - 30,
									maxHeight: document.body.offsetHeight - 260
								}, this.props),
								React.createElement(Column, {
									cell: React.createElement(ImageCell, { style: { textAlign: 'center' }, data: channels, col: 'logo', source: 'channels' }),
									fixed: true,
									width: 50,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										React.createElement(
											'a',
											{ href: '#', 'data-path': 'active', onClick: this.reverseOrder },
											'Active'
										)
									),
									cell: React.createElement(ChannelCheckbox, _extends({ data: channels, source: 'Channel', col: 'active' }, this.props)),
									fixed: true,
									width: 75,
									style: { textAlign: 'center' },
									allowCellsRecycling: true,
									columnKey: 'active'
								}),
								React.createElement(Column, {
									columnKey: 'Channel',
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										React.createElement(
											'a',
											{ href: '#', 'data-path': 'channel', onClick: this.reverseOrder },
											'Channel'
										)
									),

									cell: React.createElement(TextCell, { style: { textAlign: 'center' }, data: channels, source: 'channels', col: 'channel' }),
									fixed: true,
									width: 100,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									columnKey: 'hd',
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										React.createElement(
											'a',
											{ href: '#', onClick: this.sortHD },
											'HD/SD'
										)
									),

									cell: React.createElement(TextCell, { style: { textAlign: 'center' }, data: channels, source: 'channels', col: 'hd' }),
									fixed: true,
									width: 100,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										React.createElement(
											'a',
											{ href: '#', 'data-path': 'name', onClick: this.reverseOrder },
											'Station'
										)
									),
									cell: React.createElement(TextCell, { style: { textAlign: 'center' }, data: channels, source: 'channels', col: 'name' }),
									fixed: false,
									width: 200,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										React.createElement(
											'a',
											{ href: '#', 'data-path': 'callsign', onClick: this.reverseOrder },
											'Callsign'
										)
									),
									cell: React.createElement(TextCell, { style: { textAlign: 'center' }, data: channels, source: 'channels', col: 'callsign' }),
									fixed: false,
									width: 150,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										React.createElement(
											'a',
											{ href: '#', 'data-path': 'affiliate', onClick: this.reverseOrder },
											'Affiliate'
										)
									),
									cell: React.createElement(TextCell, { style: { textAlign: 'center' }, data: channels, source: 'channels', col: 'affiliate' }),
									fixed: false,
									width: 100,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										React.createElement(
											'a',
											{ href: '#', 'data-path': 'uhfVhf', onClick: this.reverseOrder },
											'uhfVhf'
										)
									),
									cell: React.createElement(TextCell, { style: { textAlign: 'center' }, data: channels, source: 'channels', col: 'uhfVhf' }),
									width: 75,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										React.createElement(
											'a',
											{ href: '#', 'data-path': 'atscMajor', onClick: this.reverseOrder },
											'atscMajor'
										)
									),
									cell: React.createElement(TextCell, { style: { textAlign: 'center' }, data: channels, source: 'channels', col: 'atscMajor' }),
									width: 100,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										React.createElement(
											'a',
											{ href: '#', 'data-path': 'atscMinor', onClick: this.reverseOrder },
											'atscMinor'
										)
									),
									cell: React.createElement(TextCell, { style: { textAlign: 'center' }, data: channels, source: 'channels', col: 'atscMinor' }),
									width: 100,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										React.createElement(
											'a',
											{ href: '#', 'data-path': 'providerCallsign', onClick: this.reverseOrder },
											'providerCallsign'
										)
									),
									cell: React.createElement(TextCell, { style: { textAlign: 'center' }, data: channels, source: 'channels', col: 'providerCallsign' }),
									width: 100,
									allowCellsRecycling: true
								})
							)
						);
					}
				}]);

				return ChannelsTable;
			})(React.Component);

			_export('default', ChannelsTable);
		}
	};
});
System.register('app/pages/tables/stations.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:babel-runtime@5.8.34/helpers/define-property', 'npm:babel-runtime@5.8.34/helpers/extends', 'npm:react@0.14.5', 'npm:fixed-data-table@0.6.0', 'app/common/utils.js', 'npm:material-ui@0.14.0/lib', 'npm:lodash@3.10.1', 'npm:object-property-natural-sort@0.0.4', 'npm:debug@2.2.0'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, _defineProperty, _extends, React, Table, Column, Cell, DateCell, ImageCell, LinkCell, TextCell, Checkbox, FontIcon, Styles, sortByOrder, naturalSort, Debug, debug, StationsTable;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmBabelRuntime5834HelpersDefineProperty) {
			_defineProperty = _npmBabelRuntime5834HelpersDefineProperty['default'];
		}, function (_npmBabelRuntime5834HelpersExtends) {
			_extends = _npmBabelRuntime5834HelpersExtends['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmFixedDataTable060) {
			Table = _npmFixedDataTable060.Table;
			Column = _npmFixedDataTable060.Column;
			Cell = _npmFixedDataTable060.Cell;
		}, function (_appCommonUtilsJs) {
			DateCell = _appCommonUtilsJs.DateCell;
			ImageCell = _appCommonUtilsJs.ImageCell;
			LinkCell = _appCommonUtilsJs.LinkCell;
			TextCell = _appCommonUtilsJs.TextCell;
		}, function (_npmMaterialUi0140Lib) {
			Checkbox = _npmMaterialUi0140Lib.Checkbox;
			FontIcon = _npmMaterialUi0140Lib.FontIcon;
			Styles = _npmMaterialUi0140Lib.Styles;
		}, function (_npmLodash3101) {
			sortByOrder = _npmLodash3101.sortByOrder;
		}, function (_npmObjectPropertyNaturalSort004) {
			naturalSort = _npmObjectPropertyNaturalSort004['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}],
		execute: function () {
			'use strict';

			debug = Debug('epg:app:pages:tables:stations');

			StationsTable = (function (_React$Component) {
				_inherits(StationsTable, _React$Component);

				function StationsTable(props) {
					_classCallCheck(this, StationsTable);

					_get(Object.getPrototypeOf(StationsTable.prototype), 'constructor', this).call(this, props);
					if (props.list) props.list.sort(naturalSort('name'));
					this.state = {
						list: props.list,
						order: 'asc',
						sortPath: 'name'
					};

					this.reverseOrder = this.reverseOrder.bind(this);
					this.sortHD = this.sortHD.bind(this);
				}

				_createClass(StationsTable, [{
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						debug('got props', this.state, props);
						if (props.list && this.state.sortPath !== 'hd') {
							this.reverseOrder(false, props.list, this.state.order);
							//this.setState(props);
						} else {
								this.sortHD(false, props.list, this.state.order);
							}
					}
				}, {
					key: 'reverseOrder',
					value: function reverseOrder(e, list, order) {

						var path = undefined;
						if (e) {
							e.preventDefault();
							path = e.target.dataset.path;
						} else {
							path = this.state.sortPath;
						}
						debug('sort', Array.isArray(list), order, path);
						if (!Array.isArray(list)) {
							list = this.state.list;
						}

						order = typeof order === 'string' ? order : this.state.order === 'asc' ? 'desc' : 'asc';

						var sorted = list.sort(naturalSort(path));

						if (order === 'desc') sorted.reverse();

						debug('sort channels', sorted.map(function (e) {
							return e[path];
						}));

						this.setState({
							list: sorted,
							order: order,
							sortPath: path
						});
					}
				}, {
					key: 'sortHD',
					value: function sortHD(e, list, order) {

						if (e) {
							e.preventDefault();
						}

						if (!Array.isArray(list)) {
							list = this.state.list;
						}

						order = typeof order === 'string' ? order : this.state.order === 'asc' ? 'desc' : 'asc';

						this.setState({
							list: sortByOrder(list, [function (n) {
								var search = n.name ? n.name : n.callsign ? n.callsign : 'sd';
								var searchedForHD = search.toLowerCase().search('hd') > -1;
								var returnValue = searchedForHD ? 'HD' : search.toLowerCase().search('dt') > -1 ? 'HD' : 'SD';
								return returnValue;
							}, 'name'], order),
							order: order,
							sortPath: 'hd'
						});
					}
				}, {
					key: 'render',
					value: function render() {
						var _this = this;

						var stations = this.state.list;

						return React.createElement(
							'div',
							{ style: { margin: '0 auto' } },
							React.createElement(
								Table,
								_extends({
									rowHeight: 40,
									headerHeight: 40,
									rowsCount: stations.length,
									width: document.body.offsetWidth - 30,
									maxHeight: document.body.offsetHeight - 260
								}, this.props),
								React.createElement(Column, {
									cell: React.createElement(ImageCell, { data: stations, col: 'logo', source: 'channels' }),
									fixed: true,
									width: 50,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									header: React.createElement(
										Cell,
										null,
										'Active'
									),
									cell: function (_ref) {
										var rowIndex = _ref.rowIndex;

										var data = stations;
										var col = 'active';

										var first = _this.props.lineupMap.stations[data[rowIndex].stationID].channel;

										var channel = _this.props.lineupMap.channels[first];

										var val = !!channel[col];

										return React.createElement(
											Cell,
											{ style: { textAlign: 'center' } },
											React.createElement(Checkbox, {
												name: col + rowIndex,
												value: "" + val,
												defaultChecked: val,
												checkedIcon: React.createElement(
													FontIcon,
													{ className: 'material-icons', color: Styles.Colors.green500 },
													'visibility'
												),
												unCheckedIcon: React.createElement(
													FontIcon,
													{ className: 'material-icons', color: Styles.Colors.grey300 },
													'visibility'
												),
												onCheck: function (e) {
													debug('update ', data[rowIndex]);
													_this.props.sockets['updateChannel'](channel, _defineProperty({}, col, !val));
												}
											})
										);
									},
									fixed: true,
									width: 75,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										React.createElement(
											'a',
											{ href: '#', 'data-path': 'name', onClick: this.reverseOrder },
											'Name'
										)
									),
									cell: React.createElement(TextCell, { style: { textAlign: 'center' }, data: stations, source: 'stations', col: 'name' }),
									fixed: true,
									width: 200,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									columnKey: 'Channel',
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										'Channel'
									),

									cell: function (_ref2) {
										var rowIndex = _ref2.rowIndex;

										var data = stations;

										var station = _this.props.lineupMap.stations[data[rowIndex].stationID];

										return React.createElement(
											Cell,
											{ style: { textAlign: 'center' } },
											station.channel
										);
									},
									fixed: true,
									width: 100,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									columnKey: 'Callsign',
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										React.createElement(
											'a',
											{ href: '#', 'data-path': 'callsign', onClick: this.reverseOrder },
											'Callsign'
										)
									),
									cell: React.createElement(TextCell, { style: { textAlign: 'center' }, data: stations, source: 'stations', col: 'callsign' }),
									fixed: false,
									width: 100,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									columnKey: 'hd',
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										React.createElement(
											'a',
											{ href: '#', onClick: this.sortHD },
											'HD/SD'
										)
									),

									cell: React.createElement(TextCell, { style: { textAlign: 'center' }, data: stations, source: 'channels', col: 'hd' }),
									fixed: true,
									width: 100,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										React.createElement(
											'a',
											{ href: '#', 'data-path': 'affiliate', onClick: this.reverseOrder },
											'Affiliate'
										)
									),
									cell: React.createElement(TextCell, { style: { textAlign: 'center' }, data: stations, source: 'stations', col: 'affiliate' }),
									fixed: false,
									width: 100,
									allowCellsRecycling: true
								}),
								React.createElement(Column, {
									header: React.createElement(
										Cell,
										{ style: { textAlign: 'center' } },
										React.createElement(
											'a',
											{ href: '#', 'data-path': 'stationID', onClick: this.reverseOrder },
											'Station ID'
										)
									),
									cell: React.createElement(TextCell, { style: { textAlign: 'center' }, data: stations, source: 'stations', col: 'stationID' }),
									fixed: false,
									width: 100,
									allowCellsRecycling: true
								})
							)
						);
					}
				}]);

				return StationsTable;
			})(React.Component);

			_export('default', StationsTable);
		}
	};
});
System.register('app/common/components/confirm.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:react@0.14.5', 'npm:material-ui@0.14.0/lib/dialog', 'npm:material-ui@0.14.0/lib/flat-button', 'npm:material-ui@0.14.0/lib/raised-button', 'npm:debug@2.2.0'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Dialog, FlatButton, RaisedButton, debugging, debug, Modal;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmMaterialUi0140LibDialog) {
			Dialog = _npmMaterialUi0140LibDialog['default'];
		}, function (_npmMaterialUi0140LibFlatButton) {
			FlatButton = _npmMaterialUi0140LibFlatButton['default'];
		}, function (_npmMaterialUi0140LibRaisedButton) {
			RaisedButton = _npmMaterialUi0140LibRaisedButton['default'];
		}, function (_npmDebug220) {
			debugging = _npmDebug220['default'];
		}],
		execute: function () {
			'use strict';

			debug = debugging('epg:app:common:components:confirm');

			Modal = (function (_React$Component) {
				_inherits(Modal, _React$Component);

				function Modal(props) {
					_classCallCheck(this, Modal);

					_get(Object.getPrototypeOf(Modal.prototype), 'constructor', this).call(this, props);

					this.handleYes = this.handleYes.bind(this);
					this.handleNo = this.handleNo.bind(this);
				}

				_createClass(Modal, [{
					key: 'handleYes',
					value: function handleYes() {
						if (typeof this.props.answer == 'function') {
							this.props.answer(true);
						}
					}
				}, {
					key: 'handleNo',
					value: function handleNo() {
						if (typeof this.props.answer == 'function') {
							this.props.answer(false);
						}
					}
				}, {
					key: 'render',
					value: function render() {
						var actions = [React.createElement(FlatButton, {
							label: this.props.yesText,
							primary: true,
							onTouchTap: this.handleYes
						}), React.createElement(FlatButton, {
							label: this.props.noText,
							secondary: true,
							onTouchTap: this.handleNo
						})];

						return React.createElement(
							'div',
							null,
							React.createElement(
								Dialog,
								{
									title: this.props.title,
									actions: actions,
									modal: true,
									open: this.props.open
								},
								React.createElement('div', { dangerouslySetInnerHTML: { __html: this.props.html } })
							)
						);
					}
				}]);

				return Modal;
			})(React.Component);

			_export('default', Modal);

			Modal.defaultProps = {
				yesText: 'Delete',
				noText: 'Cancel',
				open: false,
				html: 'Placeholder Text',
				title: 'Confirm'
			};
		}
	};
});
System.register('app/assets/icons.js', ['npm:react-fontawesome@0.3.3'], function (_export) {
  'use strict';

  var FontAwesome;
  return {
    setters: [function (_npmReactFontawesome033) {
      FontAwesome = _npmReactFontawesome033['default'];
    }],
    execute: function () {
      _export('default', FontAwesome);
    }
  };
});
System.register('app/pages/settings/lineups.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:babel-runtime@5.8.34/helpers/extends', 'npm:babel-runtime@5.8.34/core-js/object/assign', 'npm:react@0.14.5', 'npm:debug@2.2.0', 'app/pages/tables/channels.js', 'app/pages/tables/stations.js', 'app/common/components/confirm.js', 'app/common/gab.js', 'app/routes.js', 'npm:material-ui@0.14.0/lib', 'npm:react-swipeable-views@0.3.5', 'npm:react-bootstrap@0.28.1', 'app/common/utils.js', 'app/assets/icons.js', 'npm:lodash@3.10.1', 'npm:react-tap-event-plugin@0.2.1', 'github:jspm/nodelibs-path@0.1.0'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, _extends, _Object$assign, React, Debug, ChannelsTable, StationsTable, Confirm, Gab, Routes, Card, CardActions, CardHeader, CardMedia, CardTitle, CardText, Divider, FontIcon, FlatButton, IconButton, IconMenu, List, ListItem, MenuItem, Styles, Tabs, Tab, TextField, SwipeableViews, Col, Button, setKey, Icons, defaultsDeep, injectTapEventPlugin, Path, debug, styles, pageIndex, paths, Lineup;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmBabelRuntime5834HelpersExtends) {
			_extends = _npmBabelRuntime5834HelpersExtends['default'];
		}, function (_npmBabelRuntime5834CoreJsObjectAssign) {
			_Object$assign = _npmBabelRuntime5834CoreJsObjectAssign['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appPagesTablesChannelsJs) {
			ChannelsTable = _appPagesTablesChannelsJs['default'];
		}, function (_appPagesTablesStationsJs) {
			StationsTable = _appPagesTablesStationsJs['default'];
		}, function (_appCommonComponentsConfirmJs) {
			Confirm = _appCommonComponentsConfirmJs['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_appRoutesJs) {
			Routes = _appRoutesJs['default'];
		}, function (_npmMaterialUi0140Lib) {
			Card = _npmMaterialUi0140Lib.Card;
			CardActions = _npmMaterialUi0140Lib.CardActions;
			CardHeader = _npmMaterialUi0140Lib.CardHeader;
			CardMedia = _npmMaterialUi0140Lib.CardMedia;
			CardTitle = _npmMaterialUi0140Lib.CardTitle;
			CardText = _npmMaterialUi0140Lib.CardText;
			Divider = _npmMaterialUi0140Lib.Divider;
			FontIcon = _npmMaterialUi0140Lib.FontIcon;
			FlatButton = _npmMaterialUi0140Lib.FlatButton;
			IconButton = _npmMaterialUi0140Lib.IconButton;
			IconMenu = _npmMaterialUi0140Lib.IconMenu;
			List = _npmMaterialUi0140Lib.List;
			ListItem = _npmMaterialUi0140Lib.ListItem;
			MenuItem = _npmMaterialUi0140Lib.MenuItem;
			Styles = _npmMaterialUi0140Lib.Styles;
			Tabs = _npmMaterialUi0140Lib.Tabs;
			Tab = _npmMaterialUi0140Lib.Tab;
			TextField = _npmMaterialUi0140Lib.TextField;
		}, function (_npmReactSwipeableViews035) {
			SwipeableViews = _npmReactSwipeableViews035['default'];
		}, function (_npmReactBootstrap0281) {
			Col = _npmReactBootstrap0281.Col;
		}, function (_appCommonUtilsJs) {
			Button = _appCommonUtilsJs.Button;
			setKey = _appCommonUtilsJs.setChannelKey;
		}, function (_appAssetsIconsJs) {
			Icons = _appAssetsIconsJs['default'];
		}, function (_npmLodash3101) {
			defaultsDeep = _npmLodash3101.defaultsDeep;
		}, function (_npmReactTapEventPlugin021) {
			injectTapEventPlugin = _npmReactTapEventPlugin021['default'];
		}, function (_githubJspmNodelibsPath010) {
			Path = _githubJspmNodelibsPath010['default'];
		}],
		execute: function () {
			'use strict';

			injectTapEventPlugin();
			debug = Debug('epg:app:pages:lineups');
			styles = {
				headline: {
					fontSize: 24,
					paddingTop: 16,
					marginBottom: 12,
					fontWeight: 400
				},
				slide: {
					padding: 10
				}
			};
			pageIndex = {
				'headend': 0,
				'channels': 1,
				'stations': 1,
				'guide-settings': 2,
				0: 'headend',
				1: 'channels',
				2: 'guide-settings'
			};
			paths = location.pathname.split('/').filter(function (v) {
				return v !== '';
			});

			Lineup = (function (_React$Component) {
				_inherits(Lineup, _React$Component);

				function Lineup(props) {
					_classCallCheck(this, Lineup);

					_get(Object.getPrototypeOf(Lineup.prototype), 'constructor', this).call(this, props);
					this.displayName = 'Lineup Component';
					this.state = {
						parent: props,
						slideIndex: pageIndex[paths[3]] ? pageIndex[paths[3]] : 0,
						pageIndex: pageIndex,
						ready: false,
						durationError: 2000,
						durationSuccess: 1500,
						lineups: {
							channels: [],
							stations: []
						},
						lineupMap: {},
						stationsTable: paths[3] === 'stations' ? true : false,
						newconfirm: {
							open: false
						}
					};
					this._update = false;

					this.changePage = this.changePage.bind(this);
					this.handleChange = this.handleChange.bind(this);
					this.lineupMap = this.lineupMap.bind(this);
					this._listenUpdateChannel = this._listenUpdateChannel.bind(this);
					this.reverseChannels = this.reverseChannels.bind(this);
					this.answerConfirm = this.answerConfirm.bind(this);
					this.lineupMapRefresh = this.lineupMapRefresh.bind(this);

					Gab.on('updateChannel', this._listenUpdateChannel);
				}

				_createClass(Lineup, [{
					key: 'changePage',
					value: function changePage(e) {
						var _this = this;

						e.preventDefault();
						this.setState({
							stationsTable: !this.state.stationsTable
						}, function (e) {
							return _this.pushHistory(_this.state.stationsTable ? 'stations' : 'channels');
						});
					}
				}, {
					key: 'pushHistory',
					value: function pushHistory(page) {
						debug('push history', '/', Path.join('/', this.props.page, this.props.child, this.props.lineup, page));
						this.props.history.push({
							pathname: Path.join('/', this.props.page, this.props.child, this.props.lineup, page),
							search: this.props.query,
							state: {
								page: this.props.page,
								current: this.props.current,
								child: this.props.child,
								lineup: this.props.lineup,
								headend: page
							}
						});
					}
				}, {
					key: 'handleChange',
					value: function handleChange(value) {
						var _this2 = this;

						this.setState({
							slideIndex: value
						}, function () {
							return _this2.pushHistory(pageIndex[value]);
						});
					}
				}, {
					key: 'componentDidMount',
					value: function componentDidMount() {
						debug('mount grab lineupMap');
						this.lineupMap();
					}
				}, {
					key: '_listenUpdateChannel',
					value: function _listenUpdateChannel(data) {
						/**
       * we get back the same data that was sent if successful
       * we also get an index and source property
       * 
       * */

						debug('update channel listen', data, 'test', data.source && data.index >= 0 && typeof data.data === 'object');
						if (data.source && typeof data.data === 'object' && typeof data.data.channel === 'object') {
							debug('do we have a data source?', this.state.lineupMap[data.source].length, data.source, this.state.lineupMap);

							if (this.state.lineupMap.channels[data.data.channel.channel]) {

								// copy the item so we do not mutate the state object
								var copy = _Object$assign({}, this.state.lineupMap);

								debug('copy done... cheking', copy[data.source][data.data.channel.channel].id === data.data.channel.id, copy[data.source][data.data.channel.channel].id, data.data.channel.id);

								if (typeof copy[data.source][data.data.channel.channel] === 'object' && copy[data.source][data.data.channel.channel].id === data.data.channel.id) {

									// merge the updated data in
									copy[data.source][data.data.channel.channel] = _Object$assign(copy[data.source][data.data.channel.channel], data.data.update);

									debug('save data from channel update listener', copy[data.source][data.data.channel.channel], data.data);

									this.setState({ lineupMap: copy });
								} else {
									debug('no good data from channel update listener', copy, data);
								}
							}
						}
					}
				}, {
					key: 'componentWillUnmount',
					value: function componentWillUnmount() {
						debug('remove listener _listenUpdateChannel from Gab');
						Gab.removeListener('updateChannel', this._listenUpdateChannel);
					}
				}, {
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						//debug('receiveProps');

						if (props.lineup !== this.state.parent.lineup) {
							this.setState({
								parent: props,
								lineups: {
									channels: [],
									stations: []
								},
								lineupMap: {},
								stationsTable: false
							}, this.lineupMap);
						}

						this._update = false;
					}
				}, {
					key: 'componentDidUpdate',
					value: function componentDidUpdate() {
						//debug('didUpdate');
						this._update = false;
					}
				}, {
					key: 'componentDidMount',
					value: function componentDidMount() {
						//debug('did mount');
						debug('mount grab lineupMap');
						this.lineupMap();
					}
				}, {
					key: 'reverseChannels',
					value: function reverseChannels(e) {

						e.preventDefault();
						debug('reverse');
						this.setState({
							lineups: {
								channels: this.state.lineups.channels.reverse(),
								stations: this.state.lineups.stations
							}
						});
					}
				}, {
					key: 'getSchedules',
					value: function getSchedules() {
						var _this3 = this;

						if (this.refs['schedules']) {
							this.refs['schedules'].loading();
						}

						var headend = this.props.headends[this.props.lineup];

						if (typeof headend !== 'object') {
							return debug('linepMap no headends', headend);
						}

						debug('schedule headend', headend);

						this.props.sockets.refreshGuide(headend, function (data) {
							debug('got schedules data', data);
							if (_this3.refs['schedules']) {
								_this3.refs['schedules'].success();
							}
							if (data === 'success') {
								debug('update started');
								return;
							}
							_this3.props.assets({
								newalert: data
							});
						});
					}
				}, {
					key: 'lineupMapRefresh',
					value: function lineupMapRefresh(e) {
						e.preventDefault();
						var headend = this.props.headends[this.props.lineup];
						this.setState({
							newconfirm: {
								open: true,
								html: 'Are you sure you want to refresh ' + headend.name + '?  You will lose your saved channels!',
								yesText: 'Get Channels'
							},
							answerConfirm: true,
							answerMethod: 'lineupMap'
						});
					}
				}, {
					key: 'answerConfirm',
					value: function answerConfirm(success) {
						if (success) {
							this[this.state.answerMethod](this.state.answerConfirm);
						}
						this.setState({
							newconfirm: {
								open: false
							},
							answerConfirm: false
						});
					}
				}, {
					key: 'lineupMap',
					value: function lineupMap() {
						var _this4 = this;

						var refresh = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
						var button = arguments.length <= 1 || arguments[1] === undefined ? 'submit' : arguments[1];

						debug('getLineup');

						if (this.refs[button]) {
							this.refs[button].loading();
						}

						var headend = this.props.headends[this.props.lineup];

						if (typeof headend !== 'object') {
							debug('linepMap no headends', headend);
							return this.props.sockets.io.once('status', function (data) {
								debug('headends once');
								_this4.lineupMap();
							});
						}
						this.props.showAlert('warning', 'Channels will be available soon!', 'html');
						headend.refresh = refresh;

						debug('lineupMap headend', headend);

						this.props.sockets.lineupMap(headend, function (data) {
							debug('got getLineup data', data);
							if (data.error) {
								_this4.props.showAlert('danger', data.error.message, 'html');
								if (_this4.refs[button]) {
									_this4.refs[button].error();
								}
							} else {
								(function () {
									if (_this4.refs[button]) {
										_this4.refs[button].success();
									}
									var lineupMap = {
										channels: {},
										stations: {},
										allStations: {}
									};

									if (Array.isArray(data.channels)) {
										data.channels.forEach(function (v, k) {
											var corc = setKey(v);
											if (corc && !lineupMap.channels[corc]) {
												lineupMap.channels[corc] = v;
												lineupMap.channels[corc].index = k;
												lineupMap.stations[v.stationID] = v;
												lineupMap.stations[v.stationID].index = k;
											}
										});
										data.stations = data.stations.filter(function (v) {
											var corc = setKey(lineupMap.stations[v.stationID]);
											lineupMap.allStations[v.stationID] = v;
											if (corc && lineupMap.channels[corc]) {
												//delete v.id;
												defaultsDeep(lineupMap.channels[corc], v);
												return true;
											}
											return false;
										});
									}

									debug('___________MAP-----------', data, lineupMap);

									_this4.setState({
										lineups: data,
										lineupMap: lineupMap
									});

									_this4.props.showAlert('info', 'Lineup Channels and Stations available', 'html');
								})();
							}
						});
					}
				}, {
					key: 'render',
					value: function render() {
						var _this5 = this;

						debug('render lineup', this.state, 'props', this.props);

						var headend = this.props.headends[this.props.lineup];

						var table = undefined;
						var GR = [];
						var updates = React.createElement(
							'span',
							null,
							React.createElement(
								'b',
								null,
								'Guide Update Log will  list here'
							)
						);

						if (!this.props.headends) {
							return React.createElement(
								Col,
								{ xs: 12, style: { marginBottom: 20 } },
								React.createElement(
									Card,
									null,
									React.createElement(CardTitle, {
										title: "Loading",
										subtitle: "Waiting for all assets to load",
										titleColor: Styles.Colors.blue400,
										subtitleColor: Styles.Colors.grey500
									}),
									React.createElement(
										CardText,
										{ style: { padding: 0, height: 300, textAlign: 'center', paddingTop: 20 } },
										React.createElement(
											'div',
											{ className: '', style: { padding: 0, height: 100, paddingTop: 0, paddingBottom: 30 } },
											React.createElement(
												'div',
												{ className: 'Spinner Spinner--default Spinner--lg' },
												React.createElement('span', { className: 'Spinner_dot Spinner_dot--first' }),
												React.createElement('span', { className: 'Spinner_dot Spinner_dot--second' }),
												React.createElement('span', { className: 'Spinner_dot Spinner_dot--third' })
											)
										),
										React.createElement(Divider, { style: { marginBottom: 30 } }),
										React.createElement(
											'p',
											null,
											'Data is loading or you have selected a headend that is no longer valid.  '
										),
										React.createElement(
											'p',
											null,
											'Please wait a moment and if you need to ',
											React.createElement(
												'a',
												{ href: '#', onClick: function (e) {
														e.preventDefault();_this5.props.goTo('add-lineup');
													} },
												' add a new headend'
											)
										)
									)
								)
							);
						} else if (!headend) {
							return React.createElement(
								Col,
								{ xs: 12, style: { marginBottom: 20 } },
								React.createElement(
									Card,
									null,
									React.createElement(CardTitle, {
										title: "404",
										subtitle: "The requested headend could not be found",
										titleColor: Styles.Colors.red600,
										subtitleColor: Styles.Colors.grey500
									}),
									React.createElement(
										CardText,
										{ style: { padding: 0, height: 300, textAlign: 'center', paddingTop: 20 } },
										React.createElement(
											'div',
											{ className: '', style: { color: Styles.Colors.grey600, fontSize: '76px', padding: 0, height: 100, paddingTop: 0, paddingBottom: 30 } },
											React.createElement(
												FontIcon,
												{ style: { fontSize: '128px' }, className: 'material-icons', color: Styles.Colors.amber600, hoverColor: Styles.Colors.amber500 },
												'error'
											)
										),
										React.createElement('div', { style: { marginBottom: 40 } }),
										React.createElement(
											'p',
											null,
											React.createElement(
												'a',
												{ href: '#', onClick: function (e) {
														e.preventDefault();_this5.props.goTo('add-lineup');
													} },
												'Add a new headend'
											)
										)
									)
								)
							);
						} else {
							table = !this.state.stationsTable && this.state.slideIndex === 1 ? React.createElement(ChannelsTable, _extends({ list: this.state.lineups.channels, sockets: this.props.sockets }, this.state)) : this.state.stationsTable && this.state.slideIndex === 1 ? React.createElement(StationsTable, _extends({ list: this.state.lineups.channels, sockets: this.props.sockets }, this.state)) : React.createElement('span', null);

							if (this.state.slideIndex === 2) {
								if (Gab.guideUpdates.length > 0) {
									GR = Gab.guideUpdates.map(function (v, k) {
										return React.createElement(
											'p',
											{ key: k + 'sdffret' },
											v
										);
									});
								}
								updates = GR.length === 0 ? React.createElement(
									'span',
									null,
									React.createElement(
										'b',
										null,
										'Guide Update Log will  list here'
									)
								) : React.createElement(
									'div',
									{ style: { maxHeight: document.body.offsetHeight / 2, overflow: 'auto', padding: 10 } },
									React.createElement(
										'span',
										null,
										React.createElement(
											'b',
											null,
											'Guide Refresh Log'
										)
									),
									GR
								);
							}

							return React.createElement(
								Col,
								{ xs: 12, className: 'no-padding' },
								React.createElement(
									Tabs,
									{
										onChange: this.handleChange,
										value: this.state.slideIndex
									},
									React.createElement(Tab, { label: 'Headend', value: 0 }),
									React.createElement(Tab, { label: React.createElement(
											'div',
											{ style: { position: 'relative' } },
											'Channels',
											React.createElement(
												'div',
												{ style: { display: this.state.slideIndex === 1 ? 'block' : 'none', position: 'absolute', top: '-12', right: '-15' } },
												React.createElement(
													IconMenu,
													{
														iconButtonElement: React.createElement(
															IconButton,
															null,
															React.createElement(
																FontIcon,
																{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.greenA200 },
																'cached'
															)
														)
													},
													React.createElement(MenuItem, {
														leftIcon: React.createElement(
															FontIcon,
															{ className: 'material-icons', color: Styles.Colors.blue100 },
															'archive'
														),
														primaryText: 'Get Channels from Cache',
														onClick: function (e) {
															return _this5.lineupMap(false, "cached");
														},
														durationSuccess: this.state.durationSuccess,
														durationError: this.state.durationError
													}),
													React.createElement(Divider, null),
													React.createElement(MenuItem, {
														rightIcon: React.createElement(
															FontIcon,
															{ className: 'material-icons', color: Styles.Colors.blue100 },
															'cloud_download'
														),
														primaryText: 'Force grab of Channels from Agent',
														onClick: this.lineupMapRefresh,
														durationSuccess: this.state.durationSuccess,
														durationError: this.state.durationError
													})
												)
											)
										), value: 1 }),
									React.createElement(Tab, { label: 'Guide', value: 2 })
								),
								React.createElement(
									SwipeableViews,
									{
										index: this.state.slideIndex,
										onChangeIndex: this.handleChange
									},
									React.createElement(
										'div',
										{ style: styles.slide, className: 'no-gutter' },
										React.createElement(
											Col,
											{ xs: 12, style: { padding: 5 } },
											React.createElement(
												Card,
												null,
												React.createElement(CardTitle, {
													title: React.createElement(TextField, {
														hintText: 'change the headend name',
														value: headend.name,
														style: { width: '100%' },
														underlineStyle: { borderColor: 'transparent' },
														inputStyle: { fontWeight: 'bold', fontSize: '32px', color: Styles.Colors.blue500 },
														onChange: function (e) {
															headend.name = e.target.value;
															_this5.props.sockets.updateHeadend(headend, { name: e.target.value });
															_this5.props.lineups.lineups[headend.index].name = e.target.value;
															_this5.props.assets({});
														}
													}),
													subtitle: "headend information",
													titleColor: Styles.Colors.blue400,
													subtitleColor: Styles.Colors.grey500
												}),
												React.createElement(
													CardText,
													{ style: {} },
													React.createElement(
														List,
														null,
														React.createElement(ListItem, {
															primaryText: headend.name,
															disabled: true,
															insetChildren: true
														}),
														React.createElement(Divider, { inset: true }),
														React.createElement(ListItem, { primaryText: headend.lineup, disabled: true, insetChildren: true }),
														React.createElement(Divider, { inset: true }),
														React.createElement(ListItem, { primaryText: headend.location, disabled: true, insetChildren: true }),
														React.createElement(Divider, { inset: true }),
														React.createElement(ListItem, { primaryText: headend.transport, disabled: true, insetChildren: true }),
														React.createElement(Divider, { inset: true }),
														React.createElement(ListItem, { primaryText: headend.uri, disabled: true, insetChildren: true }),
														React.createElement(Divider, { inset: false }),
														React.createElement(ListItem, { secondaryText: "confirm and remove " + headend.lineup + " from account", primaryText: 'Delete', style: { color: Styles.Colors.deepOrange800 }, leftIcon: React.createElement(Icons, { name: 'trash', style: { color: Styles.Colors.deepOrange800 } }), onClick: function () {
																_this5.props.lineupRemove(headend);
															} }),
														React.createElement(Divider, { inset: false })
													),
													React.createElement('div', { className: 'clearfix', style: { margin: '10px 0' } })
												)
											)
										),
										React.createElement('div', { className: 'clearfix', style: { marginBottom: 30 } })
									),
									React.createElement(
										'div',
										{ id: 'channels', className: 'no-gutter', style: styles.slide },
										React.createElement(
											Card,
											null,
											React.createElement(CardTitle, {
												title: this.state.stationsTable ? 'Stations' : "Channels",
												subtitle: React.createElement(
													'div',
													null,
													headend.name,
													' - ',
													React.createElement(
														'a',
														{ href: '#', onClick: this.changePage },
														'Switch to ',
														this.state.stationsTable ? 'Channels' : 'Stations'
													)
												),
												titleColor: Styles.Colors.blue400,
												subtitleColor: Styles.Colors.grey500
											}),
											React.createElement(
												CardText,
												{ style: { padding: 0 } },
												table,
												React.createElement(Confirm, {
													html: this.state.newconfirm.html,
													title: this.state.newconfirm.title,
													answer: this.answerConfirm,
													open: this.state.newconfirm.open,
													yesText: this.state.newconfirm.yesText,
													noText: this.state.newconfirm.noText
												})
											)
										),
										React.createElement('div', { className: 'clearfix' })
									),
									React.createElement(
										'div',
										{ style: styles.slide },
										React.createElement(
											Card,
											null,
											React.createElement(CardTitle, {
												title: "Guide",
												subtitle: headend.name,
												titleColor: Styles.Colors.blue400,
												subtitleColor: Styles.Colors.grey500
											}),
											React.createElement(
												CardText,
												{ style: { padding: 0 } },
												React.createElement(
													Col,
													{ xs: 6 },
													React.createElement(
														Button,
														{ className: "left", ref: 'schedules', onClick: function (e) {
																return _this5.getSchedules();
															}, durationSuccess: this.state.durationSuccess, durationError: this.state.durationError },
														'Get Schedules'
													)
												),
												React.createElement('div', { className: 'clearfix', style: { margin: '20px 0' } }),
												React.createElement(
													Col,
													{ xs: 12 },
													updates,
													React.createElement('br', null)
												),
												React.createElement('div', { className: 'clearfix', style: { margin: '10px 0 40px' } })
											)
										),
										React.createElement('div', { className: 'clearfix' })
									)
								)
							);
						}
					}
				}]);

				return Lineup;
			})(React.Component);

			_export('default', Lineup);

			Lineup.defaultProps = {
				current: {}

			};
		}
	};
});
System.register('app/pages/settings.js', ['app/pages/settings/index.js', 'app/pages/settings/lineups.js'], function (_export) {
	'use strict';

	var index, lineups;
	return {
		setters: [function (_appPagesSettingsIndexJs) {
			index = _appPagesSettingsIndexJs['default'];
		}, function (_appPagesSettingsLineupsJs) {
			lineups = _appPagesSettingsLineupsJs['default'];
		}],
		execute: function () {
			_export('default', {
				Index: index,
				lineup: lineups
			});
		}
	};
});
System.register('app/pages/disconnect.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:react@0.14.5', 'npm:debug@2.2.0', 'app/common/gab.js', 'app/common/utils.js', 'npm:material-ui@0.14.0/lib', 'npm:react-bootstrap@0.28.1'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Debug, Gab, pickIcon, Divider, FontIcon, Styles, CardText, Card, CardActions, CardHeader, CardMedia, CardTitle, Col, debug, Disconnect;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_appCommonUtilsJs) {
			pickIcon = _appCommonUtilsJs.pickIcon;
		}, function (_npmMaterialUi0140Lib) {
			Divider = _npmMaterialUi0140Lib.Divider;
			FontIcon = _npmMaterialUi0140Lib.FontIcon;
			Styles = _npmMaterialUi0140Lib.Styles;
			CardText = _npmMaterialUi0140Lib.CardText;
			Card = _npmMaterialUi0140Lib.Card;
			CardActions = _npmMaterialUi0140Lib.CardActions;
			CardHeader = _npmMaterialUi0140Lib.CardHeader;
			CardMedia = _npmMaterialUi0140Lib.CardMedia;
			CardTitle = _npmMaterialUi0140Lib.CardTitle;
		}, function (_npmReactBootstrap0281) {
			Col = _npmReactBootstrap0281.Col;
		}],
		execute: function () {
			'use strict';

			debug = Debug('epg:app:pages:disconnect');

			Disconnect = (function (_React$Component) {
				_inherits(Disconnect, _React$Component);

				function Disconnect(props) {
					_classCallCheck(this, Disconnect);

					_get(Object.getPrototypeOf(Disconnect.prototype), 'constructor', this).call(this, props);
					this.displayName = 'Disconnect Component';
					this.state = {};
					this._update = false;
				}

				_createClass(Disconnect, [{
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						debug('receiveProps');
						this._update = true;
					}
				}, {
					key: 'componentDidUpdate',
					value: function componentDidUpdate() {
						debug('didUpdate');
					}
				}, {
					key: 'componentDidMount',
					value: function componentDidMount() {
						debug('did mount');
					}
				}, {
					key: 'render',
					value: function render() {
						debug('disconnect render', this.state, this.props);
						if (this.props.sockets.io.connected) {
							return React.createElement(
								Col,
								{ xs: 12, md: 8, mdOffset: 2, lg: 6, lgOffset: 3 },
								React.createElement(
									Card,
									null,
									React.createElement(CardTitle, {
										title: "Server Connected",
										subtitle: "The agent is currently responding to socket requests",
										titleColor: Styles.Colors.green600,
										subtitleColor: Styles.Colors.grey500
									}),
									React.createElement(
										CardText,
										{ style: { padding: 0, height: 300, textAlign: 'center', paddingTop: 20 } },
										React.createElement(
											'div',
											{ className: '', style: { color: Styles.Colors.grey600, fontSize: '76px', padding: 0, height: 100, paddingTop: 0, paddingBottom: 30 } },
											React.createElement(
												FontIcon,
												{ style: { fontSize: '128px' }, className: 'material-icons', color: Styles.Colors.green600, hoverColor: Styles.Colors.blue600 },
												'cloud_done'
											)
										),
										React.createElement('div', { style: { marginBottom: 30 } }),
										React.createElement(
											'p',
											null,
											'No problems here.'
										),
										React.createElement(
											'p',
											null,
											React.createElement(
												'a',
												{ href: '#', onClick: function (e) {
														e.preventDefault();window.history.back();
													} },
												'Previous Page'
											)
										)
									)
								)
							);
						} else {
							return React.createElement(
								Col,
								{ xs: 12, md: 8, mdOffset: 2, lg: 6, lgOffset: 3 },
								React.createElement(
									Card,
									null,
									React.createElement(CardTitle, {
										title: "Server Connection Issues",
										subtitle: "The agent is currently not responding to socket requests",
										titleColor: Styles.Colors.red600,
										subtitleColor: Styles.Colors.grey500
									}),
									React.createElement(
										CardText,
										{ style: { padding: 0, height: 300, textAlign: 'center', paddingTop: 20 } },
										React.createElement(
											'div',
											{ className: '', style: { color: Styles.Colors.grey600, fontSize: '76px', padding: 0, height: 100, paddingTop: 0, paddingBottom: 30 } },
											React.createElement(
												FontIcon,
												{ style: { fontSize: '128px' }, className: 'material-icons', color: Styles.Colors.red600, hoverColor: Styles.Colors.amber500 },
												'cloud_off'
											)
										),
										React.createElement('div', { style: { marginBottom: 30 } }),
										React.createElement(
											'p',
											null,
											'The main server is not responding to connection requests. ',
											React.createElement('br', null),
											' The App Bar will return to normal when the issue is resolved.'
										),
										React.createElement(
											'p',
											null,
											React.createElement(
												'a',
												{ href: '#', onClick: function (e) {
														e.preventDefault();window.history.back();
													} },
												'Previous Page'
											)
										)
									)
								)
							);
						}
					}
				}]);

				return Disconnect;
			})(React.Component);

			_export('default', Disconnect);
		}
	};
});
System.register("app/common/components/ZyngaScroller.js", [], function (_export) {
  "use strict";

  var scroller;
  return {
    setters: [],
    execute: function () {
      scroller = window.Scroller;

      _export("default", scroller);
    }
  };
});
System.register('app/common/components/TouchableArea.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:react@0.14.5'], function (_export) {
    var _get, _inherits, _createClass, _classCallCheck, React, TouchableArea;

    return {
        setters: [function (_npmBabelRuntime5834HelpersGet) {
            _get = _npmBabelRuntime5834HelpersGet['default'];
        }, function (_npmBabelRuntime5834HelpersInherits) {
            _inherits = _npmBabelRuntime5834HelpersInherits['default'];
        }, function (_npmBabelRuntime5834HelpersCreateClass) {
            _createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
        }, function (_npmBabelRuntime5834HelpersClassCallCheck) {
            _classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
        }, function (_npmReact0145) {
            React = _npmReact0145['default'];
        }],
        execute: function () {
            'use strict';

            TouchableArea = (function (_React$Component) {
                _inherits(TouchableArea, _React$Component);

                function TouchableArea(props) {
                    _classCallCheck(this, TouchableArea);

                    _get(Object.getPrototypeOf(TouchableArea.prototype), 'constructor', this).call(this, props);
                    this.displayName = 'touch wrapper';
                    this.state = {};

                    this.handleTouchStart = this.handleTouchStart.bind(this);
                    this.handleTouchMove = this.handleTouchMove.bind(this);
                    this.handleTouchEnd = this.handleTouchEnd.bind(this);
                }

                _createClass(TouchableArea, [{
                    key: 'handleTouchStart',
                    value: function handleTouchStart(e) {
                        if (!this.props.scroller || !this.props.touchable) {
                            return;
                        }

                        this.props.scroller.doTouchStart(e.touches, e.timeStamp);
                        e.preventDefault();
                    }
                }, {
                    key: 'handleTouchMove',
                    value: function handleTouchMove(e) {
                        if (!this.props.scroller || !this.props.touchable) {
                            return;
                        }

                        this.props.scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
                        e.preventDefault();
                    }
                }, {
                    key: 'handleTouchEnd',
                    value: function handleTouchEnd(e) {
                        if (!this.props.scroller || !this.props.touchable) {
                            return;
                        }

                        this.props.scroller.doTouchEnd(e.timeStamp);
                        e.preventDefault();
                    }
                }, {
                    key: 'render',
                    value: function render() {
                        return React.createElement(
                            'div',
                            {
                                onTouchStart: this.handleTouchStart,
                                onTouchMove: this.handleTouchMove,
                                onTouchEnd: this.handleTouchEnd,
                                onTouchCancel: this.handleTouchEnd },
                            this.props.children
                        );
                    }
                }]);

                return TouchableArea;
            })(React.Component);

            _export('default', TouchableArea);

            TouchableArea.defaultProps = {
                touchable: true
            };
        }
    };
});
System.register('app/common/components/TouchWrapper.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:react@0.14.5', 'app/common/components/ZyngaScroller.js', 'app/common/components/TouchableArea.js'], function (_export) {
    var _get, _inherits, _createClass, _classCallCheck, React, ZyngaScroller, TouchableArea, PropTypes, TouchWrapper;

    function isTouchDevice() {
        return 'ontouchstart' in document.documentElement // works on most browsers
         || 'onmsgesturechange' in window; // works on ie10
    }return {
        setters: [function (_npmBabelRuntime5834HelpersGet) {
            _get = _npmBabelRuntime5834HelpersGet['default'];
        }, function (_npmBabelRuntime5834HelpersInherits) {
            _inherits = _npmBabelRuntime5834HelpersInherits['default'];
        }, function (_npmBabelRuntime5834HelpersCreateClass) {
            _createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
        }, function (_npmBabelRuntime5834HelpersClassCallCheck) {
            _classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
        }, function (_npmReact0145) {
            React = _npmReact0145['default'];
        }, function (_appCommonComponentsZyngaScrollerJs) {
            ZyngaScroller = _appCommonComponentsZyngaScrollerJs['default'];
        }, function (_appCommonComponentsTouchableAreaJs) {
            TouchableArea = _appCommonComponentsTouchableAreaJs['default'];
        }],
        execute: function () {
            'use strict';

            PropTypes = React.PropTypes;
            ;

            TouchWrapper = (function (_React$Component) {
                _inherits(TouchWrapper, _React$Component);

                function TouchWrapper(props) {
                    _classCallCheck(this, TouchWrapper);

                    _get(Object.getPrototypeOf(TouchWrapper.prototype), 'constructor', this).call(this, props);
                    this.displayName = 'touch wrapper';
                    this.state = {
                        left: 0,
                        top: 0,
                        contentHeight: 0,
                        contentWidth: 0
                    };
                    this._update = false;

                    this._handleScroll = this._handleScroll.bind(this);
                    this._onContentHeightChange = this._onContentHeightChange.bind(this);
                }

                _createClass(TouchWrapper, [{
                    key: 'componentWillMount',
                    value: function componentWillMount() {
                        this.scroller = new ZyngaScroller(this._handleScroll);
                    }
                }, {
                    key: 'render',
                    value: function render() {
                        if (!isTouchDevice()) {
                            return React.cloneElement(this.props.children, {
                                height: this.props.tableHeight,
                                width: this.props.tableWidth
                            });
                        }

                        var example = React.cloneElement(this.props.children, {
                            onContentHeightChange: this._onContentHeightChange,
                            scrollLeft: this.state.left,
                            scrollTop: this.state.top,
                            height: this.props.tableHeight,
                            width: this.props.tableWidth,
                            overflowX: 'hidden',
                            overflowY: 'hidden'
                        });

                        return React.createElement(
                            TouchableArea,
                            { scroller: this.scroller },
                            example
                        );
                    }
                }, {
                    key: '_onContentHeightChange',
                    value: function _onContentHeightChange(contentHeight) {
                        this.scroller.setDimensions(this.props.tableWidth, this.props.tableHeight, Math.max(600, this.props.tableWidth), contentHeight);
                    }
                }, {
                    key: '_handleScroll',
                    value: function _handleScroll(left, top) {
                        this.setState({
                            left: left,
                            top: top
                        });
                    }
                }]);

                return TouchWrapper;
            })(React.Component);

            _export('default', TouchWrapper);

            ;

            TouchWrapper.childContextTypes = {
                tableWidth: PropTypes.number.isRequired,
                tableHeight: PropTypes.number.isRequired
            };
        }
    };
});
System.register('app/common/localstore.js', ['npm:localforage@1.3.2', 'npm:debug@2.2.0'], function (_export) {
	'use strict';

	var localforage, Debug, debug, store;

	function haveProgram(program) {
		if (program === Object(program)) {
			return true;
		} else {
			return false;
		}
	}

	function isCallback(callback) {
		if (typeof callback === 'function') {
			return callback;
		} else {
			return function (err, data) {};
		}
	}
	return {
		setters: [function (_npmLocalforage132) {
			localforage = _npmLocalforage132['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}],
		execute: function () {
			debug = Debug('epg:app:common:localstore');

			store = function store() {};

			store.prototype.setItem = function (key, value, callback) {
				var cb = isCallback(callback);
				localforage.setItem(String(key), value, function (err, value) {
					//debug('set', key, '=', value);
					cb(err, value);
				});
			};

			store.prototype.getItem = function (key, callback) {
				var cb = isCallback(callback);
				localforage.getItem(String(key), cb);
			};

			store.prototype.removeItem = function (key, callback) {
				var cb = isCallback(callback);
				localStorage.removeItem(String(key), cb);
			};

			store.prototype.getStation = function (id, callback) {
				var cb = isCallback(callback);
				this.getItem(id, cb);
			};

			store.prototype.getStations = function (stations, callback) {

				var cb = isCallback(callback);

				if (!Array.isArray(stations)) {
					return cb('stations array required');
				}

				var archive = {};
				this.getItem('__guideUpdated', function (err, val) {
					archive.__guideUpdated = val;
					localforage.iterate(function (value, key, iterationNumber) {
						//debug(key, stations)
						if (stations.indexOf(key)) {
							archive[key] = value;
						}
					}, function (err) {
						cb(err, archive);
					});
				});
			};

			store.prototype.allStorage = function (callback) {

				var archive = {};

				localforage.iterate(function (value, key, iterationNumber) {
					archive[key] = value;
				}, function (err) {
					callback(err, archive);
				});
			};

			_export('default', new store());
		}
	};
});
System.register('app/pages/tables/guide.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:babel-runtime@5.8.34/helpers/extends', 'npm:babel-runtime@5.8.34/core-js/object/assign', 'npm:react@0.14.5', 'npm:fixed-data-table@0.6.0', 'app/common/utils.js', 'npm:material-ui@0.14.0/lib', 'npm:lodash@3.10.1', 'npm:object-property-natural-sort@0.0.4', 'npm:moment@2.11.1', 'app/common/localstore.js', 'npm:debug@2.2.0'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, _extends, _Object$assign, React, Table, Column, Cell, ChannelCell, clickButton, iButton, DateCell, ImageCell, LinkCell, TextCell, ProgramCell, Checkbox, FontIcon, Styles, sortByOrder, naturalSort, moment, store, Debug, debug, GuideTable;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmBabelRuntime5834HelpersExtends) {
			_extends = _npmBabelRuntime5834HelpersExtends['default'];
		}, function (_npmBabelRuntime5834CoreJsObjectAssign) {
			_Object$assign = _npmBabelRuntime5834CoreJsObjectAssign['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmFixedDataTable060) {
			Table = _npmFixedDataTable060.Table;
			Column = _npmFixedDataTable060.Column;
			Cell = _npmFixedDataTable060.Cell;
		}, function (_appCommonUtilsJs) {
			ChannelCell = _appCommonUtilsJs.ChannelCell;
			clickButton = _appCommonUtilsJs.clickButton;
			iButton = _appCommonUtilsJs.iButton;
			DateCell = _appCommonUtilsJs.DateCell;
			ImageCell = _appCommonUtilsJs.ImageCell;
			LinkCell = _appCommonUtilsJs.LinkCell;
			TextCell = _appCommonUtilsJs.TextCell;
			ProgramCell = _appCommonUtilsJs.ProgramCell;
		}, function (_npmMaterialUi0140Lib) {
			Checkbox = _npmMaterialUi0140Lib.Checkbox;
			FontIcon = _npmMaterialUi0140Lib.FontIcon;
			Styles = _npmMaterialUi0140Lib.Styles;
		}, function (_npmLodash3101) {
			sortByOrder = _npmLodash3101.sortByOrder;
		}, function (_npmObjectPropertyNaturalSort004) {
			naturalSort = _npmObjectPropertyNaturalSort004['default'];
		}, function (_npmMoment2111) {
			moment = _npmMoment2111['default'];
		}, function (_appCommonLocalstoreJs) {
			store = _appCommonLocalstoreJs['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}],
		execute: function () {
			'use strict';

			debug = Debug('epg:app:pages:guide:table');

			GuideTable = (function (_React$Component) {
				_inherits(GuideTable, _React$Component);

				function GuideTable(props) {
					_classCallCheck(this, GuideTable);

					_get(Object.getPrototypeOf(GuideTable.prototype), 'constructor', this).call(this, props);
					if (props.list) props.list.sort(naturalSort('channel'));

					this.state = {
						list: props.list || [],
						order: props.order || 'asc',
						sortPath: props.sortPath || 'channel',
						guide: {},
						updated: false
					};
					this._setState({}, props, true);

					this._intervaled = {};

					this.reverseOrder = this.reverseOrder.bind(this);
					this.sortHD = this.sortHD.bind(this);
					this.guideInterval = this.guideInterval.bind(this);
				}

				_createClass(GuideTable, [{
					key: '_setState',
					value: function _setState() {
						var who = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

						var _this = this;

						var props = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
						var save = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

						store.getStations(props.stationMap || this.props.stationMap, function (err, stations) {
							if (err) {
								debug('error getting stations', err);
							}

							var merge = {
								guide: stations,
								updated: stations.__guideUpdated
							};

							who = _Object$assign(who, merge);

							if (save) {
								_this.setState(who);
							}
						});
					}
				}, {
					key: 'guideInterval',
					value: function guideInterval() {
						var _this2 = this;

						store.getItem('__guideUpdated', function (err, updated) {
							//debug('__guideUpdated', this.state.updated, updated);
							if (_this2.state.updated !== updated) {
								_this2._setState({}, {}, true);
							}
						});
					}
				}, {
					key: 'componentWillMount',
					value: function componentWillMount() {
						this._intervaled.updated = setInterval(this.guideInterval, 5000);
					}
				}, {
					key: 'componentWillUnmount',
					value: function componentWillUnmount() {
						clearInterval(this._intervaled.updated);
					}
				}, {
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						debug('got props', this.state, props);
						if (props.list && this.state.sortPath !== 'hd') {
							this.reverseOrder(false, props.list, this.state.order);
						} else {
							this.sortHD(false, props.list, this.state.order);
						}
					}
				}, {
					key: 'reverseOrder',
					value: function reverseOrder(e, list, order) {

						var path = undefined;
						if (e) {
							e.preventDefault();
							path = e.target.dataset.path;
						} else {
							path = this.state.sortPath;
						}

						if (!Array.isArray(list)) {
							list = this.state.list;
						}

						order = typeof order === 'string' ? order : this.state.order === 'asc' ? 'desc' : 'asc';

						var sorted = list.sort(naturalSort(path));

						if (order === 'desc') sorted.reverse();

						debug('sort channels', sorted.map(function (e) {
							return e[path];
						}));

						this.setState({
							list: sorted,
							order: order,
							sortPath: path
						});
					}
				}, {
					key: 'sortHD',
					value: function sortHD(e, list, order) {

						if (e) {
							e.preventDefault();
						}

						if (!Array.isArray(list)) {
							list = this.state.list;
						}

						order = typeof order === 'string' ? order : this.state.order === 'asc' ? 'desc' : 'asc';

						this.setState({
							list: sortByOrder(list, [function (n) {
								var search = n.name ? n.name : n.callsign ? n.callsign : 'sd';
								var searchedForHD = search.toLowerCase().search('hd') > -1;
								var returnValue = searchedForHD ? 'HD' : search.toLowerCase().search('dt') > -1 ? 'HD' : 'SD';
								return returnValue;
							}, 'name'], order),
							order: order,
							sortPath: 'hd'
						});
					}
				}, {
					key: 'scratch',
					value: function scratch() {
						//debug('scratch', this.props, this.state.guide);
						// subtract 30 since we add 30 first in loop
						var now = this.props.timeframe().subtract(this.props.splits, 'minutes');
						var headerTimes = [];

						for (var i = 0; i < this.props.hours * (60 / this.props.splits); i++) {
							var nn = now.add(this.props.splits, 'minutes').format("LT");
							//debug('add header', i, nn);
							headerTimes.push(React.createElement(Column, {
								header: React.createElement(
									'div',
									{ style: { textAlign: 'center' } },
									nn
								),
								cell: React.createElement('span', null),
								width: 150,
								allowCellsRecycling: true,
								columnKey: now.valueOf(),
								key: now.valueOf(),
								cell: React.createElement(ProgramCell, { click: this.props.programInfo, zero: i, data: this.state.list, guide: this.state.guide, splits: this.props.splits, time: now.valueOf() })
							}));
						}
						return headerTimes;
					}
				}, {
					key: 'render',
					value: function render() {
						var _this3 = this;

						var guide = this.state.guide;
						var channels = this.state.list;
						//debug('render guide table', guide, channels, channels.length);

						var times = this.scratch();
						var bound = document.body.getBoundingClientRect();
						//debug('bound', bound);
						return React.createElement(
							'div',
							{ style: { margin: '0 auto' } },
							React.createElement(
								Table,
								_extends({
									rowHeight: bound.height / this.props.perPage,
									headerHeight: 30,
									footerHeight: 0,
									rowsCount: channels.length,
									width: bound.width,
									height: bound.height,
									rowClassNameGetter: function (index) {
										return '';
									}
								}, this.props),
								React.createElement(Column, {
									cell: React.createElement(ChannelCell, { click: this.props.channelInfo, data: channels, col: 'logo', source: 'channels', backgroundColor: 'white' }),
									fixed: true,
									width: Math.floor(bound.width / 6),
									allowCellsRecycling: true,
									header: React.createElement(
										Cell,
										null,
										React.createElement(
											'div',
											{ className: 'col-xs-2 no-padding', style: { cursor: 'pointer' } },
											clickButton(this.props.handleLeftNav, {
												className: "material-icons",
												style: { fontSize: '18px' },
												color: Styles.Colors.grey200,
												hoverColor: Styles.Colors.amber900,
												title: 'Menu',
												dataIcon: 'menu'
											})
										),
										React.createElement(
											'div',
											{ className: 'col-xs-offSet-8 col-xs-2 no-padding', onClick: function (e) {
													_this3.flickMe(e, 'down');
												}, style: { cursor: 'pointer', padding: 5 } },
											clickButton(function (e) {
												_this3.flickMe(e, 'down');
											}, {
												className: "material-icons",
												style: { fontSize: '24px' },
												color: Styles.Colors.grey200,
												hoverColor: Styles.Colors.amber900,
												title: 'Prev Channels',
												dataIcon: 'arrow_drop_up'
											})
										)
									),
									footerA: React.createElement(
										Cell,
										{ style: { padding: 0 } },
										React.createElement(
											'div',
											{ className: 'col-xs-2 no-padding', style: { cursor: 'pointer' } },
											clickButton(function () {
												_this3.props.goTo({

													page: 'lineup',
													child: '',
													lineup: _this3.props.lineup

												});
											}, {
												className: "material-icons",
												style: { fontSize: '20px' },
												color: Styles.Colors.grey200,
												hoverColor: Styles.Colors.amber600,
												title: 'Settings',
												dataIcon: 'settings'
											})
										),
										React.createElement(
											'div',
											{ className: 'col-xs-offSet-8 col-xs-2 no-padding', onClick: this.flickMe, style: { cursor: 'pointer' } },
											clickButton(this.flickMe, {
												className: "material-icons",
												style: { fontSize: '24px' },
												color: Styles.Colors.grey200,
												hoverColor: Styles.Colors.amber600,
												title: 'Next Channels',
												dataIcon: 'arrow_drop_down'
											})
										)
									)
								}),
								times
							)
						);
					}
				}]);

				return GuideTable;
			})(React.Component);

			_export('default', GuideTable);
		}
	};
});
System.register('app/common/components/dialog.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:react@0.14.5', 'npm:material-ui@0.14.0/lib/dialog', 'npm:material-ui@0.14.0/lib/flat-button', 'npm:material-ui@0.14.0/lib/raised-button', 'npm:debug@2.2.0'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Dialog, FlatButton, RaisedButton, debugging, debug, Dialog2;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmMaterialUi0140LibDialog) {
			Dialog = _npmMaterialUi0140LibDialog['default'];
		}, function (_npmMaterialUi0140LibFlatButton) {
			FlatButton = _npmMaterialUi0140LibFlatButton['default'];
		}, function (_npmMaterialUi0140LibRaisedButton) {
			RaisedButton = _npmMaterialUi0140LibRaisedButton['default'];
		}, function (_npmDebug220) {
			debugging = _npmDebug220['default'];
		}],
		execute: function () {
			'use strict';

			debug = debugging('epg:app:common:components:dialog');

			Dialog2 = (function (_React$Component) {
				_inherits(Dialog2, _React$Component);

				function Dialog2(props) {
					_classCallCheck(this, Dialog2);

					_get(Object.getPrototypeOf(Dialog2.prototype), 'constructor', this).call(this, props);

					this.handleNo = this.handleNo.bind(this);
				}

				_createClass(Dialog2, [{
					key: 'handleNo',
					value: function handleNo() {
						if (typeof this.props.answer == 'function') {
							this.props.answer(false);
						}
					}
				}, {
					key: 'render',
					value: function render() {
						var actions = [React.createElement(FlatButton, {
							label: this.props.closeText,
							secondary: true,
							onTouchTap: this.handleNo
						})];

						return React.createElement(
							'div',
							null,
							React.createElement(
								Dialog,
								{
									title: this.props.title,
									actions: actions,
									modal: false,
									open: this.props.open,
									onRequestClose: this.handleNo
								},
								React.createElement('div', { dangerouslySetInnerHTML: { __html: this.props.html } })
							)
						);
					}
				}]);

				return Dialog2;
			})(React.Component);

			_export('default', Dialog2);

			Dialog2.defaultProps = {
				closeText: 'Close',
				open: false,
				html: 'Placeholder Text',
				title: 'Dialog'
			};
		}
	};
});
System.register('app/pages/guide.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:babel-runtime@5.8.34/helpers/extends', 'npm:babel-runtime@5.8.34/core-js/object/keys', 'npm:babel-runtime@5.8.34/core-js/object/assign', 'npm:react@0.14.5', 'npm:debug@2.2.0', 'app/common/gab.js', 'app/common/components/TouchWrapper.js', 'app/common/utils.js', 'npm:material-ui@0.14.0/lib', 'npm:react-bootstrap@0.28.1', 'npm:lodash@3.10.1', 'npm:moment@2.11.1', 'npm:react-swipeable@3.1.0', 'app/common/localstore.js', 'app/pages/tables/guide.js', 'app/common/components/dialog.js'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, _extends, _Object$keys, _Object$assign, React, Debug, Gab, TouchWrapper, clickButton, iButton, pickIcon, setKey, IconButton, List, ListItem, Divider, FontIcon, Styles, CardText, Card, CardActions, CardHeader, CardMedia, CardTitle, Col, defaultsDeep, moment, Swipeable, store, GuideTable, Dialog, debug, w, myStyles, Guide;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmBabelRuntime5834HelpersExtends) {
			_extends = _npmBabelRuntime5834HelpersExtends['default'];
		}, function (_npmBabelRuntime5834CoreJsObjectKeys) {
			_Object$keys = _npmBabelRuntime5834CoreJsObjectKeys['default'];
		}, function (_npmBabelRuntime5834CoreJsObjectAssign) {
			_Object$assign = _npmBabelRuntime5834CoreJsObjectAssign['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_appCommonComponentsTouchWrapperJs) {
			TouchWrapper = _appCommonComponentsTouchWrapperJs['default'];
		}, function (_appCommonUtilsJs) {
			clickButton = _appCommonUtilsJs.clickButton;
			iButton = _appCommonUtilsJs.iButton;
			pickIcon = _appCommonUtilsJs.pickIcon;
			setKey = _appCommonUtilsJs.setChannelKey;
		}, function (_npmMaterialUi0140Lib) {
			IconButton = _npmMaterialUi0140Lib.IconButton;
			List = _npmMaterialUi0140Lib.List;
			ListItem = _npmMaterialUi0140Lib.ListItem;
			Divider = _npmMaterialUi0140Lib.Divider;
			FontIcon = _npmMaterialUi0140Lib.FontIcon;
			Styles = _npmMaterialUi0140Lib.Styles;
			CardText = _npmMaterialUi0140Lib.CardText;
			Card = _npmMaterialUi0140Lib.Card;
			CardActions = _npmMaterialUi0140Lib.CardActions;
			CardHeader = _npmMaterialUi0140Lib.CardHeader;
			CardMedia = _npmMaterialUi0140Lib.CardMedia;
			CardTitle = _npmMaterialUi0140Lib.CardTitle;
		}, function (_npmReactBootstrap0281) {
			Col = _npmReactBootstrap0281.Col;
		}, function (_npmLodash3101) {
			defaultsDeep = _npmLodash3101.defaultsDeep;
		}, function (_npmMoment2111) {
			moment = _npmMoment2111['default'];
		}, function (_npmReactSwipeable310) {
			Swipeable = _npmReactSwipeable310['default'];
		}, function (_appCommonLocalstoreJs) {
			store = _appCommonLocalstoreJs['default'];
		}, function (_appPagesTablesGuideJs) {
			GuideTable = _appPagesTablesGuideJs['default'];
		}, function (_appCommonComponentsDialogJs) {
			Dialog = _appCommonComponentsDialogJs['default'];
		}],
		execute: function () {
			'use strict';

			debug = Debug('epg:app:pages:guide');
			w = undefined;
			myStyles = {
				primary1Color: '#26282D',
				textColor: Styles.Colors.blue100,
				alternateTextColor: Styles.Colors.lightBlue50,
				primary2Color: '#26282D',
				primary3Color: '#26282D',

				canvasColor: '#303234',
				accent1Color: "#FF6040",
				accent2Color: "#F5001E",
				accent3Color: "#FA905C"
			};

			Guide = (function (_React$Component) {
				_inherits(Guide, _React$Component);

				function Guide(props) {
					_classCallCheck(this, Guide);

					_get(Object.getPrototypeOf(Guide.prototype), 'constructor', this).call(this, props);
					this.displayName = 'Guide Component';
					this.state = {
						lineup: props.lineup,
						lineups: {
							channels: [],
							stations: []
						},
						channels: {},
						stations: [],
						hours: 24,
						page: 1,
						perPage: 5,
						cachePerGrab: 15,
						channelsPer: 100,
						index: 0,
						splits: 30,
						dialog: {
							open: false
						}
					};
					this.guide = {};

					this._update = false;

					this.getGuideData = this.getGuideData.bind(this);
					this.advanceChannels = this.advanceChannels.bind(this);
					this.prevChannels = this.prevChannels.bind(this);
					this.setMoment = this.setMoment.bind(this);
					this.timeframe = this.timeframe.bind(this);
					this.answerDialog = this.answerDialog.bind(this);
					this.programInfo = this.programInfo.bind(this);
					this.channelInfo = this.channelInfo.bind(this);

					this.setMoment();
				}

				_createClass(Guide, [{
					key: 'timeframe',
					value: function timeframe() {
						//debug('get moment', this.moment, moment(this.moment).format('LLLL'));
						return moment(this.moment);
					}
				}, {
					key: 'getChildContext',
					value: function getChildContext() {
						return {
							muiTheme: Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.DarkRawTheme), myStyles)
						};
					}
				}, {
					key: 'setMoment',
					value: function setMoment() {
						this.moment = moment().startOf('hour').valueOf();
						//debug('set moment', this.moment, moment(this.moment).format('LLLL'));
						if (moment().minutes() > 29) {
							this.moment = moment(this.moment).add(30, 'minutes').valueOf();
							debug('fast forward moment set', this.moment, moment(this.moment).format('LLLL'));
						}
					}
				}, {
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						//debug('receiveProps');

						if (props.lineup && this.state.lineup !== props.lineup && !this._update) {
							this.setState({
								lineup: props.lineup
							}, this.lineupMap);
							this._update = true;
						}
					}
				}, {
					key: 'componentWillMount',
					value: function componentWillMount() {
						var _this = this;

						//debug('will mount');
						if (this.state.lineup) {
							this.lineupMap();
						}
						w = undefined;
						w = new Worker('/epg-files/app/common/workers/index.js');
						w.onmessage = function (event) {
							_this.gotGuideDataFromWorker(event.data);
						};
					}
				}, {
					key: 'componentWillUpdate',
					value: function componentWillUpdate() {
						this.setMoment();
					}
				}, {
					key: 'componentWillUnmount',
					value: function componentWillUnmount() {
						this.props.sockets.io.removeListener('guide data', this.getGuideData);
						w.terminate();
					}
				}, {
					key: 'componentDidUpdate',
					value: function componentDidUpdate() {
						//debug('did update', this.state.lineup, this._startedSwipeAt);
						if (this.state.lineup && this._startedSwipeAt === undefined) {}
					}
				}, {
					key: 'componentDidMount',
					value: function componentDidMount() {
						//debug('did mount', this.state.lineup, this._startedSwipeAt);
						if (this.state.lineup && this._startedSwipeAt === undefined) {}
					}
				}, {
					key: 'advanceChannels',
					value: function advanceChannels(e, index) {
						if (e && typeof e.preventDefault === 'function') {
							e.preventDefault();
						}
						var newIndex = index ? this.state.index + index : this.state.index + this.state.perPage;
						this.setState({
							index: newIndex
						});
					}
				}, {
					key: 'prevChannels',
					value: function prevChannels(e, index) {
						if (e && typeof e.preventDefault === 'function') {
							e.preventDefault();
						}
						var newIndex = index ? this.state.index - index : this.state.index === 0 ? 0 : this.state.index - this.state.perPage;
						if (newIndex < 0) newIndex = 0;
						this.setState({
							index: newIndex
						});
					}
				}, {
					key: 'grabGuideData',
					value: function grabGuideData() {
						var _this2 = this;

						var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

						debug('guide', data);

						var g = {
							end: this.timeframe().add(this.state.hours, 'hours'),
							start: this.timeframe().subtract(1, 'hours')
						};
						//debug('between', g);

						var startC = this.state.index;
						var endC = this.state.index + this.state.perPage + this.state.cachePerGrab;
						var i = -1;
						var stations = this.state.lineups.channels.filter(function (sta) {
							i++;
							if (_this2.guide[sta.stationID] === Object(_this2.guide[sta.stationID])) {
								var v = false;
								for (var k in _this2.guide[sta.stationID]) {
									if (k >= g.start.valueOf() && k <= g.end.valueOf()) {
										v = true;
									}
								}
								if (v) return false;
							}
							if (i >= startC && i < endC) {
								return true;
							}
							return false;
						}).map(function (sta) {

							return sta.stationID;
						});
						this.props.sockets.guide(_extends({ stationID: stations }, g), function (data) {
							debug('return callback data', data);
							var m = data.data === Object(data.data) ? data.data.message : false;
							if (m) {
								_this2.props.showAlert('info', m, 'html');
							}
						});
						this.props.sockets.io.on('guide data', this.getGuideData);
					}
				}, {
					key: 'getGuideData',
					value: function getGuideData(data) {
						//debug(data)
						return;
						var ID = _Object$keys(data.stations)[0];
						var lineupMap = _Object$assign({}, this.state.lineupMap);
						//debug(ID, lineupMap.stations[ID], data.stations[ID])
						lineupMap.stations[ID].guide = _Object$assign(lineupMap.stations[_Object$keys(data.stations)[0]].guide, data.stations[ID]);
						this.setState({ lineupMap: lineupMap }, function () {
							debug('guide data', ID, data);
						});
					}
				}, {
					key: 'guideWorker',
					value: function guideWorker() {
						var _this3 = this;

						var filter = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

						// load guide data from storage first then refresh
						this.guide = {};
						store.getStations(this.state.stationMap, function (err, stations) {
							_this3.guide = stations;
						});

						var def = {
							hours: this.state.hours,
							stations: this.state.stationMap,
							moment: this.timeframe().valueOf()
						};

						var opts = _Object$assign(def, filter);

						w.postMessage(opts);
					}
				}, {
					key: 'gotGuideDataFromWorker',
					value: function gotGuideDataFromWorker(data) {
						var ID = undefined;
						if (data.stations === Object(data.stations)) {
							ID = _Object$keys(data.stations)[0];

							store.getItem(ID, function (err, doc) {

								if (doc !== Object(doc)) {
									doc = {};
								}

								var item = _Object$assign(doc, data.stations[ID]);
								store.setItem(ID, item, function (err, value) {
									if (err) {
										debug('error saving guide data', err, data);
									}
									store.setItem('__guideUpdated', moment().valueOf(), function (err, val) {
										//debug('__guideUpdated value set', val);
										if (err) {
											debug('__guideUpdated value save failed', err);
										}
									});
								});
							});
						}
					}
				}, {
					key: 'lineupMap',
					value: function lineupMap() {
						var _this4 = this;

						//debug('getLineup');

						var headend = this.props.headends[this.props.lineup];

						if (typeof headend !== 'object') {
							debug('linepMap no headends', headend);
							return this.props.sockets.io.once('status', function (data) {
								debug('headends once');
								_this4.lineupMap();
							});
						}
						this.props.showAlert('warning', 'Channels will be available soon!', 'html');
						headend.active = true;

						//debug('lineupMap headend', headend);

						this.props.sockets.lineupMap(headend, function (data) {
							//debug('getLineup data', data);
							if (data.error) {
								_this4.props.showAlert('danger', data.error.message, 'html');
							} else {
								(function () {

									var channels = {};
									var stations = {};
									var stationMap = [];

									if (Array.isArray(data.channels)) {
										data.channels.forEach(function (v, k) {
											var corc = setKey(v);
											if (corc && !channels[corc]) {
												channels[corc] = v;
												channels[corc].index = k;
												stationMap.push(v.stationID);
												stations[v.stationID] = v;
												stations[v.stationID].index = k;
											}
										});
										data.stations = data.stations.filter(function (v) {
											var corc = setKey(stations[v.stationID]);
											if (corc && channels[corc]) {
												//delete v.id;
												defaultsDeep(channels[corc], v);
												return true;
											}
											return false;
										});
									}

									_this4.setState({
										channels: channels,
										stations: stations,
										stationMap: stationMap,
										lineups: data
									}, _this4.guideWorker);

									_this4.props.showAlert('warning', 'Grabbing guide data', 'html');

									_this4._update = false;
								})();
							}
						});
					}
				}, {
					key: 'render',
					value: function render() {
						var _this5 = this;

						debug('guide render', this.state, this.props);

						var mylineups = this.props.lineups.lineups.map(function (v) {
							return React.createElement(
								'span',
								{ key: v.lineup + 'home' },
								React.createElement(ListItem, {
									key: v.lineup + 'home',
									style: { fontSize: '16px' },
									primaryText: v.name,
									secondaryText: v.lineup,
									leftIcon: React.createElement(
										FontIcon,
										{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.greenA200 },
										pickIcon(v.transport)
									),
									onTouchTap: function (e) {
										e.preventDefault(e);
										_this5.props.goTo({
											current: v,
											page: 'guide',
											child: '',
											lineup: v.lineup,
											newalert: {
												show: true,
												html: 'Viewing guide for ' + v.name,
												style: 'info',
												duration: 2500
											}
										});
									}

								})
							);
						});

						var bound = document.body.getBoundingClientRect();
						var list = false;
						var pick = React.createElement('span', null);
						if (!this.props.lineup) {
							pick = React.createElement(
								List,
								{ subheader: 'Select a Guide' },
								mylineups
							);
						} else if (this.state.lineups.channels.length > 0) {
							list = React.createElement(
								'div',
								{ className: 'epg__container' },
								React.createElement(
									TouchWrapper,
									_extends({ tableWidth: bound.width, tableHeight: bound.height }, this.state),
									React.createElement(GuideTable, _extends({ timeframe: this.timeframe, moment: moment, list: this.state.lineups.channels, sockets: this.props.sockets, channelInfo: this.channelInfo, programInfo: this.programInfo }, this.state, this.props))
								),
								React.createElement(Dialog, {
									html: this.state.dialog.html,
									title: this.state.dialog.title,
									answer: this.answerDialog,
									open: this.state.dialog.open,
									closeText: this.state.dialog.closeText
								})
							);
						} else {
							list = React.createElement(
								'div',
								{ className: 'epg__container' },
								React.createElement(
									'div',
									{ className: 'page-middle center', style: { color: Styles.Colors.grey600, fontSize: '76px', padding: 0, height: 100, paddingTop: 0, paddingBottom: 30 } },
									React.createElement(
										FontIcon,
										{ style: { fontSize: '160px' }, className: 'material-icons', color: Styles.Colors.amber600, hoverColor: Styles.Colors.amber600 },
										'file_download'
									)
								)
							);
						}

						if (list) {
							return list;
						} else {
							return pick;
						}
					}
				}, {
					key: 'answerDialog',
					value: function answerDialog() {
						this.setState({
							dialog: {
								open: false
							}
						});
					}
				}, {
					key: 'channelInfo',
					value: function channelInfo(channel) {
						this.setState({
							dialog: {
								open: true,
								title: 'Channel Info'
							}
						});
					}
				}, {
					key: 'programInfo',
					value: function programInfo() {
						this.setState({
							dialog: {
								open: true,
								title: 'Program Info'
							}
						});
					}
				}]);

				return Guide;
			})(React.Component);

			_export('default', Guide);

			Guide.childContextTypes = {
				muiTheme: React.PropTypes.object
			};
		}
	};
});
System.register('app/pages/status.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:react@0.14.5', 'npm:debug@2.2.0', 'app/common/gab.js', 'app/common/utils.js', 'npm:material-ui@0.14.0/lib', 'npm:react-bootstrap@0.28.1'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Debug, Gab, pickIcon, Button, List, ListItem, Divider, FontIcon, Styles, CardText, Card, CardActions, CardHeader, CardMedia, CardTitle, IconButton, Col, debug, Status;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_appCommonUtilsJs) {
			pickIcon = _appCommonUtilsJs.pickIcon;
			Button = _appCommonUtilsJs.Button;
		}, function (_npmMaterialUi0140Lib) {
			List = _npmMaterialUi0140Lib.List;
			ListItem = _npmMaterialUi0140Lib.ListItem;
			Divider = _npmMaterialUi0140Lib.Divider;
			FontIcon = _npmMaterialUi0140Lib.FontIcon;
			Styles = _npmMaterialUi0140Lib.Styles;
			CardText = _npmMaterialUi0140Lib.CardText;
			Card = _npmMaterialUi0140Lib.Card;
			CardActions = _npmMaterialUi0140Lib.CardActions;
			CardHeader = _npmMaterialUi0140Lib.CardHeader;
			CardMedia = _npmMaterialUi0140Lib.CardMedia;
			CardTitle = _npmMaterialUi0140Lib.CardTitle;
			IconButton = _npmMaterialUi0140Lib.IconButton;
		}, function (_npmReactBootstrap0281) {
			Col = _npmReactBootstrap0281.Col;
		}],
		execute: function () {
			'use strict';

			debug = Debug('epg:app:pages:status');

			Status = (function (_React$Component) {
				_inherits(Status, _React$Component);

				function Status(props) {
					_classCallCheck(this, Status);

					_get(Object.getPrototypeOf(Status.prototype), 'constructor', this).call(this, props);
					this.displayName = 'Status Component';
					this.state = {};
					this._update = false;
				}

				_createClass(Status, [{
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						debug('receiveProps');
						this._update = true;
					}
				}, {
					key: 'componentDidUpdate',
					value: function componentDidUpdate() {
						debug('didUpdate');
					}
				}, {
					key: 'componentDidMount',
					value: function componentDidMount() {
						debug('did mount');
					}
				}, {
					key: 'render',
					value: function render() {
						var _this = this;

						debug('status render', this.state, this.props);

						if (!this.props.status.serverID) {
							return React.createElement(
								Col,
								{ xs: 12, md: 8, mdOffset: 2, lg: 6, lgOffset: 3 },
								React.createElement(
									Card,
									null,
									React.createElement(CardTitle, {
										title: "Status",
										subtitle: "Requested status from from agent",
										titleColor: Styles.Colors.blue400,
										subtitleColor: Styles.Colors.grey500
									}),
									React.createElement(
										CardText,
										{ style: { padding: 25 } },
										'Status not currently available.',
										React.createElement(
											'div',
											null,
											React.createElement(
												Button,
												{ className: "left", ref: 'schedules', onClick: function (e) {
														e.preventDefault();_this.props.sockets.status();
													}, durationSuccess: this.state.durationSuccess, durationError: this.state.durationError },
												'Refresh Status'
											)
										)
									)
								)
							);
						}

						var GR = [];
						if (Gab.guideUpdates.length > 0) {
							GR = Gab.guideUpdates.map(function (v, k) {
								return React.createElement(
									'p',
									{ key: k + 'sdffret' },
									v
								);
							});
						}

						var updates = GR.length === 0 ? React.createElement(
							'span',
							null,
							React.createElement(
								'b',
								null,
								'Guide Update Log will  list here'
							)
						) : React.createElement(
							'div',
							{ style: { maxHeight: 300, overflow: 'auto', padding: 10 } },
							React.createElement(
								'span',
								null,
								React.createElement(
									'b',
									null,
									'Guide Refresh Log'
								)
							),
							GR
						);

						var connected = this.props.sockets.io.connected ? this.props.guideRefresh.download ? React.createElement(
							FontIcon,
							{ className: 'material-icons', style: { fontSize: '32px' }, color: Styles.Colors.deepPurple200, hoverColor: Styles.Colors.deepPurple200, title: "Downloading guide data for " + this.props.guideRefresh.who[0] },
							'cloud_download'
						) : React.createElement(
							FontIcon,
							{ style: { fontSize: '32px' }, className: 'material-icons', color: Styles.Colors.green600, hoverColor: Styles.Colors.blue600 },
							'cloud_done'
						) : React.createElement(
							IconButton,
							{ onClick: function (e) {
									e.preventDefault();_this.props.goTo('disconnected');
								} },
							React.createElement(
								FontIcon,
								{ style: { fontSize: '32px' }, className: 'material-icons', color: Styles.Colors.red600, hoverColor: Styles.Colors.amber500 },
								'cloud_off'
							)
						);

						if (!this.props.status.account) {
							return React.createElement('span', null);
						}
						return React.createElement(
							Col,
							{ xs: 12, md: 8, mdOffset: 2, lg: 6, lgOffset: 3 },
							React.createElement(
								Card,
								null,
								React.createElement(CardTitle, {
									title: "Status",
									subtitle: "Requested status from from agent",
									titleColor: Styles.Colors.blue400,
									subtitleColor: Styles.Colors.grey500
								}),
								React.createElement(
									CardText,
									{ style: { padding: 0, paddingTop: 20 } },
									React.createElement(
										List,
										null,
										React.createElement(ListItem, { primaryText: React.createElement(
												Button,
												{ className: "left", ref: 'schedules', onClick: function (e) {
														e.preventDefault();_this.props.sockets.status();
													}, durationSuccess: this.state.durationSuccess, durationError: this.state.durationError },
												'Refresh Status'
											), disabled: true, insetChildren: true }),
										React.createElement(Divider, { inset: true }),
										React.createElement(ListItem, {
											leftIcon: connected,
											primaryText: this.props.sockets.io.connected ? this.props.guideRefresh.download ? 'Guide data is being refreshed for ' + this.props.guideRefresh.who.join(', ') : 'Connected' : 'Disconnected',
											disabled: true
										}),
										React.createElement(Divider, { inset: true }),
										React.createElement(ListItem, { primaryText: this.props.status.account.maxLineups, secondaryText: 'Max Lineups', disabled: true, insetChildren: true }),
										React.createElement(Divider, { inset: false }),
										React.createElement(ListItem, { secondaryText: 'Available Lineups', primaryText: this.props.status.account.maxLineups - this.props.status.lineups.length, disabled: true, insetChildren: true }),
										React.createElement(Divider, { inset: false }),
										React.createElement(ListItem, { secondaryText: 'Account Expiration', primaryText: this.props.status.account.expires, disabled: true, insetChildren: true }),
										React.createElement(Divider, { inset: false }),
										React.createElement(ListItem, { secondaryText: 'Notifications', primaryText: this.props.status.notifications.length === 0 ? "0" : this.props.status.notifications.length, disabled: true, insetChildren: true }),
										React.createElement(Divider, { inset: false }),
										React.createElement(ListItem, { secondaryText: 'Last data update', primaryText: this.props.status.lastDataUpdate, disabled: true, insetChildren: true }),
										React.createElement(Divider, { inset: false }),
										React.createElement(ListItem, { secondaryText: 'Agent serverID', primaryText: this.props.status.serverID, disabled: true, insetChildren: true }),
										React.createElement(Divider, { inset: false }),
										React.createElement(ListItem, { secondaryText: 'Agent Server Status', primaryText: this.props.status.systemStatus[0].status, disabled: true, insetChildren: true }),
										React.createElement(Divider, { inset: false }),
										React.createElement(ListItem, { secondaryText: 'Agent Message', primaryText: this.props.status.systemStatus[0].message, disabled: true, insetChildren: true }),
										React.createElement(Divider, { inset: false }),
										React.createElement(ListItem, { style: { maxHeight: 350 }, primaryText: updates, disabled: true, insetChildren: true }),
										React.createElement(Divider, { inset: false })
									)
								)
							),
							React.createElement('div', { style: { height: 100 } })
						);
					}
				}]);

				return Status;
			})(React.Component);

			_export('default', Status);
		}
	};
});
System.register('app/pages/component/card.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:react@0.14.5', 'npm:debug@2.2.0', 'app/common/gab.js', 'npm:material-ui@0.14.0/lib/card/card', 'npm:material-ui@0.14.0/lib/card/card-actions', 'npm:material-ui@0.14.0/lib/card/card-header', 'npm:material-ui@0.14.0/lib/card/card-media', 'npm:material-ui@0.14.0/lib/card/card-title', 'npm:material-ui@0.14.0/lib/flat-button', 'npm:material-ui@0.14.0/lib/card/card-text'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Debug, Gab, Card, CardActions, CardHeader, CardMedia, CardTitle, FlatButton, CardText, debug, myCard;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_npmMaterialUi0140LibCardCard) {
			Card = _npmMaterialUi0140LibCardCard['default'];
		}, function (_npmMaterialUi0140LibCardCardActions) {
			CardActions = _npmMaterialUi0140LibCardCardActions['default'];
		}, function (_npmMaterialUi0140LibCardCardHeader) {
			CardHeader = _npmMaterialUi0140LibCardCardHeader['default'];
		}, function (_npmMaterialUi0140LibCardCardMedia) {
			CardMedia = _npmMaterialUi0140LibCardCardMedia['default'];
		}, function (_npmMaterialUi0140LibCardCardTitle) {
			CardTitle = _npmMaterialUi0140LibCardCardTitle['default'];
		}, function (_npmMaterialUi0140LibFlatButton) {
			FlatButton = _npmMaterialUi0140LibFlatButton['default'];
		}, function (_npmMaterialUi0140LibCardCardText) {
			CardText = _npmMaterialUi0140LibCardCardText['default'];
		}],
		execute: function () {
			'use strict';

			debug = Debug('epg:app:pages:component:card');

			myCard = (function (_React$Component) {
				_inherits(myCard, _React$Component);

				function myCard(props) {
					_classCallCheck(this, myCard);

					_get(Object.getPrototypeOf(myCard.prototype), 'constructor', this).call(this, props);
					this.displayName = 'Card Component';
					this.state = {
						html: props.children || props.html || React.createElement('span', null)
					};
					this._update = false;
					//debug('Card');
				}

				_createClass(myCard, [{
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						debug('receiveProps');
						this.setState({ html: props.children || props.html });
						this._update = true;
					}
				}, {
					key: 'componentDidUpdate',
					value: function componentDidUpdate() {
						debug('didUpdate');
					}
				}, {
					key: 'componentDidMount',
					value: function componentDidMount() {
						debug('did mount');
					}
				}, {
					key: 'render',
					value: function render() {
						debug('any', this.state);
						var content = undefined;
						if ('function' === typeof this.state.html) {

							// render a component
							content = React.createElement(
								'div',
								null,
								' ',
								React.createElement(this.state.html, null),
								' '
							);
						} else if ('object' === typeof this.state.html) {

							// this is a rendered componenet
							content = React.createElement(
								'div',
								null,
								' ',
								this.state.html,
								' '
							);
						} else {
							debug('any leftover', this.state);
							// add anything else
							content = React.createElement('div', { dangerouslySetInnerHTML: { __html: this.state.html } });
						}
						return React.createElement(
							Card,
							null,
							React.createElement(CardTitle, { title: this.props.title, subtitle: this.props.subtitle }),
							React.createElement(
								CardActions,
								null,
								React.createElement(FlatButton, { label: 'Action1' }),
								React.createElement(FlatButton, { label: 'Action2' })
							),
							React.createElement(
								CardText,
								null,
								content
							)
						);
					}
				}]);

				return myCard;
			})(React.Component);

			_export('default', myCard);
		}
	};
});
System.register('app/common/gab.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'github:jspm/nodelibs-events@0.1.1'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, EventEmitter, Gab;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_githubJspmNodelibsEvents011) {
			EventEmitter = _githubJspmNodelibsEvents011.EventEmitter;
		}],
		execute: function () {
			'use strict';

			Gab = (function (_EventEmitter) {
				_inherits(Gab, _EventEmitter);

				function Gab(props) {
					_classCallCheck(this, Gab);

					_get(Object.getPrototypeOf(Gab.prototype), 'constructor', this).call(this, props);

					this.guideUpdates = [];
				}

				_createClass(Gab, [{
					key: 'reset',
					value: function reset() {
						this.guideUpdates = [];
					}
				}]);

				return Gab;
			})(EventEmitter);

			_export('default', new Gab());
		}
	};
});
System.register('app/common/utils.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:babel-runtime@5.8.34/helpers/define-property', 'npm:babel-runtime@5.8.34/helpers/extends', 'npm:babel-runtime@5.8.34/helpers/object-without-properties', 'npm:babel-runtime@5.8.34/core-js/object/keys', 'npm:react-progress-button@3.0.0', 'npm:react@0.14.5', 'npm:fixed-data-table@0.6.0', 'npm:material-ui@0.14.0/lib', 'npm:moment@2.11.1', 'npm:debug@2.2.0'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, _defineProperty, _extends, _objectWithoutProperties, _Object$keys, ProgressButton, React, Cell, Styles, Checkbox, FontIcon, IconButton, moment, debugging, debug, Button, iButton, clickButton, pickIcon, setChannelKey, DateCell, ImageCell, LinkCell, TextCell, isTimeInGuideData, GenreColors, selectGenreColor, ProgramCell, ChannelCell, ChannelCheckbox;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmBabelRuntime5834HelpersDefineProperty) {
			_defineProperty = _npmBabelRuntime5834HelpersDefineProperty['default'];
		}, function (_npmBabelRuntime5834HelpersExtends) {
			_extends = _npmBabelRuntime5834HelpersExtends['default'];
		}, function (_npmBabelRuntime5834HelpersObjectWithoutProperties) {
			_objectWithoutProperties = _npmBabelRuntime5834HelpersObjectWithoutProperties['default'];
		}, function (_npmBabelRuntime5834CoreJsObjectKeys) {
			_Object$keys = _npmBabelRuntime5834CoreJsObjectKeys['default'];
		}, function (_npmReactProgressButton300) {
			ProgressButton = _npmReactProgressButton300['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmFixedDataTable060) {
			Cell = _npmFixedDataTable060.Cell;
		}, function (_npmMaterialUi0140Lib) {
			Styles = _npmMaterialUi0140Lib.Styles;
			Checkbox = _npmMaterialUi0140Lib.Checkbox;
			FontIcon = _npmMaterialUi0140Lib.FontIcon;
			IconButton = _npmMaterialUi0140Lib.IconButton;
		}, function (_npmMoment2111) {
			moment = _npmMoment2111['default'];
		}, function (_npmDebug220) {
			debugging = _npmDebug220['default'];
		}],
		execute: function () {
			'use strict';

			debug = debugging('epg:app:common:utils');
			Button = ProgressButton;

			_export('Button', Button);

			iButton = (function (_React$Component) {
				_inherits(iButton, _React$Component);

				function iButton(props) {
					_classCallCheck(this, iButton);

					_get(Object.getPrototypeOf(iButton.prototype), 'constructor', this).call(this, props);
				}

				_createClass(iButton, [{
					key: 'render',
					value: function render() {
						debug('render iconButton');
						return React.createElement(
							IconButton,
							{ onClick: this.props.clickOn },
							React.createElement(
								FontIcon,
								this.props,
								this.props.dataIcon
							)
						);
					}
				}]);

				return iButton;
			})(React.Component);

			_export('iButton', iButton);

			clickButton = function clickButton(onClick, opts) {
				return React.createElement(
					FontIcon,
					_extends({ onClick: onClick }, opts),
					opts.dataIcon
				);
			};

			_export('clickButton', clickButton);

			pickIcon = function pickIcon(text) {
				if (text.toLowerCase() === 'cable') {
					return 'tv';
				} else if (text.toLowerCase() === 'satellite') {
					return 'satellite';
				} else if (text.toLowerCase() === 'antenna') {
					return 'settings_input_antenna';
				} else {
					return 'tv';
				}
			};

			_export('pickIcon', pickIcon);

			setChannelKey = function setChannelKey(v) {
				if (!v || typeof v !== 'object') {
					return 'undefined';
				}
				if (v.atscMajor) {
					return v.atscMajor + '-' + v.atscMinor;
				}
				if (v.channel) {
					return v.channel;
				}
				if (v.frequencyHz && v.serviceID) {
					return v.serviceID;
				}
				if (v.uhfVhf) {
					return v.uhfVhf;
				}

				debug('no channel', v);
				return false;
			};

			_export('setChannelKey', setChannelKey);

			DateCell = function DateCell(_ref) {
				var rowIndex = _ref.rowIndex;
				var data = _ref.data;
				var col = _ref.col;

				var props = _objectWithoutProperties(_ref, ['rowIndex', 'data', 'col']);

				var val = data[rowIndex][col];
				return React.createElement(
					Cell,
					props,
					val
				);
			};

			_export('DateCell', DateCell);

			ImageCell = function ImageCell(_ref2) {
				var rowIndex = _ref2.rowIndex;
				var data = _ref2.data;
				var col = _ref2.col;
				var _ref2$backgroundColor = _ref2.backgroundColor;
				var backgroundColor = _ref2$backgroundColor === undefined ? 'white' : _ref2$backgroundColor;

				var props = _objectWithoutProperties(_ref2, ['rowIndex', 'data', 'col', 'backgroundColor']);

				var val = data[rowIndex][col];
				var logo = React.createElement(
					'div',
					{ style: { backgroundColor: backgroundColor, width: '100%', height: '100%' } },
					React.createElement(
						FontIcon,
						{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.greenA200 },
						'tv'
					)
				);
				if (val) {
					logo = React.createElement('div', { style: { backgroundColor: backgroundColor, width: '100%', height: '100%', backgroundSize: 'contain', backgroundImage: 'url(' + val.URL + ')', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' } });
				}
				return logo;
			};

			_export('ImageCell', ImageCell);

			LinkCell = function LinkCell(_ref3) {
				var rowIndex = _ref3.rowIndex;
				var data = _ref3.data;
				var col = _ref3.col;

				var props = _objectWithoutProperties(_ref3, ['rowIndex', 'data', 'col']);

				var val = data[rowIndex][col];
				return React.createElement(
					Cell,
					props,
					React.createElement(
						'a',
						{ href: '#' },
						val
					)
				);
			};

			_export('LinkCell', LinkCell);

			TextCell = function TextCell(_ref4) {
				var rowIndex = _ref4.rowIndex;
				var data = _ref4.data;
				var col = _ref4.col;

				var props = _objectWithoutProperties(_ref4, ['rowIndex', 'data', 'col']);

				var val = undefined;

				if (col === 'hd') {
					var search = data[rowIndex].name ? data[rowIndex].name : data[rowIndex].callsign ? data[rowIndex].callsign : 'sd';
					val = search.toLowerCase().search('hd') > -1 ? 'HD' : search.toLowerCase().search('dt') > -1 ? 'HD' : 'SD';
				} else {
					val = data[rowIndex][col];
				}

				return React.createElement(
					Cell,
					props,
					val
				);
			};

			_export('TextCell', TextCell);

			isTimeInGuideData = function isTimeInGuideData(station, time, splits, zero) {
				var first = zero === 0;
				var ret = [];

				if (station[time]) {
					// add an exact match
					ret.push(station[time]);
				} else if (first) {
					// this is the first item and it does not begin at the start of our guide
					var keys = _Object$keys(station);
					keys.push(time);
					var findBefore = keys.sort().indexOf(time) - 1;

					var found = station[keys[findBefore]];
					//debug('first item not exact', keys, findBefore, found);
					if (found === Object(found)) {
						ret.push(found);
					}
				}

				var _b = time;
				var _e = moment(time).add(splits, 'minutes').valueOf();

				for (var day in station) {
					if (day < _e && day >= _b) {
						ret.push(station[day]);
					}
				}

				return ret;
			};

			_export('isTimeInGuideData', isTimeInGuideData);

			GenreColors = {
				'action': '#FA7519',
				'adventure': '#0C9244',
				'drama': '#680C92',
				'sports': '#F44503',
				'news': '#2B1108',
				'comedy': '#18D5E0',
				'horror': '#370A26',
				'default': '',
				'educational': '#16D546',
				'children': '#161ED5',
				'animated': '#6164A6'
			};

			_export('GenreColors', GenreColors);

			selectGenreColor = function selectGenreColor(genre) {
				genre = genre.toLowerCase();
				var keys = _Object$keys(GenreColors);
				var index = keys.indexOf(genre);
				if (GenreColors[keys[index]]) {
					return GenreColors[keys[index]];
				} else {
					return GenreColors['default'];
				}
			};

			_export('selectGenreColor', selectGenreColor);

			ProgramCell = function ProgramCell(_ref5) {
				var rowIndex = _ref5.rowIndex;
				var data = _ref5.data;
				var guide = _ref5.guide;
				var time = _ref5.time;
				var zero = _ref5.zero;
				var splits = _ref5.splits;
				var click = _ref5.click;

				var props = _objectWithoutProperties(_ref5, ['rowIndex', 'data', 'guide', 'time', 'zero', 'splits', 'click']);

				var val = data[rowIndex].stationID;
				var text = undefined;
				var marginLeft = 0;
				var width = props.width;
				var position = 'fixed';
				var zIndex = 20;
				var display = 'block';
				var final = [];
				//debug('val',val, data[rowIndex]);
				var programs = !guide[val] ? [] : isTimeInGuideData(guide[val], time, splits, zero);

				for (var i = 0; i < programs.length; i++) {

					var info = programs[i];

					var airTime = moment(info.airDateTime);

					var backgroundColor = GenreColors['default'];
					if (Array.isArray(info.genres)) {
						info.genre.forEach(function (genre) {
							backgroundColor = selectGenreColor(genre);
						});
					}

					width = info.duration / 12;
					if (zero === 0 && time > airTime.valueOf()) {
						var t1 = (time - airTime.valueOf()) / 1000;
						var t2 = info.duration - t1;
						width = t2 / 12;
					}

					// figure out if we move left
					if (airTime.valueOf() > time) {
						// 12 is a number that Maths correlates to 150px per splits(30)
						marginLeft = (airTime.valueOf() - time) / 1000 / 12;
					}
					var description = undefined;
					if (info.descriptions === Object(info.descriptions)) {
						description = info.descriptions;
					} else {
						description = {};
					}

					var dd = React.createElement(
						'span',
						{ style: { color: '#999', fontSize: '11px' } },
						airTime.format('LT'),
						' till ',
						airTime.add(info.duration, 'seconds').format('LT')
					);

					text = React.createElement(
						'div',
						null,
						React.createElement(
							'span',
							{ style: { color: '#F4AA30' } },
							Array.isArray(info.titles) ? info.titles[0].title120 : 'no title',
							' '
						),
						React.createElement('br', null),
						dd,
						' ',
						React.createElement('br', null),
						React.createElement(
							'span',
							{ style: { color: '#FBDCB4', fontSize: '11px' } },
							description.short
						)
					);

					final.push(React.createElement(
						Cell,
						{ onClick: click, key: i + '-' + val + '-' + airTime.valueOf() + '-' + info.programID, width: width, className: 'epg__timeSlot click', style: { backgroundColor: backgroundColor, marginLeft: marginLeft, width: width, display: display, position: position, zIndex: zIndex } },
						text
					));
				}
				if (!programs.length) {
					display = 'none';
				}
				return React.createElement(
					'div',
					null,
					final
				);
			};

			_export('ProgramCell', ProgramCell);

			ChannelCell = function ChannelCell(_ref6) {
				var rowIndex = _ref6.rowIndex;
				var data = _ref6.data;
				var col = _ref6.col;
				var _ref6$backgroundColor = _ref6.backgroundColor;
				var backgroundColor = _ref6$backgroundColor === undefined ? 'white' : _ref6$backgroundColor;
				var click = _ref6.click;

				var props = _objectWithoutProperties(_ref6, ['rowIndex', 'data', 'col', 'backgroundColor', 'click']);

				var val = data[rowIndex][col];
				var logo = React.createElement(
					'div',
					{ style: { backgroundColor: backgroundColor, width: '100%', height: '100%' } },
					React.createElement(
						FontIcon,
						{ className: 'material-icons', color: Styles.Colors.amber600, hoverColor: Styles.Colors.red200 },
						'tv'
					)
				);
				if (val) {
					logo = React.createElement('div', { onClick: click, className: 'logo ', style: { backgroundImage: 'url(' + val.URL + ')' } });
				}
				return React.createElement(
					'div',
					{ className: 'epg__channelSlot logo', style: { width: '100%', height: '100%' } },
					logo,
					React.createElement(
						'div',
						{ className: 'text' },
						data[rowIndex].channel
					)
				);
			};

			_export('ChannelCell', ChannelCell);

			ChannelCheckbox = function ChannelCheckbox(_ref7) {
				var rowIndex = _ref7.rowIndex;
				var data = _ref7.data;
				var col = _ref7.col;

				var props = _objectWithoutProperties(_ref7, ['rowIndex', 'data', 'col']);

				// for channels only		
				var val = !!data[rowIndex][col];

				return React.createElement(
					Cell,
					_extends({}, props, { style: { textAlign: 'center' } }),
					React.createElement(Checkbox, {
						name: col + rowIndex,
						value: "" + val,
						defaultChecked: val,
						checkedIcon: React.createElement(
							FontIcon,
							{ className: 'material-icons', color: Styles.Colors.green400 },
							'visibility'
						),
						unCheckedIcon: React.createElement(
							FontIcon,
							{ className: 'material-icons', color: Styles.Colors.grey300 },
							'visibility'
						),
						onCheck: function (e) {
							debug('update ', props.source, data[rowIndex]);
							// we cheat here and mutate the state object...
							// our update listener should fix the state quickly
							data[rowIndex][col] = !val;
							props.sockets['update' + props.source](data[rowIndex], _defineProperty({}, col, !val));
						}
					})
				);
			};

			_export('ChannelCheckbox', ChannelCheckbox);
		}
	};
});
System.register('app/pages/404.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:react@0.14.5', 'npm:debug@2.2.0', 'app/common/gab.js', 'app/common/utils.js', 'npm:material-ui@0.14.0/lib', 'npm:react-bootstrap@0.28.1'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Debug, Gab, pickIcon, Divider, FontIcon, Styles, CardText, Card, CardActions, CardHeader, CardMedia, CardTitle, Col, debug, Disconnect;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_appCommonUtilsJs) {
			pickIcon = _appCommonUtilsJs.pickIcon;
		}, function (_npmMaterialUi0140Lib) {
			Divider = _npmMaterialUi0140Lib.Divider;
			FontIcon = _npmMaterialUi0140Lib.FontIcon;
			Styles = _npmMaterialUi0140Lib.Styles;
			CardText = _npmMaterialUi0140Lib.CardText;
			Card = _npmMaterialUi0140Lib.Card;
			CardActions = _npmMaterialUi0140Lib.CardActions;
			CardHeader = _npmMaterialUi0140Lib.CardHeader;
			CardMedia = _npmMaterialUi0140Lib.CardMedia;
			CardTitle = _npmMaterialUi0140Lib.CardTitle;
		}, function (_npmReactBootstrap0281) {
			Col = _npmReactBootstrap0281.Col;
		}],
		execute: function () {
			'use strict';

			debug = Debug('epg:app:pages:disconnect');

			Disconnect = (function (_React$Component) {
				_inherits(Disconnect, _React$Component);

				function Disconnect(props) {
					_classCallCheck(this, Disconnect);

					_get(Object.getPrototypeOf(Disconnect.prototype), 'constructor', this).call(this, props);
					this.displayName = 'Disconnect Component';
					this.state = {};
					this._update = false;
				}

				_createClass(Disconnect, [{
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						debug('receiveProps');
						this._update = true;
					}
				}, {
					key: 'componentDidUpdate',
					value: function componentDidUpdate() {
						debug('didUpdate');
					}
				}, {
					key: 'componentDidMount',
					value: function componentDidMount() {
						debug('did mount');
					}
				}, {
					key: 'render',
					value: function render() {
						debug('disconnect render', this.state, this.props);

						return React.createElement(
							Col,
							{ xs: 12, md: 8, mdOffset: 2, lg: 6, lgOffset: 3 },
							React.createElement(
								Card,
								null,
								React.createElement(CardTitle, {
									title: "404",
									subtitle: "The requested headend could not be found",
									titleColor: Styles.Colors.red600,
									subtitleColor: Styles.Colors.grey500
								}),
								React.createElement(
									CardText,
									{ style: { padding: 0, height: 300, textAlign: 'center', paddingTop: 20 } },
									React.createElement(
										'div',
										{ className: '', style: { color: Styles.Colors.grey600, fontSize: '76px', padding: 0, height: 100, paddingTop: 0, paddingBottom: 30 } },
										React.createElement(
											FontIcon,
											{ style: { fontSize: '128px' }, className: 'material-icons', color: Styles.Colors.red600, hoverColor: Styles.Colors.amber500 },
											'error'
										)
									),
									React.createElement('div', { style: { marginBottom: 30 } }),
									React.createElement(
										'p',
										null,
										'The page or lineup you requested is not valid.'
									),
									React.createElement(
										'p',
										null,
										React.createElement(
											'a',
											{ href: '#', onClick: function (e) {
													e.preventDefault();window.history.back();
												} },
											'Previous Page'
										)
									)
								)
							)
						);
					}
				}]);

				return Disconnect;
			})(React.Component);

			_export('default', Disconnect);
		}
	};
});
System.register('app/routes.js', ['app/pages/home.js', 'app/pages/settings.js', 'app/pages/disconnect.js', 'app/pages/guide.js', 'app/pages/status.js', 'app/pages/component/card.js', 'npm:lodash@3.10.1', 'npm:debug@2.2.0', 'app/pages/404.js'], function (_export) {
	'use strict';

	var Home, Settings, Disconnect, Guide, Status, Card, isObject, Debug, fourofour, debug, routes, routeConfig;
	return {
		setters: [function (_appPagesHomeJs) {
			Home = _appPagesHomeJs['default'];
		}, function (_appPagesSettingsJs) {
			Settings = _appPagesSettingsJs['default'];
		}, function (_appPagesDisconnectJs) {
			Disconnect = _appPagesDisconnectJs['default'];
		}, function (_appPagesGuideJs) {
			Guide = _appPagesGuideJs['default'];
		}, function (_appPagesStatusJs) {
			Status = _appPagesStatusJs['default'];
		}, function (_appPagesComponentCardJs) {
			Card = _appPagesComponentCardJs['default'];
		}, function (_npmLodash3101) {
			isObject = _npmLodash3101.isObject;
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appPages404Js) {
			fourofour = _appPages404Js['default'];
		}],
		execute: function () {
			debug = Debug('epg:app:routes');
			routes = {
				'add-lineup': Settings.Index,
				lineup: Settings.lineup,
				guide: Settings.lineup,
				disconnected: Disconnect,
				status: Status,
				settings: Home,
				guide: Guide,
				redirect: {
					add: 'add-lineup',
					home: 'settings'
				}
			};

			routes['404'] = fourofour;

			routeConfig = function routeConfig(route, child) {
				debug(route, child, isObject(routes[route]));
				if (routes[route]) {
					if (isObject(routes[route]) && 'function' !== typeof routes[route]) {
						if (routes[route][child]) {
							return routes[route][child];
						} else {
							return routes['404'];
						}
					} else {
						return routes[route];
					}
				} else if (routes.redirect[route]) {
					return routes[routes.redirect[route]];
				} else {
					return routes['404'];
				}
			};

			_export('default', routeConfig);
		}
	};
});
System.register('app/common/alert.js', ['npm:react@0.14.5', 'npm:react-bootstrap@0.28.1', 'npm:lodash@3.10.1', 'npm:debug@2.2.0'], function (_export) {
	'use strict';

	var React, Alert, Button, _, debugging, debug, Alerter, Alerts;

	return {
		setters: [function (_npmReact0145) {
			React = _npmReact0145['default'];
		}, function (_npmReactBootstrap0281) {
			Alert = _npmReactBootstrap0281.Alert;
			Button = _npmReactBootstrap0281.Button;
		}, function (_npmLodash3101) {
			_ = _npmLodash3101['default'];
		}, function (_npmDebug220) {
			debugging = _npmDebug220['default'];
		}],
		execute: function () {
			debug = debugging('epg:client:common:alert');
			Alerter = Alert;
			Alerts = React.createClass({
				displayName: 'Alerts',

				getInitialState: function getInitialState() {
					return {
						alertVisible: true
					};
				},
				getDefaultProps: function getDefaultProps() {
					return {
						style: 'danger',
						html: 'error with the alert.  This is placeholder text.',
						dismiss: false,
						data: false
					};
				},
				componentDidMount: function componentDidMount() {
					//this.getStreams();
				},
				componentWillMount: function componentWillMount() {},
				componentWillReceiveProps: function componentWillReceiveProps(props) {
					//debug('receive props',props)
					/*
     	*/
					return false;
				},
				renderError: function renderError(data) {
					try {
						var myerror = JSON.stringify(data.error, null, 4);
						var myrequest = JSON.stringify(data.received, null, 4);
					} catch (e) {
						var myerror = 'I encountered an error. Please check the console for the error object';
						var myrequest = '';
						debug(data);
					}
					var senderror = React.createElement(
						'div',
						null,
						React.createElement(
							'div',
							null,
							'ERROR'
						),
						React.createElement(
							'pre',
							null,
							myerror
						),
						React.createElement(
							'div',
							null,
							'REQUEST'
						),
						React.createElement(
							'pre',
							null,
							myrequest
						)
					);
					return senderror;
				},
				renderSuccess: function renderSuccess(data) {
					return data;
				},
				renderHTML: function renderHTML() {
					if (this.props.data) {
						if (this.props.data.error) {
							return this.renderError(this.props.data);
						}
						return this.renderSuccess(this.props.data);
					} else if (this.props.component) {
						return this.props.component;
					} else {
						return React.createElement('div', { dangerouslySetInnerHTML: { __html: this.props.html } });
					}
				},
				render: function render() {
					if (this.state.alertVisible) {
						return React.createElement(
							Alerter,
							{ bsStyle: this.props.style, onDismiss: this.handleAlertDismiss },
							this.renderHTML(),
							React.createElement('div', { className: 'clearfix' })
						);
					}

					return React.createElement('span', null);
				},

				handleAlertDismiss: function handleAlertDismiss() {
					this.setState({ alertVisible: false });
					if (_.isFunction(this.props.dismiss)) {
						this.props.dismiss();
					}
				},

				handleAlertShow: function handleAlertShow() {
					this.setState({ alertVisible: true });
				}

			});

			_export('default', Alerts);
		}
	};
});
System.register('app/render.js', ['npm:babel-runtime@5.8.34/helpers/get', 'npm:babel-runtime@5.8.34/helpers/inherits', 'npm:babel-runtime@5.8.34/helpers/create-class', 'npm:babel-runtime@5.8.34/helpers/class-call-check', 'npm:babel-runtime@5.8.34/helpers/extends', 'npm:babel-runtime@5.8.34/helpers/define-property', 'npm:babel-runtime@5.8.34/core-js/object/assign', 'npm:react@0.14.5', 'npm:react-dom@0.14.5', 'github:jspm/nodelibs-path@0.1.0', 'npm:react-bootstrap@0.28.1', 'app/listen.js', 'npm:debug@2.2.0', 'app/common/gab.js', 'app/common/utils.js', 'app/common/components/snackbar.js', 'app/common/components/confirm.js', 'app/pages/component/any.js', 'app/routes.js', 'npm:material-ui@0.14.0/lib', 'npm:react-tap-event-plugin@0.2.1', 'app/common/alert.js'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, _extends, _defineProperty, _Object$assign, React, Component, ReactDOM, Path, Col, wrapListeners, Debug, Gab, pickIcon, Snackbar, Confirm, Any, routes, FontIcon, IconButton, AppBar, RaisedButton, LeftNav, MenuItem, Styles, Divider, List, ListItem, injectTapEventPlugin, Alert, debug, myStyles, myStylesLight, Main;

	return {
		setters: [function (_npmBabelRuntime5834HelpersGet) {
			_get = _npmBabelRuntime5834HelpersGet['default'];
		}, function (_npmBabelRuntime5834HelpersInherits) {
			_inherits = _npmBabelRuntime5834HelpersInherits['default'];
		}, function (_npmBabelRuntime5834HelpersCreateClass) {
			_createClass = _npmBabelRuntime5834HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5834HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5834HelpersClassCallCheck['default'];
		}, function (_npmBabelRuntime5834HelpersExtends) {
			_extends = _npmBabelRuntime5834HelpersExtends['default'];
		}, function (_npmBabelRuntime5834HelpersDefineProperty) {
			_defineProperty = _npmBabelRuntime5834HelpersDefineProperty['default'];
		}, function (_npmBabelRuntime5834CoreJsObjectAssign) {
			_Object$assign = _npmBabelRuntime5834CoreJsObjectAssign['default'];
		}, function (_npmReact0145) {
			React = _npmReact0145['default'];
			Component = _npmReact0145.Component;
		}, function (_npmReactDom0145) {
			ReactDOM = _npmReactDom0145['default'];
		}, function (_githubJspmNodelibsPath010) {
			Path = _githubJspmNodelibsPath010['default'];
		}, function (_npmReactBootstrap0281) {
			Col = _npmReactBootstrap0281.Col;
		}, function (_appListenJs) {
			wrapListeners = _appListenJs['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_appCommonUtilsJs) {
			pickIcon = _appCommonUtilsJs.pickIcon;
		}, function (_appCommonComponentsSnackbarJs) {
			Snackbar = _appCommonComponentsSnackbarJs['default'];
		}, function (_appCommonComponentsConfirmJs) {
			Confirm = _appCommonComponentsConfirmJs['default'];
		}, function (_appPagesComponentAnyJs) {
			Any = _appPagesComponentAnyJs['default'];
		}, function (_appRoutesJs) {
			routes = _appRoutesJs['default'];
		}, function (_npmMaterialUi0140Lib) {
			FontIcon = _npmMaterialUi0140Lib.FontIcon;
			IconButton = _npmMaterialUi0140Lib.IconButton;
			AppBar = _npmMaterialUi0140Lib.AppBar;
			RaisedButton = _npmMaterialUi0140Lib.RaisedButton;
			LeftNav = _npmMaterialUi0140Lib.LeftNav;
			MenuItem = _npmMaterialUi0140Lib.MenuItem;
			Styles = _npmMaterialUi0140Lib.Styles;
			Divider = _npmMaterialUi0140Lib.Divider;
			List = _npmMaterialUi0140Lib.List;
			ListItem = _npmMaterialUi0140Lib.ListItem;
		}, function (_npmReactTapEventPlugin021) {
			injectTapEventPlugin = _npmReactTapEventPlugin021['default'];
		}, function (_appCommonAlertJs) {
			Alert = _appCommonAlertJs['default'];
		}],
		execute: function () {

			//Needed for onTouchTap
			//Can go away when react 1.0 release
			//Check this repo:
			//https://github.com/zilverline/react-tap-event-plugin
			'use strict';

			injectTapEventPlugin();

			debug = Debug('epg:app:render');

			debug('dark raw theme', Styles.DarkRawTheme);
			debug('dark  base theme', Styles.darkBaseTheme);

			myStyles = {
				primary1Color: '#223E77',
				textColor: Styles.Colors.blue100,
				alternateTextColor: Styles.Colors.lightBlue50,
				primary2Color: '#3B71E2',
				canvasColor: '#303234',
				accent1Color: "#FF6040",
				accent2Color: "#F5001E",
				accent3Color: "#FA905C",
				disabledColor: Styles.Colors.grey600
			};
			myStylesLight = {
				primary1Color: 'initial',
				primary2Color: Styles.Colors.lightBlue700,
				textColor: Styles.Colors.grey700,
				accent1Color: Styles.Colors.deepOrange700,
				accent2Color: Styles.Colors.deepOrange500,
				accent3Color: Styles.Colors.lightBlack
			};

			Main = (function (_Component) {
				_inherits(Main, _Component);

				function Main(props) {
					_classCallCheck(this, Main);

					// we get props from Listener
					_get(Object.getPrototypeOf(Main.prototype), 'constructor', this).call(this, props);

					debug(props, 'location', location);

					this.state = _Object$assign({
						leftNav: false,
						theme: Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme), myStylesLight),
						//theme: Styles.ThemeManager.getMuiTheme(Styles.DarkRawTheme),
						//theme: Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme),
						query: location.search,
						location: _extends({}, location),
						current: {},
						newalert: {},
						newconfirm: {
							open: false
						},
						status: {
							lineups: [],
							account: {
								maxLineups: 4
							},
							notifications: []
						},
						lineups: {
							lineups: []
						},
						headends: {}
					}, props);

					debug('fresh state', this.state);

					this.handleLeftNav = this.handleLeftNav.bind(this);
					this.LeftNavClose = this.LeftNavClose.bind(this);
					this.goTo = this.goTo.bind(this);
					this.setAsset = this.setAsset.bind(this);
					this.dismissAlert = this.dismissAlert.bind(this);
					this.answerConfirm = this.answerConfirm.bind(this);
					this.lineupRemove = this.lineupRemove.bind(this);
					this.lineupAdd = this.lineupAdd.bind(this);
					this.getLineups = this.getLineups.bind(this);
					this.showAlert = this.showAlert.bind(this);
				}

				_createClass(Main, [{
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						// update from listener
						debug('listener props', props);
						this.setState(props);
					}
				}, {
					key: 'showAlert',
					value: function showAlert(style, message) {
						var _newalert;

						var type = arguments.length <= 2 || arguments[2] === undefined ? 'html' : arguments[2];

						this.setState({
							newalert: (_newalert = {
								show: true
							}, _defineProperty(_newalert, type, message), _defineProperty(_newalert, 'style', style), _newalert)
						});
					}
				}, {
					key: 'getLineups',
					value: function getLineups(e) {
						if (e && typeof e.preventDefault === 'function') {
							e.preventDefault();
						}
						this.state.sockets.lineups(this.props.lineupListener);
					}
				}, {
					key: 'getChildContext',
					value: function getChildContext() {
						return {
							muiTheme: this.state.theme
						};
					}
				}, {
					key: 'handleLeftNav',
					value: function handleLeftNav(e) {
						if (e && typeof e.preventDefault === 'function') {
							e.preventDefault();
						}
						this.setState({ leftNav: !this.state.leftNav });
					}
				}, {
					key: 'LeftNavClose',
					value: function LeftNavClose() {
						this.setState({ leftNav: false });
					}
				}, {
					key: 'goTo',
					value: function goTo(state) {
						var _this = this;

						var legacyChild = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
						var legacyLineup = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

						debug('goTo state', state);

						if (typeof state === 'string') {
							// accept strings for the page
							state = {
								page: state,
								child: legacyChild,
								lineup: legacyLineup
							};
						}

						var _defaults = {
							leftNav: false,
							child: '',
							current: {},
							location: location,
							lineup: '',
							query: ''
						};

						this.setState(_Object$assign(_defaults, state), function () {
							debug('push history', '/', _this.state.page, _this.state.child, _this.state.lineup);
							_this.state.history.push({
								pathname: Path.join('/', _this.state.page, _this.state.child, _this.state.lineup),
								search: _this.state.query,
								state: {
									page: _this.state.page,
									current: _this.state.current,
									child: _this.state.child,
									lineup: _this.state.lineup
								}
							});
						});
					}
				}, {
					key: 'setAsset',
					value: function setAsset(asset, callback) {
						this.setState(asset, callback);
					}
				}, {
					key: 'dismissAlert',
					value: function dismissAlert() {
						this.setState({
							newalert: {
								show: false
							}
						});
					}
				}, {
					key: 'dismissConfirm',
					value: function dismissConfirm() {
						this.setState({
							newconfirm: {
								show: false
							}
						});
					}
				}, {
					key: 'lineupRemove',
					value: function lineupRemove(lineup) {
						this.setState({
							newconfirm: {
								open: true,
								html: 'Are you sure you want to delete ' + lineup.name + '?  You will lose your saved channels!'
							},
							answerConfirm: lineup,
							answerMethod: 'lineupRemoveForReal'
						});
					}
				}, {
					key: 'answerConfirm',
					value: function answerConfirm(success) {
						if (success) {
							this[this.state.answerMethod](this.state.answerConfirm);
						}
						this.setState({
							newconfirm: {
								open: false
							},
							answerConfirm: false
						});
					}
				}, {
					key: 'lineupRemoveForReal',
					value: function lineupRemoveForReal(lineup) {
						var _this2 = this;

						debug('got lineupRemove', lineup.uri, this.state, 'props', this.props);

						this.state.sockets.lineupRemove(lineup.uri, function (data) {
							debug('got lineupRemove data', data);
							if (data.err) {
								_this2.setState({
									newalert: {
										style: 'danger',
										html: data.error.message,
										show: true
									}
								});
							} else {
								_this2.getLineups();
								var state = {
									newalert: {
										style: 'warning',
										html: 'Removed lineup ' + lineup.name + '.',
										show: true
									}
								};

								state.page = 'home';

								_this2.goTo(state);
							}
						});
					}
				}, {
					key: 'lineupAdd',
					value: function lineupAdd(lineup) {
						this.setState({
							newconfirm: {
								open: true,
								html: 'Are you sure you want to add lineup ' + lineup.name + ' - ' + lineup.lineup + '?',
								yesText: 'Add ' + lineup.name

							},
							answerConfirm: lineup,
							answerMethod: 'lineupAddForReal'
						});
					}
				}, {
					key: 'lineupAddForReal',
					value: function lineupAddForReal(lineup) {
						var _this3 = this;

						debug('got lineupAdd', lineup, this.state, 'props', this.props);

						this.state.sockets.lineupAdd(lineup, function (data) {
							debug('got lineupAdd data', data);
							if (data.error) {
								_this3.setState({
									newalert: {
										style: 'danger',
										html: data.error.message,
										show: true
									}
								});
								if (_this3.refs.manage) _this3.refs.manage.error();
							} else {
								if (_this3.refs.manage) _this3.refs.manage.success();
								_this3.getLineups();
								_this3.goTo({
									newalert: {
										style: 'success',
										html: 'Added lineup ' + lineup.lineup + '.  Now select some channels...',
										show: true
									},
									lineup: lineup.lineup,
									page: 'lineup'
								});
							}
						});
					}
				}, {
					key: 'render',
					value: function render() {
						var _this4 = this;

						debug('render state', this.state);

						var title = this.state.page;
						if (this.state.child) {
							switch (this.state.child) {
								case "settings":
									title = "Settings";
									break;
								case "index":
								case "add-lineup":
									title = 'Add Lineup';
									break;
								default:
									title = this.state.child;
							};
						}
						if (this.state.lineup && this.state.headends[this.state.lineup]) {
							title = this.state.headends[this.state.lineup].name;
						}

						var isConnected = this.state.sockets.io.connected !== false ? this.state.guideRefresh.download ? React.createElement(
							IconButton,
							{ onClick: function (e) {
									e.preventDefault();_this4.goTo('status');
								} },
							React.createElement(
								FontIcon,
								{ className: 'material-icons', style: { fontSize: '20px' }, color: Styles.Colors.deepPurple200, hoverColor: Styles.Colors.deepPurple200, title: "Downloading guide data for " + this.state.guideRefresh.who.join(', ') },
								'cloud_download'
							)
						) : React.createElement(
							IconButton,
							{ onClick: function (e) {
									e.preventDefault();_this4.goTo('status');
								} },
							React.createElement(
								FontIcon,
								{ className: 'material-icons', style: { fontSize: '20px' }, color: Styles.Colors.green600, hoverColor: Styles.Colors.lightBlue300, title: 'Connection established. View status' },
								'cloud_done'
							)
						) : React.createElement(
							'span',
							null,
							React.createElement(
								IconButton,
								{ onClick: function (e) {
										e.preventDefault();_this4.goTo('disconnected');
									} },
								React.createElement(
									FontIcon,
									{ className: 'material-icons', style: { fontSize: '20px' }, color: Styles.Colors.amber100, hoverColor: Styles.Colors.red900, title: 'Connection to server lost' },
									'cloud_off'
								)
							),
							' ',
							React.createElement(
								'span',
								{ style: { color: Styles.Colors.amber100, fontSize: '20px' } },
								'Connection Lost '
							)
						);

						var eRight = React.createElement(
							'span',
							null,
							React.createElement(
								IconButton,
								{ onClick: function (e) {
										e.preventDefault();_this4.goTo('home');
									} },
								React.createElement(
									FontIcon,
									{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.lightBlue300 },
									'home'
								)
							),
							React.createElement(
								IconButton,
								{ onClick: function (e) {
										e.preventDefault();_this4.goTo('add-lineup');
									} },
								React.createElement(
									FontIcon,
									{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.lightBlue300 },
									'add_to_queue'
								)
							),
							isConnected
						);

						var appbar = this.state.page === 'guide' ? React.createElement('span', null) : React.createElement(
							'div',
							null,
							React.createElement(AppBar, {
								title: title,
								onLeftIconButtonTouchTap: this.handleLeftNav,
								iconElementRight: eRight,
								style: { boxShadow: 'none', position: 'fixed', background: this.state.sockets.io.connected ? '#26282D' : '#FF6F00' }
							}),
							React.createElement('div', { style: { height: 65, width: '100%' } })
						);

						var mylineups = this.state.lineups.lineups.map(function (v) {
							return React.createElement(ListItem, {
								key: v.lineup + '1',
								className: 'fixmenuleft',
								style: { fontSize: '12px', marginLeft: 0 },
								primaryText: v.name,
								secondaryText: React.createElement(
									'span',
									{ style: { fontSize: '11px' } },
									v.lineup
								),
								onClick: function (e) {
									e.preventDefault(e);
									_this4.goTo({
										page: 'guide',
										lineup: v.lineup,
										current: v,
										newalert: {
											show: true,
											html: 'Manage ' + v.name,
											style: 'info',
											duration: 2500
										}
									});
								}
							});
						});

						var menu = React.createElement(
							LeftNav,
							{
								docked: false,
								open: this.state.leftNav,
								width: 255,
								onRequestChange: function (open) {
									debug('request change', open, _this4.state);
									_this4.setState({
										leftNav: open
									});
								}
							},
							React.createElement(
								List,
								null,
								React.createElement(ListItem, {
									primaryText: 'My Guides',
									primaryTogglesNestedList: true,
									leftIcon: React.createElement(
										FontIcon,
										{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.greenA200 },
										'tv'
									),
									initiallyOpen: true,
									nestedItems: mylineups
								}),
								React.createElement(ListItem, { onTouchTap: function () {
										_this4.goTo('settings');
									}, primaryText: 'Settings', leftIcon: React.createElement(
										FontIcon,
										{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.greenA200 },
										'home'
									) }),
								React.createElement(ListItem, { onTouchTap: function () {
										_this4.goTo('add-lineup');
									}, primaryText: 'Add A Lineup', leftIcon: React.createElement(
										FontIcon,
										{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.greenA200 },
										'plus_one'
									) })
							)
						);

						var Page = routes(this.state.page, this.state.child);
						var colors = {
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
						var bodyStyle = {
							backgroundColor: colors[this.state.newalert.style] ? colors[this.state.newalert.style].bg : colors.info.bg,
							color: colors[this.state.newalert.style] ? colors[this.state.newalert.style].color : colors.info.color
						};

						return React.createElement(
							'div',
							null,
							appbar,
							menu,
							React.createElement('div', { className: 'clearfix' }),
							React.createElement(
								'div',
								{ className: 'epg-container' },
								React.createElement(
									'div',
									null,
									React.createElement(Page, _extends({}, this.state, { assets: this.setAsset, showAlert: this.showAlert, goTo: this.goTo, getLineups: this.getLineups, handleLeftNav: this.handleLeftNav, lineupAdd: this.lineupAdd, lineupRemove: this.lineupRemove }))
								)
							),
							React.createElement(Confirm, {
								html: this.state.newconfirm.html,
								title: this.state.newconfirm.title,
								answer: this.answerConfirm,
								open: this.state.newconfirm.open,
								yesText: this.state.newconfirm.yesText,
								noText: this.state.newconfirm.noText
							}),
							this.state.newalert.show ? React.createElement(Snackbar, {
								bodyStyle: bodyStyle,
								setParentState: this.setAsset,
								html: '<div style="color:' + bodyStyle.color + '">' + this.state.newalert.html + '</div>',
								data: this.state.newalert.data,
								component: this.state.newalert.component,
								open: this.state.newalert.show,
								autoHideDuration: this.state.newalert.duration >= 0 ? this.state.newalert.duration : 5000,
								onRequestClose: function () {
									_this4.setState({ newalert: { show: false } });
								}
							}) : ''
						);
					}
				}]);

				return Main;
			})(Component);

			Main.childContextTypes = {
				muiTheme: React.PropTypes.object
			};

			_export('default', wrapListeners(Main));
		}
	};
});
System.register('app/app.js', ['npm:react@0.14.5', 'npm:react-dom@0.14.5', 'app/render.js', 'npm:debug@2.2.0'], function (_export) {
  // end globals
  'use strict';

  var React, render, App, Debug;
  return {
    setters: [function (_npmReact0145) {
      React = _npmReact0145['default'];
    }, function (_npmReactDom0145) {
      render = _npmReactDom0145.render;
    }, function (_appRenderJs) {
      App = _appRenderJs['default'];
    }, function (_npmDebug220) {
      Debug = _npmDebug220['default'];
    }],
    execute: function () {

      window.myDebug = Debug;

      render(React.createElement(App, null), document.getElementById('epg'));
    }
  };
});
//# sourceMappingURL=client.js.map