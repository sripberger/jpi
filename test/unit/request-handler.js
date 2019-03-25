import { MethodManager } from '../../lib/method-manager';
import { MiddlewareManager } from '../../lib/middleware-manager';
import { Request } from '../../lib/request';
import { RequestHandler } from '../../lib/request-handler';

describe('RequestHandler', function() {
	let request, middlewareManager, methodManager, handler;

	beforeEach(function() {
		request = sinon.createStubInstance(Request);
		middlewareManager = new MiddlewareManager();
		methodManager = new MethodManager();

		handler = new RequestHandler(
			request,
			middlewareManager,
			methodManager
		);
	});

	it('stores provided request object', function() {
		expect(handler.request).to.equal(request);
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
