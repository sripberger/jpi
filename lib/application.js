import { MethodManager } from './method-manager';
import { MiddlewareManager } from './middleware-manager';

export class Application {
	constructor() {
		this._middlewareManager = new MiddlewareManager();
		this._methodManager = new MethodManager();
	}

	registerPremethod(...args) {
		this._middlewareManager.registerPremethod(...args);
	}

	registerPostmethod(...args) {
		this._middlewareManager.registerPostmethod(...args);
	}

	registerMethod(...args) {
		this._methodManager.register(...args);
	}

	getCallback() {
		this._middlewareManager.finalize();
		return this._handle.bind();
	}

	_handle() {
		// TODO
	}
}
