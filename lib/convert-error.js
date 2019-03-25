import { toObject } from 'jpi-errors';
import { wrapError } from './wrap-error';

export function convertError(err) {
	return toObject(wrapError(err));
}
