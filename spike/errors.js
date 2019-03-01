/* eslint max-classes-per-file: off */
import { NaniError } from 'nani';

export class InternalJpiError extends NaniError {}

export class NotFoundError extends NaniError {
	constructor() {
		super({
			shortMessage: 'Not Found',
			info: { statusCode: 404 },
		});
	}
}

export class MethodNotAllowedError extends InternalJpiError {
	constructor() {
		super({
			shortMessage: 'Method Not Allowed',
			info: { statusCode: 405, headers: { allow: 'POST' } },
		});
	}
}
