import { Problem } from 'topo-strict';
import _ from 'lodash';

export class MiddlewareManager {
	constructor() {
		this.problem = new Problem();
		this.middlewaresById = {};
	}

	register(...args) {
		// eslint-disable-next-line no-underscore-dangle
		const options = this.constructor._normalizeRegisterArgs(args);
		const { id, middleware } = options;
		this.problem.add(id, _.pick(options, 'before', 'after', 'group'));
		this.middlewaresById[id] = middleware;
	}

	getMiddlewares() {
		return this.problem.solve().map((id) => this.middlewaresById[id]);
	}

	static _normalizeRegisterArgs(args) {
		const { id, options, middleware } = this._identifyRegisterArgs(args);
		return _.assign({ id, middleware }, options);
	}

	static _identifyRegisterArgs(args) {
		const id = _.isString(args[0]) ? args.shift() : null;
		const options = _.isPlainObject(args[0]) ? args.shift() : {};
		const middleware = _.isFunction(args[0]) ? args.shift() : null;
		return { id, options, middleware };
	}
}
