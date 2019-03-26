import { toObject } from 'jpi-errors';
import { wrapError } from './wrap-error';

export function getSuccessResponse(result, id) {
	return id === undefined ? null : { jsonrpc: '2.0', id, result };
}

export function getErrorResponse(err, id = null) {
	return { jsonrpc: '2.0', id, error: toObject(wrapError(err)) };
}
