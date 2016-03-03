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
	
	request(route, callback) {
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
		request
			.get(route)
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
					result.page = res.body.page;
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
