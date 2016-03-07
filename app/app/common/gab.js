import {EventEmitter} from 'events';
import request from 'superagent';
import {isFunction} from 'lodash';
import Debug from 'debug';

let debug = Debug('simpledocs:app:common:gab');

class Gab extends EventEmitter {
	constructor(props) {
		super(props)
		
	}
	
	reset() {
		
	}
	
	request(route, moon, callback) {
		var _this = this;
		if(!isFunction(callback)) {
			callback = function(){};
		}
		if(!route) {
			var res = {
				success: false,
				message: 'No route defined.',
			}
			this.emit('request', res);
			return callback(res);
		}
		var page = route ? route : snowUI.homepage;
		if(page === snowUI.singlePage) {
			var root = snowUI.api.allinone;
		} else if(route.search('search::') > -1) {
			var root = snowUI.api.search;
		} else {
			var root = snowUI.api.page;
		}
		let	url = root + '/' + page;
		debug('request', url, root, page);
		
		request
			.get(url)
			.set({
				'Accept': 'application/json'
			})
			.end(function(err, res) {
				debug('request result', err, res);
				var result = {
					success: false
				}
				if(err) {
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
	
}

export default new Gab()
