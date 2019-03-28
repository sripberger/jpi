import { InternalError, JpiError, ServerError } from 'jpi-errors';
import { is } from 'nani';
import { isInteger } from 'lodash';

export function wrapError(err) {
	return shouldWrap(err) ? new ServerError(err) : err;
}

export function wrapUnknownError(err) {
	return new InternalError(err);
}

function shouldWrap(err) {
	return !is(JpiError, err) || !isInteger(err.code);
}
