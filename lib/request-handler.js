export class RequestHandler {
	constructor(request, response, middlewareManager, methodManager) {
		this.request = request;
		this.response = response;
		this.middlewareManager = middlewareManager;
		this.methodManager = methodManager;
	}

	async run() {
		// TODO
	}
}
