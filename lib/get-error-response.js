import { toObject } from 'jpi-errors';
import { wrapError } from './wrap-error';

export function getErrorResponse(err, id = null) {
	return { jsonrpc: '2.0', id, error: toObject(wrapError(err)) };
}
