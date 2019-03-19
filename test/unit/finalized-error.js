import { FinalizedError } from '../../lib/finalized-error';
import { RegistrationError } from '../../lib/registration-error';

describe('FinalizedError', function() {
	it('extends RegistrationError', function() {
		expect(new FinalizedError()).to.be.an.instanceof(RegistrationError);
	});

	describe('::getDefaultMessage', function() {
		it('returns an appropriate message', function() {
			expect(FinalizedError.getDefaultMessage()).to.equal(
				'Cannot register to a finalized middleware sort'
			);
		});
	});
});
