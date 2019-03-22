import { ParseError, RequestFailedError } from 'jpi-errors';
import { HttpStatusError } from './http-status-error';
import zstreams from 'zstreams';

export function validateHttp(req) {
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

export async function getBody(req) {
	try {
		return await zstreams(req).intoString();
	} catch (err) {
		throw new RequestFailedError(err);
	}
}

export function parseBody(body) {
	try {
		return JSON.parse(body);
	} catch (err) {
		throw new ParseError(err);
	}
}
