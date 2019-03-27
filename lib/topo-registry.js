import { FinalizedError } from './finalized-error';
import { Problem } from 'topo-strict';
import _ from 'lodash';

export class TopoRegistry {
	constructor() {
		this.problem = new Problem();
		this.ids = null;
		this._middlewaresById = {};
	}

	get middlewares() {
		if (!this.ids) return null;
		return this.ids.map((id) => this._middlewaresById[id]);
	}

	register(...args) {
		if (this.ids) throw new FinalizedError();
		// eslint-disable-next-line no-underscore-dangle
		const options = this.constructor._normalizeRegisterArgs(args);
		const { id, middleware } = options;
		this.problem.add(id, _.pick(options, 'before', 'after', 'group'));
		this._middlewaresById[id] = middleware;
	}

	finalize() {
		if (!this.ids) this.ids = this.problem.solve();
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
