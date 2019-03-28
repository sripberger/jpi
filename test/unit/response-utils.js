import * as errorUtils from '../../lib/error-utils';
import * as jpiErrors from 'jpi-errors';

import {
	getErrorResponse,
	getSuccessResponse,
	serializeResponse,
} from '../../lib/response-utils';

import { SerializationError } from '../../lib/serialization-error';

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
			wrapError = sinon.stub(errorUtils, 'wrapError')
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

	describe('serializeResponse', function() {
		const response = { response: 'object' };
		const stringified = 'stringifed response';

		beforeEach(function() {
			// Callthrough is needed here because stingify is used by chai.
			sinon.stub(JSON, 'stringify').callThrough()
				.onFirstCall().returns(stringified);
		});

		it('stringifies response as json', function() {
			serializeResponse(response);

			expect(JSON.stringify).to.be.calledOnce;
			expect(JSON.stringify).to.be.calledWith(response);
		});

		it('returns stringifed response', function() {
			expect(serializeResponse(response)).to.equal(stringified);
		});

		it('wraps stringify errors', function() {
			const err = new Error('Stringify error');
			JSON.stringify.onFirstCall().throws(err);

			expect(() => {
				serializeResponse(response);
			}).to.throw(SerializationError).with.property('cause', err);
		});
	});
});
