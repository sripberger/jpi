import { MethodManager } from '../../lib/method-manager';

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
});
