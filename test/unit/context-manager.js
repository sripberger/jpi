import { ContextManager } from '../../lib/context-manager';

describe('ContextManager', function() {
	let context, middlewares, manager;

	beforeEach(function() {
		context = {};
		middlewares = [];
		manager = new ContextManager(context, middlewares);
	});

	it('stores the provided context object', function() {
		expect(manager.context).to.equal(context);
	});

	it('stores the provided middlewares array', function() {
		expect(manager.middlewares).to.equal(middlewares);
	});

	describe('#run', function() {
		beforeEach(function() {
			sinon.stub(manager, '_runMiddlewares').resolves();
		});

		it('runs middlewares', async function() {
			await manager.run();

			expect(manager._runMiddlewares).to.be.calledOnce;
			expect(manager._runMiddlewares).to.be.calledOn(manager);
		});

		it('resolves with the context object', async function() {
			expect(await manager.run()).to.equal(context);
		});

		it('rejects if middleware run rejects', function() {
			const middlewareErr = new Error('Middleware error');
			manager._runMiddlewares.rejects(middlewareErr);

			return manager.run()
				.then(() => {
					throw new Error('Promise should have rejected');
				}, (err) => {
					expect(err).to.equal(middlewareErr);
				});
		});
	});

	describe('#_runMiddlewares', function() {
		it('runs middlewares in series', async function() {
			const mw1 = () => {};
			const mw2 = () => {};
			const _runSingleMiddleware = sinon.stub(
				manager,
				'_runSingleMiddleware'
			);
			manager.middlewares.push(mw1, mw2);

			_runSingleMiddleware
				.onFirstCall().callsFake(function() {
					return new Promise((resolve) => {
						setImmediate(() => {
							mw1.done = true;
							resolve();
						});
					});
				})
				.onSecondCall().callsFake(function() {
					if (!mw1.done) {
						throw new Error('Must execute middlewares in series');
					}
					return new Promise((resolve) => {
						setImmediate(() => {
							mw2.done = true;
							resolve();
						});
					});
				});

			await manager._runMiddlewares();

			expect(_runSingleMiddleware).to.be.calledTwice;
			expect(_runSingleMiddleware).to.always.be.calledOn(manager);
			expect(_runSingleMiddleware.firstCall).to.be.calledWith(mw1);
			expect(_runSingleMiddleware.secondCall).to.be.calledWith(mw2);
			expect(mw1.done).to.be.true;
			expect(mw2.done).to.be.true;
		});
	});

	describe('#_runSingleMiddleware', function() {
		let middleware;

		beforeEach(function() {
			middleware = sinon.stub().named('middleware');
		});

		it('invokes middleware with context object', async function() {
			await manager._runSingleMiddleware(middleware);

			expect(middleware).to.be.calledOnce;
			expect(middleware).to.be.calledWith(
				sinon.match.same(manager.context)
			);
		});

		it('assigns middleware result onto context', async function() {
			const result = { foo: 'bar' };
			middleware.returns(result);

			await manager._runSingleMiddleware(middleware);

			expect(manager.context.result).to.equal(result);
		});

		it('supports falsy middleware results', async function() {
			middleware.returns(false);

			await manager._runSingleMiddleware(middleware);

			expect(manager.context.result).to.be.false;
		});

		it('does not assign undefined middleware result onto context', async function() {
			await manager._runSingleMiddleware(middleware);

			expect(manager.context).to.not.have.property('result');
		});

		it('handles successful asynchronous middleware with result', async function() {
			const result = { foo: 'bar' };
			middleware.resolves(result);

			await manager._runSingleMiddleware(middleware);

			expect(manager.context.result).to.equal(result);
		});

		it('handles successful asynchronous middleware with no result', async function() {
			middleware.resolves();

			await manager._runSingleMiddleware(middleware);

			expect(manager.context).to.not.have.property('result');
		});
	});
});
