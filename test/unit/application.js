import { Application } from '../../lib/application';
import { MethodRegistry } from '../../lib/method-registry';
import { MiddlewareManager } from '../../lib/middleware-manager';

describe('Application', function() {
	let application, _middlewareManager, _methodRegistry;

	beforeEach(function() {
		application = new Application();
		({ _middlewareManager, _methodRegistry } = application);
	});

	it('creates manager for application-level middleware', function() {
		expect(_middlewareManager).to.be.an.instanceof(MiddlewareManager);
	});

	it('creates a manager for methods', function() {
		expect(_methodRegistry).to.be.an.instanceof(MethodRegistry);
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
		it('passes through to _methodRegistry.register', function() {
			sinon.stub(_methodRegistry, 'register');

			application.registerMethod('foo', 'bar');

			expect(_methodRegistry.register).to.be.calledOnce;
			expect(_methodRegistry.register).to.be.calledOn(_methodRegistry);
			expect(_methodRegistry.register).to.be.calledWith('foo', 'bar');
		});
	});

	describe('#getCallback', function() {
		const bound = () => {};
		let _handle, result;

		beforeEach(function() {
			({ _handle } = application);
			sinon.stub(_middlewareManager, 'finalize');
			sinon.stub(_handle, 'bind').returns(bound);

			result = application.getCallback();
		});

		it('finalizes application-level middleware', function() {
			expect(_middlewareManager.finalize).to.be.calledOnce;
			expect(_middlewareManager.finalize)
				.to.be.calledOn(_middlewareManager);
		});

		it('binds #_handle method to instance', function() {
			expect(_handle.bind).to.be.calledOnce;
			expect(_handle.bind).to.be.calledOn(_handle);
			expect(_handle.bind).to.be.calledWithExactly();
		});

		it('returns bound #_handle method', function() {
			expect(result).to.equal(bound);
		});
	});

	describe('#_handle', function() {
		it('handles the http request and response');
	});
});
