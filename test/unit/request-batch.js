import * as pasync from 'pasync';
import * as requestModule from '../../lib/request';
import { InvalidRequestError } from 'jpi-errors';
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

	describe('#getResponse', function() {
		const registry = { middleware: 'registry' };
		const httpRequest = { http: 'request' };
		let batch, mapResult, result;

		beforeEach(async function() {
			batch = new RequestBatch();
			mapResult = [ 'foo', 'bar' ];
			sinon.stub(pasync, 'map').resolves(mapResult);

			result = await batch.getResponse(registry, httpRequest);
		});

		it('maps requests using using pasync', function() {
			expect(pasync.map).to.be.calledOnce;
			expect(pasync.map).to.be.calledWith(
				sinon.match.same(batch.requests),
				sinon.match.func
			);
		});

		it('resolves with result of pasync map', function() {
			expect(result).to.equal(mapResult);
		});

		describe('iteratee', function() {
			const response = { baz: 'qux' };
			let iteratee, request, iterateeResult;

			beforeEach(async function() {
				await batch.getResponse();
				[ , iteratee ] = pasync.map.firstCall.args;
				request = sinon.createStubInstance(requestModule.Request);
				request.getResponse.resolves(response);

				iterateeResult = await iteratee(request);
			});

			it('gets response from the request', function() {
				expect(request.getResponse).to.be.calledOnce;
				expect(request.getResponse).to.be.calledOn(request);
				expect(request.getResponse).to.be.calledWith(
					registry,
					httpRequest
				);
			});

			it('resolves with response', function() {
				expect(iterateeResult).to.equal(response);
			});
		});
	});

	describe('::fromArray', function() {
		it('converts a plain object array to an instance', function() {
			const fooObj = { obj: 'foo' };
			const barObj = { obj: 'bar' };
			const fooRequest = { request: 'foo' };
			const barRequest = { request: 'bar' };
			const Request = sinon.stub(requestModule, 'Request');
			Request.withArgs(fooObj).returns(fooRequest);
			Request.withArgs(barObj).returns(barRequest);

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

		it('throws if array is empty', function() {
			expect(() => {
				RequestBatch.fromArray([]);
			}).to.throw(InvalidRequestError);
		});
	});
});
