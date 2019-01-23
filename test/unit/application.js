import Application from '../../lib/application';

describe('Application', function() {
	let application;

	beforeEach(function() {
		application = new Application();
	});

	it('creates an empty object for methods', function() {
		expect(application._methods).to.deep.equal({});
	});

	describe('#register', function() {
		it('registers a method with options', function() {
			const middleware = () => {};

			application.register({ method: 'foo', bar: 'baz' }, middleware);

			expect(application._methods).to.deep.equal({
				foo: {
					options: { bar: 'baz' },
					middlewares: [ middleware ],
				},
			});
		});

		it('suports any number of middlewares', function() {
			const mw1 = () => {};
			const mw2 = () => {};

			application.register({ method: 'foo', bar: 'baz' }, mw1, mw2);

			expect(application._methods).to.deep.equal({
				foo: {
					options: { bar: 'baz' },
					middlewares: [ mw1, mw2 ],
				},
			});
		});

		it('supports shorthand for method with no options', function() {
			const middleware = () => {};

			application.register('foo', middleware);

			expect(application._methods).to.deep.equal({
				foo: {
					options: {},
					middlewares: [ middleware ],
				},
			});
		});

		it('throws if method is not provided', function() {
			const middleware = () => {};

			expect(() => {
				application.register({}, middleware);
			}).to.throw('method must be a non-empty string');
		});

		it('throws if method is not a string', function() {
			const middleware = () => {};

			expect(() => {
				application.register({ method: {} }, middleware);
			}).to.throw('method must be a non-empty string');
		});

		it('throws if method is an empty string', function() {
			const middleware = () => {};

			expect(() => {
				application.register({ method: '' }, middleware);
			}).to.throw('method must be a non-empty string');
		});
	});

	describe('#getCallback', function() {
		let callback;

		beforeEach(function() {
			callback = application.getCallback();
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
		// TODO
	});
});
