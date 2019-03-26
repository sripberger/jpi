import { toObject } from 'jpi-errors';
import { wrapError } from './wrap-error';

export function getErrorResponse(err, id = null) {
	return { id, result: null, error: toObject(wrapError(err)) };
}
