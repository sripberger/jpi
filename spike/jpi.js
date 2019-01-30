import ContextManager from '../lib/context-manager';
import JpiError from 'jpi-error';
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

			let id = null;
			try {
				try {
					// Ensure url path is root.
					if (request.url !== '/') {
						throw new JpiError(JpiError.NOT_FOUND);
					}

					// Ensure method is POST.
					if (request.method !== 'POST') {
						throw new JpiError(JpiError.METHOD_NOT_ALLOWED);
					}

					// Get the whole request body.
					let body;
					try {
						body = await zstreams(request).intoString();
					} catch (err) {
						throw new JpiError(JpiError.REQUEST_FAILED, err);
					}

					// Parse the request body as JSON.
					try {
						body = JSON.parse(body);
					} catch (err) {
						throw new JpiError(JpiError.PARSE_ERROR, err);
					}

					// Get JSON-RPC fields from request body.
					let method, params;
					({ method, params, id } = body);
					if (!method) {
						throw new JpiError(
							JpiError.INVALID_REQUEST,
							'No method in request body'
						);
					}
					if (!params) {
						throw new JpiError(
							JpiError.INVALID_REQUEST,
							'No params in request body'
						);
					}

					// Make sure method is registered.
					if (!(method in this.methods)) {
						throw new JpiError(
							JpiError.METHOD_NOT_FOUND,
							{ method }
						);
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

					// If an error occurred in middleware, throw it.
					if (manager.context.error) throw manager.context.error;

					// Send successful JSON_RPC response.
					response.statusCode = 200;
					response.setHeader('Content-Type', 'application/json');
					response.end(JSON.stringify({
						result: manager.context.result,
						error: null,
						id,
					}));
				} catch (err) {
					// Wrap any non-jpi errors in a generic server error.
					if (err.isJpiError) throw err;
					throw new JpiError(JpiError.SERVER_ERROR, err);
				}
			} catch (err) {
				if (err.code === JpiError.NOT_FOUND) {
					// Send 404 response.
					response.statusCode = 404;
					response.end('Not Found');
				} else if (err.code === JpiError.METHOD_NOT_ALLOWED) {
					// Send 405 response.
					response.statusCode = 405;
					response.setHeader('Allow', 'POST');
					response.end('Method Not Allowed');
				} else {
					// Send normal JSON-RPC error response.
					response.statusCode = 200;
					response.setHeader('Content-Type', 'application/json');
					response.end(JSON.stringify({
						result: null,
						error: err.toObject(),
						id
					}));
				}
			}
		};
	}
}
