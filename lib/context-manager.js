export class ContextManager {
	constructor(context, middlewares) {
		this.context = context;
		this.middlewares = middlewares;
	}

	async run() {
		await this._runMiddlewares();
		return this.context;
	}

	async _runMiddlewares() {
		for (const middleware of this.middlewares) {
			// eslint-disable-next-line no-await-in-loop
			await this._runSingleMiddleware(middleware);
		}
	}

	async _runSingleMiddleware(middleware) {
		const result = await middleware(this.context);
		if (result !== undefined) this.context.result = result;
	}
}
