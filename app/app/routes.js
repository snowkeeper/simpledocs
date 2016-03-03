import Home from './pages/home';
import Status from './pages/status';
import MainAbout from './pages/main-about';

import { isObject } from 'lodash';
import Debug from 'debug';
import fourofour from './pages/404.js';

let debug = Debug('simpledocs:app:routes');

let routes = {
	status: Status,
	'main-about': MainAbout,
	redirect: {
		lost: '404',
		disconnected: 'status'
	}
};
routes['404'] = fourofour;

const routeConfig = function(route) {
	debug(route, isObject(routes[route]));
	if(routes[route]) {
		if(isObject(routes[route]) && 'function' !== typeof routes[route]) {
			return Home;
		} else {
			return routes[route];
		}
		
	} else if(routes.redirect[route]) {
		return routes[routes.redirect[route]]	
	} else {
		return Home;
	}	
}

export default routeConfig
