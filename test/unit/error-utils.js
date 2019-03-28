import * as nani from 'nani';
import { InternalError, JpiError, ServerError } from 'jpi-errors';
import { wrapError, wrapUnknownError } from '../../lib/error-utils';

describe('Error Utils', function() {
	describe('wrapError', function() {
		let err;

		beforeEach(function() {
			err = new Error('omg bad error!');
			sinon.stub(nani, 'is').returns(true);
		});

		it('checks if the provided error is a JpiError', function() {
			wrapError(err);

			expect(nani.is).to.be.calledOnce;
			expect(nani.is).to.be.calledWith(JpiError, err);
		});

		context('provided error is a JpiError', function() {
			it('returns unchanged error if it has an integer code', function() {
				err.code = 42;

				expect(wrapError(err)).to.equal(err);
			});

			it('wraps error if it has a non-integer code', function() {
				err.code = 3.14;

				const result = wrapError(err);

				expect(result).to.be.an.instanceof(ServerError);
				expect(result.cause).to.equal(err);
			});
		});

		context('provided error is not a JpiError', function() {
			beforeEach(function() {
				nani.is.returns(false);
			});

			it('wraps error if it has an integer code', function() {
				err.code = 42;

				const result = wrapError(err);

				expect(result).to.be.an.instanceof(ServerError);
				expect(result.cause).to.equal(err);
			});

			it('wraps error if it has a non-integer code', function() {
				err.code = 3.14;

				const result = wrapError(err);

				expect(result).to.be.an.instanceof(ServerError);
				expect(result.cause).to.equal(err);
			});
		});
	});

	describe('wrapUnknownError', function() {
		it('returns provided error wrapped with an InternalError', function() {
			const err = new Error('Unknown error');

			const result = wrapUnknownError(err);

			expect(result).to.be.an.instanceof(InternalError);
			expect(result.cause).to.equal(err);
		});
	});
});
