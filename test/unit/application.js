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
		const bound = () => {};
		let _handle, result;

		beforeEach(function() {
			({ _handle } = application);
			sinon.stub(_registry, 'finalize');
			sinon.stub(_handle, 'bind').returns(bound);

			result = application.getCallback();
		});

		it('finalizes registry', function() {
			expect(_registry.finalize).to.be.calledOnce;
			expect(_registry.finalize).to.be.calledOn(_registry);
		});

		it('binds #_handle method to instance', function() {
			expect(_handle.bind).to.be.calledOnce;
			expect(_handle.bind).to.be.calledOn(_handle);
			expect(_handle.bind).to.be.calledWithExactly(application);
		});

		it('returns bound #_handle method', function() {
			expect(result).to.equal(bound);
		});
	});

	describe('#_handle', function() {
		it('handles the http request and response');
	});
});
