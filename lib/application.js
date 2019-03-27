import { MiddlewareManager } from './middleware-manager';

export class Application {
	constructor() {
		this._manager = new MiddlewareManager();
	}

	registerPremethod(...args) {
		this._manager.registerPremethod(...args);
	}

	registerPostmethod(...args) {
		this._manager.registerPostmethod(...args);
	}

	registerMethod(...args) {
		this._manager.registerMethod(...args);
	}

	getCallback() {
		this._manager.finalize();
		return this._handle.bind();
	}

	_handle() {
		// TODO
	}
}
