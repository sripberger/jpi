import { FinalizedError } from '../../lib/finalized-error';
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

	it('creates a null property for storing the finalized id order', function() {
		expect(manager.ids).to.be.null;
	});

	it('creates an object for storing middlewares by id', function() {
		expect(manager._middlewaresById).to.deep.equal({});
	});

	describe('@middlewares', function() {
		it('returns ids mapped to middlewares', function() {
			const fooMiddleware = () => {};
			const barMiddleware = () => {};
			manager.ids = [ 'foo', 'bar' ];
			manager._middlewaresById = {
				foo: fooMiddleware,
				bar: barMiddleware,
				baz: () => {},
			};

			expect(manager.middlewares).to.deep.equal([
				fooMiddleware,
				barMiddleware,
			]);
		});

		it('returns null if ids is null', function() {
			expect(manager.middlewares).to.be.null;
		});
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

		it('omits any extra options properties from add options', function() {
			const { before, after, group } = options;
			options.whatever = 'should be ignored';

			manager.register();

			expect(problem.add).to.be.calledWith(id, { before, after, group });
		});

		it('adds the middleware to middlewares by id', function() {
			manager.register();

			expect(manager._middlewaresById[id]).to.equal(middleware);
		});

		it('does not change middlewares by id if Problem#add throws', function() {
			problem.add.throws(new Error('bad error wow'));

			expect(() => manager.register()).to.throw();
			expect(manager._middlewaresById).to.be.empty;
		});

		it('throws if ids is not null', function() {
			manager.ids = [ 'yay', 'woo' ];

			expect(() => {
				manager.register();
			}).to.throw(FinalizedError).that.satisfies((err) => {
				const defaultMessage = FinalizedError.getDefaultMessage();
				expect(err.message).to.equal(defaultMessage);
				return true;
			});
			expect(problem.add).to.not.be.called;
			expect(manager._middlewaresById).to.be.empty;
		});
	});

	describe('#finalize', function() {
		let problem, solution;

		beforeEach(function() {
			({ problem } = manager);
			solution = [ 'foo', 'bar' ];
			sinon.stub(problem, 'solve').returns(solution);
		});

		it('solves the problem', function() {
			manager.finalize();

			expect(problem.solve).to.be.calledOnce;
			expect(problem.solve).to.be.calledOn(manager.problem);
		});

		it('sets the ids property to the problem solution', function() {
			manager.finalize();

			expect(manager.ids).to.equal(solution);
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
