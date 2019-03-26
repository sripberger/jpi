import { ContextManager } from '../../lib/context-manager';
import _ from 'lodash';

describe('ContextManager', function() {
	let context, middlewares, manager;

	beforeEach(function() {
		context = {};
		middlewares = {};
		manager = new ContextManager(context, middlewares);
	});

	it('stores the provided context object', function() {
		expect(manager.context).to.equal(context);
	});

	it('stores the provided middlewares object', function() {
		expect(manager.middlewares).to.equal(middlewares);
	});

	describe('#run', function() {
		it('runs all middlewares in the proper order', async function() {
			const names = [];
			const _runMiddlewaresWithName = sinon.stub(
				manager,
				'_runMiddlewaresWithName'
			).callsFake((name) => {
				let expectedNames;
				switch (name) {
					case 'premethod':
						expectedNames = [];
						break;
					case 'method':
						expectedNames = [ 'premethod' ];
						break;
					case 'postmethod':
						expectedNames = [ 'premethod', 'method' ];
						break;
					default:
						return;
				}
				return new Promise((resolve, reject) => {
					if (_.isEqual(names, expectedNames)) {
						setImmediate(() => {
							names.push(name);
							resolve();
						});
					} else {
						reject(new Error('Middlewares run out of sequence'));
					}
				});
			});

			await manager.run();

			expect(_runMiddlewaresWithName).to.be.calledThrice;
			expect(names).to.deep.equal([
				'premethod',
				'method',
				'postmethod',
			]);
		});
	});

	describe('#_runMiddlewaresWithName', function() {
		beforeEach(function() {
			middlewares.foo = [ () => {}, () => {} ];
			sinon.stub(manager, '_runMiddlewares').resolves();
		});

		it('runs the middlewares with the provided name', async function() {
			await manager._runMiddlewaresWithName('foo');

			expect(manager._runMiddlewares).to.be.calledOnce;
			expect(manager._runMiddlewares).to.be.calledOn(manager);
			expect(manager._runMiddlewares).to.be.calledWith(middlewares.foo);
		});

		it('rejects if middlewares reject', function() {
			const middlwareError = new Error('Middlware error');
			manager._runMiddlewares.rejects(middlwareError);

			return manager._runMiddlewaresWithName('foo')
				.then(() => {
					throw new Error('Promise should have rejected');
				}, (err) => {
					expect(err).to.equal(middlwareError);
				});
		});
	});

	describe('#_runMiddlewares', function() {
		const mw1 = () => {};
		const mw2 = () => {};
		const mws = [ mw1, mw2 ];
		let _runSingleMiddleware;

		beforeEach(function() {
			_runSingleMiddleware = sinon.stub(manager, '_runSingleMiddleware');
		});

		it('runs provided middlewares in series', async function() {
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

			await manager._runMiddlewares(mws);

			expect(_runSingleMiddleware).to.be.calledTwice;
			expect(_runSingleMiddleware).to.always.be.calledOn(manager);
			expect(_runSingleMiddleware.firstCall).to.be.calledWith(mw1);
			expect(_runSingleMiddleware.secondCall).to.be.calledWith(mw2);
			expect(mw1.done).to.be.true;
			expect(mw2.done).to.be.true;
		});

		it('does nothing if error is already set', async function() {
			manager.context.error = new Error('wow an error');
			_runSingleMiddleware.resolves();

			await manager._runMiddlewares(mws);

			expect(_runSingleMiddleware).to.not.be.called;
		});

		it('stops if error is set by a middleware', async function() {
			_runSingleMiddleware
				.onFirstCall().callsFake(function() {
					manager.context.error = new Error('Omg bad error!');
					return Promise.resolve();
				})
				.onSecondCall().resolves();

			await manager._runMiddlewares(mws);

			expect(_runSingleMiddleware).to.be.calledOnce;
			expect(_runSingleMiddleware).to.be.calledOn(manager);
			expect(_runSingleMiddleware).to.be.calledWith(mw1);
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

		it('assigns error onto context if middleware throws', async function() {
			const error = new Error('Bad error omg');
			middleware.throws(error);

			await manager._runSingleMiddleware(middleware);

			expect(manager.context.error).to.equal(error);
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

		it('handles failed asynchronous middleware', async function() {
			const error = new Error('Bad error omg');
			middleware.rejects(error);

			await manager._runSingleMiddleware(middleware);

			expect(manager.context.error).to.equal(error);
		});

		it('assigns default error if middleware rejects with nothing', async function() {
			// eslint-disable-next-line prefer-promise-reject-errors
			middleware.returns(Promise.reject());

			await manager._runSingleMiddleware(middleware);

			expect(manager.context.error).to.be.an.instanceof(Error);
			expect(manager.context.error.message).to.equal(
				'Unknown error in request middleware.'
			);
		});
	});
});
