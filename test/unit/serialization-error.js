import { JpiError } from 'jpi-errors';
import { SerializationError } from '../../lib/serialization-error';

describe('SerializationError', function() {
	it('extends JpiError', function() {
		expect(new SerializationError()).to.be.an.instanceof(JpiError);
	});

	describe('::getDefaultMessage', function() {
		it('returns an appropriate message', function() {
			expect(SerializationError.getDefaultMessage()).to.equal(
				'Response could not be serialized to JSON'
			);
		});
	});
});
