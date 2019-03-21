import { HttpStatusError } from '../../lib/http-status-error';
import { JpiError } from 'jpi-errors';

describe('HttpStatusError', function() {
	it('extends JpiError', function() {
		expect(new HttpStatusError()).to.be.an.instanceof(JpiError);
	});
});
