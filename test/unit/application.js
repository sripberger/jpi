import { Application } from '../../lib/application';

describe('Application', function() {
	let application;

	beforeEach(function() {
		application = new Application();
	});

	it('creates an empty object for methods', function() {
		expect(application._methods).to.deep.equal({});
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
		it('handles a request');
	});
});
