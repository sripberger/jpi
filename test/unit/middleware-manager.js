import { MiddlewareManager } from '../../lib/middleware-manager';
import { Problem } from 'topo-strict';
import _ from 'lodash';

describe('MiddlewareManager', function() {
	let manager;

	beforeEach(function() {
		manager = new MiddlewareManager();
	});

	it('creates a topo-strict Problem for ordering ids', function() {
		expect(manager.problem).to.be.an.instanceof(Problem);
	});

	it('creates an object for storing middlewares by id', function() {
		expect(manager.middlewaresById).to.deep.equal({});
	});

	describe('#register', function() {
		const id = 'some id';
		const middleware = () => {};
		let problem, options;

		beforeEach(function() {
			({ problem } = manager);
			options = {
				id,
				middleware,
				before: 'foo',
				after: 'bar',
				group: 'baz',
			};
			sinon.stub(MiddlewareManager, '_normalizeRegisterArgs')
				.returns(options);
			sinon.stub(problem, 'add');
		});

		it('normalizes arguments', function() {
			manager.register('wow', 'omg');

			expect(MiddlewareManager._normalizeRegisterArgs).to.be.calledOnce;
			expect(MiddlewareManager._normalizeRegisterArgs)
				.to.be.calledOn(MiddlewareManager);
			expect(MiddlewareManager._normalizeRegisterArgs).to.be
				.calledWith([ 'wow', 'omg' ]);
		});

		it('adds id to the problem, with before, after, and group options', function() {
			const { before, after, group } = options;

			manager.register();

			expect(problem.add).to.be.calledOnce;
			expect(problem.add).to.be.calledOn(problem);
			expect(problem.add).to.be.calledWith(id, { before, after, group });
		});

		it('omits any extra optiosn properties from add options', function() {
			const { before, after, group } = options;
			options.whatever = 'should be ignored';

			manager.register();

			expect(problem.add).to.be.calledWith(id, { before, after, group });
		});

		it('adds the middleware to middlewares by id', function() {
			manager.register();

			expect(manager.middlewaresById[id]).to.equal(middleware);
		});

		it('does not change middlewares by id if Problem#add throws', function() {
			problem.add.throws(new Error('bad error wow'));

			expect(() => manager.register()).to.throw();
			expect(manager.middlewaresById).to.be.empty;
		});
	});

	describe('#getMiddlewares', function() {
		const fooMiddleware = () => {};
		const barMiddleware = () => {};
		let problem, result;

		beforeEach(function() {
			({ problem } = manager);
			manager.middlewaresById = {
				foo: fooMiddleware,
				bar: barMiddleware,
			};
			sinon.stub(problem, 'solve').returns([ 'foo', 'bar' ]);

			result = manager.getMiddlewares();
		});

		it('solves the problem', function() {
			expect(problem.solve).to.be.calledOnce;
			expect(problem.solve).to.be.calledOn(manager.problem);
		});

		it('returns solve result mapped to middlewares', function() {
			expect(result).to.deep.equal([ fooMiddleware, barMiddleware ]);
		});
	});

	describe('::_normalizeRegisterArgs', function() {
		const id = 'some id';
		const middleware = () => {};
		const args = [ 'arg1', 'arg2' ];
		let options, unchanged, identified;

		beforeEach(function() {
			options = { foo: 'bar' };
			unchanged = _.clone(options);
			identified = { id, options, middleware };

			sinon.stub(MiddlewareManager, '_identifyRegisterArgs')
				.returns(identified);
		});

		it('identifies provided args array', function() {
			MiddlewareManager._normalizeRegisterArgs(args);

			expect(MiddlewareManager._identifyRegisterArgs).to.be.calledOnce;
			expect(MiddlewareManager._identifyRegisterArgs)
				.to.be.calledOn(MiddlewareManager);
			expect(MiddlewareManager._identifyRegisterArgs)
				.to.be.calledWith(args);
		});

		it('returns a copy of options with id and middleware added', function() {
			const result = MiddlewareManager._normalizeRegisterArgs(args);

			expect(result).to.deep.equal({ foo: 'bar', id, middleware });
			expect(options).to.deep.equal(unchanged);
		});

		it('prioritizes options value for id and middleware, if any', function() {
			options.id = 'options id';
			options.middleware = () => {};

			const result = MiddlewareManager._normalizeRegisterArgs(args);

			expect(result).to.deep.equal({
				foo: 'bar',
				id: options.id,
				middleware: options.middleware,
			});
		});
	});

	describe('::_identifyRegisterArgs', function() {
		const id = 'some id';
		const options = { foo: 'bar' };
		const middleware = () => {};

		it('returns categorized arguments as an object', function() {
			const result = MiddlewareManager._identifyRegisterArgs([
				id,
				options,
				middleware,
			]);

			expect(result).to.deep.equal({ id, options, middleware });
		});

		it('supports omitted id', function() {
			const result = MiddlewareManager._identifyRegisterArgs([
				options,
				middleware,
			]);

			expect(result).to.deep.equal({ id: null, options, middleware });
		});

		it('supports omitted options', function() {
			const result = MiddlewareManager._identifyRegisterArgs([
				id,
				middleware,
			]);

			expect(result).to.deep.equal({ id, options: {}, middleware });
		});

		it('supports omitted middleware', function() {
			const result = MiddlewareManager._identifyRegisterArgs([
				id,
				options,
			]);

			expect(result).to.deep.equal({ id, options, middleware: null });
		});

		it('supports id only', function() {
			const result = MiddlewareManager._identifyRegisterArgs([ id ]);

			expect(result).to.deep.equal({ id, options: {}, middleware: null });
		});

		it('supports options only', function() {
			const result = MiddlewareManager._identifyRegisterArgs([ options ]);

			expect(result).to.deep.equal({
				id: null,
				options,
				middleware: null,
			});
		});

		it('supports middleware only', function() {
			const result = MiddlewareManager._identifyRegisterArgs([
				middleware,
			]);

			expect(result).to.deep.equal({ id: null, options: {}, middleware });
		});

		it('supports empty arguments array', function() {
			const result = MiddlewareManager._identifyRegisterArgs([]);

			expect(result).to.deep.equal({
				id: null,
				options: {},
				middleware: null,
			});
		});
	});
});
