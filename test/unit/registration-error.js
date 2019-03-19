import { JpiError } from 'jpi-errors';
import { RegistrationError } from '../../lib/registration-error';

describe('RegistrationError', function() {
	it('extends JpiError', function() {
		expect(new RegistrationError()).to.be.an.instanceof(JpiError);
	});

	describe('::getDefaultMessage', function() {
		it('returns an appropriate message', function() {
			expect(RegistrationError.getDefaultMessage()).to.equal(
				'Middleware registration error'
			);
		});
	});
});
