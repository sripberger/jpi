import * as requestHandlerModule from '../../lib/request-handler';
import { Application } from '../../lib/application';
import { MethodManager } from '../../lib/method-manager';
import { MiddlewareManager } from '../../lib/middleware-manager';

describe('Application', function() {
	let application, _middlewareManager, _methodManager;

	beforeEach(function() {
		application = new Application();
		({ _middlewareManager, _methodManager } = application);
	});

	it('creates manager for application-level middleware', function() {
		expect(_middlewareManager).to.be.an.instanceof(MiddlewareManager);
	});

	it('creates a manager for methods', function() {
		expect(_methodManager).to.be.an.instanceof(MethodManager);
	});

	describe('#registerPremethod', function() {
		it('passes through to _middlewareManager.registerPremethod', function() {
			sinon.stub(_middlewareManager, 'registerPremethod');

			application.registerPremethod('foo', 'bar');

			expect(_middlewareManager.registerPremethod).to.be.calledOnce;
			expect(_middlewareManager.registerPremethod)
				.to.be.calledOn(_middlewareManager);
			expect(_middlewareManager.registerPremethod)
				.to.be.calledWith('foo', 'bar');
		});
	});

	describe('#registerPostmethod', function() {
		it('passes through to _middlewareManager.registerPostmethod', function() {
			sinon.stub(_middlewareManager, 'registerPostmethod');

			application.registerPostmethod('foo', 'bar');

			expect(_middlewareManager.registerPostmethod).to.be.calledOnce;
			expect(_middlewareManager.registerPostmethod)
				.to.be.calledOn(_middlewareManager);
			expect(_middlewareManager.registerPostmethod)
				.to.be.calledWith('foo', 'bar');
		});
	});

	describe('registerMethod', function() {
		it('passes through to _methodManager.register', function() {
			sinon.stub(_methodManager, 'register');

			application.registerMethod('foo', 'bar');

			expect(_methodManager.register).to.be.calledOnce;
			expect(_methodManager.register).to.be.calledOn(_methodManager);
			expect(_methodManager.register).to.be.calledWith('foo', 'bar');
		});
	});

	describe('#getCallback', function() {
		let callback;

		beforeEach(function() {
			sinon.stub(_middlewareManager, 'finalize');

			callback = application.getCallback();
		});

		it('finalizes application-level middleware', function() {
			expect(_middlewareManager.finalize).to.be.calledOnce;
			expect(_middlewareManager.finalize)
				.to.be.calledOn(_middlewareManager);
		});

		it('returns a function', function() {
			expect(callback).to.be.an.instanceof(Function);
		});

		describe('returned function', function() {
			let request, response, handler;

			beforeEach(function() {
				request = {};
				response = {};
				handler = sinon.createStubInstance(
					requestHandlerModule.RequestHandler
				);
				sinon.stub(requestHandlerModule, 'RequestHandler')
					.returns(handler);

				callback(request, response);
			});

			it('creates a request handler with required arguments', function() {
				expect(requestHandlerModule.RequestHandler).to.be.calledOnce;
				expect(requestHandlerModule.RequestHandler).to.be.calledWithNew;
				expect(requestHandlerModule.RequestHandler).to.be.calledWith(
					sinon.match.same(request),
					sinon.match.same(response),
					sinon.match.same(application._middlewareManager),
					sinon.match.same(application._methodManager)
				);
			});

			it('runs the request handler', function() {
				expect(handler.run).to.be.calledOnce;
				expect(handler.run).to.be.calledOn(handler);
			});
		});
	});
});
