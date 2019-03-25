import { JpiError } from 'jpi-errors';
import { ValidationError } from '../../lib/validation-error';

describe('ValidationError', function() {
	it('extends JpiError', function() {
		expect(new ValidationError()).to.be.an.instanceof(JpiError);
	});
});
