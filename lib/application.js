import { Registry } from './registry';

export class Application {
	constructor() {
		this._registry = new Registry();
	}

	registerPremethod(...args) {
		this._registry.registerPremethod(...args);
	}

	registerPostmethod(...args) {
		this._registry.registerPostmethod(...args);
	}

	registerMethod(...args) {
		this._registry.registerMethod(...args);
	}

	getCallback() {
		this._registry.finalize();
		return this._handle.bind();
	}

	_handle() {
		// TODO
	}
}
