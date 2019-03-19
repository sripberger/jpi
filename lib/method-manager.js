import _ from 'lodash';

export class MethodManager {
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
}
