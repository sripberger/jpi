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
			it('invokes #_handleRequest with reqqest and reponse', function() {
				const request = {};
				const response = {};
				sinon.stub(application, '_handleRequest');

				callback(request, response);

				expect(application._handleRequest).to.be.calledOnce;
				expect(application._handleRequest).to.be.calledOn(application);
				expect(application._handleRequest).to.be.calledWith(
					sinon.match.same(request),
					sinon.match.same(response)
				);
			});
		});
	});

	describe('#_handleRequest', function() {
		it('handles a request');
	});
});
