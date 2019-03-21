import { ParseError, RequestFailedError } from 'jpi-errors';
import { castArray, isArray } from 'lodash';
import { HttpStatusError } from './http-status-error';
import { Request } from './request';
import zstreams from 'zstreams';

export class RequestBatch {
	constructor(requests = [], isSingle = false) {
		this.requests = requests;
		this.isSingle = isSingle;
	}

	static async fromHttp(req) {
		this._validateHttp(req);
		const body = await this._parseBody(req);
		const requests = castArray(body).map((obj) => new Request(obj));
		return new this(requests, !isArray(body));
	}

	static _validateHttp(req) {
		if (req.path !== '/') {
			throw new HttpStatusError(
				'Not Found',
				{ info: { statusCode: 404 } }
			);
		}

		if (req.method !== 'POST') {
			throw new HttpStatusError(
				'Method Not Allowed',
				{ info: {
					statusCode: 405,
					headers: { allow: 'POST' },
				} }
			);
		}
	}

	static async _parseBody(req) {
		const body = await this._getBody(req);
		try {
			return JSON.parse(body);
		} catch (err) {
			throw new ParseError(err);
		}
	}

	static async _getBody(req) {
		try {
			return await zstreams(req).intoString();
		} catch (err) {
			throw new RequestFailedError(err);
		}
	}
}
