import _ from 'lodash';

export default class Application {
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

	getCallback() {
		return (request, response) => {
			this._handleRequest(request, response);
		};
	}

	async _handleRequest(request, response) {
		// TODO
	}
}
