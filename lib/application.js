import { MethodRegistry } from './method-registry';
import { MiddlewareManager } from './middleware-manager';

export class Application {
	constructor() {
		this._middlewareManager = new MiddlewareManager();
		this._methodRegistry = new MethodRegistry();
	}

	registerPremethod(...args) {
		this._middlewareManager.registerPremethod(...args);
	}

	registerPostmethod(...args) {
		this._middlewareManager.registerPostmethod(...args);
	}

	registerMethod(...args) {
		this._methodRegistry.register(...args);
	}

	getCallback() {
		this._middlewareManager.finalize();
		return this._handle.bind();
	}

	_handle() {
		// TODO
	}
}
