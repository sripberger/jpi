/**
 * Wraps a request context, providing methods for running middleware with that
 * context.
 * @param {Object} [context={}] - The context object.
 */
export class ContextManager {
	constructor(context = {}) {
		this.context = context;
	}

	/**
	 * Runs the provided middleware functions in series.
	 * @param {Array<Function>} middlewares - Middleware functions to run.
	 */
	async runMiddlewares(middlewares) {
		for (const middleware of middlewares) {
			if (this.context.error) break;
			// eslint-disable-next-line no-await-in-loop
			await this._runSingleMiddleware(middleware);
		}
	}

	/**
	 * Runs an individual middleware function.
	 * @private
	 * @param {Function} middleware - Middleware function to run.
	 */
	async _runSingleMiddleware(middleware) {
		try {
			const result = await middleware(this.context);
			if (result !== undefined) this.context.result = result;
		} catch (err) {
			this.context.error = err ||
				new Error('Unknown error in request middleware.');
		}
	}
}
