import { ClientRequest, ServerResponse } from 'http';
import { MethodManager } from '../../lib/method-manager';
import { MiddlewareManager } from '../../lib/middleware-manager';
import { RequestHandler } from '../../lib/request-handler';

describe('RequestHandler', function() {
	let request, response, middlewareManager, methodManager, handler;

	beforeEach(function() {
		request = sinon.createStubInstance(ClientRequest);
		response = sinon.createStubInstance(ServerResponse);
		middlewareManager = new MiddlewareManager();
		methodManager = new MethodManager();

		handler = new RequestHandler(
			request,
			response,
			middlewareManager,
			methodManager
		);
	});

	it('stores provided client request', function() {
		expect(handler.request).to.equal(request);
	});

	it('stores provided server response', function() {
		expect(handler.response).to.equal(response);
	});

	it('stores provided middleware manager', function() {
		expect(handler.middlewareManager).to.equal(middlewareManager);
	});

	it('stores provided method manager', function() {
		expect(handler.methodManager).to.equal(methodManager);
	});

	describe('#run', function() {
		it('handles the request');
	});
});
