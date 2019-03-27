import { MethodNotFoundError } from 'jpi-errors';
import { MethodRegistry } from '../../lib/method-registry';

describe('MethodRegistry', function() {
	let registry;

	beforeEach(function() {
		registry = new MethodRegistry();
	});

	it('creates an empty object for storing methods', function() {
		expect(registry._methods).to.deep.equal({});
	});

	describe('#register', function() {
		it('registers a method with options', function() {
			const middleware = () => {};

			registry.register({ method: 'foo', bar: 'baz' }, middleware);

			expect(registry._methods).to.deep.equal({
				foo: {
					options: { bar: 'baz' },
					middlewares: [ middleware ],
				},
			});
		});

		it('suports any number of middlewares', function() {
			const mw1 = () => {};
			const mw2 = () => {};

			registry.register({ method: 'foo', bar: 'baz' }, mw1, mw2);

			expect(registry._methods).to.deep.equal({
				foo: {
					options: { bar: 'baz' },
					middlewares: [ mw1, mw2 ],
				},
			});
		});

		it('supports shorthand for method with no options', function() {
			const middleware = () => {};

			registry.register('foo', middleware);

			expect(registry._methods).to.deep.equal({
				foo: {
					options: {},
					middlewares: [ middleware ],
				},
			});
		});

		it('throws if method is not provided', function() {
			const middleware = () => {};

			expect(() => {
				registry.register({}, middleware);
			}).to.throw('method must be a non-empty string');
		});

		it('throws if method is not a string', function() {
			const middleware = () => {};

			expect(() => {
				registry.register({ method: {} }, middleware);
			}).to.throw('method must be a non-empty string');
		});

		it('throws if method is an empty string', function() {
			const middleware = () => {};

			expect(() => {
				registry.register({ method: '' }, middleware);
			}).to.throw('method must be a non-empty string');
		});
	});

	describe('#getMethod', function() {
		beforeEach(function() {
			registry._methods.foo = {};
			registry._methods.bar = {};
		});

		it('returns entry for specified method', function() {
			expect(registry.getMethod('foo')).to.equal(registry._methods.foo);
			expect(registry.getMethod('bar')).to.equal(registry._methods.bar);
		});

		it('throws if specified method does not exist', function() {
			expect(() => {
				registry.getMethod('baz');
			}).to.throw(MethodNotFoundError).that.satisfies((err) => {
				const info = { method: 'baz' };
				const message = MethodNotFoundError.getDefaultMessage(info);
				expect(err.message).to.equal(message);
				expect(err.info).to.deep.equal(info);
				return true;
			});
		});
	});
});
