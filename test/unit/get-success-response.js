import { getSuccessResponse } from '../../lib/get-success-response';

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
