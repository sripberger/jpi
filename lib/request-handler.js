import { getErrorResponse, getSuccessResponse } from './response-utils';
import { ContextManager } from './context-manager';

export class RequestHandler {
	constructor(request, registry, httpRequest) {
		this.request = request;
		this.registry = registry;
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
		// Destructure the JSON-RPC and HTTP requests.
		const { method, params } = this.request;
		const { headers, rawHeaders } = this.httpRequest;

		// Get the options and middlewares for the specified method.
		const { options, middlewares } = this.registry.getMethod(method);

		// Populate and return the context manager.
		return new ContextManager(
			{ method, options, params, headers, rawHeaders },
			middlewares
		);
	}
}
