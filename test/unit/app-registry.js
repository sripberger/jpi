import { AppRegistry } from '../../lib/app-registry';
import { MethodRegistry } from '../../lib/method-registry';
import { TopoRegistry } from '../../lib/topo-registry';

describe('AppRegistry', function() {
	let registry, _premethod, _postmethod, _methods;

	beforeEach(function() {
		registry = new AppRegistry();
		({ _premethod, _postmethod, _methods } = registry);
	});

	it('creates a registry for pre-method middlewares', function() {
		expect(_premethod).to.be.an.instanceof(TopoRegistry);
	});

	it('creates a registry for post-method middlewares', function() {
		expect(_postmethod).to.be.an.instanceof(TopoRegistry);
	});

	it('creates a registry for methods', function() {
		expect(_methods).to.be.an.instanceof(MethodRegistry);
	});

	describe('#registerPremethod', function() {
		it('passes through to _premethod#register', function() {
			sinon.stub(_premethod, 'register');

			registry.registerPremethod('foo', 'bar');

			expect(_premethod.register).to.be.calledOnce;
			expect(_premethod.register).to.be.calledOn(_premethod);
			expect(_premethod.register).to.be.calledWith('foo', 'bar');
		});
	});

	describe('#registerPostmethod', function() {
		it('passes through to _postMethod#register', function() {
			sinon.stub(_postmethod, 'register');

			registry.registerPostmethod('foo', 'bar');

			expect(_postmethod.register).to.be.calledOnce;
			expect(_postmethod.register).to.be.calledOn(_postmethod);
			expect(_postmethod.register).to.be.calledWith('foo', 'bar');
		});
	});

	describe('#registerMethod', function() {
		it('passes through to _methods#register', function() {
			sinon.stub(_methods, 'register');

			registry.registerMethod('foo', 'bar');

			expect(_methods.register).to.be.calledOnce;
			expect(_methods.register).to.be.calledOn(_methods);
			expect(_methods.register).to.be.calledWith('foo', 'bar');
		});
	});

	describe('#finalize', function() {
		it('finalizes both middleware sorts', function() {
			sinon.stub(_premethod, 'finalize');
			sinon.stub(_postmethod, 'finalize');

			registry.finalize();

			expect(_premethod.finalize).to.be.calledOnce;
			expect(_premethod.finalize).to.be.calledOn(_premethod);
			expect(_postmethod.finalize).to.be.calledOnce;
			expect(_postmethod.finalize).to.be.calledOn(_postmethod);
		});
	});

	describe('#getMethod', function() {
		it('returns options and middlewares for the provided method', function() {
			const premethodMiddlewares = [ () => {}, () => {} ];
			const postmethodMiddlewares = [ () => {}, () => {} ];
			const method = 'some method';
			const options = { foo: 'bar' };
			const methodMiddlewares = [ () => {}, () => {} ];
			sinon.stub(_premethod, 'middlewares')
				.get(() => premethodMiddlewares);
			sinon.stub(_postmethod, 'middlewares')
				.get(() => postmethodMiddlewares);
			sinon.stub(_methods, 'getMethod').returns({
				options,
				middlewares: methodMiddlewares,
			});

			const result = registry.getMethod(method);

			expect(_methods.getMethod).to.be.calledOnce;
			expect(_methods.getMethod).to.be.calledOn(_methods);
			expect(_methods.getMethod).to.be.calledWith(method);
			expect(result).to.deep.equal({
				options,
				middlewares: {
					premethod: premethodMiddlewares,
					postmethod: postmethodMiddlewares,
					method: methodMiddlewares,
				},
			});
		});
	});
});
