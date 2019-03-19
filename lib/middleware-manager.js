import { MiddlewareSort } from './middleware-sort';

export class MiddlewareManager {
	constructor() {
		this._premethod = new MiddlewareSort();
		this._postmethod = new MiddlewareSort();
	}

	get premethod() {
		return this._premethod.middlewares;
	}

	get postmethod() {
		return this._postmethod.middlewares;
	}

	registerPremethod(...args) {
		this._premethod.register(...args);
	}

	registerPostmethod(...args) {
		this._postmethod.register(...args);
	}

	finalize() {
		this._premethod.finalize();
		this._postmethod.finalize();
	}
}
