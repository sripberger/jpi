import { getErrorResponse, serializeResponse } from './response-utils';
import { HttpStatusError } from './http-status-error';
import { JpiError } from 'jpi-errors';
import { fromHttp } from './from-http';
import { is } from 'nani';
import { wrapUnknownError } from './error-utils';

export class HttpHandler {
	constructor(registry, httpRequest, httpResponse) {
		this.registry = registry;
		this.httpRequest = httpRequest;
		this.httpResponse = httpResponse;
	}

	async run() {
		try {
			await this._run();
		} catch (err) {
			this._handleLastDitchError(err);
		}
	}

	async _run() {
		try {
			await this._handleRequest();
		} catch (err) {
			this._handleRequestError(err);
		}
	}

	async _handleRequest() {
		const { registry, httpRequest } = this;
		const request = await fromHttp(httpRequest);
		const response = await request.getResponse(registry, httpRequest);
		this._sendResponse(response);
	}

	_handleRequestError(err) {
		if (is(HttpStatusError, err)) {
			this._handleStatusError(err);
		} else if (is(JpiError, err)) {
			this._sendErrorResponse(err);
		} else {
			this._handleUnknownError(err);
		}
	}

	_sendErrorResponse(err) {
		this._sendResponse(getErrorResponse(err));
	}

	_handleStatusError(err) {
		const { status, headers } = err.info;
		this._prepareHttpResponse(status, headers);
		this.httpResponse.end(err.message);
	}

	_handleUnknownError(err) {
		this._sendErrorResponse(wrapUnknownError(err));
	}

	_handleLastDitchError(err) {
		try {
			this._handleUnknownError(err);
		} catch (e) { // eslint-disable-line no-unused-var
			// Nothing more we can do at this point...
		}
	}

	_sendResponse(response) {
		this._sendResponseText(serializeResponse(response));
	}

	_sendResponseText(text) {
		this._prepareHttpResponse(200, { 'Content-Type': 'application/json' });
		this.httpResponse.end(text);
	}

	_prepareHttpResponse(status, headers = {}) {
		this.httpResponse.on('error', () => {});
		this.httpResponse.statusCode = status;
		for (const key in headers) {
			this.httpResponse.setHeader(key, headers[key]);
		}
	}
}
