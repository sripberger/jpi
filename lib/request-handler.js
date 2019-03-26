import { ContextManager } from './context-manager';

export class RequestHandler {
	constructor(request, middlewareManager, methodManager, httpRequest) {
		this.request = request;
		this.middlewareManager = middlewareManager;
		this.methodManager = methodManager;
		this.httpRequest = httpRequest;
	}

	run() {
		this.request.validate();
		return this._getContextManager().run();
	}

	_getContextManager() {
		// Destructure the json-rpc request and http request.
		const { method, params } = this.request;
		const { headers, rawHeaders } = this.httpRequest;

		// Get the options and middlewares for the specified method.
		const {
			options: methodOptions,
			middlewares: methodMiddlewares,
		} = this.methodManager.getMethod(this.request.method);

		// Populate and return the context manager.
		return new ContextManager({
			method,
			methodOptions,
			params,
			headers,
			rawHeaders,
		}, {
			premethod: this.middlewareManager.premethod,
			method: methodMiddlewares,
			postmethod: this.middlewareManager.postmethod,
		});
	}
}
