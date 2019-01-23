import ContextManager from '../lib/context-manager';
import _ from 'lodash';
import zstreams from 'zstreams';

export default class Jpi {
	constructor() {
		this.methods = {};
	}

	register(options, ...middlewares) {
		if (_.isString(options)) options = { method: options };
		const { method } = options;
		options = _.omit(options, 'method');
		if (!method || !_.isString(method)) {
			throw new Error('method must be a non-empty string');
		}
		this.methods[method] = { options, middlewares };
	}

	getCallback() {
		return async(request, response) => {
			// Ignore response stream errors.
			response.on('error', () => {});

			// Send 404 for non-root requsts.
			if (request.url !== '/') {
				response.statusCode = 404;
				response.end('Not Found');
				return;
			}

			// Send 405 for non-post requests.
			if (request.method !== 'POST') {
				response.statusCode = 405;
				response.setHeader('Allow', 'POST');
				response.end('Method Not Allowed');
				return;
			}

			// All other responses will be handled as json-rpc.
			response.setHeader('Content-Type', 'application/json');
			response.statusCode = 200;

			// Get the whole request body.
			let body;
			try {
				body = await zstreams(request).intoString();
			} catch (err) {
				response.end(JSON.stringify({
					result: null,
					error: {
						code: -32000,
						message: 'Failed to read request body.',
						data: { cause: err.message },
					},
				}));
				return;
			}

			// Parse the request body as JSON.
			try {
				body = JSON.parse(body);
			} catch (err) {
				response.end(JSON.stringify({
					result: null,
					error: {
						code: -32700,
						message: 'Parse error',
						data: { cause: err.message },
					},
					id: null,
				}));
				return;
			}

			// Get JSON-RPC fields from request body.
			const { method, params, id = null } = body;
			if (!method || !params) {
				response.end(JSON.stringify({
					result: null,
					error: {
						code: -32600,
						message: 'Invalid Request',
					},
					id,
				}));
				return;
			}

			// Make sure method has been registered.
			if (!(method in this.methods)) {
				response.end(JSON.stringify({
					result: null,
					error: {
						code: -32601,
						message: 'Method not found',
						data: { method },
					},
					id,
				}));
				return;
			}

			// Get options and middlewares from method registry.
			const { options, middlewares } = this.methods[method];

			// Create the context manager.
			const manager = new ContextManager({
				method,
				params,
				options,
				headers: request.headers,
				rawHeaders: request.rawHeaders,
			});

			// Run method middlewares.
			await manager.runMiddleware(...middlewares);

			// Send response.
			response.end(JSON.stringify({
				result: manager.context.result || null,
				error: manager.context.error || null,
				id,
			}));
		};
	}
}
