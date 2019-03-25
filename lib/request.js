import { InvalidRequestError } from 'jpi-errors';
import { ValidationError } from './validation-error';
import _ from 'lodash';
import { fromArray } from 'nani';

const jsonRpcProperties = [
	'jsonrpc',
	'method',
	'params',
	'id',
];

export class Request {
	constructor(obj = {}) {
		_.assign(this, _.pick(obj, jsonRpcProperties));
	}

	validate() {
		const err = fromArray(this._getValidationErrors());
		if (err) throw new InvalidRequestError(err);
	}

	_getValidationErrors() {
		return _.filter([
			this._getJsonrpcError(),
			this._getMethodError(),
			this._getParamsError(),
			this._getIdError(),
		]);
	}

	_getJsonrpcError() {
		const { jsonrpc } = this;
		if (jsonrpc === '2.0') return null;
		const info = 'jsonrpc' in this ? { jsonrpc } : null;
		return new ValidationError('Only jsonrpc 2.0 is supported', { info });
	}

	_getMethodError() {
		let message = null;
		let info = null;
		if ('method' in this) {
			const { method } = this;
			if (!_.isString(method)) {
				message = `method must be a string, recieved ${method}`;
			} else if (_.isEmpty(method)) {
				message = 'method string must not be empty';
			}
			info = { method };
		} else {
			message = 'method is required';
		}

		return message ? new ValidationError(message, { info }) : null;
	}

	_getParamsError() {
		const { params } = this;
		if (
			!('params' in this) ||
			_.isPlainObject(params) ||
			_.isArray(params)
		) {
			return null;
		}

		return new ValidationError(
			`params must be an object or array, recieved ${params}`,
			{ info: { params } }
		);
	}

	_getIdError() {
		const { id } = this;
		if (
			!('id' in this) ||
			id === null ||
			_.isString(id) ||
			_.isNumber(id)
		) {
			return null;
		}

		return new ValidationError(
			`id must be a string, number, or null, recieved ${id}`,
			{ info: { id } }
		);
	}
}
