import { MethodNotFoundError } from 'jpi-errors';
import _ from 'lodash';

export class MethodRegistry {
	constructor() {
		this._methods = {};
	}

	register(options, ...middlewares) {
		if (_.isString(options)) options = { method: options };
		const { method } = options;
		if (!method || !_.isString(method)) {
			throw new Error('method must be a non-empty string');
		}
		this._methods[method] = {
			options: _.omit(options, 'method'),
			middlewares,
		};
	}

	getMethod(method) {
		const entry = this._methods[method];
		if (!entry) throw new MethodNotFoundError({ info: { method } });
		return entry;
	}
}
