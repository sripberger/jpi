import { MiddlewareManager } from '../../lib/middleware-manager';
import { MiddlewareSort } from '../../lib/middleware-sort';

describe('MiddlewareManager', function() {
	let manager, _premethod, _postmethod;

	beforeEach(function() {
		manager = new MiddlewareManager();
		({ _premethod, _postmethod } = manager);
	});

	it('creates a sort for pre-method middlewares', function() {
		expect(_premethod).to.be.an.instanceof(MiddlewareSort);
	});

	it('creates a sort for post-method middlewares', function() {
		expect(_postmethod).to.be.an.instanceof(MiddlewareSort);
	});

	describe('@premethod', function() {
		it('returns middlewares from _premethod', function() {
			const middlewares = [ () => {}, () => {} ];
			sinon.stub(_premethod, 'middlewares').get(() => middlewares);

			expect(manager.premethod).to.equal(middlewares);
		});
	});

	describe('@postmethod', function() {
		it('returns middlewares from _postmethod', function() {
			const middlewares = [ () => {}, () => {} ];
			sinon.stub(_postmethod, 'middlewares').get(() => middlewares);

			expect(manager.postmethod).to.equal(middlewares);
		});
	});

	describe('#registerPremethod', function() {
		it('passes through to _premethod.register', function() {
			sinon.stub(_premethod, 'register');

			manager.registerPremethod('foo', 'bar');

			expect(_premethod.register).to.be.calledOnce;
			expect(_premethod.register).to.be.calledOn(_premethod);
			expect(_premethod.register).to.be.calledWith('foo', 'bar');
		});
	});

	describe('#registerPostmethod', function() {
		it('passes through to _postMethod.register', function() {
			sinon.stub(_postmethod, 'register');

			manager.registerPostmethod('foo', 'bar');

			expect(_postmethod.register).to.be.calledOnce;
			expect(_postmethod.register).to.be.calledOn(_postmethod);
			expect(_postmethod.register).to.be.calledWith('foo', 'bar');
		});
	});

	describe('#finalize', function() {
		it('finalizes both middleware sorts', function() {
			sinon.stub(_premethod, 'finalize');
			sinon.stub(_postmethod, 'finalize');

			manager.finalize();

			expect(_premethod.finalize).to.be.calledOnce;
			expect(_premethod.finalize).to.be.calledOn(_premethod);
			expect(_postmethod.finalize).to.be.calledOnce;
			expect(_postmethod.finalize).to.be.calledOn(_postmethod);
		});
	});
});
