export class Application {
	constructor() {
		this._methods = {};
	}

	getCallback() {
		return (request, response) => {
			this._handleRequest(request, response);
		};
	}

	// eslint-disable-next-line no-unused-vars
	async _handleRequest(request, response) {
		// TODO
	}
}
