import { MethodRegistry } from './method-registry';
import { TopoRegistry } from './topo-registry';

export class AppRegistry {
	constructor() {
		this._premethod = new TopoRegistry();
		this._postmethod = new TopoRegistry();
		this._methods = new MethodRegistry();
	}

	get premethod() {
		return this._premethod.middlewares;
	}

	get postmethod() {
		return this._postmethod.middlewares;
	}

	getMethod(...args) {
		return this._methods.getMethod(...args);
	}

	registerPremethod(...args) {
		this._premethod.register(...args);
	}

	registerPostmethod(...args) {
		this._postmethod.register(...args);
	}

	registerMethod(...args) {
		this._methods.register(...args);
	}

	finalize() {
		this._premethod.finalize();
		this._postmethod.finalize();
	}
}
