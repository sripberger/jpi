import { eachSeries } from 'pasync';

export class ContextManager {
	constructor(context, middlewares) {
		this.context = context;
		this.middlewares = middlewares;
	}

	async run() {
		await eachSeries(this.middlewares, this._runMiddleware.bind(this));
		return this.context;
	}

	async _runMiddleware(middleware) {
		const result = await middleware(this.context);
		if (result !== undefined) this.context.result = result;
	}
}
