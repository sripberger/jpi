import { getErrorResponse, getSuccessResponse } from './response-utils';
import { ContextManager } from './context-manager';

export class RequestHandler {
	constructor(request, middlewareManager, methodRegistry, httpRequest) {
		this.request = request;
		this.middlewareManager = middlewareManager;
		this.methodRegistry = methodRegistry;
		this.httpRequest = httpRequest;
	}

	async getResponse() {
		try {
			return await this._run();
		} catch (err) {
			return getErrorResponse(err, this.request.id);
		}
	}

	async _run() {
		this.request.validate();
		const contextManager = this._getContextManager();
		const context = await contextManager.run();
		return getSuccessResponse(context.result, this.request.id);
	}

	_getContextManager() {
		// Destructure the json-rpc request and http request.
		const { method, params } = this.request;
		const { headers, rawHeaders } = this.httpRequest;

		// Get the options and middlewares for the specified method.
		const {
			options: methodOptions,
			middlewares: methodMiddlewares,
		} = this.methodRegistry.getMethod(this.request.method);

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
