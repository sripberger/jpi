import * as requestModule from '../../lib/request';
import * as zstreams from 'zstreams';
import { ParseError, RequestFailedError } from 'jpi-errors';
import { HttpStatusError } from '../../lib/http-status-error';
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

	describe('::fromHttp', function() {
		const req = {};

		beforeEach(function() {
			sinon.stub(RequestBatch, '_validateHttp');
			sinon.stub(RequestBatch, '_parseBody').returns([]);
		});

		it('validates the provided http request', async function() {
			await RequestBatch.fromHttp(req);

			expect(RequestBatch._validateHttp).to.be.calledOnce;
			expect(RequestBatch._validateHttp).to.be.calledOn(RequestBatch);
			expect(RequestBatch._validateHttp)
				.to.be.calledWith(sinon.match.same(req));
		});

		it('parses the request body after validating', async function() {
			await RequestBatch.fromHttp(req);

			expect(RequestBatch._parseBody).to.be.calledOnce;
			expect(RequestBatch._parseBody).to.be.calledOn(RequestBatch);
			expect(RequestBatch._parseBody)
				.to.be.calledWith(sinon.match.same(req));
			expect(RequestBatch._parseBody)
				.to.be.calledAfter(RequestBatch._validateHttp);
		});

		it('returns instance with body objects mapped to requests', async function() {
			const fooObj = { name: 'foo' };
			const barObj = { name: 'bar' };
			const fooRequest = { request: 'foo' };
			const barRequest = { request: 'bar' };
			RequestBatch._parseBody.resolves([ fooObj, barObj ]);
			sinon.stub(requestModule, 'Request')
				.withArgs(fooObj).returns(fooRequest)
				.withArgs(barObj).returns(barRequest);

			const result = await RequestBatch.fromHttp(req);

			expect(requestModule.Request).to.be.calledTwice;
			expect(requestModule.Request).to.always.be.calledWithNew;
			expect(requestModule.Request).to.be.calledWith(fooObj);
			expect(requestModule.Request).to.be.calledWith(barObj);
			expect(result).to.be.an.instanceof(RequestBatch);
			expect(result.requests).to.have.length(2);
			expect(result.requests[0]).to.equal(fooRequest);
			expect(result.requests[1]).to.equal(barRequest);
		});

		it('maps a single request with no array', async function() {
			const obj = { name: 'foo' };
			const request = { request: 'foo' };
			RequestBatch._parseBody.resolves(obj);
			sinon.stub(requestModule, 'Request').returns(request);

			const result = await RequestBatch.fromHttp(req);

			expect(requestModule.Request).to.be.calledOnce;
			expect(requestModule.Request).to.be.calledWithNew;
			expect(requestModule.Request).to.be.calledWith(obj);
			expect(result).to.be.an.instanceof(RequestBatch);
			expect(result.requests).to.have.length(1);
			expect(result.requests[0]).to.equal(request);
		});
	});

	describe('::_validateHttp', function() {
		let req;

		beforeEach(function() {
			req = { path: '/', method: 'POST' };
		});

		it('does nothing if path and method are valid', function() {
			RequestBatch._validateHttp(req);
		});

		it('throws if path is not root', function() {
			req.path = '/path/to/something';

			expect(() => {
				RequestBatch._validateHttp(req);
			}).to.throw(HttpStatusError).that.satisfies((err) => {
				expect(err.message).to.equal('Not Found');
				expect(err.info).to.deep.equal({ statusCode: 404 });
				return true;
			});
		});

		it('throws if method is not POST', function() {
			req.method = 'GET';

			expect(() => {
				RequestBatch._validateHttp(req);
			}).to.throw(HttpStatusError).that.satisfies((err) => {
				expect(err.message).to.equal('Method Not Allowed');
				expect(err.info).to.deep.equal({
					statusCode: 405,
					headers: { allow: 'POST' },
				});
				return true;
			});
		});
	});

	describe('::_parseBody', function() {
		const req = {};
		const body = 'request body';
		const parsed = { foo: 'bar' };

		beforeEach(function() {
			sinon.stub(RequestBatch, '_getBody').resolves(body);
			sinon.stub(JSON, 'parse').returns(parsed);
		});

		it('gets http request body', async function() {
			await RequestBatch._parseBody(req);

			expect(RequestBatch._getBody).to.be.calledOnce;
			expect(RequestBatch._getBody).to.be.calledOn(RequestBatch);
			expect(RequestBatch._getBody)
				.to.be.calledWith(sinon.match.same(req));
		});

		it('parses body as json', async function() {
			await RequestBatch._parseBody(req);

			expect(JSON.parse).to.be.calledOnce;
			expect(JSON.parse).to.be.calledWith(body);
		});

		it('returns parsed body', async function() {
			expect(await RequestBatch._parseBody(req)).to.equal(parsed);
		});

		it('wraps parsing errors', function() {
			const parsingErr = new Error('Parsing error');
			JSON.parse.throws(parsingErr);

			return RequestBatch._parseBody(req)
				.then(() => {
					throw new Error('Promise should have rejected');
				}, (err) => {
					expect(err).to.be.an.instanceof(ParseError);
					expect(err.cause).to.equal(parsingErr);
				});
		});

		it('does not wrap errors from ::_getBody', function() {
			const getBodyErr = new Error('_getBody error');
			RequestBatch._getBody.rejects(getBodyErr);

			return RequestBatch._parseBody(req)
				.then(() => {
					throw new Error('Promise should have rejected');
				}, (err) => {
					expect(err).to.equal(getBodyErr);
				});
		});
	});

	describe('::_getBody', function() {
		const req = {};
		const body = 'request body';
		const stream = { intoString: () => {} };

		beforeEach(function() {
			sinon.stub(zstreams, 'default').returns(stream);
			sinon.stub(stream, 'intoString').resolves(body);
		});

		it('consumes request using zstreams intoString', async function() {
			const result = await RequestBatch._getBody(req);

			expect(zstreams.default).to.be.calledOnce;
			expect(zstreams.default).to.be.calledWith(sinon.match.same(req));
			expect(stream.intoString).to.be.calledOnce;
			expect(stream.intoString).to.be.calledOn(stream);
			expect(stream.intoString).to.be.calledWithExactly();
			expect(result).to.equal(body);
		});

		it('wraps stream errors', function() {
			const streamErr = new Error('Stream error');
			stream.intoString.rejects(streamErr);

			return RequestBatch._getBody(req)
				.then(() => {
					throw new Error('Promise should have rejected');
				}, (err) => {
					expect(err).to.be.an.instanceof(RequestFailedError);
					expect(err.cause).to.equal(streamErr);
				});
		});

		it('wraps zstreams conversion errors', function() {
			const zstreamsErr = new Error('zstreams conversion error');
			zstreams.default.throws(zstreamsErr);

			return RequestBatch._getBody(req)
				.then(() => {
					throw new Error('Promise should have rejected');
				}, (err) => {
					expect(err).to.be.an.instanceof(RequestFailedError);
					expect(err.cause).to.equal(zstreamsErr);
				});
		});
	});
});
