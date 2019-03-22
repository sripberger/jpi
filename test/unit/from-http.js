import * as requestModule from '../../lib/request';
import * as requestUtils from '../../lib/request-utils';
import { RequestBatch } from '../../lib/request-batch';
import { fromHttp } from '../../lib/from-http';

describe('fromHttp', function() {
	const req = { http: 'request' };
	const body = 'request body';
	const request = { jsonrpc: 'request' };
	let parsed, validateHttp, getBody, parseBody, Request;

	beforeEach(function() {
		parsed = { foo: 'bar' };
		validateHttp = sinon.stub(requestUtils, 'validateHttp');
		getBody = sinon.stub(requestUtils, 'getBody').resolves(body);
		parseBody = sinon.stub(requestUtils, 'parseBody')
			.callsFake(() => parsed);
		Request = sinon.stub(requestModule, 'Request').returns(request);
	});

	it('validates provided http request', async function() {
		await fromHttp(req);

		expect(validateHttp).to.be.calledOnce;
		expect(validateHttp).to.be.calledWith(sinon.match.same(req));
	});

	it('gets body from provided http request after validating', async function() {
		await fromHttp(req);

		expect(getBody).to.be.calledOnce;
		expect(getBody).to.be.calledWith(sinon.match.same(req));
		expect(getBody).to.be.calledAfter(validateHttp);
	});

	it('parses fetched body', async function() {
		await fromHttp(req);

		expect(parseBody).to.be.calledOnce;
		expect(parseBody).to.be.calledWith(body);
	});

	it('resolves with a parsed object as a single Request', async function() {
		const result = await fromHttp(req);

		expect(Request).to.be.calledOnce;
		expect(Request).to.be.calledWithNew;
		expect(Request).to.be.calledWith(parsed);
		expect(result).to.equal(request);
	});

	it('resolves with a parsed array as a RequestBatch', async function() {
		const batch = new RequestBatch();
		parsed = [ { foo: 'bar' }, { baz: 'qux' } ];
		sinon.stub(RequestBatch, 'fromArray').returns(batch);

		const result = await fromHttp(req);

		expect(RequestBatch.fromArray).to.be.calledOnce;
		expect(RequestBatch.fromArray).to.be.calledOn(RequestBatch);
		expect(RequestBatch.fromArray).to.be.calledWith(parsed);
		expect(result).to.equal(batch);
	});
});
