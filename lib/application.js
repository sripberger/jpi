import { AppRegistry } from './app-registry';
import { HttpHandler } from './http-handler';

export class Application {
	constructor() {
		this._registry = new AppRegistry();
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
		return (httpRequest, httpResponse) => {
			new HttpHandler(this._registry, httpRequest, httpResponse).run();
		};
	}
}
