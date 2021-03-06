import * as responseUtils from '../../lib/response-utils';
import { AppRegistry } from '../../lib/app-registry';
import { ContextManager } from '../../lib/context-manager';
import { Request } from '../../lib/request';
import { RequestHandler } from '../../lib/request-handler';

describe('RequestHandler', function() {
	let request, registry, httpRequest, handler;

	beforeEach(function() {
		request = new Request();
		registry = new AppRegistry();
		httpRequest = {};

		handler = new RequestHandler(request, registry, httpRequest);
	});

	it('stores provided Request instance', function() {
		expect(handler.request).to.equal(request);
	});

	it('stores provided registry', function() {
		expect(handler.registry).to.equal(registry);
	});

	it('stores provided http request', function() {
		expect(handler.httpRequest).to.equal(httpRequest);
	});

	describe('#getResponse', function() {
		const response = { success: 'response' };

		beforeEach(function() {
			sinon.stub(handler, '_run').resolves(response);
		});

		it('runs the handler', async function() {
			await handler.getResponse();

			expect(handler._run).to.be.calledOnce;
			expect(handler._run).to.be.calledOn(handler);
		});

		it('resolves with the handler result', async function() {
			expect(await handler.getResponse()).to.equal(response);
		});

		it('resolves with error response if the run fails', async function() {
			const errResponse = { error: 'response' };
			const err = new Error('omg bad error!');
			request.id = 'request id';
			handler._run.rejects(err);
			sinon.stub(responseUtils, 'getErrorResponse').returns(errResponse);

			const result = await handler.getResponse();

			expect(responseUtils.getErrorResponse).to.be.calledOnce;
			expect(responseUtils.getErrorResponse).to.be.calledWith(
				err,
				request.id
			);
			expect(result).to.equal(errResponse);
		});
	});

	describe('#_run', function() {
		const context = { result: { foo: 'bar' } };
		const response = { success: 'response' };
		let contextManager, result;

		beforeEach(async function() {
			contextManager = sinon.createStubInstance(ContextManager);
			request.id = 'request id';
			sinon.stub(request, 'validate');
			sinon.stub(handler, '_getContextManager').returns(contextManager);
			contextManager.run.resolves(context);
			sinon.stub(responseUtils, 'getSuccessResponse').returns(response);

			result = await handler._run();
		});

		it('validates the request', function() {
			expect(request.validate).to.be.calledOnce;
		});

		it('fetches a context manager after validating', function() {
			expect(handler._getContextManager).to.be.calledOnce;
			expect(handler._getContextManager).to.be.calledOn(handler);
			expect(handler._getContextManager)
				.to.be.calledAfter(request.validate);
		});

		it('runs the fetched context manager', function() {
			expect(contextManager.run).to.be.calledOnce;
			expect(contextManager.run).to.be.calledOn(contextManager);
		});

		it('gets success response using result from context manager run', function() {
			expect(responseUtils.getSuccessResponse).to.be.calledOnce;
			expect(responseUtils.getSuccessResponse).to.be.calledWith(
				context.result,
				request.id
			);
		});

		it('resolves success response', function() {
			expect(result).to.equal(response);
		});
	});

	describe('#_getContextManager', function() {
		const method = 'some method';
		const params = { some: 'params' };
		const headers = { some: 'headers' };
		const rawHeaders = { some: 'raw headers' };
		const options = { method: 'options' };
		const middlewares = { method: 'middlewares' };
		let result;

		beforeEach(function() {
			request.method = method;
			request.params = params;
			httpRequest.headers = headers;
			httpRequest.rawHeaders = rawHeaders;
			sinon.stub(registry, 'getMethod').returns({ options, middlewares });

			result = handler._getContextManager();
		});

		it('gets registry entry for request.method', function() {
			expect(registry.getMethod).to.be.calledOnce;
			expect(registry.getMethod).to.be.calledOn(registry);
			expect(registry.getMethod).to.be.calledWith(method);
		});

		it('returns a ContextManager with necessary references', function() {
			expect(result).to.be.an.instanceof(ContextManager);
			expect(result.context).to.deep.equal({
				method,
				options,
				params,
				headers,
				rawHeaders,
			});
			expect(result.middlewares).to.equal(middlewares);
		});
	});
});
