import * as jpiErrors from 'jpi-errors';
import * as wrapErrorModule from '../../lib/wrap-error';
import { getErrorResponse, getSuccessResponse } from '../../lib/response-utils';

describe('Response Utils', function() {
	describe('getSuccessResponse', function() {
		const result = { foo: 'bar' };

		it('returns a JSON-RPC response object with id and result', function() {
			const id = 'some id';

			expect(getSuccessResponse(result, id)).to.deep.equal({
				jsonrpc: '2.0',
				id,
				result,
			});
		});

		it('returns null if id is undefined', function() {
			expect(getSuccessResponse(result, undefined)).to.be.null;
		});

		it('supports falsy ids', function() {
			expect(getSuccessResponse(result, 0).id).to.equal(0);
		});

		it('supports null ids', function() {
			expect(getSuccessResponse(result, null).id).to.be.null;
		});
	});

	describe('getErrorResponse', function() {
		const id = 'some id';
		const err = new Error('original error');
		const wrappedError = new Error('wrapped error');
		const converted = { converted: 'error' };
		let toObject, wrapError, result;

		beforeEach(function() {
			wrapError = sinon.stub(wrapErrorModule, 'wrapError')
				.returns(wrappedError);
			toObject = sinon.stub(jpiErrors, 'toObject')
				.returns(converted);

			result = getErrorResponse(err, id);
		});

		it('wraps error', function() {
			expect(wrapError).to.be.calledOnce;
			expect(wrapError).to.be.calledWith(err);
		});

		it('converts wrapped error to a JSON-RPC error object', function() {
			expect(toObject).to.be.calledOnce;
			expect(toObject).to.be.calledWith(wrappedError);
		});

		it('returns JSON-RPC response object with id and converted error', function() {
			expect(result).to.deep.equal({
				jsonrpc: '2.0',
				id,
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
});
