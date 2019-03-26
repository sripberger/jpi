import * as jpiErrors from 'jpi-errors';
import * as wrapErrorModule from '../../lib/wrap-error';
import { getErrorResponse } from '../../lib/get-error-response';

describe('getErrorResponse', function() {
	const id = 'some id';
	const err = new Error('original error');
	const wrapped = new Error('wrapped error');
	const converted = { converted: 'error' };
	let toObject, wrapError, result;

	beforeEach(function() {
		wrapError = sinon.stub(wrapErrorModule, 'wrapError').returns(wrapped);
		toObject = sinon.stub(jpiErrors, 'toObject').returns(converted);

		result = getErrorResponse(err, id);
	});

	it('wraps error', function() {
		expect(wrapError).to.be.calledOnce;
		expect(wrapError).to.be.calledWith(err);
	});

	it('converts wrapped error to a JSON-RPC error object', function() {
		expect(toObject).to.be.calledOnce;
		expect(toObject).to.be.calledWith(wrapped);
	});

	it('returns an object with id, null result, and converted error', function() {
		expect(result).to.deep.equal({
			id,
			result: null,
			error: converted,
		});
	});

	it('defaults to a null id', function() {
		expect(getErrorResponse(err).id).to.be.null;
	});

	it('supports falsy ids', function() {
		expect(getErrorResponse(err, 0).id).to.equal(0);
	});
});
