import { Application } from '../../lib/application';
import { MiddlewareManager } from '../../lib/middleware-manager';

describe('Application', function() {
	let application, _manager;

	beforeEach(function() {
		application = new Application();
		({ _manager } = application);
	});

	it('creates and stores a middleware manager', function() {
		expect(_manager).to.be.an.instanceof(MiddlewareManager);
	});

	describe('#registerPremethod', function() {
		it('passes through to middleware manager', function() {
			sinon.stub(_manager, 'registerPremethod');

			application.registerPremethod('foo', 'bar');

			expect(_manager.registerPremethod).to.be.calledOnce;
			expect(_manager.registerPremethod).to.be.calledOn(_manager);
			expect(_manager.registerPremethod).to.be.calledWith('foo', 'bar');
		});
	});

	describe('#registerPostmethod', function() {
		it('passes through to middleware manager', function() {
			sinon.stub(_manager, 'registerPostmethod');

			application.registerPostmethod('foo', 'bar');

			expect(_manager.registerPostmethod).to.be.calledOnce;
			expect(_manager.registerPostmethod).to.be.calledOn(_manager);
			expect(_manager.registerPostmethod).to.be.calledWith('foo', 'bar');
		});
	});

	describe('registerMethod', function() {
		it('passes through to middleware manager', function() {
			sinon.stub(_manager, 'registerMethod');

			application.registerMethod('foo', 'bar');

			expect(_manager.registerMethod).to.be.calledOnce;
			expect(_manager.registerMethod).to.be.calledOn(_manager);
			expect(_manager.registerMethod).to.be.calledWith('foo', 'bar');
		});
	});

	describe('#getCallback', function() {
		const bound = () => {};
		let _handle, result;

		beforeEach(function() {
			({ _handle } = application);
			sinon.stub(_manager, 'finalize');
			sinon.stub(_handle, 'bind').returns(bound);

			result = application.getCallback();
		});

		it('finalizes middleware manager', function() {
			expect(_manager.finalize).to.be.calledOnce;
			expect(_manager.finalize).to.be.calledOn(_manager);
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
