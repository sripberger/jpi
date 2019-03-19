import { FinalizedError } from '../../lib/finalized-error';
import { MiddlewareSort } from '../../lib/middleware-sort';
import { Problem } from 'topo-strict';
import _ from 'lodash';

describe('MiddlewareSort', function() {
	let sort;

	beforeEach(function() {
		sort = new MiddlewareSort();
	});

	it('creates a topo-strict Problem for ordering ids', function() {
		expect(sort.problem).to.be.an.instanceof(Problem);
	});

	it('creates a null property for storing the finalized id order', function() {
		expect(sort.ids).to.be.null;
	});

	it('creates an object for storing middlewares by id', function() {
		expect(sort._middlewaresById).to.deep.equal({});
	});

	describe('@middlewares', function() {
		it('returns ids mapped to middlewares', function() {
			const fooMiddleware = () => {};
			const barMiddleware = () => {};
			sort.ids = [ 'foo', 'bar' ];
			sort._middlewaresById = {
				foo: fooMiddleware,
				bar: barMiddleware,
				baz: () => {},
			};

			expect(sort.middlewares).to.deep.equal([
				fooMiddleware,
				barMiddleware,
			]);
		});

		it('returns null if ids is null', function() {
			expect(sort.middlewares).to.be.null;
		});
	});

	describe('#register', function() {
		const id = 'some id';
		const middleware = () => {};
		let problem, options;

		beforeEach(function() {
			({ problem } = sort);
			options = {
				id,
				middleware,
				before: 'foo',
				after: 'bar',
				group: 'baz',
			};
			sinon.stub(MiddlewareSort, '_normalizeRegisterArgs')
				.returns(options);
			sinon.stub(problem, 'add');
		});

		it('normalizes arguments', function() {
			sort.register('wow', 'omg');

			expect(MiddlewareSort._normalizeRegisterArgs).to.be.calledOnce;
			expect(MiddlewareSort._normalizeRegisterArgs)
				.to.be.calledOn(MiddlewareSort);
			expect(MiddlewareSort._normalizeRegisterArgs).to.be
				.calledWith([ 'wow', 'omg' ]);
		});

		it('adds id to the problem, with before, after, and group options', function() {
			const { before, after, group } = options;

			sort.register();

			expect(problem.add).to.be.calledOnce;
			expect(problem.add).to.be.calledOn(problem);
			expect(problem.add).to.be.calledWith(id, { before, after, group });
		});

		it('omits any extra options properties from add options', function() {
			const { before, after, group } = options;
			options.whatever = 'should be ignored';

			sort.register();

			expect(problem.add).to.be.calledWith(id, { before, after, group });
		});

		it('adds the middleware to middlewares by id', function() {
			sort.register();

			expect(sort._middlewaresById[id]).to.equal(middleware);
		});

		it('does not change middlewares by id if Problem#add throws', function() {
			problem.add.throws(new Error('bad error wow'));

			expect(() => sort.register()).to.throw();
			expect(sort._middlewaresById).to.be.empty;
		});

		it('throws if ids is not null', function() {
			sort.ids = [ 'yay', 'woo' ];

			expect(() => {
				sort.register();
			}).to.throw(FinalizedError).that.satisfies((err) => {
				const defaultMessage = FinalizedError.getDefaultMessage();
				expect(err.message).to.equal(defaultMessage);
				return true;
			});
			expect(problem.add).to.not.be.called;
			expect(sort._middlewaresById).to.be.empty;
		});
	});

	describe('#finalize', function() {
		let problem, solution;

		beforeEach(function() {
			({ problem } = sort);
			solution = [ 'foo', 'bar' ];
			sinon.stub(problem, 'solve').returns(solution);
		});

		it('solves the problem', function() {
			sort.finalize();

			expect(problem.solve).to.be.calledOnce;
			expect(problem.solve).to.be.calledOn(sort.problem);
		});

		it('sets the ids property to the problem solution', function() {
			sort.finalize();

			expect(sort.ids).to.equal(solution);
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

			sinon.stub(MiddlewareSort, '_identifyRegisterArgs')
				.returns(identified);
		});

		it('identifies provided args array', function() {
			MiddlewareSort._normalizeRegisterArgs(args);

			expect(MiddlewareSort._identifyRegisterArgs).to.be.calledOnce;
			expect(MiddlewareSort._identifyRegisterArgs)
				.to.be.calledOn(MiddlewareSort);
			expect(MiddlewareSort._identifyRegisterArgs)
				.to.be.calledWith(args);
		});

		it('returns a copy of options with id and middleware added', function() {
			const result = MiddlewareSort._normalizeRegisterArgs(args);

			expect(result).to.deep.equal({ foo: 'bar', id, middleware });
			expect(options).to.deep.equal(unchanged);
		});

		it('prioritizes options value for id and middleware, if any', function() {
			options.id = 'options id';
			options.middleware = () => {};

			const result = MiddlewareSort._normalizeRegisterArgs(args);

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
			const result = MiddlewareSort._identifyRegisterArgs([
				id,
				options,
				middleware,
			]);

			expect(result).to.deep.equal({ id, options, middleware });
		});

		it('supports omitted id', function() {
			const result = MiddlewareSort._identifyRegisterArgs([
				options,
				middleware,
			]);

			expect(result).to.deep.equal({ id: null, options, middleware });
		});

		it('supports omitted options', function() {
			const result = MiddlewareSort._identifyRegisterArgs([
				id,
				middleware,
			]);

			expect(result).to.deep.equal({ id, options: {}, middleware });
		});

		it('supports omitted middleware', function() {
			const result = MiddlewareSort._identifyRegisterArgs([
				id,
				options,
			]);

			expect(result).to.deep.equal({ id, options, middleware: null });
		});

		it('supports id only', function() {
			const result = MiddlewareSort._identifyRegisterArgs([ id ]);

			expect(result).to.deep.equal({ id, options: {}, middleware: null });
		});

		it('supports options only', function() {
			const result = MiddlewareSort._identifyRegisterArgs([ options ]);

			expect(result).to.deep.equal({
				id: null,
				options,
				middleware: null,
			});
		});

		it('supports middleware only', function() {
			const result = MiddlewareSort._identifyRegisterArgs([
				middleware,
			]);

			expect(result).to.deep.equal({ id: null, options: {}, middleware });
		});

		it('supports empty arguments array', function() {
			const result = MiddlewareSort._identifyRegisterArgs([]);

			expect(result).to.deep.equal({
				id: null,
				options: {},
				middleware: null,
			});
		});
	});
});
