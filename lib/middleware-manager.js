import { TopoRegistry } from './topo-registry';

export class MiddlewareManager {
	constructor() {
		this._premethod = new TopoRegistry();
		this._postmethod = new TopoRegistry();
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
