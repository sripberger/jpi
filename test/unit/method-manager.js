import { MethodManager } from '../../lib/method-manager';
import { MethodNotFoundError } from 'jpi-errors';

describe('MethodManager', function() {
	let manager;

	beforeEach(function() {
		manager = new MethodManager();
	});

	it('creates an empty object for storing methods', function() {
		expect(manager._methods).to.deep.equal({});
	});

	describe('#register', function() {
		it('registers a method with options', function() {
			const middleware = () => {};

			manager.register({ method: 'foo', bar: 'baz' }, middleware);

			expect(manager._methods).to.deep.equal({
				foo: {
					options: { bar: 'baz' },
					middlewares: [ middleware ],
				},
			});
		});

		it('suports any number of middlewares', function() {
			const mw1 = () => {};
			const mw2 = () => {};

			manager.register({ method: 'foo', bar: 'baz' }, mw1, mw2);

			expect(manager._methods).to.deep.equal({
				foo: {
					options: { bar: 'baz' },
					middlewares: [ mw1, mw2 ],
				},
			});
		});

		it('supports shorthand for method with no options', function() {
			const middleware = () => {};

			manager.register('foo', middleware);

			expect(manager._methods).to.deep.equal({
				foo: {
					options: {},
					middlewares: [ middleware ],
				},
			});
		});

		it('throws if method is not provided', function() {
			const middleware = () => {};

			expect(() => {
				manager.register({}, middleware);
			}).to.throw('method must be a non-empty string');
		});

		it('throws if method is not a string', function() {
			const middleware = () => {};

			expect(() => {
				manager.register({ method: {} }, middleware);
			}).to.throw('method must be a non-empty string');
		});

		it('throws if method is an empty string', function() {
			const middleware = () => {};

			expect(() => {
				manager.register({ method: '' }, middleware);
			}).to.throw('method must be a non-empty string');
		});
	});

	describe('#getMethod', function() {
		beforeEach(function() {
			manager._methods.foo = {};
			manager._methods.bar = {};
		});

		it('returns entry for specified method', function() {
			expect(manager.getMethod('foo')).to.equal(manager._methods.foo);
			expect(manager.getMethod('bar')).to.equal(manager._methods.bar);
		});

		it('throws if specified method does not exist', function() {
			expect(() => {
				manager.getMethod('baz');
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
