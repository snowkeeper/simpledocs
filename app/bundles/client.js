System.register('app/lib/socketFunctions.js', ['npm:debug@2.2.0'], function (_export) {
	'use strict';

	var debugging, debug, randomNumber;

	function options() {

		var exports = {};

		exports.trapResponse = function (socket, callback) {

			var unique = randomNumber();

			socket.once(unique, callback);

			return unique;
		};
		exports.trap = exports.trapResponse;

		exports.page = function (page, search) {
			var nowTime = new Date().getTime();
			var newTime = new Date(nowTime + 10000).getTime();

			if (snowUI.watingForPage && snowUI.waitTimeout > nowTime) {
				console.warn('SOCKET not sent', snowUI.waitTimeout, nowTime);
				return false;
			}

			snowUI.watingForPage = true;
			snowUI.waitTimeout = newTime;

			if (page === snowUI.singlePage) {
				this.io.emit('allinone', page);
			} else if (page.search('search::') > -1) {
				this.io.emit('search', search);
			} else {
				this.io.emit('page', page);
			}
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
		setters: [function (_npmDebug220) {
			debugging = _npmDebug220['default'];
		}],
		execute: function () {
			debug = debugging('simpledocs:app:lib:socketFunctions');
			randomNumber = Math.random;

			_export('default', options);
		}
	};
});
System.register('app/lib/sockets.js', ['npm:lodash@3.10.1', 'npm:debug@2.2.0', 'app/lib/socketFunctions.js', 'github:socketio/socket.io-client@1.4.5', 'app/common/gab.js'], function (_export) {
	'use strict';

	var extend, isFunction, isObject, debugging, SF, io, Gab, debug, Sockets;
	return {
		setters: [function (_npmLodash3101) {
			extend = _npmLodash3101.extend;
			isFunction = _npmLodash3101.isFunction;
			isObject = _npmLodash3101.isObject;
		}, function (_npmDebug220) {
			debugging = _npmDebug220['default'];
		}, function (_appLibSocketFunctionsJs) {
			SF = _appLibSocketFunctionsJs['default'];
		}, function (_githubSocketioSocketIoClient145) {
			io = _githubSocketioSocketIoClient145['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}],
		execute: function () {
			debug = debugging('simpledocs:app:lib:sockets');

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

				this.io = io('//' + this.host + ':' + this.port + snowUI.namespace, { 'forceNew': true });
				this.auth = this.io;
				debug('reconnect open', this.auth);

				this.io.on('connect', function (data) {
					debug('open connected', snowUI.namespace);
					_this2.connected.open = true;
					_this2.connected.io = {
						get: function get() {
							this.io.socket.isConnected();
						}
					};
					if (isFunction(callback)) {
						callback(null, true);
					}
				});
				this.io.on('connect-error', function (err) {
					debug('auth connect-error', err);
				});
			};

			Sockets.prototype.init = function (opts, callback) {
				var _this3 = this;

				var _opts = {
					host: snowUI.host || '@',
					port: snowUI.port,
					namespace: snowUI.namespace
				};
				if (isFunction(opts)) {
					callback = opts;
					opts = _opts;
				}

				if (isObject(opts)) {
					opts = _opts;
				}

				this.port = opts.port;
				this.host = opts.host;

				var _this = this;

				// connection
				debug(snowUI);
				this.io = io('//' + this.host + ':' + this.port + snowUI.namespace, { 'forceNew': true });

				this.io.on('connect', function (data) {
					debug('io connected', snowUI.namespace);
					_this3.connected.open = true;
					_this3.connected.io = {
						get: function get() {
							this.io.socket.isConnected();
						}
					};

					if (isFunction(callback)) {
						callback(null, true);
					}
				});
				this.io.on('connect-error', function (err) {
					debug('io connect-error', err);
					if (isFunction(callback)) {
						callback(err);
					}
				});
			};

			extend(Sockets.prototype, SF());

			_export('default', new Sockets());
		}
	};
});
System.register('app/listen.js', ['npm:babel-runtime@5.8.35/helpers/get', 'npm:babel-runtime@5.8.35/helpers/inherits', 'npm:babel-runtime@5.8.35/helpers/create-class', 'npm:babel-runtime@5.8.35/helpers/class-call-check', 'npm:babel-runtime@5.8.35/helpers/extends', 'npm:react@0.14.7', 'npm:lodash@3.10.1', 'npm:debug@2.2.0', 'app/common/gab.js', 'app/lib/sockets.js', 'npm:history@1.17.0', 'github:jspm/nodelibs-path@0.1.0'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, _extends, React, isObject, isArray, Debug, Gab, Sockets, createHistory, useBasename, Path, debug, history;

	return {
		setters: [function (_npmBabelRuntime5835HelpersGet) {
			_get = _npmBabelRuntime5835HelpersGet['default'];
		}, function (_npmBabelRuntime5835HelpersInherits) {
			_inherits = _npmBabelRuntime5835HelpersInherits['default'];
		}, function (_npmBabelRuntime5835HelpersCreateClass) {
			_createClass = _npmBabelRuntime5835HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5835HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5835HelpersClassCallCheck['default'];
		}, function (_npmBabelRuntime5835HelpersExtends) {
			_extends = _npmBabelRuntime5835HelpersExtends['default'];
		}, function (_npmReact0147) {
			React = _npmReact0147['default'];
		}, function (_npmLodash3101) {
			isObject = _npmLodash3101.isObject;
			isArray = _npmLodash3101.isArray;
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
			'use strict';

			debug = Debug('simpledocs:app:listen');
			history = useBasename(createHistory)({
				basename: snowUI.path.material || 'simpledocs'
			});

			_export('default', function (Component) {
				var Listeners = (function (_React$Component) {
					_inherits(Listeners, _React$Component);

					function Listeners(props) {
						_classCallCheck(this, Listeners);

						_get(Object.getPrototypeOf(Listeners.prototype), 'constructor', this).call(this, props);
						this.displayName = 'Listeners';

						debug('listener', props);

						this.state = {
							sockets: Sockets,
							forceGrab: false,
							history: history,
							location: location,
							query: location.search,

							connected: false
						};

						snowUI.page = this.state.page;

						this._update = false;
						this._limiters = {};

						this.initiate();

						this.newState = this.newState.bind(this);
					}

					_createClass(Listeners, [{
						key: 'newState',
						value: function newState(state, cb) {
							this.setState(state, cb);
						}
					}, {
						key: 'pageResults',
						value: function pageResults(data) {
							snowUI.watingForPage = false;
							if (!data.success) {
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
									forceGrab: false
								});
							} else {
								this.setState({
									page: data.page.slug || snowUI.page,
									contents: data.page,
									forceGrab: false
								}, function () {
									/* run page js for new content */
									debug('##  RUN __mountedPage() js  ############');
									snowUI.code.__mountedPage();
								});

								if (isObject(data.menu)) {
									snowUI.menu = data.menu;
								}
								if (isArray(data.tree)) {
									snowUI.tree = data.tree;
								}
							}
						}
					}, {
						key: 'componentWillReceiveProps',
						value: function componentWillReceiveProps(props) {
							var clean = props.page;
							if (clean !== this.state.page) {
								this.setState({
									page: clean,
									prev: this.state.page
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
							//Sockets.io.removeAllListeners();
							snowUI.unstickyMenu();
							snowUI.code.__unmountUI();
						}
					}, {
						key: 'componentDidMount',
						value: function componentDidMount() {
							//this.onMount();
							this.onUpdate();
							snowUI.stickyMenu();
							// run user code
							snowUI.code.__mountedUI();
							debug('##  RUN __mountedUI js  ############');
						}
					}, {
						key: 'onUpdate',
						value: function onUpdate() {
							var thisComponent = this;
							this._update = false;
							debug('update listeners');
						}
					}, {
						key: 'initiate',
						value: function initiate() {
							var _this = this;

							debug('INITIATE SOCKERT LISTENERS');
							var thisComponent = this;

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

							// receive page from request
							Gab.on('request', function (data) {
								debug('got page request data', data);
								thisComponent.pageResults(data);
							});

							if (snowUI.usesockets) {
								Sockets.init(function () {
									debug('set heartbeat');
									// setup a 15 sec heartbeat for socket connection loss
									_this.heartbeat = setInterval(function () {
										//debug('heartbeat', Sockets.io.connected);
										if (!Sockets.io.connected && _this.state.connected) {
											debug('io connect-error');
											_this.setState({
												connected: false,
												newalert: {}
											});
										}
										if (Sockets.io.connected && !_this.state.connected) {
											debug('io connect');
											_this.setState({
												connected: true,
												newalert: {}
											});
										}
									}, 2500);

									// receive page from server
									Sockets.io.on('page', function (data) {
										debug('got page socket data', data);
										thisComponent.pageResults(data);
									});

									// listen for a server error event
									Sockets.io.on('error', function (data) {
										debug('received socket error event', data);
										_this.setState({
											newalert: {
												show: true,
												style: 'danger',
												html: data.error
											}
										});
									});
								});
							} // end socket init
						}
						// end initiate

					}, {
						key: 'render',
						value: function render() {
							// return React.cloneElement(Component, this.props)
							debug('render listeners state', this.state);
							return React.createElement(Component, _extends({}, this.props, this.state, { setState: this.newState }));
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
System.register('app/common/styles.js', ['npm:material-ui@0.14.4/lib'], function (_export) {
	'use strict';

	var Styles, myStyles, myStylesLight, myStylesDefault, myStylesDefaultDark;
	return {
		setters: [function (_npmMaterialUi0144Lib) {
			Styles = _npmMaterialUi0144Lib.Styles;
		}],
		execute: function () {
			myStyles = {
				primary1Color: '#223E77',
				textColor: Styles.Colors.blueGrey200,
				alternateTextColor: Styles.Colors.lightBlue50,
				primary2Color: '#3B71E2',
				canvasColor: '#303234',
				accent1Color: Styles.Colors.blueGrey50,
				accent2Color: Styles.Colors.blueGrey400,
				accent3Color: "#FA905C",
				disabledColor: Styles.Colors.grey600
			};

			_export('myStyles', myStyles);

			myStylesLight = {
				primary1Color: 'initial',
				primary2Color: Styles.Colors.lightBlue700,
				textColor: Styles.Colors.grey700,
				accent1Color: Styles.Colors.blueGrey50,
				accent2Color: Styles.Colors.blueGrey500,
				accent3Color: Styles.Colors.lightBlack
			};

			_export('myStylesLight', myStylesLight);

			myStylesDefault = {
				primary1Color: '#0C87C1'
			};

			_export('myStylesDefault', myStylesDefault);

			myStylesDefaultDark = {};

			_export('myStylesDefaultDark', myStylesDefaultDark);
		}
	};
});
System.register('app/common/components/snackbar.js', ['npm:babel-runtime@5.8.35/helpers/get', 'npm:babel-runtime@5.8.35/helpers/inherits', 'npm:babel-runtime@5.8.35/helpers/create-class', 'npm:babel-runtime@5.8.35/helpers/class-call-check', 'npm:react@0.14.7', 'npm:material-ui@0.14.4/lib/snackbar', 'npm:material-ui@0.14.4/lib/text-field', 'npm:material-ui@0.14.4/lib/raised-button', 'npm:debug@2.2.0'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Snackbar, TextField, RaisedButton, debugging, debug, SnackbarExampleSimple;

	return {
		setters: [function (_npmBabelRuntime5835HelpersGet) {
			_get = _npmBabelRuntime5835HelpersGet['default'];
		}, function (_npmBabelRuntime5835HelpersInherits) {
			_inherits = _npmBabelRuntime5835HelpersInherits['default'];
		}, function (_npmBabelRuntime5835HelpersCreateClass) {
			_createClass = _npmBabelRuntime5835HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5835HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5835HelpersClassCallCheck['default'];
		}, function (_npmReact0147) {
			React = _npmReact0147['default'];
		}, function (_npmMaterialUi0144LibSnackbar) {
			Snackbar = _npmMaterialUi0144LibSnackbar['default'];
		}, function (_npmMaterialUi0144LibTextField) {
			TextField = _npmMaterialUi0144LibTextField['default'];
		}, function (_npmMaterialUi0144LibRaisedButton) {
			RaisedButton = _npmMaterialUi0144LibRaisedButton['default'];
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
System.register('app/common/components/menu2.js', ['npm:babel-runtime@5.8.35/helpers/get', 'npm:babel-runtime@5.8.35/helpers/inherits', 'npm:babel-runtime@5.8.35/helpers/create-class', 'npm:babel-runtime@5.8.35/helpers/class-call-check', 'npm:react@0.14.7', 'npm:debug@2.2.0', 'npm:material-ui@0.14.4/lib'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Debug, LeftNav, debug, Menu;

	return {
		setters: [function (_npmBabelRuntime5835HelpersGet) {
			_get = _npmBabelRuntime5835HelpersGet['default'];
		}, function (_npmBabelRuntime5835HelpersInherits) {
			_inherits = _npmBabelRuntime5835HelpersInherits['default'];
		}, function (_npmBabelRuntime5835HelpersCreateClass) {
			_createClass = _npmBabelRuntime5835HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5835HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5835HelpersClassCallCheck['default'];
		}, function (_npmReact0147) {
			React = _npmReact0147['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_npmMaterialUi0144Lib) {
			LeftNav = _npmMaterialUi0144Lib.LeftNav;
		}],
		execute: function () {
			'use strict';

			debug = Debug('simpledocs:app:common:components:menu');

			Menu = (function (_React$Component) {
				_inherits(Menu, _React$Component);

				function Menu(props) {
					_classCallCheck(this, Menu);

					_get(Object.getPrototypeOf(Menu.prototype), 'constructor', this).call(this, props);
					this.displayName = 'Menu Component';
					this.state = {
						page: props.page,
						leftNav: props.leftNav
					};
					this._update = true;
				}

				_createClass(Menu, [{
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						debug("menu2 props", props);
						if (props.leftNav !== this.state.leftNav || props.update || this.state.page !== props.page) {
							this._update = true;
							this.setState({
								page: props.page,
								leftNav: props.leftNav
							});
							return;
						}
						if (props.allinone) {
							debug('allinone updatre menu');
							this._update = true;
						}
					}
				}, {
					key: 'shouldComponentUpdate',
					value: function shouldComponentUpdate() {
						debug('should update? ', this._update);
						if (this._update) {
							this._update = false;
							return true;
						}
						return false;
					}
				}, {
					key: 'render',
					value: function render() {
						var _this2 = this;

						debug('simple menu render', this.props);
						var _this = this;
						debug('simple menu tree', snowUI.tree);

						var page = this.props.anchor || this.props.page;

						var runTree = function runTree(slug, children) {
							/* run through the kids and see if one of them is active so we can show the kid links */
							if (Object.prototype.toString.call(children) === '[object Array]') {
								return children.reduce(function (runner, current) {
									//snowlog.log(current.slug,slug);
									if (runner) return runner;
									if (current.slug === slug || snowUI.menu[current.parent] && snowUI.menu[current.parent].slug === slug) {
										debug(true, current.slug, slug);
										runner = true;
										return runner;
									}
									return runTree(slug, current.documents);
								}, false);
							} else {
								return false;
							}
						};
						var printMenu = function printMenu(pages, skiptree) {
							var list = pages.map(function (v) {
								var active = page === v.slug ? 'active' : '';
								var rantree = active === 'active' && !snowUI.singleBranch ? true : skiptree === undefined ? runTree(page, v.documents) : skiptree;
								//snowlog.log(v.slug,rantree,skiptree);
								var collapse = snowUI.collapse ? rantree === true || active === 'active' ? ' ' : ' hidden' : ' ';
								//debug('should menu list be open', snowUI.collapse, rantree, active, snowUI.singleBranch, v.slug);
								var onclick = undefined;
								var linkto = undefined;
								if (_this.props.allinone) {
									onclick = function (e) {
										e.preventDefault();
										_this2.props.goToAnchor(v.slug, v);
									};
									linkto = React.createElement(
										'a',
										{
											className: "list-group-item " + active,
											onClick: onclick,
											href: "#" + v.slug
										},
										v.menuTitle || v.title
									);
								} else {
									onclick = function (e) {
										e.preventDefault(e);
										_this2.props.goTo({
											page: v.slug,
											current: v
										});
									};
									linkto = React.createElement(
										'a',
										{ className: "list-group-item " + active, onClick: onclick, href: snowUI.path.root + '/' + v.slug },
										v.menuTitle || v.title
									);
								}
								return React.createElement(
									'div',
									{ key: v.slug, className: '' },
									linkto,
									React.createElement(
										'div',
										{ className: "link " + collapse },
										printMenu(v.documents)
									)
								);
							});
							return list;
						};

						var menu = snowUI.tree.map(function (v) {
							var active = page === v.slug ? 'active' : '';
							/* our first entry is the root document
        * printMenu takes care of the children
       * */
							var onclick = undefined;
							var linkto = undefined;
							var allinone = !snowUI.allinone || v.documents.length < 1 ? React.createElement('span', null) : _this.props.allinone ? React.createElement(
								'a',
								{ className: "list-group-item " + active, onClick: function (e) {
										e.preventDefault(e);
										_this2.props.goTo({
											page: page,
											current: v
										});
									},
									href: snowUI.path.root + '/' + v.slug },
								snowUI.text['multi page']
							) : React.createElement(
								'a',
								{ className: 'list-group-item', href: '', onClick: function (e) {
										e.preventDefault();
										_this2.props.allInOne(v.slug);
									} },
								snowUI.text['single page']
							);

							if (_this.props.allinone) {
								linkto = React.createElement(
									'a',
									{ className: "list-group-item " + active, onClick: function (e) {
											e.preventDefault();
											_this2.props.goToAnchor(v.slug);
										},
										href: "#" + v.slug },
									v.menuTitle || v.title
								);
							} else {
								onclick = function (e) {
									e.preventDefault(e);
									_this2.props.goTo({
										page: v.slug,
										current: v
									});
								};
								linkto = React.createElement(
									'a',
									{ className: "list-group-item " + active, onClick: onclick, href: snowUI.path.root + '/' + v.slug },
									v.menuTitle || v.title
								);
							}
							var search = undefined;
							if (snowUI.search) {
								search = React.createElement(
									'span',
									null,
									React.createElement(
										'div',
										{ className: 'search-slider' },
										React.createElement('input', { className: 'form-control', placeholder: 'Search', title: 'Press Enter to submit search' })
									),
									React.createElement(
										'div',
										{ key: v.slug, style: { position: 'relative' } },
										linkto,
										React.createElement('span', { className: 'glyphicon glyphicon-search searchToggle', onClick: _this2.props.searchToggle })
									)
								);
							} else {
								search = React.createElement(
									'span',
									null,
									React.createElement(
										'div',
										{ key: v.slug, style: { position: 'relative' } },
										linkto
									)
								);
							}
							return React.createElement(
								'div',
								{ className: 'list-group', key: v.slug },
								search,
								React.createElement(
									'div',
									{ style: { position: 'relative' } },
									allinone
								),
								printMenu(v.documents)
							);
						});
						debug('menu list', menu);
						var LeftNavMenu = React.createElement(
							LeftNav,
							{
								docked: false,
								desktop: true,
								open: this.props.leftNav,
								width: 255,
								onRequestChange: function (open) {
									debug('request change', open, _this2.props);
									_this2.props.handleLeftNav({
										leftNav: open
									});
								}
							},
							React.createElement(
								'div',
								{ className: 'menu', style: {
										height: '100%',
										width: '100%',
										overflow: 'auto'
									} },
								menu
							)
						);

						if (this.props.docked) {
							return LeftNavMenu;
						} else {
							return React.createElement(
								'div',
								null,
								menu
							);
						}
					}
				}]);

				return Menu;
			})(React.Component);

			_export('default', Menu);
		}
	};
});
System.register('app/common/components/confirm.js', ['npm:babel-runtime@5.8.35/helpers/get', 'npm:babel-runtime@5.8.35/helpers/inherits', 'npm:babel-runtime@5.8.35/helpers/create-class', 'npm:babel-runtime@5.8.35/helpers/class-call-check', 'npm:react@0.14.7', 'npm:material-ui@0.14.4/lib', 'npm:debug@2.2.0'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, RaisedButton, FlatButton, Dialog, Styles, debugging, debug, myStyles, Modal;

	return {
		setters: [function (_npmBabelRuntime5835HelpersGet) {
			_get = _npmBabelRuntime5835HelpersGet['default'];
		}, function (_npmBabelRuntime5835HelpersInherits) {
			_inherits = _npmBabelRuntime5835HelpersInherits['default'];
		}, function (_npmBabelRuntime5835HelpersCreateClass) {
			_createClass = _npmBabelRuntime5835HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5835HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5835HelpersClassCallCheck['default'];
		}, function (_npmReact0147) {
			React = _npmReact0147['default'];
		}, function (_npmMaterialUi0144Lib) {
			RaisedButton = _npmMaterialUi0144Lib.RaisedButton;
			FlatButton = _npmMaterialUi0144Lib.FlatButton;
			Dialog = _npmMaterialUi0144Lib.Dialog;
			Styles = _npmMaterialUi0144Lib.Styles;
		}, function (_npmDebug220) {
			debugging = _npmDebug220['default'];
		}],
		execute: function () {
			'use strict';

			debug = debugging('epg:app:common:components:confirm');
			myStyles = {
				textColor: Styles.Colors.blue600,
				alternateTextColor: Styles.Colors.amber400,
				accent1Color: "#FF6040",
				accent2Color: "#F5001E",
				accent3Color: "#FA905C"
			};

			Modal = (function (_React$Component) {
				_inherits(Modal, _React$Component);

				function Modal(props) {
					_classCallCheck(this, Modal);

					_get(Object.getPrototypeOf(Modal.prototype), 'constructor', this).call(this, props);

					this.handleYes = this.handleYes.bind(this);
					this.handleNo = this.handleNo.bind(this);
				}

				_createClass(Modal, [{
					key: 'getChildContext',
					value: function getChildContext() {
						return {
							muiTheme: Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme), myStyles)
						};
					}
				}, {
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
							label: this.props.noText,
							secondary: true,
							onTouchTap: this.handleNo,
							style: { float: 'left', color: Styles.Colors.blueGrey500 }
						}), React.createElement(FlatButton, {
							label: this.props.yesText,
							primary: true,
							onTouchTap: this.handleYes
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
									open: this.props.open,
									className: this.props['class']
								},
								React.createElement('div', { style: this.props.style.body, dangerouslySetInnerHTML: { __html: this.props.html } })
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
				title: 'Confirm',
				style: {
					body: {}
				},
				'class': 'epg__confirm epg__amber'
			};
			Modal.childContextTypes = {
				muiTheme: React.PropTypes.object
			};
		}
	};
});
System.register('app/common/components/menu.js', ['npm:babel-runtime@5.8.35/helpers/get', 'npm:babel-runtime@5.8.35/helpers/inherits', 'npm:babel-runtime@5.8.35/helpers/create-class', 'npm:babel-runtime@5.8.35/helpers/class-call-check', 'npm:react@0.14.7', 'npm:debug@2.2.0', 'npm:material-ui@0.14.4/lib'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Debug, LeftNav, List, FontIcon, Styles, ListItem, debug, Menu;

	return {
		setters: [function (_npmBabelRuntime5835HelpersGet) {
			_get = _npmBabelRuntime5835HelpersGet['default'];
		}, function (_npmBabelRuntime5835HelpersInherits) {
			_inherits = _npmBabelRuntime5835HelpersInherits['default'];
		}, function (_npmBabelRuntime5835HelpersCreateClass) {
			_createClass = _npmBabelRuntime5835HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5835HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5835HelpersClassCallCheck['default'];
		}, function (_npmReact0147) {
			React = _npmReact0147['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_npmMaterialUi0144Lib) {
			LeftNav = _npmMaterialUi0144Lib.LeftNav;
			List = _npmMaterialUi0144Lib.List;
			FontIcon = _npmMaterialUi0144Lib.FontIcon;
			Styles = _npmMaterialUi0144Lib.Styles;
			ListItem = _npmMaterialUi0144Lib.ListItem;
		}],
		execute: function () {
			'use strict';

			debug = Debug('simpledocs:app:common:components:menu');

			Menu = (function (_React$Component) {
				_inherits(Menu, _React$Component);

				function Menu(props) {
					_classCallCheck(this, Menu);

					_get(Object.getPrototypeOf(Menu.prototype), 'constructor', this).call(this, props);
					this.displayName = 'Menu Component';
					this.state = {};
				}

				_createClass(Menu, [{
					key: 'render',
					value: function render() {
						var _this2 = this;

						debug('menu render', this.props);
						var _this = this;
						var _pre = Math.random() + '__';
						var runTree = function runTree(slug, children) {
							/* run through the kids and see if one of them is active so we can show the kid links */
							if (Object.prototype.toString.call(children) === '[object Array]') {
								return children.reduce(function (runner, current) {
									snowlog.log(current.slug, slug);
									if (runner) {
										return runner;
									}
									if (current.slug === slug || snowUI.menu[current.parent] && snowUI.menu[current.parent].slug === slug) {
										debug(true, current.slug, slug);
										runner = true;
										return runner;
									}
									return runTree(slug, current.documents);
								}, false);
							} else {
								return false;
							}
						};
						var printMenu = function printMenu(pages, skiptree, index) {
							var list = pages.map(function (v) {
								var active = _this.props.page === v.slug ? 'active' : '';
								var rantree = active === 'active' && !snowUI.singleBranch ? true : skiptree === undefined ? runTree(_this.props.page, v.documents) : skiptree;
								var collapse = snowUI.collapse ? index ? true : rantree === true || active === 'active' ? true : false : true;

								var onclick = undefined;
								if (_this.props.allinone) {
									onclick = function (e) {
										e.preventDefault();
										_this2.props.goToAnchor(v.slug, v);
									};
								} else {
									onclick = function (e) {
										e.preventDefault(e);
										_this2.props.goTo({
											page: v.slug,
											current: v
										});
									};
								}
								var innerDiv = undefined;
								if (v.documents.length <= 0) {
									innerDiv = { fontSize: '12px', paddingTop: 7, paddingBottom: 4 };
								} else {
									innerDiv = { fontSize: '12px', paddingTop: 7, paddingBottom: 4 };
								}
								return React.createElement(ListItem, {
									key: _pre + v.slug + Math.random(),
									className: 'fixmenuleft',
									innerDivStyle: innerDiv,
									primaryText: v.menuTitle || v.title,
									onClick: onclick,
									initiallyOpen: _this2.props.childopen,
									primaryTogglesNestedList: false,
									nestedItems: printMenu(v.documents, rantree, false)
								});
							});
							if (index) {
								var allinone = !snowUI.allinone || _this2.props.allinone ? React.createElement('span', null) : React.createElement(ListItem, {
									key: _pre + 'allinone' + Math.random(),
									primaryText: 'single page',
									innerDivStyle: { fontSize: '12px', paddingTop: 7, paddingBottom: 4 },
									onClick: function (e) {
										e.preventDefault();
										_this.props.allInOne();
									}
								});
								list.unshift(allinone);
							}
							return list;
						};
						var lookfor = snowUI.tree;
						if (this.props.list) {
							lookfor = this.props.list;
						}
						var menuList = lookfor.map(function (v) {
							var active = _this.props.page === v.slug ? 'active' : '';
							/* our first entry is the root document
        * printMenu takes care of the children
       * */
							return React.createElement(ListItem, {
								key: _pre + v.slug + Math.random(),
								primaryText: v.menuTitle || v.title,
								initiallyOpen: _this2.props.open,
								primaryTogglesNestedList: false,
								onClick: function (e) {
									e.preventDefault(e);
									_this2.props.goTo({
										page: v.slug,
										current: {
											title: v.title,
											menuTitle: v.menuTitle || v.title,
											id: v._id,
											slug: v.slug
										}
									});
								},
								nestedItems: printMenu(v.documents, false, v.documents.length > 0)
							});
						});
						debug('menu list', menuList);
						var LeftNavMenu = React.createElement(
							LeftNav,
							{
								docked: false,
								desktop: true,
								open: this.props.leftNav,
								width: 255,
								onRequestChange: function (open) {
									debug('request change', open, _this2.props);
									_this2.props.handleLeftNav({
										leftNav: open
									});
								}
							},
							React.createElement(
								'div',
								{ className: 'menu', style: {
										height: '100%',
										width: '100%',
										overflow: 'auto'
									} },
								React.createElement(
									List,
									{ subheading: snowUI.name },
									menuList
								)
							)
						);

						if (this.props.docked) {
							return LeftNavMenu;
						} else {
							return React.createElement(
								List,
								{ subheading: snowUI.name },
								menuList
							);
						}
					}
				}]);

				return Menu;
			})(React.Component);

			_export('default', Menu);

			Menu.defaultProps = {
				open: false,
				childopen: false
			};
		}
	};
});
System.register('app/pages/home.js', ['npm:babel-runtime@5.8.35/helpers/get', 'npm:babel-runtime@5.8.35/helpers/inherits', 'npm:babel-runtime@5.8.35/helpers/create-class', 'npm:babel-runtime@5.8.35/helpers/class-call-check', 'npm:babel-runtime@5.8.35/helpers/extends', 'npm:react@0.14.7', 'npm:debug@2.2.0', 'app/common/gab.js', 'npm:material-ui@0.14.4/lib', 'app/common/components/menu.js'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, _extends, React, Debug, Gab, DropDownMenu, MenuItem, ToolbarGroup, Toolbar, ToolbarSeparator, Divider, CardText, CardMedia, CardHeader, CardActions, Card, CardTitle, Styles, List, IconButton, ListItem, FlatButton, FontIcon, Menu, debug, Home;

	return {
		setters: [function (_npmBabelRuntime5835HelpersGet) {
			_get = _npmBabelRuntime5835HelpersGet['default'];
		}, function (_npmBabelRuntime5835HelpersInherits) {
			_inherits = _npmBabelRuntime5835HelpersInherits['default'];
		}, function (_npmBabelRuntime5835HelpersCreateClass) {
			_createClass = _npmBabelRuntime5835HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5835HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5835HelpersClassCallCheck['default'];
		}, function (_npmBabelRuntime5835HelpersExtends) {
			_extends = _npmBabelRuntime5835HelpersExtends['default'];
		}, function (_npmReact0147) {
			React = _npmReact0147['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_npmMaterialUi0144Lib) {
			DropDownMenu = _npmMaterialUi0144Lib.DropDownMenu;
			MenuItem = _npmMaterialUi0144Lib.MenuItem;
			ToolbarGroup = _npmMaterialUi0144Lib.ToolbarGroup;
			Toolbar = _npmMaterialUi0144Lib.Toolbar;
			ToolbarSeparator = _npmMaterialUi0144Lib.ToolbarSeparator;
			Divider = _npmMaterialUi0144Lib.Divider;
			CardText = _npmMaterialUi0144Lib.CardText;
			CardMedia = _npmMaterialUi0144Lib.CardMedia;
			CardHeader = _npmMaterialUi0144Lib.CardHeader;
			CardActions = _npmMaterialUi0144Lib.CardActions;
			Card = _npmMaterialUi0144Lib.Card;
			CardTitle = _npmMaterialUi0144Lib.CardTitle;
			Styles = _npmMaterialUi0144Lib.Styles;
			List = _npmMaterialUi0144Lib.List;
			IconButton = _npmMaterialUi0144Lib.IconButton;
			ListItem = _npmMaterialUi0144Lib.ListItem;
			FlatButton = _npmMaterialUi0144Lib.FlatButton;
			FontIcon = _npmMaterialUi0144Lib.FontIcon;
		}, function (_appCommonComponentsMenuJs) {
			Menu = _appCommonComponentsMenuJs['default'];
		}],
		execute: function () {
			'use strict';

			debug = Debug('simpledocs:app:pages:home');

			Home = (function (_React$Component) {
				_inherits(Home, _React$Component);

				function Home(props) {
					_classCallCheck(this, Home);

					_get(Object.getPrototypeOf(Home.prototype), 'constructor', this).call(this, props);
					this.displayName = 'Home Component';
					this.state = {
						ready: true,
						page: props.page,
						contents: props.contents
					};

					debug('home start props', props);
					this._update = false;
					this._updating = true;
				}

				/* page display renderer */

				_createClass(Home, [{
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {

						if (props.page !== this.state.page || props.forceGrab && !this._updating) {
							debug('home got page', props, this._updating);
							if (props.page === snowUI.singlePage) {
								Gab.request(props.page, props.anchor);
							} else if (!snowUI.usesockets) {
								Gab.request(props.page, props.search);
							} else {
								props.sockets.page(props.page, props.search);
							}
							this._updating = true;
							snowUI.page = props.page;
							this.setState({
								page: props.page,
								contents: false
							});

							return true;
						}
						if (props.contents && this._updating) {
							debug('home got contents', props);
							this.setState({
								contents: props.contents
							}, function () {});
							this._update = true;
							this._updating = false;
							return true;
						}
						if (props.forceUpdate) {
							this._update = true;
						}
					}
				}, {
					key: 'shouldComponentUpdate',
					value: function shouldComponentUpdate() {
						debug('should update? ', this._update);
						var ret = this._update ? this._update : this._update; // !this.props.allinone;
						return ret;
					}
				}, {
					key: 'componentDidUpdate',
					value: function componentDidUpdate() {
						debug('didUpdate', this._update);
						if (this._update) {
							var simple = document.getElementById("simpledocs");
							simple.scrollTop = 0;
							this._update = false;
							snowUI.fadeIn();
						}
					}
				}, {
					key: 'componentDidMount',
					value: function componentDidMount() {
						debug('did mount');
						if (this.props.page === snowUI.singlePage) {
							Gab.request(this.props.page, this.props.anchor);
						} else if (!snowUI.usesockets) {
							Gab.request(this.props.page, this.props.search);
						} else if (this.props.page) {
							this.props.sockets.page(this.props.page, this.props.search);
						}
					}
				}, {
					key: 'componentWillUnmount',
					value: function componentWillUnmount() {
						snowUI.code.__unmountUI();
					}
				}, {
					key: 'render',
					value: function render() {
						debug('home render', this.state, this.props);
						var content = [];
						var _this = this;
						if (Array.isArray(this.state.contents)) {
							this.props.contents.forEach(function (v) {
								content.push(Home.UI.render.call(_this, v, true));
							});
						} else if (this.state.contents) {
							content.push(Home.UI.render.call(this, this.props.contents));
						} else {
							content.push(React.createElement(
								'div',
								{ style: { textAlign: 'center', width: '100%' } },
								React.createElement(
									FontIcon,
									{ style: { fontSize: '128px' }, className: 'material-icons', color: Styles.Colors.blueGrey100 },
									'file_download'
								)
							));
						}
						return React.createElement(
							'div',
							{ className: 'col-xs-12' },
							React.createElement(
								Card,
								{ style: { minHeight: snowUI.contentHeight } },
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

			Home.UI = {
				render: function render(doc, allinone) {
					var _this2 = this;

					var _this = this;
					var printMenu = React.createElement(Menu, _this.props);

					//console.log(this.state.ready,this.props.contents);
					if (this.state.ready && doc) {
						if (doc.ok) {
							/* search results */
							var search = true;
							var prev;
							var next;
							var results = doc.results.length;
							if (results > 0) {
								var display = doc.results.map(function (result) {
									var score = result.score;
									var page = result.obj;
									var content = page.display === 1 ? page.markdown ? React.createElement(
										'div',
										{ key: 'fullcontent' },
										React.createElement('div', { dangerouslySetInnerHTML: { __html: page.markdown.html } }),
										' '
									) : React.createElement('span', null) : page.display === 2 ? React.createElement(
										'div',
										{ key: 'fullcontent' },
										React.createElement('div', { dangerouslySetInnerHTML: { __html: page.html } }),
										' '
									) : page.display === 3 ? React.createElement(
										'div',
										{ key: 'fullcontent' },
										' ',
										React.createElement('div', { key: 'fullcontentB', dangerouslySetInnerHTML: { __html: page.html } }),
										React.createElement('div', { key: 'fullcontentA', dangerouslySetInnerHTML: { __html: page.html } })
									) : page.display === 4 ? React.createElement(
										'div',
										{ key: 'fullcontent' },
										' ',
										React.createElement('div', { key: 'fullcontentA', dangerouslySetInnerHTML: { __html: page.html } }),
										React.createElement('div', { key: 'fullcontentB', dangerouslySetInnerHTML: { __html: page.markdown.html } })
									) : React.createElement('span', null);
									return React.createElement(
										'div',
										{ key: score, className: 'search-result item' },
										React.createElement(
											'div',
											{ className: 'title' },
											React.createElement(
												'h3',
												null,
												React.createElement(
													'a',
													{ href: snowUI.path.root + '/' + page.slug, className: 'sdlink' },
													page.title
												)
											)
										),
										React.createElement('div', { className: 'score', style: { width: parseFloat(score) * 100 + '%' } }),
										React.createElement(
											'div',
											{ className: 'blurb' },
											content
										)
									);
								});
							} else {
								var display = React.createElement(
									'h4',
									null,
									'No results'
								);
							}
						} else {
							/* page data */
							//debug('display page data', doc)
							var search = false;
							if (typeof doc !== 'object') doc = {};
							if (typeof doc.parent !== 'object') doc.parent = {};
							var content = doc.display === 1 ? doc.markdown ? React.createElement(
								'div',
								{ key: 'fullcontent' },
								React.createElement('div', { dangerouslySetInnerHTML: { __html: doc.markdown.html } }),
								' '
							) : React.createElement('span', null) : doc.display === 2 ? React.createElement(
								'div',
								{ key: 'fullcontent' },
								React.createElement('div', { dangerouslySetInnerHTML: { __html: doc.html } }),
								' '
							) : doc.display === 3 ? React.createElement(
								'div',
								{ key: 'fullcontent' },
								' ',
								React.createElement('div', { key: 'fullcontentB', dangerouslySetInnerHTML: { __html: doc.markdown.html } }),
								React.createElement('div', { key: 'fullcontentA', dangerouslySetInnerHTML: { __html: doc.html } })
							) : doc.display === 4 ? React.createElement(
								'div',
								{ key: 'fullcontent' },
								' ',
								React.createElement('div', { key: 'fullcontentA', dangerouslySetInnerHTML: { __html: doc.html } }),
								React.createElement('div', { key: 'fullcontentB', dangerouslySetInnerHTML: { __html: doc.markdown.html } })
							) : React.createElement('span', null);

							var newcontent = [];
							newcontent.push(React.createElement('input', { type: 'hidden', value: doc.slug, className: 'hiddenTitle' }));
							newcontent.push(content);

							if (doc.type === 1) {
								/* show the content only */
								var display = newcontent;
							} else if (doc.type === 2) {
								/* show list of child root documents */
								if (snowUI.menu[doc._id]) {
									var list = doc;
									list.documents = snowUI.menu[doc._id].docs;
									var display = React.createElement(Menu, _extends({ list: [list] }, this.props, { open: !this.props.allinone, childopen: !this.props.allinone }));
								}
							} else {
								/* show the contents then a list of child root documents */
								//snowlog.info('show content and child doc list',snowUI.menu,doc._id);
								var display = [];
								if (snowUI.menu[doc._id]) {
									var list = doc;
									list.documents = snowUI.menu[doc._id].docs;
									display.push(React.createElement(Menu, _extends({ list: [list] }, this.props, { key: 'displayMenu', open: !this.props.allinone, childopen: !this.props.allinone })));
								}
								display.unshift(React.createElement(
									'div',
									{ key: 'dualpage' },
									newcontent
								));
							}
							var prev;
							var next;
							/* navigation butoons for bottom */
							if (snowUI.menu[doc._id]) {
								prev = snowUI.menu[doc.parent._id] ? typeof snowUI.menu[doc.parent._id].docs[doc.order - 2] === 'object' ? React.createElement(FlatButton, {
									label: snowUI.menu[doc.parent._id].docs[doc.order - 2].title,
									onClick: function (e) {
										e.preventDefault();
										_this2.props.goTo({
											page: snowUI.menu[doc.parent._id].docs[doc.order - 2].slug,
											current: snowUI.menu[doc.parent._id].docs[doc.order - 2]
										});
									},
									secondary: true,
									icon: React.createElement(
										FontIcon,
										{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.lightBlue300 },
										'chevron_left'
									)
								}) : React.createElement('span', null) : React.createElement('span', null);
								next = snowUI.menu[doc._id] ? typeof snowUI.menu[doc._id].docs[0] === 'object' ? React.createElement(FlatButton, {
									label: snowUI.menu[doc._id].docs[0].title,
									onClick: function (e) {
										e.preventDefault();
										_this2.props.goTo({
											page: snowUI.menu[doc._id].docs[0].slug,
											current: snowUI.menu[doc._id].docs[0]
										});
									},
									labelPosition: 'before',
									secondary: true,
									icon: React.createElement(
										FontIcon,
										{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.lightBlue300 },
										'chevron_right'
									)
								}) : React.createElement('span', null) : React.createElement('span', null);
							} else if (doc.parent) {
								prev = snowUI.menu[doc.parent._id] ? typeof snowUI.menu[doc.parent._id].docs[doc.order - 2] === 'object' ? React.createElement(FlatButton, {
									label: snowUI.menu[doc.parent._id].docs[doc.order - 2].title,
									onClick: function (e) {
										e.preventDefault();
										_this2.props.goTo({
											page: snowUI.menu[doc.parent._id].docs[doc.order - 2].slug,
											current: snowUI.menu[doc.parent._id].docs[doc.order - 2]
										});
									},
									secondary: true,
									icon: React.createElement(
										FontIcon,
										{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.lightBlue300 },
										'chevron_left'
									)
								}) : snowUI.menu[doc.parent.parent] ? typeof snowUI.menu[doc.parent.parent].docs[doc.parent.order - 1] === 'object' ? React.createElement(FlatButton, {
									label: snowUI.menu[doc.parent.parent].docs[doc.parent.order - 1].title,
									onClick: function (e) {
										e.preventDefault();
										_this2.props.goTo({
											page: snowUI.menu[doc.parent.parent].docs[doc.parent.order - 1].slug,
											current: snowUI.menu[doc.parent.parent].docs[doc.parent.order - 1]
										});
									},
									secondary: true,
									icon: React.createElement(
										FontIcon,
										{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.lightBlue300 },
										'chevron_left'
									)
								}) : React.createElement('span', null) : React.createElement('span', null) : React.createElement('span', null);
								next = snowUI.menu[doc.parent._id] ? typeof snowUI.menu[doc.parent._id].docs[doc.order] === 'object' ? React.createElement(FlatButton, {
									label: snowUI.menu[doc.parent._id].docs[doc.order].title,
									onClick: function (e) {
										e.preventDefault();
										_this2.props.goTo({
											page: snowUI.menu[doc.parent._id].docs[doc.order].slug,
											current: snowUI.menu[doc.parent._id].docs[doc.order]
										});
									},
									labelPosition: 'before',
									icon: React.createElement(
										FontIcon,
										{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.lightBlue300 },
										'chevron_right'
									)
								}) : snowUI.menu[doc.parent.parent] ? typeof snowUI.menu[doc.parent.parent].docs[doc.parent.order] === 'object' ? React.createElement(FlatButton, {
									label: snowUI.menu[doc.parent.parent].docs[doc.parent.order].title,
									onClick: function (e) {
										e.preventDefault();
										_this2.props.goTo({
											page: snowUI.menu[doc.parent.parent].docs[doc.parent.order].slug,
											current: snowUI.menu[doc.parent.parent].docs[doc.parent.order]
										});
									},
									labelPosition: 'before',

									icon: React.createElement(
										FontIcon,
										{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.lightBlue300 },
										'chevron_right'
									)
								}) : React.createElement('span', null) : React.createElement('span', null) : React.createElement('span', null);
							}
						}
						var related = [];
						if (Object.prototype.toString.call(doc.links) !== '[object Array]') {
							doc.links = [];
						}

						if (doc.links.length > 0) {
							related = doc.links.map(function (v) {
								return React.createElement(
									'div',
									{ className: 'related-bubble', key: v.slug + 'related' },
									React.createElement(
										'a',
										{ className: 'badge bg-primary', onClick: function (e) {
												e.preventDefault();_this.props.goTo(v.slug);
											} },
										v.title
									)
								);
							});
						}

						if (doc.externalLinks) {
							var ll = doc.externalLinks.replace(',', ' ').split(' ');
							ll.forEach(function (v) {
								related.push(React.createElement(
									'div',
									{ className: 'related-bubble', key: v + 'linksE' },
									React.createElement(
										'a',
										{ className: 'badge bg-primary', target: '_blank', href: v },
										v
									)
								));
							});
						}

						if (related.length > 0) {
							related.unshift(React.createElement(
								'div',
								{ className: 'related', key: 'related' },
								'Related'
							));
						}

						var nav = this.props.allinone ? React.createElement('span', null) : React.createElement(
							Toolbar,
							{ style: { marginTop: 25, background: Styles.Colors.blueGrey50 } },
							React.createElement(
								ToolbarGroup,
								{ firstChild: true, float: 'left' },
								React.createElement(
									IconButton,
									{ onClick: function (e) {
											e.preventDefault();_this2.props.goTo(snowUI.homepage);
										} },
									React.createElement(
										FontIcon,
										{ className: 'material-icons', color: Styles.Colors.lightBlue600, hoverColor: Styles.Colors.lightBlue300 },
										'home'
									)
								)
							),
							React.createElement(
								ToolbarGroup,
								{ float: 'left' },
								prev
							),
							React.createElement(
								ToolbarGroup,
								{ lastChild: true, float: 'right' },
								next
							)
						);

						return React.createElement(
							'div',
							{ id: 'showconent', key: doc.slug + Math.random() },
							display,
							React.createElement(
								'div',
								{ className: 'clearfix ' },
								related
							),
							nav,
							React.createElement('div', { className: 'clearfix', style: { height: 25 } })
						);
					} else {
						var menu = React.createElement('span', null);
						if (snowUI.tree > 0) {
							menu = React.createElement(Menu, this.props);
						}
						return React.createElement(
							'div',
							{ id: '', key: Math.random() },
							menu
						);
					}
				}
			};
		}
	};
});
System.register('app/pages/status.js', ['npm:babel-runtime@5.8.35/helpers/get', 'npm:babel-runtime@5.8.35/helpers/inherits', 'npm:babel-runtime@5.8.35/helpers/create-class', 'npm:babel-runtime@5.8.35/helpers/class-call-check', 'npm:react@0.14.7', 'npm:debug@2.2.0', 'app/common/gab.js', 'npm:material-ui@0.14.4/lib'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Debug, Gab, GridList, GridTile, Divider, FontIcon, Styles, CardText, Card, CardActions, CardHeader, CardMedia, CardTitle, debug, Status;

	return {
		setters: [function (_npmBabelRuntime5835HelpersGet) {
			_get = _npmBabelRuntime5835HelpersGet['default'];
		}, function (_npmBabelRuntime5835HelpersInherits) {
			_inherits = _npmBabelRuntime5835HelpersInherits['default'];
		}, function (_npmBabelRuntime5835HelpersCreateClass) {
			_createClass = _npmBabelRuntime5835HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5835HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5835HelpersClassCallCheck['default'];
		}, function (_npmReact0147) {
			React = _npmReact0147['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_npmMaterialUi0144Lib) {
			GridList = _npmMaterialUi0144Lib.GridList;
			GridTile = _npmMaterialUi0144Lib.GridTile;
			Divider = _npmMaterialUi0144Lib.Divider;
			FontIcon = _npmMaterialUi0144Lib.FontIcon;
			Styles = _npmMaterialUi0144Lib.Styles;
			CardText = _npmMaterialUi0144Lib.CardText;
			Card = _npmMaterialUi0144Lib.Card;
			CardActions = _npmMaterialUi0144Lib.CardActions;
			CardHeader = _npmMaterialUi0144Lib.CardHeader;
			CardMedia = _npmMaterialUi0144Lib.CardMedia;
			CardTitle = _npmMaterialUi0144Lib.CardTitle;
		}],
		execute: function () {
			'use strict';

			debug = Debug('simpledocs:app:pages:status');

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
						snowUI.fadeIn();
						debug('didUpdate');
					}
				}, {
					key: 'componentDidMount',
					value: function componentDidMount() {
						debug('did mount');
						snowUI.fadeIn();
					}
				}, {
					key: 'render',
					value: function render() {
						var _this = this;

						debug('status render', this.props);
						var status = undefined;
						if (this.props.connected || !snowUI.usesockets) {
							var msg = !snowUI.usesockets ? '' : "The server is online and accepting page requests.";
							status = React.createElement(CardHeader, {
								title: "SimpleDocs document generator",
								subtitle: msg,
								avatar: React.createElement(
									FontIcon,
									{ style: { fontSize: '42px' }, className: 'material-icons', color: Styles.Colors.green600, hoverColor: Styles.Colors.blue600 },
									'cloud_done'
								),
								titleColor: Styles.Colors.green600,
								subtitleColor: Styles.Colors.grey500
							});
						} else {
							status = React.createElement(CardHeader, {
								title: "Server Connection Issues",
								subtitle: "The agent is currently not responding to socket requests",
								avatar: React.createElement(
									FontIcon,
									{ style: { fontSize: '42px' }, className: 'material-icons', color: Styles.Colors.red600, hoverColor: Styles.Colors.amber500 },
									'cloud_off'
								),
								titleColor: Styles.Colors.red600,
								subtitleColor: Styles.Colors.grey500
							});
						}
						var ghpages = React.createElement('span', null);
						if (snowUI.chief) {
							ghpages = React.createElement(
								Card,
								null,
								React.createElement(CardHeader, {
									title: "Create Builds",
									subtitle: "Create static build for ghpages and download",
									avatar: React.createElement(
										FontIcon,
										{ style: {}, className: 'material-icons', color: Styles.Colors.blueGrey600, hoverColor: Styles.Colors.blueGrey600 },
										'file_download'
									),
									titleColor: Styles.Colors.blue600,
									subtitleColor: Styles.Colors.grey500,
									actAsExpander: true,
									showExpandableButton: true
								}),
								React.createElement(
									CardText,
									{ expandable: true },
									React.createElement(
										GridList,
										{
											cellHeight: 100,
											style: { width: '100%' },
											cols: 3
										},
										React.createElement(GridTile, {
											key: 'GitHub',
											title: 'GitHub Pages',
											onClick: function (e) {
												return _this.props.goTo('builds');
											},
											subtitle: 'Build for gh-pages',
											style: { backgroundColor: '#333335', cursor: 'pointer' }
										}),
										React.createElement(GridTile, {
											key: 'pdf',
											title: 'PDF',
											onClick: function (e) {
												return _this.props.goTo('builds');
											},
											subtitle: 'Download a PDF',
											style: { backgroundColor: '#9F4206', cursor: 'pointer' }
										}),
										React.createElement(GridTile, {
											key: 'static',
											title: 'HTML Download',
											onClick: function (e) {
												return _this.props.goTo('builds');
											},
											subtitle: 'all pages zipped up',
											style: { backgroundColor: '#23214C', cursor: 'pointer' }
										})
									)
								)
							);
						}
						return React.createElement(
							'div',
							{ className: 'col-xs-12' },
							React.createElement(
								Card,
								null,
								status,
								React.createElement(CardText, { style: {} }),
								ghpages,
								React.createElement(
									Card,
									null,
									React.createElement(CardHeader, {
										title: "Get SimpleDocs",
										subtitle: "GitHub and NPM information",
										avatar: React.createElement(
											FontIcon,
											{ style: {}, className: 'material-icons', color: Styles.Colors.blueGrey600, hoverColor: Styles.Colors.blueGrey600 },
											'file_download'
										),
										titleColor: Styles.Colors.blue600,
										subtitleColor: Styles.Colors.grey500,
										actAsExpander: true,
										showExpandableButton: true
									}),
									React.createElement(
										CardText,
										{ expandable: true },
										React.createElement(
											GridList,
											{
												cellHeight: 75,
												style: { width: '100%' }
											},
											React.createElement(GridTile, {
												key: 'npmTile',
												title: 'NPM',
												subtitle: React.createElement(
													'a',
													{ style: { color: Styles.Colors.grey300, textDecoration: 'none' }, href: 'https://npmjs.org/package/simpledocs', target: '_blank' },
													'Package Info'
												),
												style: { backgroundColor: '#CB3837' }
											}),
											React.createElement(GridTile, {
												key: 'github',
												title: 'GitHub',
												subtitle: React.createElement(
													'a',
													{ style: { color: Styles.Colors.grey300, textDecoration: 'none' }, href: 'https://github.com/inquisive/simpledocs', target: '_blank' },
													'Source'
												),
												style: { backgroundColor: '#333333' }
											})
										)
									)
								),
								React.createElement(
									Card,
									null,
									React.createElement(CardHeader, {
										title: "About",
										subtitle: "information",
										avatar: React.createElement(
											FontIcon,
											{ style: {}, className: 'material-icons', color: Styles.Colors.blueGrey600, hoverColor: Styles.Colors.blueGrey600 },
											'info_outline'
										),
										titleColor: Styles.Colors.blue600,
										subtitleColor: Styles.Colors.grey500,
										actAsExpander: true,
										showExpandableButton: true
									}),
									React.createElement(
										CardText,
										{ expandable: true },
										React.createElement(
											'h4',
											null,
											'A few of the libraries used to build SimpleDocs. '
										),
										React.createElement(
											GridList,
											{
												cellHeight: 75,
												style: { width: '100%' },
												cols: 3
											},
											React.createElement(GridTile, {
												key: 'nodeTile',
												title: React.createElement(
													'a',
													{ style: { color: Styles.Colors.grey300, textDecoration: 'none' }, href: 'http://nodejs.org', target: '_blank' },
													'Nodejs'
												),
												style: { backgroundColor: '#2D542D' }
											}),
											React.createElement(GridTile, {
												key: 'mongoTile',
												title: React.createElement(
													'a',
													{ style: { color: Styles.Colors.grey300, textDecoration: 'none' }, href: 'http://mongoosejs.com/', target: '_blank' },
													'Mongoose & MongoDB'
												),
												style: { backgroundColor: '#2B4BA7' }
											}),
											React.createElement(GridTile, {
												key: 'keystoneTime',
												title: React.createElement(
													'a',
													{ style: { color: Styles.Colors.grey300, textDecoration: 'none' }, href: 'http://keystonejs.com/', target: '_blank' },
													'Keystone'
												),
												style: { backgroundColor: '#2B4BA7' }
											}),
											React.createElement(GridTile, {
												key: 'bootTile',
												title: React.createElement(
													'a',
													{ style: { color: Styles.Colors.grey300, textDecoration: 'none' }, href: 'http://getbootstrap.com/', target: '_blank' },
													'Bootstrap'
												),
												style: { backgroundColor: '#2B4BA7' }
											}),
											React.createElement(GridTile, {
												key: 'reactTile',
												title: React.createElement(
													'a',
													{ style: { color: Styles.Colors.grey300, textDecoration: 'none' }, href: 'http://facebook.github.io/react/docs/thinking-in-react.html', target: '_blank' },
													'React JS'
												),
												style: { backgroundColor: '#2B3D6D' }
											}),
											React.createElement(GridTile, {
												key: 'matrerialTile',
												title: React.createElement(
													'a',
													{ style: { color: Styles.Colors.grey300, textDecoration: 'none' }, href: 'http://material-ui.com/', target: '_blank' },
													'Material-UI'
												),
												style: { backgroundColor: '#4EAEBB' }
											})
										)
									)
								),
								React.createElement(
									Card,
									null,
									React.createElement(CardHeader, {
										title: "Theme",
										subtitle: "switch between the available themes",
										avatar: React.createElement(
											FontIcon,
											{ style: {}, className: 'material-icons', color: Styles.Colors.blueGrey600, hoverColor: Styles.Colors.blueGrey600 },
											'invert_colors'
										),
										titleColor: Styles.Colors.blue600,
										subtitleColor: Styles.Colors.grey500,
										actAsExpander: false,
										showExpandableButton: false
									})
								),
								React.createElement(
									GridList,
									{
										cellHeight: 100,
										style: { width: '100%' },
										cols: 7,
										padding: 0
									},
									React.createElement(GridTile, {
										key: 'MaterialL7ightTheme',
										title: "Cream",
										onClick: function (e) {
											return _this.props.switchTheme('cream');
										},
										style: { backgroundColor: '#FFFCEF', cursor: 'pointer' }
									}),
									React.createElement(GridTile, {
										key: 'MaterialLightTheme',
										title: "Light",
										onClick: function (e) {
											return _this.props.switchTheme('light');
										},
										style: { backgroundColor: '#eeeeee', cursor: 'pointer' }
									}),
									React.createElement(GridTile, {
										key: 'MaterialDLightTheme',
										title: "Blue",
										onClick: function (e) {
											return _this.props.switchTheme('blue');
										},
										style: { backgroundColor: '#0C87C1', cursor: 'pointer' }
									}),
									React.createElement(GridTile, {
										key: 'MaterialTheme',
										title: "Graphite",
										onClick: function (e) {
											return _this.props.switchTheme('graphite');
										},
										style: { backgroundColor: '#303030', cursor: 'pointer' }
									}),
									React.createElement(GridTile, {
										key: 'MaterialDarkTheme',
										title: "Night",
										onClick: function (e) {
											return _this.props.switchTheme('night');
										},
										style: { backgroundColor: '#223E77', cursor: 'pointer' }
									}),
									React.createElement(GridTile, {
										key: 'MateriallDDarkTheme',
										title: "Dark",
										onClick: function (e) {
											return _this.props.switchTheme('dark');
										},
										style: { backgroundColor: '#0097A7', cursor: 'pointer' }
									}),
									React.createElement(GridTile, {
										cols: 1,
										key: 'bliteTheme',
										title: 'Bootstrap UI',
										onClick: function (e) {
											return _this.props.assets({
												newconfirm: {
													html: 'Do you want to switch to the Bootstrap UI?',
													title: 'Bootstrap UI',
													open: true,
													yesText: 'Yes, go to Bootstrap UI.',
													noText: 'No, close prompt.',
													answer: function answer() {
														location.href = snowUI.path.bootstrap;
													}
												}
											});
										},
										style: { backgroundColor: '#0C87C1', cursor: 'pointer' }
									})
								)
							)
						);
					}
				}]);

				return Status;
			})(React.Component);

			_export('default', Status);
		}
	};
});
System.register('app/pages/builds.js', ['npm:babel-runtime@5.8.35/helpers/get', 'npm:babel-runtime@5.8.35/helpers/inherits', 'npm:babel-runtime@5.8.35/helpers/create-class', 'npm:babel-runtime@5.8.35/helpers/class-call-check', 'npm:react@0.14.7', 'npm:debug@2.2.0', 'app/common/gab.js', 'npm:material-ui@0.14.4/lib'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Debug, Gab, GridList, GridTile, Divider, FontIcon, Styles, CardText, Card, CardActions, CardHeader, CardMedia, CardTitle, debug, GHPages;

	return {
		setters: [function (_npmBabelRuntime5835HelpersGet) {
			_get = _npmBabelRuntime5835HelpersGet['default'];
		}, function (_npmBabelRuntime5835HelpersInherits) {
			_inherits = _npmBabelRuntime5835HelpersInherits['default'];
		}, function (_npmBabelRuntime5835HelpersCreateClass) {
			_createClass = _npmBabelRuntime5835HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5835HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5835HelpersClassCallCheck['default'];
		}, function (_npmReact0147) {
			React = _npmReact0147['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_npmMaterialUi0144Lib) {
			GridList = _npmMaterialUi0144Lib.GridList;
			GridTile = _npmMaterialUi0144Lib.GridTile;
			Divider = _npmMaterialUi0144Lib.Divider;
			FontIcon = _npmMaterialUi0144Lib.FontIcon;
			Styles = _npmMaterialUi0144Lib.Styles;
			CardText = _npmMaterialUi0144Lib.CardText;
			Card = _npmMaterialUi0144Lib.Card;
			CardActions = _npmMaterialUi0144Lib.CardActions;
			CardHeader = _npmMaterialUi0144Lib.CardHeader;
			CardMedia = _npmMaterialUi0144Lib.CardMedia;
			CardTitle = _npmMaterialUi0144Lib.CardTitle;
		}],
		execute: function () {
			'use strict';

			debug = Debug('simpledocs:app:pages:gh-pages');

			//console.log(__hotReload);

			GHPages = (function (_React$Component) {
				_inherits(GHPages, _React$Component);

				function GHPages(props) {
					_classCallCheck(this, GHPages);

					_get(Object.getPrototypeOf(GHPages.prototype), 'constructor', this).call(this, props);
					this.displayName = 'GHPages Component';
					this.state = {};
					this._update = false;
				}

				_createClass(GHPages, [{
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						debug('receiveProps');
						this._update = true;
					}
				}, {
					key: 'componentDidUpdate',
					value: function componentDidUpdate() {
						snowUI.fadeIn();
						debug('didUpdate');
					}
				}, {
					key: 'componentDidMount',
					value: function componentDidMount() {
						debug('did mount');
						snowUI.fadeIn();
					}
				}, {
					key: 'render',
					value: function render() {
						debug('status render', this.props);

						return React.createElement(
							'div',
							{ className: 'col-xs-12' },
							React.createElement(
								Card,
								null,
								React.createElement(
									Card,
									null,
									React.createElement(CardHeader, {
										title: "Build GitHub Pages",
										subtitle: "Select your options, build the files and upload to a repo.",
										avatar: React.createElement(
											FontIcon,
											{ style: {}, className: 'material-icons', color: Styles.Colors.blueGrey600, hoverColor: Styles.Colors.blueGrey600 },
											'file_download'
										),
										titleColor: Styles.Colors.blue600,
										subtitleColor: Styles.Colors.grey500

									}),
									React.createElement(
										CardText,
										null,
										React.createElement(
											GridList,
											{
												cellHeight: 75,
												style: { width: '100%' }
											},
											React.createElement(GridTile, {
												key: 'npmTile',
												title: 'Build GitHub Pages',
												subtitle: React.createElement('a', { style: { color: Styles.Colors.grey300, textDecoration: 'none' } }),
												style: { backgroundColor: '#CB3837', cursor: 'pointer' }
											}),
											React.createElement(GridTile, {
												key: 'github',
												title: 'Publish GitHub Pages',
												subtitle: React.createElement(
													'a',
													{ style: { color: Styles.Colors.grey300, textDecoration: 'none' } },
													'use gh-pages to publish'
												),
												style: { backgroundColor: '#333333', cursor: 'pointer' }
											})
										)
									)
								)
							)
						);
					}
				}]);

				return GHPages;
			})(React.Component);

			_export('default', GHPages);
		}
	};
});
System.register('app/common/gab.js', ['npm:babel-runtime@5.8.35/helpers/get', 'npm:babel-runtime@5.8.35/helpers/inherits', 'npm:babel-runtime@5.8.35/helpers/create-class', 'npm:babel-runtime@5.8.35/helpers/class-call-check', 'github:jspm/nodelibs-events@0.1.1', 'npm:superagent@1.6.1', 'npm:lodash@3.10.1', 'npm:debug@2.2.0'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, EventEmitter, _request, isFunction, Debug, debug, Gab;

	return {
		setters: [function (_npmBabelRuntime5835HelpersGet) {
			_get = _npmBabelRuntime5835HelpersGet['default'];
		}, function (_npmBabelRuntime5835HelpersInherits) {
			_inherits = _npmBabelRuntime5835HelpersInherits['default'];
		}, function (_npmBabelRuntime5835HelpersCreateClass) {
			_createClass = _npmBabelRuntime5835HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5835HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5835HelpersClassCallCheck['default'];
		}, function (_githubJspmNodelibsEvents011) {
			EventEmitter = _githubJspmNodelibsEvents011.EventEmitter;
		}, function (_npmSuperagent161) {
			_request = _npmSuperagent161['default'];
		}, function (_npmLodash3101) {
			isFunction = _npmLodash3101.isFunction;
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}],
		execute: function () {
			'use strict';

			debug = Debug('simpledocs:app:common:gab');

			Gab = (function (_EventEmitter) {
				_inherits(Gab, _EventEmitter);

				function Gab(props) {
					_classCallCheck(this, Gab);

					_get(Object.getPrototypeOf(Gab.prototype), 'constructor', this).call(this, props);
				}

				_createClass(Gab, [{
					key: 'reset',
					value: function reset() {}
				}, {
					key: 'request',
					value: function request(route, moon, callback) {
						var _this = this;
						if (!isFunction(callback)) {
							callback = function () {};
						}
						if (!route) {
							var res = {
								success: false,
								message: 'No route defined.'
							};
							this.emit('request', res);
							return callback(res);
						}
						var page = route ? route : snowUI.homepage;
						if (page === snowUI.singlePage) {
							var root = snowUI.api.allinone;
							var url = root + '/' + page;
						} else if (route.search('search::') > -1) {
							var root = snowUI.api.search;
							var url = root + '/' + page;
						} else {
							var root = snowUI.api.page;
							var url = root + '/' + page + '.json';
						}

						debug('request', url, root, page);

						_request.get(url).set({
							'Accept': 'application/json'
						}).end(function (err, res) {
							debug('request result', err, res);
							var result = {
								success: false
							};
							if (err) {
								result.message = err.status;
								_this.emit('request', result);
								return callback(result);
							} else {
								result.success = true;
								result.page = res.body.page || res.body.search;
								result.tree = res.body.tree;
								result.menu = res.body.menu;
								_this.emit('request', result);
								return callback(null, result);
							}
						});
						// end request
					}
				}]);

				return Gab;
			})(EventEmitter);

			_export('default', new Gab());
		}
	};
});
System.register('app/pages/404.js', ['npm:babel-runtime@5.8.35/helpers/get', 'npm:babel-runtime@5.8.35/helpers/inherits', 'npm:babel-runtime@5.8.35/helpers/create-class', 'npm:babel-runtime@5.8.35/helpers/class-call-check', 'npm:react@0.14.7', 'npm:debug@2.2.0', 'app/common/gab.js', 'npm:material-ui@0.14.4/lib'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, React, Debug, Gab, Divider, FontIcon, Styles, CardText, Card, CardActions, CardHeader, CardMedia, CardTitle, debug, Disconnect;

	return {
		setters: [function (_npmBabelRuntime5835HelpersGet) {
			_get = _npmBabelRuntime5835HelpersGet['default'];
		}, function (_npmBabelRuntime5835HelpersInherits) {
			_inherits = _npmBabelRuntime5835HelpersInherits['default'];
		}, function (_npmBabelRuntime5835HelpersCreateClass) {
			_createClass = _npmBabelRuntime5835HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5835HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5835HelpersClassCallCheck['default'];
		}, function (_npmReact0147) {
			React = _npmReact0147['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_npmMaterialUi0144Lib) {
			Divider = _npmMaterialUi0144Lib.Divider;
			FontIcon = _npmMaterialUi0144Lib.FontIcon;
			Styles = _npmMaterialUi0144Lib.Styles;
			CardText = _npmMaterialUi0144Lib.CardText;
			Card = _npmMaterialUi0144Lib.Card;
			CardActions = _npmMaterialUi0144Lib.CardActions;
			CardHeader = _npmMaterialUi0144Lib.CardHeader;
			CardMedia = _npmMaterialUi0144Lib.CardMedia;
			CardTitle = _npmMaterialUi0144Lib.CardTitle;
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
							'div',
							{ className: 'col-xs-12' },
							React.createElement(
								Card,
								null,
								React.createElement(CardTitle, {
									title: "404",
									subtitle: "The requested page could not be found",
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
System.register('app/routes.js', ['app/pages/home.js', 'app/pages/status.js', 'app/pages/builds.js', 'npm:lodash@3.10.1', 'npm:debug@2.2.0', 'app/pages/404.js'], function (_export) {
	'use strict';

	var Home, Status, Builds, isObject, Debug, fourofour, debug, routes, routeConfig;
	return {
		setters: [function (_appPagesHomeJs) {
			Home = _appPagesHomeJs['default'];
		}, function (_appPagesStatusJs) {
			Status = _appPagesStatusJs['default'];
		}, function (_appPagesBuildsJs) {
			Builds = _appPagesBuildsJs['default'];
		}, function (_npmLodash3101) {
			isObject = _npmLodash3101.isObject;
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appPages404Js) {
			fourofour = _appPages404Js['default'];
		}],
		execute: function () {
			debug = Debug('simpledocs:app:routes');
			routes = {
				status: Status,
				builds: Builds,
				redirect: {
					lost: '404',
					disconnected: 'status'
				}
			};

			routes['404'] = fourofour;

			routeConfig = function routeConfig(route) {
				debug(route, isObject(routes[route]));
				if (routes[route]) {
					if (isObject(routes[route]) && 'function' !== typeof routes[route]) {
						return Home;
					} else {
						return routes[route];
					}
				} else if (routes.redirect[route]) {
					return routes[routes.redirect[route]];
				} else {
					return Home;
				}
			};

			_export('default', routeConfig);
		}
	};
});
System.register('app/render.js', ['npm:babel-runtime@5.8.35/helpers/get', 'npm:babel-runtime@5.8.35/helpers/inherits', 'npm:babel-runtime@5.8.35/helpers/create-class', 'npm:babel-runtime@5.8.35/helpers/class-call-check', 'npm:babel-runtime@5.8.35/helpers/extends', 'npm:babel-runtime@5.8.35/core-js/object/assign', 'npm:react@0.14.7', 'npm:react-dom@0.14.7', 'github:jspm/nodelibs-path@0.1.0', 'app/listen.js', 'npm:debug@2.2.0', 'app/common/gab.js', 'app/common/styles.js', 'app/common/components/snackbar.js', 'app/common/components/menu.js', 'app/common/components/menu2.js', 'app/common/components/confirm.js', 'app/routes.js', 'npm:material-ui@0.14.4/lib', 'npm:react-tap-event-plugin@0.2.2'], function (_export) {
	var _get, _inherits, _createClass, _classCallCheck, _extends, _Object$assign, React, Component, ReactDOM, Path, wrapListeners, Debug, Gab, myStyles, myStylesLight, myStylesDefault, myStylesDefaultDark, Snackbar, Menu, Menu2, Confirm, routes, Card, CardText, FontIcon, IconMenu, IconButton, AppBar, RaisedButton, LeftNav, MenuItem, Styles, Divider, List, ListItem, injectTapEventPlugin, debug, Main;

	return {
		setters: [function (_npmBabelRuntime5835HelpersGet) {
			_get = _npmBabelRuntime5835HelpersGet['default'];
		}, function (_npmBabelRuntime5835HelpersInherits) {
			_inherits = _npmBabelRuntime5835HelpersInherits['default'];
		}, function (_npmBabelRuntime5835HelpersCreateClass) {
			_createClass = _npmBabelRuntime5835HelpersCreateClass['default'];
		}, function (_npmBabelRuntime5835HelpersClassCallCheck) {
			_classCallCheck = _npmBabelRuntime5835HelpersClassCallCheck['default'];
		}, function (_npmBabelRuntime5835HelpersExtends) {
			_extends = _npmBabelRuntime5835HelpersExtends['default'];
		}, function (_npmBabelRuntime5835CoreJsObjectAssign) {
			_Object$assign = _npmBabelRuntime5835CoreJsObjectAssign['default'];
		}, function (_npmReact0147) {
			React = _npmReact0147['default'];
			Component = _npmReact0147.Component;
		}, function (_npmReactDom0147) {
			ReactDOM = _npmReactDom0147['default'];
		}, function (_githubJspmNodelibsPath010) {
			Path = _githubJspmNodelibsPath010['default'];
		}, function (_appListenJs) {
			wrapListeners = _appListenJs['default'];
		}, function (_npmDebug220) {
			Debug = _npmDebug220['default'];
		}, function (_appCommonGabJs) {
			Gab = _appCommonGabJs['default'];
		}, function (_appCommonStylesJs) {
			myStyles = _appCommonStylesJs.myStyles;
			myStylesLight = _appCommonStylesJs.myStylesLight;
			myStylesDefault = _appCommonStylesJs.myStylesDefault;
			myStylesDefaultDark = _appCommonStylesJs.myStylesDefaultDark;
		}, function (_appCommonComponentsSnackbarJs) {
			Snackbar = _appCommonComponentsSnackbarJs['default'];
		}, function (_appCommonComponentsMenuJs) {
			Menu = _appCommonComponentsMenuJs['default'];
		}, function (_appCommonComponentsMenu2Js) {
			Menu2 = _appCommonComponentsMenu2Js['default'];
		}, function (_appCommonComponentsConfirmJs) {
			Confirm = _appCommonComponentsConfirmJs['default'];
		}, function (_appRoutesJs) {
			routes = _appRoutesJs['default'];
		}, function (_npmMaterialUi0144Lib) {
			Card = _npmMaterialUi0144Lib.Card;
			CardText = _npmMaterialUi0144Lib.CardText;
			FontIcon = _npmMaterialUi0144Lib.FontIcon;
			IconMenu = _npmMaterialUi0144Lib.IconMenu;
			IconButton = _npmMaterialUi0144Lib.IconButton;
			AppBar = _npmMaterialUi0144Lib.AppBar;
			RaisedButton = _npmMaterialUi0144Lib.RaisedButton;
			LeftNav = _npmMaterialUi0144Lib.LeftNav;
			MenuItem = _npmMaterialUi0144Lib.MenuItem;
			Styles = _npmMaterialUi0144Lib.Styles;
			Divider = _npmMaterialUi0144Lib.Divider;
			List = _npmMaterialUi0144Lib.List;
			ListItem = _npmMaterialUi0144Lib.ListItem;
		}, function (_npmReactTapEventPlugin022) {
			injectTapEventPlugin = _npmReactTapEventPlugin022['default'];
		}],
		execute: function () {

			//Needed for onTouchTap
			//Can go away when react 1.0 release
			//Check this repo:
			//https://github.com/zilverline/react-tap-event-plugin
			'use strict';

			injectTapEventPlugin();

			debug = Debug('simpledocs:app:render');

			Main = (function (_Component) {
				_inherits(Main, _Component);

				function Main(props) {
					_classCallCheck(this, Main);

					// we get props from Listener
					_get(Object.getPrototypeOf(Main.prototype), 'constructor', this).call(this, props);

					debug(props, 'location', location);

					this.styles = {
						main: Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme), _Object$assign(myStylesLight, snowUI.materialStyle.main)),
						night: Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme), _Object$assign(myStyles, snowUI.materialStyle.mainDark)),
						blue: Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme), _Object$assign(myStylesDefault, snowUI.materialStyle.defaultLight)),
						dark: Styles.ThemeManager.modifyRawThemePalette(Styles.ThemeManager.getMuiTheme(Styles.DarkRawTheme), _Object$assign(myStylesDefaultDark, snowUI.materialStyle.defaultDark))
					};
					debug('blue theme', this.styles.blue);

					this.styles.main.appBar.textColor = Styles.Colors.grey700;

					var clean = location.pathname;

					var pages = clean.replace(snowUI.path.material, '').split('/');
					var page = pages[1] || snowUI.homepage;
					var anchor = pages[2] || false;

					debug('clean page', page, pages, anchor);

					if (page.charAt(0) == '/') {
						page = page.substring(1);
					}

					var search = false;
					if (page.search('::') > -1) {
						var ss = page.split('::');
						search = ss[1];
					}

					this.state = _Object$assign({
						leftNav: false,
						theme: this.styles.main,
						current: {},
						contents: false,
						newalert: {},
						allinone: snowUI.allinone === 'only',
						newconfirm: {
							open: false
						},
						anchor: anchor,
						search: search || history.search || false,
						page: page || snowUI.homepage
					}, props);

					this._defaults = {
						leftNav: false,
						current: {},
						contents: false,
						allinone: false,
						search: '',
						forceUpdate: false,
						anchor: false,
						forceGrab: false
					};

					debug('fresh state', this.state);

					this.handleLeftNav = this.handleLeftNav.bind(this);
					this.LeftNavClose = this.LeftNavClose.bind(this);
					this.goTo = this.goTo.bind(this);
					this.allInOne = this.allInOne.bind(this);
					this.goToAnchor = this.goToAnchor.bind(this);
					this.setAsset = this.setAsset.bind(this);
					this.answerConfirm = this.answerConfirm.bind(this);
					this.switchTheme = this.switchTheme.bind(this);
					this.searchToggle = this.searchToggle.bind(this);
				}

				_createClass(Main, [{
					key: 'componentDidMount',
					value: function componentDidMount() {

						/* set the theme */
						if (snowUI.materialTheme) {
							this.switchTheme(snowUI.materialTheme);
						}

						/* set the height of the menu and minimum height of content */
						var menu = document.getElementById('menu');
						var clientHeight = document.documentElement.clientHeight;
						var footer = document.getElementById('simpledocs-footer');
						var appbar = document.getElementById('appbar');

						menu.style.height = clientHeight - appbar.clientHeight + "px";
						debug('menu height', clientHeight, appbar.clientHeight, clientHeight - appbar.clientHeight, menu.style.height, menu.style);
						//snowUI.contentHeight = clientHeight - appbar.clientHeight - footer.clientHeight - 25;
					}
				}, {
					key: 'componentWillReceiveProps',
					value: function componentWillReceiveProps(props) {
						// update from listener
						var p = _extends({}, props);
						debug('listener props', p);
						if (props.page === snowUI.singlePage && !this.state.allinone) {
							p.allinone = true;
						}
						this.setState(p);
					}
				}, {
					key: 'componentWillUnmount',
					value: function componentWillUnmount() {}
				}, {
					key: 'switchTheme',
					value: function switchTheme() {
						var theme = arguments.length <= 0 || arguments[0] === undefined ? 'main' : arguments[0];

						var style = this.styles[theme];
						if (!style) {
							style = this.styles.main;
						}
						if (theme == 'dark') {
							snowUI.setTheme('dark-theme');
							snowUI.shortenTitle = false;
						} else if (theme == 'graphite') {
							snowUI.setTheme('dark-theme graphite');
							snowUI.shortenTitle = true;
						} else if (theme == 'night') {
							snowUI.setTheme('dark-theme default');
							snowUI.shortenTitle = false;
						} else if (theme == 'cream') {
							snowUI.setTheme('');
							snowUI.shortenTitle = true;
						} else if (theme == 'light') {
							snowUI.setTheme('light-theme theme-light ');
							snowUI.shortenTitle = true;
						} else {
							snowUI.setTheme('light-theme blue');
							snowUI.shortenTitle = false;
						}
						this.setState({
							theme: style,
							forceUpdate: true
						}, function () {
							Prism.highlightAll();
						});
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
					key: 'searchToggle',
					value: function searchToggle(e) {
						var _this = this;

						var target = $(e.target).parent().prev();
						target.toggleClass('open');
						debug('searchToggle', target);
						var $input = target.find('input');
						$input.val('');
						$input.focus();
						$input.keypress(function (event) {
							// keyboard Enter event
							if (event.which == 13) {
								event.preventDefault();
								var state = {
									page: 'search::' + $input.val(),
									search: $input.val()
								};

								_this.props.setState(_Object$assign(_extends({}, _this._defaults), state), function () {
									_this.state.history.push({
										pathname: 'search::',
										search: $input.val()
									});
								});
							}
						});
					}
				}, {
					key: 'goToAnchor',
					value: function goToAnchor(route, v) {
						var _this2 = this;

						debug('goToAnchor', route, v);
						var simple = document.getElementById("simpledocs");
						var goto = document.getElementById(route) ? document.getElementById(route).offsetTop : 0;
						simple.scrollTop = goto < 30 ? 0 : goto - 30;

						var state = {
							allinone: true,
							anchor: route,
							contents: this.props.contents
						};

						this.props.setState(_Object$assign(_extends({}, this._defaults), state), function () {
							_this2.state.history.push({
								pathname: Path.join('/', snowUI.singlePage, route),
								search: _this2.state.query
							});
						});
						return false;
					}
				}, {
					key: 'allInOne',
					value: function allInOne(slug) {
						var _this3 = this;

						debug('goTo allinone');

						var state = {
							page: snowUI.singlePage,
							anchor: slug || snowUI.page,
							allinone: true
						};

						// fade the content div before its replaced
						snowUI.fadeOut('slow', function () {
							_this3.props.setState(_Object$assign(_extends({}, _this3._defaults), state), function () {
								var simple = document.getElementById("simpledocs");
								simple.scrollTop = 0;
								debug('push history', '/', snowUI.singlePage, state.anchor);
								_this3.state.history.push({
									pathname: Path.join('/', snowUI.singlePage, state.anchor),
									search: _this3.state.query
								});
							});
						});
					}
				}, {
					key: 'goTo',
					value: function goTo(state) {
						var _this4 = this;

						debug('goTo state', state);

						if (typeof state === 'string') {
							// accept strings for the page
							state = {
								page: state
							};
						}

						if (this.props.page === snowUI.singlePage) {
							state.forceGrab = true;
						}

						// fade the content div before its replaced
						snowUI.fadeOut('slow', function () {
							var send = _Object$assign(_extends({}, _this4._defaults), state);

							_this4.props.setState(send, function () {
								debug('push history ', '/', _this4.state.page, _this4._defaults, state, send);
								_this4.state.history.push({
									pathname: Path.join('/', _this4.state.page),
									search: _this4.state.query
								});
							});
						});
					}
				}, {
					key: 'setAsset',
					value: function setAsset(asset, callback) {
						this.setState(asset, callback);
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
					key: 'answerConfirm',
					value: function answerConfirm(success) {
						if (success) {
							if (typeof this.state.newconfirm.answer === 'function') {
								this.state.newconfirm.answer(this.state.answerConfirm);
							} else if (typeof this[this.state.answerMethod] === 'function') {
								this[this.state.answerMethod](this.state.answerConfirm);
							}
						}
						this.setState({
							newconfirm: {
								open: false
							},
							answerConfirm: false
						});
					}
				}, {
					key: 'render',
					value: function render() {
						var _this5 = this;

						debug('render state', this.state);

						var title = this.state.current.title || this.state.page;

						var isConnectedIcon = this.state.connected === true || !snowUI.usesockets ? React.createElement(
							IconButton,
							{ onClick: function (e) {
									e.preventDefault();_this5.goTo('status');
								} },
							React.createElement(
								FontIcon,
								{ className: 'material-icons' },
								'info_outline'
							)
						) : React.createElement(
							'span',
							null,
							React.createElement(
								IconButton,
								{ onClick: function (e) {
										e.preventDefault();_this5.goTo('Status');
									} },
								React.createElement(
									FontIcon,
									{ className: 'material-icons', style: { fontSize: '20px' }, color: Styles.Colors.red900, hoverColor: Styles.Colors.red500, title: 'Connection to server lost' },
									'cloud_offline'
								)
							)
						);

						var appBarRightIcons = React.createElement(
							'span',
							null,
							isConnectedIcon,
							React.createElement(
								'span',
								{ style: { cursor: 'pointer' } },
								React.createElement(
									IconMenu,
									{
										iconButtonElement: React.createElement(
											FontIcon,
											{ className: 'material-icons' },
											'invert_colors'
										),
										onItemTouchTap: function (e, val) {
											debug(e, val);
											if (val.props.value === 'boot') {
												return location.href = snowUI.path.bootstrap;
											}
											_this5.switchTheme(val.props.value);
										}
									},
									React.createElement(MenuItem, { primaryText: 'Cream', value: 'cream' }),
									React.createElement(MenuItem, { primaryText: 'Light', value: 'light' }),
									React.createElement(MenuItem, { primaryText: 'Blue', value: 'blue' }),
									React.createElement(MenuItem, { primaryText: 'Graphite', value: 'graphite' }),
									React.createElement(MenuItem, { primaryText: 'Night', value: 'night' }),
									React.createElement(MenuItem, { primaryText: 'Dark', value: 'dark' }),
									React.createElement(MenuItem, { primaryText: 'Bootstrap', value: 'boot' })
								)
							),
							React.createElement(
								IconButton,
								{ onClick: function (e) {
										e.preventDefault();_this5.goTo(snowUI.homepage);
									} },
								React.createElement(
									FontIcon,
									{ className: 'material-icons' },
									'home'
								)
							),
							React.createElement('div', { style: { width: 20, height: 20, display: 'inline-block' } })
						);

						var appbar = React.createElement(
							'div',
							{ id: 'appbar' },
							' ',
							React.createElement(
								'div',
								{ style: { zIndex: 1101, width: '100%', height: '64px', position: 'fixed' } },
								React.createElement(AppBar, {
									title: React.createElement(
										'div',
										{ id: 'appbarTitle' },
										title
									),
									onLeftIconButtonTouchTap: this.handleLeftNav,
									iconElementRight: appBarRightIcons,
									style: { boxShadow: 'none' }
								})
							),
							React.createElement('div', { style: { height: 65, width: '100%' } })
						);

						var Page = routes(this.state.page);

						var xs = snowUI.breaks.menu[0] === 12 ? 'hidden-xs' : 'col-xs-' + snowUI.breaks.menu[0];
						var sm = snowUI.breaks.menu[1] === 12 ? 'hidden-sm' : 'col-sm-' + snowUI.breaks.menu[1];
						var md = snowUI.breaks.menu[2] === 0 ? 'hidden-md' : 'col-md-' + snowUI.breaks.menu[2];
						var lg = snowUI.breaks.menu[3] === 0 ? 'hidden-lg' : 'col-lg-' + snowUI.breaks.menu[3];
						var xsC = snowUI.breaks.content[0] === 0 ? 'hidden-xs' : 'col-xs-' + snowUI.breaks.content[0];
						var smC = snowUI.breaks.content[1] === 0 ? 'hidden-sm' : 'col-sm-' + snowUI.breaks.content[1];
						var mdC = snowUI.breaks.content[2] === 0 ? 'hidden-md' : 'col-md-' + snowUI.breaks.content[2];
						var lgC = snowUI.breaks.content[3] === 0 ? 'hidden-lg' : 'col-lg-' + snowUI.breaks.content[3];

						return React.createElement(
							'div',
							null,
							appbar,
							React.createElement(Menu2, _extends({ update: snowUI.alwaysloadtree, docked: true, searchToggle: this.searchToggle, goTo: this.goTo, handleLeftNav: this.handleLeftNav, goToAnchor: this.goToAnchor, allInOne: this.allInOne }, this.state)),
							React.createElement('div', { className: 'clearfix' }),
							React.createElement(
								'div',
								{ className: 'simpledocs-container' },
								React.createElement(
									'div',
									{ className: xs + " " + sm + " " + md + " " + lg + " ", style: { padding: 0 } },
									React.createElement(
										'div',
										{ id: 'menu', className: xs + " " + sm + " " + md + " " + lg + " no-padding" },
										React.createElement(Menu2, _extends({ update: snowUI.alwaysloadtree, docked: false, searchToggle: this.searchToggle, goTo: this.goTo, handleLeftNav: this.handleLeftNav, goToAnchor: this.goToAnchor, allInOne: this.allInOne }, this.state))
									)
								),
								React.createElement(
									'div',
									{ style: { paddingRight: 0, paddingLeft: 0 }, className: xsC + " " + smC + " " + mdC + " " + lgC + " " },
									React.createElement(
										'div',
										{ id: 'content-fader' },
										React.createElement(Page, _extends({}, this.state, { assets: this.setAsset, switchTheme: this.switchTheme, goTo: this.goTo, handleLeftNav: this.handleLeftNav, goToAnchor: this.goToAnchor, allInOne: this.allInOne }))
									)
								)
							),
							React.createElement('div', { className: 'clearfix' }),
							React.createElement('div', { className: 'simpledocs-footer', id: 'simpledocs-footer' }),
							React.createElement(Confirm, {
								html: this.state.newconfirm.html,
								title: this.state.newconfirm.title,
								answer: this.answerConfirm,
								open: this.state.newconfirm.open,
								yesText: this.state.newconfirm.yesText,
								noText: this.state.newconfirm.noText
							})
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
System.registerDynamic("npm:core-js@1.2.6/library/modules/es6.object.keys", ["npm:core-js@1.2.6/library/modules/$.to-object", "npm:core-js@1.2.6/library/modules/$.object-sap"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toObject = $__require('npm:core-js@1.2.6/library/modules/$.to-object');
  $__require('npm:core-js@1.2.6/library/modules/$.object-sap')('keys', function($keys) {
    return function keys(it) {
      return $keys(toObject(it));
    };
  });
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/fn/object/keys", ["npm:core-js@1.2.6/library/modules/es6.object.keys", "npm:core-js@1.2.6/library/modules/$.core"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('npm:core-js@1.2.6/library/modules/es6.object.keys');
  module.exports = $__require('npm:core-js@1.2.6/library/modules/$.core').Object.keys;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.35/core-js/object/keys", ["npm:core-js@1.2.6/library/fn/object/keys"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('npm:core-js@1.2.6/library/fn/object/keys'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.string-at", ["npm:core-js@1.2.6/library/modules/$.to-integer", "npm:core-js@1.2.6/library/modules/$.defined"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toInteger = $__require('npm:core-js@1.2.6/library/modules/$.to-integer'),
      defined = $__require('npm:core-js@1.2.6/library/modules/$.defined');
  module.exports = function(TO_STRING) {
    return function(that, pos) {
      var s = String(defined(that)),
          i = toInteger(pos),
          l = s.length,
          a,
          b;
      if (i < 0 || i >= l)
        return TO_STRING ? '' : undefined;
      a = s.charCodeAt(i);
      return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
    };
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/es6.string.iterator", ["npm:core-js@1.2.6/library/modules/$.string-at", "npm:core-js@1.2.6/library/modules/$.iter-define"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $at = $__require('npm:core-js@1.2.6/library/modules/$.string-at')(true);
  $__require('npm:core-js@1.2.6/library/modules/$.iter-define')(String, 'String', function(iterated) {
    this._t = String(iterated);
    this._i = 0;
  }, function() {
    var O = this._t,
        index = this._i,
        point;
    if (index >= O.length)
      return {
        value: undefined,
        done: true
      };
    point = $at(O, index);
    this._i += point.length;
    return {
      value: point,
      done: false
    };
  });
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.same-value", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = Object.is || function is(x, y) {
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.species-constructor", ["npm:core-js@1.2.6/library/modules/$.an-object", "npm:core-js@1.2.6/library/modules/$.a-function", "npm:core-js@1.2.6/library/modules/$.wks"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var anObject = $__require('npm:core-js@1.2.6/library/modules/$.an-object'),
      aFunction = $__require('npm:core-js@1.2.6/library/modules/$.a-function'),
      SPECIES = $__require('npm:core-js@1.2.6/library/modules/$.wks')('species');
  module.exports = function(O, D) {
    var C = anObject(O).constructor,
        S;
    return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.invoke", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(fn, args, that) {
    var un = that === undefined;
    switch (args.length) {
      case 0:
        return un ? fn() : fn.call(that);
      case 1:
        return un ? fn(args[0]) : fn.call(that, args[0]);
      case 2:
        return un ? fn(args[0], args[1]) : fn.call(that, args[0], args[1]);
      case 3:
        return un ? fn(args[0], args[1], args[2]) : fn.call(that, args[0], args[1], args[2]);
      case 4:
        return un ? fn(args[0], args[1], args[2], args[3]) : fn.call(that, args[0], args[1], args[2], args[3]);
    }
    return fn.apply(that, args);
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.html", ["npm:core-js@1.2.6/library/modules/$.global"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:core-js@1.2.6/library/modules/$.global').document && document.documentElement;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.dom-create", ["npm:core-js@1.2.6/library/modules/$.is-object", "npm:core-js@1.2.6/library/modules/$.global"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var isObject = $__require('npm:core-js@1.2.6/library/modules/$.is-object'),
      document = $__require('npm:core-js@1.2.6/library/modules/$.global').document,
      is = isObject(document) && isObject(document.createElement);
  module.exports = function(it) {
    return is ? document.createElement(it) : {};
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.task", ["npm:core-js@1.2.6/library/modules/$.ctx", "npm:core-js@1.2.6/library/modules/$.invoke", "npm:core-js@1.2.6/library/modules/$.html", "npm:core-js@1.2.6/library/modules/$.dom-create", "npm:core-js@1.2.6/library/modules/$.global", "npm:core-js@1.2.6/library/modules/$.cof", "github:jspm/nodelibs-process@0.1.2"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    var ctx = $__require('npm:core-js@1.2.6/library/modules/$.ctx'),
        invoke = $__require('npm:core-js@1.2.6/library/modules/$.invoke'),
        html = $__require('npm:core-js@1.2.6/library/modules/$.html'),
        cel = $__require('npm:core-js@1.2.6/library/modules/$.dom-create'),
        global = $__require('npm:core-js@1.2.6/library/modules/$.global'),
        process = global.process,
        setTask = global.setImmediate,
        clearTask = global.clearImmediate,
        MessageChannel = global.MessageChannel,
        counter = 0,
        queue = {},
        ONREADYSTATECHANGE = 'onreadystatechange',
        defer,
        channel,
        port;
    var run = function() {
      var id = +this;
      if (queue.hasOwnProperty(id)) {
        var fn = queue[id];
        delete queue[id];
        fn();
      }
    };
    var listner = function(event) {
      run.call(event.data);
    };
    if (!setTask || !clearTask) {
      setTask = function setImmediate(fn) {
        var args = [],
            i = 1;
        while (arguments.length > i)
          args.push(arguments[i++]);
        queue[++counter] = function() {
          invoke(typeof fn == 'function' ? fn : Function(fn), args);
        };
        defer(counter);
        return counter;
      };
      clearTask = function clearImmediate(id) {
        delete queue[id];
      };
      if ($__require('npm:core-js@1.2.6/library/modules/$.cof')(process) == 'process') {
        defer = function(id) {
          process.nextTick(ctx(run, id, 1));
        };
      } else if (MessageChannel) {
        channel = new MessageChannel;
        port = channel.port2;
        channel.port1.onmessage = listner;
        defer = ctx(port.postMessage, port, 1);
      } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
        defer = function(id) {
          global.postMessage(id + '', '*');
        };
        global.addEventListener('message', listner, false);
      } else if (ONREADYSTATECHANGE in cel('script')) {
        defer = function(id) {
          html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function() {
            html.removeChild(this);
            run.call(id);
          };
        };
      } else {
        defer = function(id) {
          setTimeout(ctx(run, id, 1), 0);
        };
      }
    }
    module.exports = {
      set: setTask,
      clear: clearTask
    };
  })($__require('github:jspm/nodelibs-process@0.1.2'));
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.microtask", ["npm:core-js@1.2.6/library/modules/$.global", "npm:core-js@1.2.6/library/modules/$.task", "npm:core-js@1.2.6/library/modules/$.cof", "github:jspm/nodelibs-process@0.1.2"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    var global = $__require('npm:core-js@1.2.6/library/modules/$.global'),
        macrotask = $__require('npm:core-js@1.2.6/library/modules/$.task').set,
        Observer = global.MutationObserver || global.WebKitMutationObserver,
        process = global.process,
        Promise = global.Promise,
        isNode = $__require('npm:core-js@1.2.6/library/modules/$.cof')(process) == 'process',
        head,
        last,
        notify;
    var flush = function() {
      var parent,
          domain,
          fn;
      if (isNode && (parent = process.domain)) {
        process.domain = null;
        parent.exit();
      }
      while (head) {
        domain = head.domain;
        fn = head.fn;
        if (domain)
          domain.enter();
        fn();
        if (domain)
          domain.exit();
        head = head.next;
      }
      last = undefined;
      if (parent)
        parent.enter();
    };
    if (isNode) {
      notify = function() {
        process.nextTick(flush);
      };
    } else if (Observer) {
      var toggle = 1,
          node = document.createTextNode('');
      new Observer(flush).observe(node, {characterData: true});
      notify = function() {
        node.data = toggle = -toggle;
      };
    } else if (Promise && Promise.resolve) {
      notify = function() {
        Promise.resolve().then(flush);
      };
    } else {
      notify = function() {
        macrotask.call(global, flush);
      };
    }
    module.exports = function asap(fn) {
      var task = {
        fn: fn,
        next: undefined,
        domain: isNode && process.domain
      };
      if (last)
        last.next = task;
      if (!head) {
        head = task;
        notify();
      }
      last = task;
    };
  })($__require('github:jspm/nodelibs-process@0.1.2'));
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.set-species", ["npm:core-js@1.2.6/library/modules/$.core", "npm:core-js@1.2.6/library/modules/$", "npm:core-js@1.2.6/library/modules/$.descriptors", "npm:core-js@1.2.6/library/modules/$.wks"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var core = $__require('npm:core-js@1.2.6/library/modules/$.core'),
      $ = $__require('npm:core-js@1.2.6/library/modules/$'),
      DESCRIPTORS = $__require('npm:core-js@1.2.6/library/modules/$.descriptors'),
      SPECIES = $__require('npm:core-js@1.2.6/library/modules/$.wks')('species');
  module.exports = function(KEY) {
    var C = core[KEY];
    if (DESCRIPTORS && C && !C[SPECIES])
      $.setDesc(C, SPECIES, {
        configurable: true,
        get: function() {
          return this;
        }
      });
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.iter-detect", ["npm:core-js@1.2.6/library/modules/$.wks"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var ITERATOR = $__require('npm:core-js@1.2.6/library/modules/$.wks')('iterator'),
      SAFE_CLOSING = false;
  try {
    var riter = [7][ITERATOR]();
    riter['return'] = function() {
      SAFE_CLOSING = true;
    };
    Array.from(riter, function() {
      throw 2;
    });
  } catch (e) {}
  module.exports = function(exec, skipClosing) {
    if (!skipClosing && !SAFE_CLOSING)
      return false;
    var safe = false;
    try {
      var arr = [7],
          iter = arr[ITERATOR]();
      iter.next = function() {
        safe = true;
      };
      arr[ITERATOR] = function() {
        return iter;
      };
      exec(arr);
    } catch (e) {}
    return safe;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/es6.promise", ["npm:core-js@1.2.6/library/modules/$", "npm:core-js@1.2.6/library/modules/$.library", "npm:core-js@1.2.6/library/modules/$.global", "npm:core-js@1.2.6/library/modules/$.ctx", "npm:core-js@1.2.6/library/modules/$.classof", "npm:core-js@1.2.6/library/modules/$.export", "npm:core-js@1.2.6/library/modules/$.is-object", "npm:core-js@1.2.6/library/modules/$.an-object", "npm:core-js@1.2.6/library/modules/$.a-function", "npm:core-js@1.2.6/library/modules/$.strict-new", "npm:core-js@1.2.6/library/modules/$.for-of", "npm:core-js@1.2.6/library/modules/$.set-proto", "npm:core-js@1.2.6/library/modules/$.same-value", "npm:core-js@1.2.6/library/modules/$.wks", "npm:core-js@1.2.6/library/modules/$.species-constructor", "npm:core-js@1.2.6/library/modules/$.microtask", "npm:core-js@1.2.6/library/modules/$.descriptors", "npm:core-js@1.2.6/library/modules/$.redefine-all", "npm:core-js@1.2.6/library/modules/$.set-to-string-tag", "npm:core-js@1.2.6/library/modules/$.set-species", "npm:core-js@1.2.6/library/modules/$.core", "npm:core-js@1.2.6/library/modules/$.iter-detect", "github:jspm/nodelibs-process@0.1.2"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  (function(process) {
    'use strict';
    var $ = $__require('npm:core-js@1.2.6/library/modules/$'),
        LIBRARY = $__require('npm:core-js@1.2.6/library/modules/$.library'),
        global = $__require('npm:core-js@1.2.6/library/modules/$.global'),
        ctx = $__require('npm:core-js@1.2.6/library/modules/$.ctx'),
        classof = $__require('npm:core-js@1.2.6/library/modules/$.classof'),
        $export = $__require('npm:core-js@1.2.6/library/modules/$.export'),
        isObject = $__require('npm:core-js@1.2.6/library/modules/$.is-object'),
        anObject = $__require('npm:core-js@1.2.6/library/modules/$.an-object'),
        aFunction = $__require('npm:core-js@1.2.6/library/modules/$.a-function'),
        strictNew = $__require('npm:core-js@1.2.6/library/modules/$.strict-new'),
        forOf = $__require('npm:core-js@1.2.6/library/modules/$.for-of'),
        setProto = $__require('npm:core-js@1.2.6/library/modules/$.set-proto').set,
        same = $__require('npm:core-js@1.2.6/library/modules/$.same-value'),
        SPECIES = $__require('npm:core-js@1.2.6/library/modules/$.wks')('species'),
        speciesConstructor = $__require('npm:core-js@1.2.6/library/modules/$.species-constructor'),
        asap = $__require('npm:core-js@1.2.6/library/modules/$.microtask'),
        PROMISE = 'Promise',
        process = global.process,
        isNode = classof(process) == 'process',
        P = global[PROMISE],
        Wrapper;
    var testResolve = function(sub) {
      var test = new P(function() {});
      if (sub)
        test.constructor = Object;
      return P.resolve(test) === test;
    };
    var USE_NATIVE = function() {
      var works = false;
      function P2(x) {
        var self = new P(x);
        setProto(self, P2.prototype);
        return self;
      }
      try {
        works = P && P.resolve && testResolve();
        setProto(P2, P);
        P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
        if (!(P2.resolve(5).then(function() {}) instanceof P2)) {
          works = false;
        }
        if (works && $__require('npm:core-js@1.2.6/library/modules/$.descriptors')) {
          var thenableThenGotten = false;
          P.resolve($.setDesc({}, 'then', {get: function() {
              thenableThenGotten = true;
            }}));
          works = thenableThenGotten;
        }
      } catch (e) {
        works = false;
      }
      return works;
    }();
    var sameConstructor = function(a, b) {
      if (LIBRARY && a === P && b === Wrapper)
        return true;
      return same(a, b);
    };
    var getConstructor = function(C) {
      var S = anObject(C)[SPECIES];
      return S != undefined ? S : C;
    };
    var isThenable = function(it) {
      var then;
      return isObject(it) && typeof(then = it.then) == 'function' ? then : false;
    };
    var PromiseCapability = function(C) {
      var resolve,
          reject;
      this.promise = new C(function($$resolve, $$reject) {
        if (resolve !== undefined || reject !== undefined)
          throw TypeError('Bad Promise constructor');
        resolve = $$resolve;
        reject = $$reject;
      });
      this.resolve = aFunction(resolve), this.reject = aFunction(reject);
    };
    var perform = function(exec) {
      try {
        exec();
      } catch (e) {
        return {error: e};
      }
    };
    var notify = function(record, isReject) {
      if (record.n)
        return;
      record.n = true;
      var chain = record.c;
      asap(function() {
        var value = record.v,
            ok = record.s == 1,
            i = 0;
        var run = function(reaction) {
          var handler = ok ? reaction.ok : reaction.fail,
              resolve = reaction.resolve,
              reject = reaction.reject,
              result,
              then;
          try {
            if (handler) {
              if (!ok)
                record.h = true;
              result = handler === true ? value : handler(value);
              if (result === reaction.promise) {
                reject(TypeError('Promise-chain cycle'));
              } else if (then = isThenable(result)) {
                then.call(result, resolve, reject);
              } else
                resolve(result);
            } else
              reject(value);
          } catch (e) {
            reject(e);
          }
        };
        while (chain.length > i)
          run(chain[i++]);
        chain.length = 0;
        record.n = false;
        if (isReject)
          setTimeout(function() {
            var promise = record.p,
                handler,
                console;
            if (isUnhandled(promise)) {
              if (isNode) {
                process.emit('unhandledRejection', value, promise);
              } else if (handler = global.onunhandledrejection) {
                handler({
                  promise: promise,
                  reason: value
                });
              } else if ((console = global.console) && console.error) {
                console.error('Unhandled promise rejection', value);
              }
            }
            record.a = undefined;
          }, 1);
      });
    };
    var isUnhandled = function(promise) {
      var record = promise._d,
          chain = record.a || record.c,
          i = 0,
          reaction;
      if (record.h)
        return false;
      while (chain.length > i) {
        reaction = chain[i++];
        if (reaction.fail || !isUnhandled(reaction.promise))
          return false;
      }
      return true;
    };
    var $reject = function(value) {
      var record = this;
      if (record.d)
        return;
      record.d = true;
      record = record.r || record;
      record.v = value;
      record.s = 2;
      record.a = record.c.slice();
      notify(record, true);
    };
    var $resolve = function(value) {
      var record = this,
          then;
      if (record.d)
        return;
      record.d = true;
      record = record.r || record;
      try {
        if (record.p === value)
          throw TypeError("Promise can't be resolved itself");
        if (then = isThenable(value)) {
          asap(function() {
            var wrapper = {
              r: record,
              d: false
            };
            try {
              then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
            } catch (e) {
              $reject.call(wrapper, e);
            }
          });
        } else {
          record.v = value;
          record.s = 1;
          notify(record, false);
        }
      } catch (e) {
        $reject.call({
          r: record,
          d: false
        }, e);
      }
    };
    if (!USE_NATIVE) {
      P = function Promise(executor) {
        aFunction(executor);
        var record = this._d = {
          p: strictNew(this, P, PROMISE),
          c: [],
          a: undefined,
          s: 0,
          d: false,
          v: undefined,
          h: false,
          n: false
        };
        try {
          executor(ctx($resolve, record, 1), ctx($reject, record, 1));
        } catch (err) {
          $reject.call(record, err);
        }
      };
      $__require('npm:core-js@1.2.6/library/modules/$.redefine-all')(P.prototype, {
        then: function then(onFulfilled, onRejected) {
          var reaction = new PromiseCapability(speciesConstructor(this, P)),
              promise = reaction.promise,
              record = this._d;
          reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
          reaction.fail = typeof onRejected == 'function' && onRejected;
          record.c.push(reaction);
          if (record.a)
            record.a.push(reaction);
          if (record.s)
            notify(record, false);
          return promise;
        },
        'catch': function(onRejected) {
          return this.then(undefined, onRejected);
        }
      });
    }
    $export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: P});
    $__require('npm:core-js@1.2.6/library/modules/$.set-to-string-tag')(P, PROMISE);
    $__require('npm:core-js@1.2.6/library/modules/$.set-species')(PROMISE);
    Wrapper = $__require('npm:core-js@1.2.6/library/modules/$.core')[PROMISE];
    $export($export.S + $export.F * !USE_NATIVE, PROMISE, {reject: function reject(r) {
        var capability = new PromiseCapability(this),
            $$reject = capability.reject;
        $$reject(r);
        return capability.promise;
      }});
    $export($export.S + $export.F * (!USE_NATIVE || testResolve(true)), PROMISE, {resolve: function resolve(x) {
        if (x instanceof P && sameConstructor(x.constructor, this))
          return x;
        var capability = new PromiseCapability(this),
            $$resolve = capability.resolve;
        $$resolve(x);
        return capability.promise;
      }});
    $export($export.S + $export.F * !(USE_NATIVE && $__require('npm:core-js@1.2.6/library/modules/$.iter-detect')(function(iter) {
      P.all(iter)['catch'](function() {});
    })), PROMISE, {
      all: function all(iterable) {
        var C = getConstructor(this),
            capability = new PromiseCapability(C),
            resolve = capability.resolve,
            reject = capability.reject,
            values = [];
        var abrupt = perform(function() {
          forOf(iterable, false, values.push, values);
          var remaining = values.length,
              results = Array(remaining);
          if (remaining)
            $.each.call(values, function(promise, index) {
              var alreadyCalled = false;
              C.resolve(promise).then(function(value) {
                if (alreadyCalled)
                  return;
                alreadyCalled = true;
                results[index] = value;
                --remaining || resolve(results);
              }, reject);
            });
          else
            resolve(results);
        });
        if (abrupt)
          reject(abrupt.error);
        return capability.promise;
      },
      race: function race(iterable) {
        var C = getConstructor(this),
            capability = new PromiseCapability(C),
            reject = capability.reject;
        var abrupt = perform(function() {
          forOf(iterable, false, function(promise) {
            C.resolve(promise).then(capability.resolve, reject);
          });
        });
        if (abrupt)
          reject(abrupt.error);
        return capability.promise;
      }
    });
  })($__require('github:jspm/nodelibs-process@0.1.2'));
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/fn/promise", ["npm:core-js@1.2.6/library/modules/es6.object.to-string", "npm:core-js@1.2.6/library/modules/es6.string.iterator", "npm:core-js@1.2.6/library/modules/web.dom.iterable", "npm:core-js@1.2.6/library/modules/es6.promise", "npm:core-js@1.2.6/library/modules/$.core"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('npm:core-js@1.2.6/library/modules/es6.object.to-string');
  $__require('npm:core-js@1.2.6/library/modules/es6.string.iterator');
  $__require('npm:core-js@1.2.6/library/modules/web.dom.iterable');
  $__require('npm:core-js@1.2.6/library/modules/es6.promise');
  module.exports = $__require('npm:core-js@1.2.6/library/modules/$.core').Promise;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.35/core-js/promise", ["npm:core-js@1.2.6/library/fn/promise"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('npm:core-js@1.2.6/library/fn/promise'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/es6.object.to-string", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "format cjs";
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.add-to-unscopables", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function() {};
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.iter-step", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(done, value) {
    return {
      value: value,
      done: !!done
    };
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.library", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = true;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.iter-create", ["npm:core-js@1.2.6/library/modules/$", "npm:core-js@1.2.6/library/modules/$.property-desc", "npm:core-js@1.2.6/library/modules/$.set-to-string-tag", "npm:core-js@1.2.6/library/modules/$.hide", "npm:core-js@1.2.6/library/modules/$.wks"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = $__require('npm:core-js@1.2.6/library/modules/$'),
      descriptor = $__require('npm:core-js@1.2.6/library/modules/$.property-desc'),
      setToStringTag = $__require('npm:core-js@1.2.6/library/modules/$.set-to-string-tag'),
      IteratorPrototype = {};
  $__require('npm:core-js@1.2.6/library/modules/$.hide')(IteratorPrototype, $__require('npm:core-js@1.2.6/library/modules/$.wks')('iterator'), function() {
    return this;
  });
  module.exports = function(Constructor, NAME, next) {
    Constructor.prototype = $.create(IteratorPrototype, {next: descriptor(1, next)});
    setToStringTag(Constructor, NAME + ' Iterator');
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.iter-define", ["npm:core-js@1.2.6/library/modules/$.library", "npm:core-js@1.2.6/library/modules/$.export", "npm:core-js@1.2.6/library/modules/$.redefine", "npm:core-js@1.2.6/library/modules/$.hide", "npm:core-js@1.2.6/library/modules/$.has", "npm:core-js@1.2.6/library/modules/$.iterators", "npm:core-js@1.2.6/library/modules/$.iter-create", "npm:core-js@1.2.6/library/modules/$.set-to-string-tag", "npm:core-js@1.2.6/library/modules/$", "npm:core-js@1.2.6/library/modules/$.wks"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var LIBRARY = $__require('npm:core-js@1.2.6/library/modules/$.library'),
      $export = $__require('npm:core-js@1.2.6/library/modules/$.export'),
      redefine = $__require('npm:core-js@1.2.6/library/modules/$.redefine'),
      hide = $__require('npm:core-js@1.2.6/library/modules/$.hide'),
      has = $__require('npm:core-js@1.2.6/library/modules/$.has'),
      Iterators = $__require('npm:core-js@1.2.6/library/modules/$.iterators'),
      $iterCreate = $__require('npm:core-js@1.2.6/library/modules/$.iter-create'),
      setToStringTag = $__require('npm:core-js@1.2.6/library/modules/$.set-to-string-tag'),
      getProto = $__require('npm:core-js@1.2.6/library/modules/$').getProto,
      ITERATOR = $__require('npm:core-js@1.2.6/library/modules/$.wks')('iterator'),
      BUGGY = !([].keys && 'next' in [].keys()),
      FF_ITERATOR = '@@iterator',
      KEYS = 'keys',
      VALUES = 'values';
  var returnThis = function() {
    return this;
  };
  module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
    $iterCreate(Constructor, NAME, next);
    var getMethod = function(kind) {
      if (!BUGGY && kind in proto)
        return proto[kind];
      switch (kind) {
        case KEYS:
          return function keys() {
            return new Constructor(this, kind);
          };
        case VALUES:
          return function values() {
            return new Constructor(this, kind);
          };
      }
      return function entries() {
        return new Constructor(this, kind);
      };
    };
    var TAG = NAME + ' Iterator',
        DEF_VALUES = DEFAULT == VALUES,
        VALUES_BUG = false,
        proto = Base.prototype,
        $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT],
        $default = $native || getMethod(DEFAULT),
        methods,
        key;
    if ($native) {
      var IteratorPrototype = getProto($default.call(new Base));
      setToStringTag(IteratorPrototype, TAG, true);
      if (!LIBRARY && has(proto, FF_ITERATOR))
        hide(IteratorPrototype, ITERATOR, returnThis);
      if (DEF_VALUES && $native.name !== VALUES) {
        VALUES_BUG = true;
        $default = function values() {
          return $native.call(this);
        };
      }
    }
    if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
      hide(proto, ITERATOR, $default);
    }
    Iterators[NAME] = $default;
    Iterators[TAG] = returnThis;
    if (DEFAULT) {
      methods = {
        values: DEF_VALUES ? $default : getMethod(VALUES),
        keys: IS_SET ? $default : getMethod(KEYS),
        entries: !DEF_VALUES ? $default : getMethod('entries')
      };
      if (FORCED)
        for (key in methods) {
          if (!(key in proto))
            redefine(proto, key, methods[key]);
        }
      else
        $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
    }
    return methods;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/es6.array.iterator", ["npm:core-js@1.2.6/library/modules/$.add-to-unscopables", "npm:core-js@1.2.6/library/modules/$.iter-step", "npm:core-js@1.2.6/library/modules/$.iterators", "npm:core-js@1.2.6/library/modules/$.to-iobject", "npm:core-js@1.2.6/library/modules/$.iter-define"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var addToUnscopables = $__require('npm:core-js@1.2.6/library/modules/$.add-to-unscopables'),
      step = $__require('npm:core-js@1.2.6/library/modules/$.iter-step'),
      Iterators = $__require('npm:core-js@1.2.6/library/modules/$.iterators'),
      toIObject = $__require('npm:core-js@1.2.6/library/modules/$.to-iobject');
  module.exports = $__require('npm:core-js@1.2.6/library/modules/$.iter-define')(Array, 'Array', function(iterated, kind) {
    this._t = toIObject(iterated);
    this._i = 0;
    this._k = kind;
  }, function() {
    var O = this._t,
        kind = this._k,
        index = this._i++;
    if (!O || index >= O.length) {
      this._t = undefined;
      return step(1);
    }
    if (kind == 'keys')
      return step(0, index);
    if (kind == 'values')
      return step(0, O[index]);
    return step(0, [index, O[index]]);
  }, 'values');
  Iterators.Arguments = Iterators.Array;
  addToUnscopables('keys');
  addToUnscopables('values');
  addToUnscopables('entries');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/web.dom.iterable", ["npm:core-js@1.2.6/library/modules/es6.array.iterator", "npm:core-js@1.2.6/library/modules/$.iterators"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('npm:core-js@1.2.6/library/modules/es6.array.iterator');
  var Iterators = $__require('npm:core-js@1.2.6/library/modules/$.iterators');
  Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.is-array", ["npm:core-js@1.2.6/library/modules/$.cof"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var cof = $__require('npm:core-js@1.2.6/library/modules/$.cof');
  module.exports = Array.isArray || function(arg) {
    return cof(arg) == 'Array';
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.array-species-create", ["npm:core-js@1.2.6/library/modules/$.is-object", "npm:core-js@1.2.6/library/modules/$.is-array", "npm:core-js@1.2.6/library/modules/$.wks"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var isObject = $__require('npm:core-js@1.2.6/library/modules/$.is-object'),
      isArray = $__require('npm:core-js@1.2.6/library/modules/$.is-array'),
      SPECIES = $__require('npm:core-js@1.2.6/library/modules/$.wks')('species');
  module.exports = function(original, length) {
    var C;
    if (isArray(original)) {
      C = original.constructor;
      if (typeof C == 'function' && (C === Array || isArray(C.prototype)))
        C = undefined;
      if (isObject(C)) {
        C = C[SPECIES];
        if (C === null)
          C = undefined;
      }
    }
    return new (C === undefined ? Array : C)(length);
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.array-methods", ["npm:core-js@1.2.6/library/modules/$.ctx", "npm:core-js@1.2.6/library/modules/$.iobject", "npm:core-js@1.2.6/library/modules/$.to-object", "npm:core-js@1.2.6/library/modules/$.to-length", "npm:core-js@1.2.6/library/modules/$.array-species-create"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var ctx = $__require('npm:core-js@1.2.6/library/modules/$.ctx'),
      IObject = $__require('npm:core-js@1.2.6/library/modules/$.iobject'),
      toObject = $__require('npm:core-js@1.2.6/library/modules/$.to-object'),
      toLength = $__require('npm:core-js@1.2.6/library/modules/$.to-length'),
      asc = $__require('npm:core-js@1.2.6/library/modules/$.array-species-create');
  module.exports = function(TYPE) {
    var IS_MAP = TYPE == 1,
        IS_FILTER = TYPE == 2,
        IS_SOME = TYPE == 3,
        IS_EVERY = TYPE == 4,
        IS_FIND_INDEX = TYPE == 6,
        NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
    return function($this, callbackfn, that) {
      var O = toObject($this),
          self = IObject(O),
          f = ctx(callbackfn, that, 3),
          length = toLength(self.length),
          index = 0,
          result = IS_MAP ? asc($this, length) : IS_FILTER ? asc($this, 0) : undefined,
          val,
          res;
      for (; length > index; index++)
        if (NO_HOLES || index in self) {
          val = self[index];
          res = f(val, index, O);
          if (TYPE) {
            if (IS_MAP)
              result[index] = res;
            else if (res)
              switch (TYPE) {
                case 3:
                  return true;
                case 5:
                  return val;
                case 6:
                  return index;
                case 2:
                  result.push(val);
              }
            else if (IS_EVERY)
              return false;
          }
        }
      return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
    };
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.collection-weak", ["npm:core-js@1.2.6/library/modules/$.hide", "npm:core-js@1.2.6/library/modules/$.redefine-all", "npm:core-js@1.2.6/library/modules/$.an-object", "npm:core-js@1.2.6/library/modules/$.is-object", "npm:core-js@1.2.6/library/modules/$.strict-new", "npm:core-js@1.2.6/library/modules/$.for-of", "npm:core-js@1.2.6/library/modules/$.array-methods", "npm:core-js@1.2.6/library/modules/$.has", "npm:core-js@1.2.6/library/modules/$.uid"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var hide = $__require('npm:core-js@1.2.6/library/modules/$.hide'),
      redefineAll = $__require('npm:core-js@1.2.6/library/modules/$.redefine-all'),
      anObject = $__require('npm:core-js@1.2.6/library/modules/$.an-object'),
      isObject = $__require('npm:core-js@1.2.6/library/modules/$.is-object'),
      strictNew = $__require('npm:core-js@1.2.6/library/modules/$.strict-new'),
      forOf = $__require('npm:core-js@1.2.6/library/modules/$.for-of'),
      createArrayMethod = $__require('npm:core-js@1.2.6/library/modules/$.array-methods'),
      $has = $__require('npm:core-js@1.2.6/library/modules/$.has'),
      WEAK = $__require('npm:core-js@1.2.6/library/modules/$.uid')('weak'),
      isExtensible = Object.isExtensible || isObject,
      arrayFind = createArrayMethod(5),
      arrayFindIndex = createArrayMethod(6),
      id = 0;
  var frozenStore = function(that) {
    return that._l || (that._l = new FrozenStore);
  };
  var FrozenStore = function() {
    this.a = [];
  };
  var findFrozen = function(store, key) {
    return arrayFind(store.a, function(it) {
      return it[0] === key;
    });
  };
  FrozenStore.prototype = {
    get: function(key) {
      var entry = findFrozen(this, key);
      if (entry)
        return entry[1];
    },
    has: function(key) {
      return !!findFrozen(this, key);
    },
    set: function(key, value) {
      var entry = findFrozen(this, key);
      if (entry)
        entry[1] = value;
      else
        this.a.push([key, value]);
    },
    'delete': function(key) {
      var index = arrayFindIndex(this.a, function(it) {
        return it[0] === key;
      });
      if (~index)
        this.a.splice(index, 1);
      return !!~index;
    }
  };
  module.exports = {
    getConstructor: function(wrapper, NAME, IS_MAP, ADDER) {
      var C = wrapper(function(that, iterable) {
        strictNew(that, C, NAME);
        that._i = id++;
        that._l = undefined;
        if (iterable != undefined)
          forOf(iterable, IS_MAP, that[ADDER], that);
      });
      redefineAll(C.prototype, {
        'delete': function(key) {
          if (!isObject(key))
            return false;
          if (!isExtensible(key))
            return frozenStore(this)['delete'](key);
          return $has(key, WEAK) && $has(key[WEAK], this._i) && delete key[WEAK][this._i];
        },
        has: function has(key) {
          if (!isObject(key))
            return false;
          if (!isExtensible(key))
            return frozenStore(this).has(key);
          return $has(key, WEAK) && $has(key[WEAK], this._i);
        }
      });
      return C;
    },
    def: function(that, key, value) {
      if (!isExtensible(anObject(key))) {
        frozenStore(that).set(key, value);
      } else {
        $has(key, WEAK) || hide(key, WEAK, {});
        key[WEAK][that._i] = value;
      }
      return that;
    },
    frozenStore: frozenStore,
    WEAK: WEAK
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.property-desc", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.hide", ["npm:core-js@1.2.6/library/modules/$", "npm:core-js@1.2.6/library/modules/$.property-desc", "npm:core-js@1.2.6/library/modules/$.descriptors"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = $__require('npm:core-js@1.2.6/library/modules/$'),
      createDesc = $__require('npm:core-js@1.2.6/library/modules/$.property-desc');
  module.exports = $__require('npm:core-js@1.2.6/library/modules/$.descriptors') ? function(object, key, value) {
    return $.setDesc(object, key, createDesc(1, value));
  } : function(object, key, value) {
    object[key] = value;
    return object;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.redefine", ["npm:core-js@1.2.6/library/modules/$.hide"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = $__require('npm:core-js@1.2.6/library/modules/$.hide');
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.redefine-all", ["npm:core-js@1.2.6/library/modules/$.redefine"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var redefine = $__require('npm:core-js@1.2.6/library/modules/$.redefine');
  module.exports = function(target, src) {
    for (var key in src)
      redefine(target, key, src[key]);
    return target;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.iter-call", ["npm:core-js@1.2.6/library/modules/$.an-object"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var anObject = $__require('npm:core-js@1.2.6/library/modules/$.an-object');
  module.exports = function(iterator, fn, value, entries) {
    try {
      return entries ? fn(anObject(value)[0], value[1]) : fn(value);
    } catch (e) {
      var ret = iterator['return'];
      if (ret !== undefined)
        anObject(ret.call(iterator));
      throw e;
    }
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.is-array-iter", ["npm:core-js@1.2.6/library/modules/$.iterators", "npm:core-js@1.2.6/library/modules/$.wks"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var Iterators = $__require('npm:core-js@1.2.6/library/modules/$.iterators'),
      ITERATOR = $__require('npm:core-js@1.2.6/library/modules/$.wks')('iterator'),
      ArrayProto = Array.prototype;
  module.exports = function(it) {
    return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.to-integer", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var ceil = Math.ceil,
      floor = Math.floor;
  module.exports = function(it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.to-length", ["npm:core-js@1.2.6/library/modules/$.to-integer"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var toInteger = $__require('npm:core-js@1.2.6/library/modules/$.to-integer'),
      min = Math.min;
  module.exports = function(it) {
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.classof", ["npm:core-js@1.2.6/library/modules/$.cof", "npm:core-js@1.2.6/library/modules/$.wks"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var cof = $__require('npm:core-js@1.2.6/library/modules/$.cof'),
      TAG = $__require('npm:core-js@1.2.6/library/modules/$.wks')('toStringTag'),
      ARG = cof(function() {
        return arguments;
      }()) == 'Arguments';
  module.exports = function(it) {
    var O,
        T,
        B;
    return it === undefined ? 'Undefined' : it === null ? 'Null' : typeof(T = (O = Object(it))[TAG]) == 'string' ? T : ARG ? cof(O) : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.iterators", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {};
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/core.get-iterator-method", ["npm:core-js@1.2.6/library/modules/$.classof", "npm:core-js@1.2.6/library/modules/$.wks", "npm:core-js@1.2.6/library/modules/$.iterators", "npm:core-js@1.2.6/library/modules/$.core"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var classof = $__require('npm:core-js@1.2.6/library/modules/$.classof'),
      ITERATOR = $__require('npm:core-js@1.2.6/library/modules/$.wks')('iterator'),
      Iterators = $__require('npm:core-js@1.2.6/library/modules/$.iterators');
  module.exports = $__require('npm:core-js@1.2.6/library/modules/$.core').getIteratorMethod = function(it) {
    if (it != undefined)
      return it[ITERATOR] || it['@@iterator'] || Iterators[classof(it)];
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.for-of", ["npm:core-js@1.2.6/library/modules/$.ctx", "npm:core-js@1.2.6/library/modules/$.iter-call", "npm:core-js@1.2.6/library/modules/$.is-array-iter", "npm:core-js@1.2.6/library/modules/$.an-object", "npm:core-js@1.2.6/library/modules/$.to-length", "npm:core-js@1.2.6/library/modules/core.get-iterator-method"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var ctx = $__require('npm:core-js@1.2.6/library/modules/$.ctx'),
      call = $__require('npm:core-js@1.2.6/library/modules/$.iter-call'),
      isArrayIter = $__require('npm:core-js@1.2.6/library/modules/$.is-array-iter'),
      anObject = $__require('npm:core-js@1.2.6/library/modules/$.an-object'),
      toLength = $__require('npm:core-js@1.2.6/library/modules/$.to-length'),
      getIterFn = $__require('npm:core-js@1.2.6/library/modules/core.get-iterator-method');
  module.exports = function(iterable, entries, fn, that) {
    var iterFn = getIterFn(iterable),
        f = ctx(fn, that, entries ? 2 : 1),
        index = 0,
        length,
        step,
        iterator;
    if (typeof iterFn != 'function')
      throw TypeError(iterable + ' is not iterable!');
    if (isArrayIter(iterFn))
      for (length = toLength(iterable.length); length > index; index++) {
        entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
      }
    else
      for (iterator = iterFn.call(iterable); !(step = iterator.next()).done; ) {
        call(iterator, f, step.value, entries);
      }
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.strict-new", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = function(it, Constructor, name) {
    if (!(it instanceof Constructor))
      throw TypeError(name + ": use the 'new' operator!");
    return it;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.has", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var hasOwnProperty = {}.hasOwnProperty;
  module.exports = function(it, key) {
    return hasOwnProperty.call(it, key);
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.shared", ["npm:core-js@1.2.6/library/modules/$.global"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var global = $__require('npm:core-js@1.2.6/library/modules/$.global'),
      SHARED = '__core-js_shared__',
      store = global[SHARED] || (global[SHARED] = {});
  module.exports = function(key) {
    return store[key] || (store[key] = {});
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.uid", [], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var id = 0,
      px = Math.random();
  module.exports = function(key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.wks", ["npm:core-js@1.2.6/library/modules/$.shared", "npm:core-js@1.2.6/library/modules/$.uid", "npm:core-js@1.2.6/library/modules/$.global"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var store = $__require('npm:core-js@1.2.6/library/modules/$.shared')('wks'),
      uid = $__require('npm:core-js@1.2.6/library/modules/$.uid'),
      Symbol = $__require('npm:core-js@1.2.6/library/modules/$.global').Symbol;
  module.exports = function(name) {
    return store[name] || (store[name] = Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.set-to-string-tag", ["npm:core-js@1.2.6/library/modules/$", "npm:core-js@1.2.6/library/modules/$.has", "npm:core-js@1.2.6/library/modules/$.wks"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var def = $__require('npm:core-js@1.2.6/library/modules/$').setDesc,
      has = $__require('npm:core-js@1.2.6/library/modules/$.has'),
      TAG = $__require('npm:core-js@1.2.6/library/modules/$.wks')('toStringTag');
  module.exports = function(it, tag, stat) {
    if (it && !has(it = stat ? it : it.prototype, TAG))
      def(it, TAG, {
        configurable: true,
        value: tag
      });
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.descriptors", ["npm:core-js@1.2.6/library/modules/$.fails"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = !$__require('npm:core-js@1.2.6/library/modules/$.fails')(function() {
    return Object.defineProperty({}, 'a', {get: function() {
        return 7;
      }}).a != 7;
  });
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/$.collection", ["npm:core-js@1.2.6/library/modules/$", "npm:core-js@1.2.6/library/modules/$.global", "npm:core-js@1.2.6/library/modules/$.export", "npm:core-js@1.2.6/library/modules/$.fails", "npm:core-js@1.2.6/library/modules/$.hide", "npm:core-js@1.2.6/library/modules/$.redefine-all", "npm:core-js@1.2.6/library/modules/$.for-of", "npm:core-js@1.2.6/library/modules/$.strict-new", "npm:core-js@1.2.6/library/modules/$.is-object", "npm:core-js@1.2.6/library/modules/$.set-to-string-tag", "npm:core-js@1.2.6/library/modules/$.descriptors"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = $__require('npm:core-js@1.2.6/library/modules/$'),
      global = $__require('npm:core-js@1.2.6/library/modules/$.global'),
      $export = $__require('npm:core-js@1.2.6/library/modules/$.export'),
      fails = $__require('npm:core-js@1.2.6/library/modules/$.fails'),
      hide = $__require('npm:core-js@1.2.6/library/modules/$.hide'),
      redefineAll = $__require('npm:core-js@1.2.6/library/modules/$.redefine-all'),
      forOf = $__require('npm:core-js@1.2.6/library/modules/$.for-of'),
      strictNew = $__require('npm:core-js@1.2.6/library/modules/$.strict-new'),
      isObject = $__require('npm:core-js@1.2.6/library/modules/$.is-object'),
      setToStringTag = $__require('npm:core-js@1.2.6/library/modules/$.set-to-string-tag'),
      DESCRIPTORS = $__require('npm:core-js@1.2.6/library/modules/$.descriptors');
  module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
    var Base = global[NAME],
        C = Base,
        ADDER = IS_MAP ? 'set' : 'add',
        proto = C && C.prototype,
        O = {};
    if (!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function() {
      new C().entries().next();
    }))) {
      C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
      redefineAll(C.prototype, methods);
    } else {
      C = wrapper(function(target, iterable) {
        strictNew(target, C, NAME);
        target._c = new Base;
        if (iterable != undefined)
          forOf(iterable, IS_MAP, target[ADDER], target);
      });
      $.each.call('add,clear,delete,forEach,get,has,set,keys,values,entries'.split(','), function(KEY) {
        var IS_ADDER = KEY == 'add' || KEY == 'set';
        if (KEY in proto && !(IS_WEAK && KEY == 'clear'))
          hide(C.prototype, KEY, function(a, b) {
            if (!IS_ADDER && IS_WEAK && !isObject(a))
              return KEY == 'get' ? undefined : false;
            var result = this._c[KEY](a === 0 ? 0 : a, b);
            return IS_ADDER ? this : result;
          });
      });
      if ('size' in proto)
        $.setDesc(C.prototype, 'size', {get: function() {
            return this._c.size;
          }});
    }
    setToStringTag(C, NAME);
    O[NAME] = C;
    $export($export.G + $export.W + $export.F, O);
    if (!IS_WEAK)
      common.setStrong(C, NAME, IS_MAP);
    return C;
  };
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/modules/es6.weak-map", ["npm:core-js@1.2.6/library/modules/$", "npm:core-js@1.2.6/library/modules/$.redefine", "npm:core-js@1.2.6/library/modules/$.collection-weak", "npm:core-js@1.2.6/library/modules/$.is-object", "npm:core-js@1.2.6/library/modules/$.has", "npm:core-js@1.2.6/library/modules/$.collection"], true, function($__require, exports, module) {
  "use strict";
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var $ = $__require('npm:core-js@1.2.6/library/modules/$'),
      redefine = $__require('npm:core-js@1.2.6/library/modules/$.redefine'),
      weak = $__require('npm:core-js@1.2.6/library/modules/$.collection-weak'),
      isObject = $__require('npm:core-js@1.2.6/library/modules/$.is-object'),
      has = $__require('npm:core-js@1.2.6/library/modules/$.has'),
      frozenStore = weak.frozenStore,
      WEAK = weak.WEAK,
      isExtensible = Object.isExtensible || isObject,
      tmp = {};
  var $WeakMap = $__require('npm:core-js@1.2.6/library/modules/$.collection')('WeakMap', function(get) {
    return function WeakMap() {
      return get(this, arguments.length > 0 ? arguments[0] : undefined);
    };
  }, {
    get: function get(key) {
      if (isObject(key)) {
        if (!isExtensible(key))
          return frozenStore(this).get(key);
        if (has(key, WEAK))
          return key[WEAK][this._i];
      }
    },
    set: function set(key, value) {
      return weak.def(this, key, value);
    }
  }, weak, true, true);
  if (new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7) {
    $.each.call(['delete', 'has', 'get', 'set'], function(key) {
      var proto = $WeakMap.prototype,
          method = proto[key];
      redefine(proto, key, function(a, b) {
        if (isObject(a) && !isExtensible(a)) {
          var result = frozenStore(this)[key](a, b);
          return key == 'set' ? this : result;
        }
        return method.call(this, a, b);
      });
    });
  }
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.6/library/fn/weak-map", ["npm:core-js@1.2.6/library/modules/es6.object.to-string", "npm:core-js@1.2.6/library/modules/web.dom.iterable", "npm:core-js@1.2.6/library/modules/es6.weak-map", "npm:core-js@1.2.6/library/modules/$.core"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  $__require('npm:core-js@1.2.6/library/modules/es6.object.to-string');
  $__require('npm:core-js@1.2.6/library/modules/web.dom.iterable');
  $__require('npm:core-js@1.2.6/library/modules/es6.weak-map');
  module.exports = $__require('npm:core-js@1.2.6/library/modules/$.core').WeakMap;
  global.define = __define;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.35/core-js/weak-map", ["npm:core-js@1.2.6/library/fn/weak-map"], true, function($__require, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = {
    "default": $__require('npm:core-js@1.2.6/library/fn/weak-map'),
    __esModule: true
  };
  global.define = __define;
  return module.exports;
});

System.register('npm:weakee@1.0.0/weakee', ['npm:babel-runtime@5.8.35/helpers/create-class', 'npm:babel-runtime@5.8.35/helpers/class-call-check', 'npm:babel-runtime@5.8.35/core-js/weak-map'], function (_export) {
  var _createClass, _classCallCheck, _WeakMap, objectToEvents, Emitter;

  return {
    setters: [function (_npmBabelRuntime5835HelpersCreateClass) {
      _createClass = _npmBabelRuntime5835HelpersCreateClass['default'];
    }, function (_npmBabelRuntime5835HelpersClassCallCheck) {
      _classCallCheck = _npmBabelRuntime5835HelpersClassCallCheck['default'];
    }, function (_npmBabelRuntime5835CoreJsWeakMap) {
      _WeakMap = _npmBabelRuntime5835CoreJsWeakMap['default'];
    }],
    execute: function () {
      /* */
      'use strict';

      'format es6';
      'use strict';

      objectToEvents = new _WeakMap();

      Emitter = (function () {
        function Emitter() {
          _classCallCheck(this, Emitter);

          objectToEvents.set(this, {});
        }

        _createClass(Emitter, [{
          key: 'on',
          value: function on(type, handler) {
            var events = objectToEvents.get(this);

            if (!events[type]) {
              events[type] = [];
            }
            events[type].push(handler);
            return this;
          }
        }, {
          key: 'once',
          value: function once(type, handler) {
            this.on(type, function tempHandler() {
              handler.apply(this, arguments);
              this.off(type, tempHandler);
            });
            return this;
          }
        }, {
          key: 'off',
          value: function off(type, handler) {
            var events = objectToEvents.get(this)[type];

            if (events) {
              if (!handler) {
                events.length = 0;
              } else {
                events.splice(events.indexOf(handler), 1);
              }
            }
            return this;
          }
        }, {
          key: 'emit',
          value: function emit(type) {
            var event, events;

            events = (objectToEvents.get(this)[type] || []).slice();

            var args = new Array(arguments.length - 1);
            var iterateTo = args.length + 1;
            for (var i = 1; i < iterateTo; ++i) {
              args[i - 1] = arguments[i];
            }

            if (events.length) {
              while (event = events.shift()) {
                event.apply(this, args);
              }
            }
            return this;
          }
        }]);

        return Emitter;
      })();

      _export('default', Emitter);
    }
  };
});
System.register("npm:weakee@1.0.0", ["npm:weakee@1.0.0/weakee"], function (_export) {
  "use strict";

  return {
    setters: [function (_npmWeakee100Weakee) {
      var _exportObj = {};

      for (var _key in _npmWeakee100Weakee) {
        if (_key !== "default") _exportObj[_key] = _npmWeakee100Weakee[_key];
      }

      _exportObj["default"] = _npmWeakee100Weakee["default"];

      _export(_exportObj);
    }],
    execute: function () {}
  };
});
System.register('github:capaj/systemjs-hot-reloader@0.5.6/hot-reloader', ['npm:babel-runtime@5.8.35/helpers/get', 'npm:babel-runtime@5.8.35/helpers/inherits', 'npm:babel-runtime@5.8.35/helpers/create-class', 'npm:babel-runtime@5.8.35/helpers/class-call-check', 'npm:babel-runtime@5.8.35/core-js/object/keys', 'npm:babel-runtime@5.8.35/core-js/promise', 'github:socketio/socket.io-client@1.4.5', 'npm:weakee@1.0.0', 'npm:debug@2.2.0'], function (_export) {
  var _get, _inherits, _createClass, _classCallCheck, _Object$keys, _Promise, socketIO, Emitter, debug, d, HotReloader;

  function identity(value) {
    return value;
  }

  return {
    setters: [function (_npmBabelRuntime5835HelpersGet) {
      _get = _npmBabelRuntime5835HelpersGet['default'];
    }, function (_npmBabelRuntime5835HelpersInherits) {
      _inherits = _npmBabelRuntime5835HelpersInherits['default'];
    }, function (_npmBabelRuntime5835HelpersCreateClass) {
      _createClass = _npmBabelRuntime5835HelpersCreateClass['default'];
    }, function (_npmBabelRuntime5835HelpersClassCallCheck) {
      _classCallCheck = _npmBabelRuntime5835HelpersClassCallCheck['default'];
    }, function (_npmBabelRuntime5835CoreJsObjectKeys) {
      _Object$keys = _npmBabelRuntime5835CoreJsObjectKeys['default'];
    }, function (_npmBabelRuntime5835CoreJsPromise) {
      _Promise = _npmBabelRuntime5835CoreJsPromise['default'];
    }, function (_githubSocketioSocketIoClient145) {
      socketIO = _githubSocketioSocketIoClient145['default'];
    }, function (_npmWeakee100) {
      Emitter = _npmWeakee100['default'];
    }, function (_npmDebug220) {
      debug = _npmDebug220['default'];
    }],
    execute: function () {
      /* */
      'use strict';

      /* eslint-env browser */
      "format esm";d = debug('hot-reloader');

      if (System.trace !== true) {
        console.warn('System.trace must be set to true via configuration before loading modules to hot-reload.');
      }
      HotReloader = (function (_Emitter) {
        _inherits(HotReloader, _Emitter);

        function HotReloader(backendUrl) {
          var _this = this;

          var transform = arguments.length <= 1 || arguments[1] === undefined ? identity : arguments[1];

          _classCallCheck(this, HotReloader);

          if (!backendUrl) {
            backendUrl = '//' + document.location.host;
          }
          _get(Object.getPrototypeOf(HotReloader.prototype), 'constructor', this).call(this);
          this.originalSystemImport = System['import'];
          this.transform = transform;
          var self = this;
          self.clientImportedModules = [];
          System['import'] = function () {
            var args = arguments;
            self.clientImportedModules.push(args[0]);
            return self.originalSystemImport.apply(System, arguments)['catch'](function (err) {
              self.lastFailedSystemImport = args;
              throw err;
            });
          };
          this.socket = socketIO(backendUrl);
          this.socket.on('connect', function () {
            d('hot reload connected to watcher on ', backendUrl);
            _this.socket.emit('identification', navigator.userAgent);
            _this.socket.emit('package.json', function (pjson) {
              // self.pjson = pjson // maybe needed in the future?
              self.jspmConfigFile = pjson.jspm.configFile || 'config.js';
            });
          });
          this.socket.on('reload', function () {
            d('whole page reload requested');
            document.location.reload(true);
          });
          this.socket.on('change', this.onFileChanged.bind(this));
          window.onerror = function (err) {
            _this.socket.emit('error', err); // emitting errors for jspm-dev-buddy
          };
          this.socket.on('disconnect', function () {
            d('hot reload disconnected from ', backendUrl);
          });
          this.pushImporters(System.loads);
        }

        _createClass(HotReloader, [{
          key: 'onFileChanged',
          value: function onFileChanged(ev) {
            var _this2 = this;

            var moduleName = this.transform(ev.path);
            this.emit('change', moduleName);
            if (moduleName === 'index.html' || moduleName === this.jspmConfigFile) {
              document.location.reload(true);
            } else {
              if (this.lastFailedSystemImport) {
                // for wehn inital System.import fails
                return this.originalSystemImport.apply(System, this.lastFailedSystemImport).then(function () {
                  d(_this2.lastFailedSystemImport[0], 'broken module reimported succesfully');
                  _this2.lastFailedSystemImport = null;
                });
              }
              if (this.currentHotReload) {
                this.currentHotReload = this.currentHotReload.then(function () {
                  // chain promises TODO we can solve this better- this often leads to the same module being reloaded mutliple times
                  return _this2.hotReload(moduleName);
                });
              } else {
                if (this.failedReimport) {
                  this.reImportRootModules(this.failedReimport, new Date());
                } else {
                  this.currentHotReload = this.hotReload(moduleName);
                }
              }
            }
          }
        }, {
          key: 'pushImporters',
          value: function pushImporters(moduleMap, overwriteOlds) {
            _Object$keys(moduleMap).forEach(function (moduleName) {
              var mod = System.loads[moduleName];
              if (!mod.importers) {
                mod.importers = [];
              }
              mod.deps.forEach(function (dependantName) {
                var normalizedDependantName = mod.depMap[dependantName];
                var dependantMod = System.loads[normalizedDependantName];
                if (!dependantMod) {
                  return;
                }
                if (!dependantMod.importers) {
                  dependantMod.importers = [];
                }
                if (overwriteOlds) {
                  var imsIndex = dependantMod.importers.length;
                  while (imsIndex--) {
                    if (dependantMod.importers[imsIndex].name === mod.name) {
                      dependantMod.importers[imsIndex] = mod;
                      return;
                    }
                  }
                }
                dependantMod.importers.push(mod);
              });
            });
          }
        }, {
          key: 'deleteModule',
          value: function deleteModule(moduleToDelete, from) {
            var name = moduleToDelete.name;
            if (!this.modulesJustDeleted[name]) {
              var exportedValue = undefined;
              this.modulesJustDeleted[name] = moduleToDelete;
              if (!moduleToDelete.exports) {
                // this is a module from System.loads
                exportedValue = System.get(name);
                if (!exportedValue) {
                  console.warn('missing exported value on ' + name + ', reloading whole page because module record is broken');
                  return document.location.reload(true);
                }
              } else {
                exportedValue = moduleToDelete.exports;
              }
              if (typeof exportedValue.__unload === 'function') {
                exportedValue.__unload(); // calling module unload hook
              }
              System['delete'](name);
              this.emit('deleted', moduleToDelete);
              d('deleted a module ', name, ' because it has dependency on ', from);
            }
          }
        }, {
          key: 'getModuleRecord',
          value: function getModuleRecord(moduleName) {
            return System.normalize(moduleName).then(function (normalizedName) {
              var aModule = System._loader.moduleRecords[normalizedName];
              if (!aModule) {
                aModule = System.loads[normalizedName];
                if (aModule) {
                  return aModule;
                }
                return System.normalize(moduleName + '!').then(function (normalizedName) {
                  // .jsx! for example are stored like this
                  var aModule = System._loader.moduleRecords[normalizedName];
                  if (aModule) {
                    return aModule;
                  }
                  throw new Error('module was not found in Systemjs moduleRecords');
                });
              }
              return aModule;
            });
          }
        }, {
          key: 'hotReload',
          value: function hotReload(moduleName) {
            var _this3 = this;

            var self = this;
            var start = new Date().getTime();

            this.modulesJustDeleted = {}; // TODO use weakmap
            return this.getModuleRecord(moduleName).then(function (module) {
              _this3.deleteModule(module, 'origin');
              var toReimport = [];

              function deleteAllImporters(mod) {
                var importersToBeDeleted = mod.importers;
                return importersToBeDeleted.map(function (importer) {
                  if (self.modulesJustDeleted.hasOwnProperty(importer.name)) {
                    d('already deleted', importer.name);
                    return false;
                  }
                  self.deleteModule(importer, mod.name);
                  if (importer.importers.length === 0 && toReimport.indexOf(importer.name) === -1) {
                    toReimport.push(importer.name);
                    return true;
                  } else {
                    // recourse
                    var deleted = deleteAllImporters(importer);
                    return deleted;
                  }
                });
              }

              if (typeof module.importers === 'undefined' || module.importers.length === 0) {
                toReimport.push(module.name);
              } else {
                var deleted = deleteAllImporters(module);
                if (deleted.find(function (res) {
                  return res === false;
                }) !== undefined) {
                  toReimport.push(module.name);
                }
              }
              d('toReimport', toReimport);
              if (toReimport.length === 0) {
                toReimport = self.clientImportedModules;
              }
              return _this3.reImportRootModules(toReimport, start);
            }, function (err) {
              _this3.emit('moduleRecordNotFound', err);
              // not found any module for this file, not really an error
            });
          }
        }, {
          key: 'reImportRootModules',
          value: function reImportRootModules(toReimport, start) {
            var _this4 = this;

            var promises = toReimport.map(function (moduleName) {
              return _this4.originalSystemImport.call(System, moduleName).then(function (moduleReloaded) {
                d('reimported ', moduleName);
                if (typeof moduleReloaded.__reload === 'function') {
                  var deletedModule = _this4.modulesJustDeleted[moduleName];
                  if (deletedModule !== undefined) {
                    moduleReloaded.__reload(deletedModule.exports); // calling module reload hook
                  }
                }
              });
            });
            return _Promise.all(promises).then(function () {
              _this4.emit('allReimported', toReimport);
              _this4.pushImporters(_this4.modulesJustDeleted, true);
              _this4.modulesJustDeleted = {};
              _this4.failedReimport = null;
              _this4.currentHotReload = null;
              d('all reimported in ', new Date().getTime() - start, 'ms');
            }, function (err) {
              _this4.emit('error', err);
              console.error(err);
              _this4.failedReimport = toReimport;
              _this4.currentHotReload = null;
            });
          }
        }]);

        return HotReloader;
      })(Emitter);

      _export('default', HotReloader);
    }
  };
});
System.register('github:capaj/systemjs-hot-reloader@0.5.6/default-listener', ['github:capaj/systemjs-hot-reloader@0.5.6/hot-reloader'], function (_export) {
  /* */
  'use strict';

  var HotReloader;
  return {
    setters: [function (_githubCapajSystemjsHotReloader056HotReloader) {
      HotReloader = _githubCapajSystemjsHotReloader056HotReloader['default'];
    }],
    execute: function () {
      "format esm";

      new HotReloader('http://localhost:5776');
    }
  };
});
System.register('app/app.js', ['npm:react@0.14.7', 'npm:react-dom@0.14.7', 'app/render.js', 'npm:debug@2.2.0', 'github:capaj/systemjs-hot-reloader@0.5.6/default-listener'], function (_export) {
  'use strict';

  var React, render, unmountComponentAtNode, App, Debug;

  _export('__unload', __unload);

  function __unload() {
    // force unload React components
    unmountComponentAtNode(document.getElementById('simpledocs')); // your container node
  }

  return {
    setters: [function (_npmReact0147) {
      React = _npmReact0147['default'];
    }, function (_npmReactDom0147) {
      render = _npmReactDom0147.render;
      unmountComponentAtNode = _npmReactDom0147.unmountComponentAtNode;
    }, function (_appRenderJs) {
      App = _appRenderJs['default'];
    }, function (_npmDebug220) {
      Debug = _npmDebug220['default'];
    }, function (_githubCapajSystemjsHotReloader056DefaultListener) {}],
    execute: function () {

      window.myDebug = Debug;

      render(React.createElement(App, null), document.getElementById('simpledocs'));
    }
  };
});
//# sourceMappingURL=client.js.map