import { MethodRegistry } from './method-registry';
import { TopoRegistry } from './topo-registry';

export class AppRegistry {
	constructor() {
		this._premethod = new TopoRegistry();
		this._postmethod = new TopoRegistry();
		this._methods = new MethodRegistry();
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

	getMethod(method) {
		const { options, middlewares } = this._methods.getMethod(method);
		return {
			options,
			middlewares: [
				...this._premethod.middlewares,
				...middlewares,
				...this._postmethod.middlewares,
			],
		};
	}
}
