import { SerializationError } from './serialization-error';
import { toObject } from 'jpi-errors';
import { wrapError } from './error-utils';

export function getSuccessResponse(result, id) {
	return id === undefined ? null : { jsonrpc: '2.0', id, result };
}

export function getErrorResponse(err, id = null) {
	return { jsonrpc: '2.0', id, error: toObject(wrapError(err)) };
}

export function serializeResponse(response) {
	try {
		return JSON.stringify(response);
	} catch (err) {
		throw new SerializationError(err);
	}
}
