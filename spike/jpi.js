import {
	InternalJpiError,
	MethodNotAllowedError,
	NotFoundError,
} from './errors';

import {
	InvalidRequestError,
	JpiError,
	MethodNotFoundError,
	ParseError,
	RequestFailedError,
	ServerError,
	toObject,
} from 'jpi-errors';

import ContextManager from '../lib/context-manager';
import _ from 'lodash';
import { is } from 'nani';
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
					if (request.url !== '/') throw new NotFoundError();

					// Ensure method is POST.
					if (request.method !== 'POST') {
						throw new MethodNotAllowedError();
					}

					// Get the whole request body.
					let body;
					try {
						body = await zstreams(request).intoString();
					} catch (err) {
						throw new RequestFailedError();
					}

					// Parse the request body as JSON.
					try {
						body = JSON.parse(body);
					} catch (err) {
						throw new ParseError(err);
					}

					// Get JSON-RPC fields from request body.
					let method, params;
					({ method, params, id } = body);
					if (!method) {
						throw new InvalidRequestError(
							'No method in request body'
						);
					}
					if (!params) {
						throw new InvalidRequestError(
							'No params in request body'
						);
					}

					// Make sure method is registered.
					if (!(method in this.methods)) {
						throw new MethodNotFoundError({ info: { method } });
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
					await manager.runMiddlewares(middlewares);

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
					// Rethrow JpiErrors with valid codes.
					if (is(JpiError, err) && Number.isInteger(err.code)) {
						throw err;
					}
					// Wrap all others in a generic server error.
					throw new ServerError(err);
				}
			} catch (err) {
				if (is(InternalJpiError, err)) {
					// Send response for internal jpi error.
					const { statusCode, headers } = err.info;
					response.statusCode = statusCode;
					for (const key in headers) {
						response.setHeader(key, headers[key]);
					}
				} else {
					// Send normal JSON-RPC error response.
					response.statusCode = 200;
					response.setHeader('Content-Type', 'application/json');
					response.end(JSON.stringify({
						result: null,
						error: toObject(err),
						id,
					}));
				}
			}
		};
	}
}
