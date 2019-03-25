import * as jpiErrors from 'jpi-errors';
import * as wrapErrorModule from '../../lib/wrap-error';
import { convertError } from '../../lib/convert-error';

describe('convertError', function() {
	const err = new Error('original error');
	const wrapped = new Error('wrapped error');
	const converted = { converted: 'error' };
	let toObject, wrapError, result;

	beforeEach(function() {
		wrapError = sinon.stub(wrapErrorModule, 'wrapError').returns(wrapped);
		toObject = sinon.stub(jpiErrors, 'toObject').returns(converted);

		result = convertError(err);
	});

	it('wraps error', function() {
		expect(wrapError).to.be.calledOnce;
		expect(wrapError).to.be.calledWith(err);
	});

	it('converts wrapped error using jpi-errors::toObject', function() {
		expect(toObject).to.be.calledOnce;
		expect(toObject).to.be.calledWith(wrapped);
	});

	it('returns result of jpi-errors::toObject', function() {
		expect(result).to.equal(converted);
	});
});
