import { JpiError, ServerError } from 'jpi-errors';
import { is } from 'nani';
import { isInteger } from 'lodash';

export function wrapError(err) {
	return shouldWrap(err) ? new ServerError(err) : err;
}

function shouldWrap(err) {
	return !is(JpiError, err) || !isInteger(err.code);
}
