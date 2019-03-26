export class ContextManager {
	constructor(context, middlewares) {
		this.context = context;
		this.middlewares = middlewares;
	}

	async run() {
		await this._runMiddlewaresWithName('premethod');
		await this._runMiddlewaresWithName('method');
		await this._runMiddlewaresWithName('postmethod');
	}

	async _runMiddlewaresWithName(name) {
		await this._runMiddlewares(this.middlewares[name]);
	}

	async _runMiddlewares(middlewares) {
		for (const middleware of middlewares) {
			if (this.context.error) break;
			// eslint-disable-next-line no-await-in-loop
			await this._runSingleMiddleware(middleware);
		}
	}

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
