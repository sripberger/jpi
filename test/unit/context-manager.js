import * as pasync from 'pasync';
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
			sinon.stub(pasync, 'eachSeries').resolves();
		});

		it('iterates middlewares in series with pasync', async function() {
			await manager.run();

			expect(pasync.eachSeries).to.be.calledOnce;
			expect(pasync.eachSeries).to.be.calledWith(
				sinon.match.same(manager.middlewares),
				sinon.match.func
			);
		});

		it('resolves with the context object', async function() {
			expect(await manager.run()).to.equal(context);
		});

		it('rejects if eachSeries rejects', function() {
			const eachError = new Error('Each error');
			pasync.eachSeries.rejects(eachError);

			return manager.run()
				.then(() => {
					throw new Error('Promise should have rejected');
				}, (err) => {
					expect(err).to.equal(eachError);
				});
		});

		describe('iteratee', function() {
			let iteratee, middleware;

			beforeEach(async function() {
				await manager.run();
				[ , iteratee ] = pasync.eachSeries.firstCall.args;
				middleware = sinon.stub().named('middleware');
			});

			it('invokes middleware with context', async function() {
				await iteratee(middleware);

				expect(middleware).to.be.calledOnce;
				expect(middleware).to.be.calledWith(
					sinon.match.same(manager.context)
				);
			});

			it('assigns result onto context', async function() {
				const result = { foo: 'bar' };
				middleware.returns(result);

				await manager._runMiddleware(middleware);

				expect(manager.context.result).to.equal(result);
			});

			it('supports falsy results', async function() {
				middleware.returns(false);

				await iteratee(middleware);

				expect(manager.context.result).to.be.false;
			});

			it('does not assign undefined result onto context', async function() {
				await iteratee(middleware);

				expect(manager.context).to.not.have.property('result');
			});

			it('handles async middleware with result', async function() {
				const result = { foo: 'bar' };
				middleware.resolves(result);

				await iteratee(middleware);

				expect(manager.context.result).to.equal(result);
			});

			it('handles async middleware with no result', async function() {
				middleware.resolves();

				await iteratee(middleware);

				expect(manager.context).to.not.have.property('result');
			});
		});
	});
});
