import * as requestModule from '../../lib/request';
import { RequestBatch } from '../../lib/request-batch';

describe('RequestBatch', function() {
	it('stores provided array of requests', function() {
		const requests = [
			new requestModule.Request({ method: 'foo' }),
			new requestModule.Request({ method: 'bar' }),
		];

		const batch = new RequestBatch(requests);

		expect(batch.requests).to.equal(requests);
	});

	it('defaults to empty request array', function() {
		expect(new RequestBatch().requests).to.deep.equal([]);
	});

	describe('::fromArray', function() {
		it('converts a plain object array to an instance', function() {
			const fooObj = { obj: 'foo' };
			const barObj = { obj: 'bar' };
			const fooRequest = { request: 'foo' };
			const barRequest = { request: 'bar' };
			const Request = sinon.stub(requestModule, 'Request');
			Request.withArgs(sinon.match.same(fooObj)).returns(fooRequest);
			Request.withArgs(sinon.match.same(barObj)).returns(barRequest);

			const result = RequestBatch.fromArray([ fooObj, barObj ]);

			expect(Request).to.be.calledTwice;
			expect(Request).to.always.be.calledWithNew;
			expect(Request).to.be.calledWith(fooObj);
			expect(Request).to.be.calledWith(barObj);
			expect(result).to.be.an.instanceof(RequestBatch);
			expect(result.requests).to.have.length(2);
			expect(result.requests[0]).to.equal(fooRequest);
			expect(result.requests[1]).to.equal(barRequest);
		});
	});
});
