import * as httpHandlerModule from '../../lib/http-handler';
import { AppRegistry } from '../../lib/app-registry';
import { Application } from '../../lib/application';

describe('Application', function() {
	let application, _registry;

	beforeEach(function() {
		application = new Application();
		({ _registry } = application);
	});

	it('creates and stores an app registry', function() {
		expect(_registry).to.be.an.instanceof(AppRegistry);
	});

	describe('#registerPremethod', function() {
		it('passes through to registry', function() {
			sinon.stub(_registry, 'registerPremethod');

			application.registerPremethod('foo', 'bar');

			expect(_registry.registerPremethod).to.be.calledOnce;
			expect(_registry.registerPremethod).to.be.calledOn(_registry);
			expect(_registry.registerPremethod).to.be.calledWith('foo', 'bar');
		});
	});

	describe('#registerPostmethod', function() {
		it('passes through to registry', function() {
			sinon.stub(_registry, 'registerPostmethod');

			application.registerPostmethod('foo', 'bar');

			expect(_registry.registerPostmethod).to.be.calledOnce;
			expect(_registry.registerPostmethod).to.be.calledOn(_registry);
			expect(_registry.registerPostmethod).to.be.calledWith('foo', 'bar');
		});
	});

	describe('registerMethod', function() {
		it('passes through to registry', function() {
			sinon.stub(_registry, 'registerMethod');

			application.registerMethod('foo', 'bar');

			expect(_registry.registerMethod).to.be.calledOnce;
			expect(_registry.registerMethod).to.be.calledOn(_registry);
			expect(_registry.registerMethod).to.be.calledWith('foo', 'bar');
		});
	});

	describe('#getCallback', function() {
		let result;

		beforeEach(function() {
			sinon.stub(_registry, 'finalize');

			result = application.getCallback();
		});

		it('finalizes registry', function() {
			expect(_registry.finalize).to.be.calledOnce;
			expect(_registry.finalize).to.be.calledOn(_registry);
		});

		it('returns a function', function() {
			expect(result).to.be.an.instanceof(Function);
		});

		describe('returned function', function() {
			const httpRequest = { http: 'request' };
			const httpResponse = { http: 'response' };
			let HttpHandler, handler;

			beforeEach(function() {
				handler = sinon.createStubInstance(
					httpHandlerModule.HttpHandler
				);
				HttpHandler = sinon.stub(httpHandlerModule, 'HttpHandler')
					.returns(handler);

				result(httpRequest, httpResponse);
			});

			it('creates an http handler', function() {
				expect(HttpHandler).to.be.calledOnce;
				expect(HttpHandler).to.be.calledWithNew;
				expect(HttpHandler).to.be.calledWith(
					_registry,
					httpRequest,
					httpResponse
				);
			});

			it('runs the http handler', function() {
				expect(handler.run).to.be.calledOnce;
				expect(handler.run).to.be.calledOn(handler);
			});
		});
	});
});
