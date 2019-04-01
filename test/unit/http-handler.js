import * as errorUtils from '../../lib/error-utils';
import * as fromHttpModule from '../../lib/from-http';
import * as responseUtils from '../../lib/response-utils';
import { HttpHandler } from '../../lib/http-handler';
import { HttpStatusError } from '../../lib/http-status-error';
import { JpiError } from 'jpi-errors';
import { Request } from '../../lib/request';
import { ServerResponse } from 'http';

describe('HttpHandler', function() {
	const registry = { app: 'registry' };
	const httpRequest = { http: 'request' };
	let httpResponse, handler;

	beforeEach(function() {
		httpResponse = sinon.createStubInstance(ServerResponse);
		handler = new HttpHandler(registry, httpRequest, httpResponse);
	});

	it('stores provided registry', function() {
		expect(handler.registry).to.equal(registry);
	});

	it('stores provided http request', function() {
		expect(handler.httpRequest).to.equal(httpRequest);
	});

	it('stores provied http response', function() {
		expect(handler.httpResponse).to.equal(httpResponse);
	});

	describe('#run', function() {
		beforeEach(function() {
			sinon.stub(handler, '_run').resolves();
			sinon.stub(handler, '_handleLastDitchError');
		});

		it('runs the handler', async function() {
			await handler.run();

			expect(handler._run).to.be.calledOnce;
			expect(handler._run).to.be.calledOn(handler);
			expect(handler._handleLastDitchError).to.not.be.called;
		});

		it('handles run errors as last-ditch', async function() {
			const err = new Error('Run error');
			handler._run.rejects(err);

			await handler.run();

			expect(handler._handleLastDitchError).to.be.calledOnce;
			expect(handler._handleLastDitchError).to.be.calledOn(handler);
			expect(handler._handleLastDitchError).to.be.calledWith(err);
		});
	});

	describe('#_run', function() {
		beforeEach(function() {
			sinon.stub(handler, '_handleRequest').resolves();
			sinon.stub(handler, '_handleRequestError');
		});

		it('handles the request', async function() {
			await handler._run();

			expect(handler._handleRequest).to.be.calledOnce;
			expect(handler._handleRequest).to.be.calledOn(handler);
			expect(handler._handleRequestError).to.not.be.called;
		});

		it('handles request handler errors', async function() {
			const err = new Error('Request handler error');
			handler._handleRequest.rejects(err);

			await handler._run();

			expect(handler._handleRequestError).to.be.calledOnce;
			expect(handler._handleRequestError).to.be.calledOn(handler);
			expect(handler._handleRequestError).to.be.calledWith(err);
		});
	});

	describe('#_handleRequest', function() {
		const response = { response: 'object' };
		let request;

		beforeEach(function() {
			request = sinon.createStubInstance(Request);
			sinon.stub(fromHttpModule, 'fromHttp').resolves(request);
			request.getResponse.resolves(response);
			sinon.stub(handler, '_sendResponse');
		});

		it('gets the request from http', async function() {
			await handler._handleRequest();

			expect(fromHttpModule.fromHttp).to.be.calledOnce;
			expect(fromHttpModule.fromHttp).to.be.calledWith(httpRequest);
		});

		it('gets the response for the request', async function() {
			await handler._handleRequest();

			expect(request.getResponse).to.be.calledOnce;
			expect(request.getResponse).to.be.calledOn(request);
			expect(request.getResponse).to.be.calledWith(registry, httpRequest);
		});

		it('sends the response', async function() {
			await handler._handleRequest();

			expect(handler._sendResponse).to.be.calledOnce;
			expect(handler._sendResponse).to.be.calledOn(handler);
			expect(handler._sendResponse).to.be.calledWith(response);
		});
	});

	describe('#_handleRequestError', function() {
		beforeEach(function() {
			sinon.stub(handler, '_handleStatusError');
			sinon.stub(handler, '_sendErrorResponse');
			sinon.stub(handler, '_handleUnknownError');
		});

		it('handles http status errors', function() {
			const err = new HttpStatusError();

			handler._handleRequestError(err);

			expect(handler._handleStatusError).to.be.calledOnce;
			expect(handler._handleStatusError).to.be.calledOn(handler);
			expect(handler._handleStatusError).to.be.calledWith(err);
			expect(handler._sendErrorResponse).to.not.be.called;
			expect(handler._handleUnknownError).to.not.be.called;
		});

		it('handles other jpi errors', function() {
			const err = new JpiError();

			handler._handleRequestError(err);

			expect(handler._sendErrorResponse).to.be.calledOnce;
			expect(handler._sendErrorResponse).to.be.calledOn(handler);
			expect(handler._sendErrorResponse).to.be.calledWith(err);
			expect(handler._handleStatusError).to.not.be.called;
			expect(handler._handleUnknownError).to.not.be.called;
		});

		it('handles unknown errors', function() {
			const err = new Error('Unknown error');

			handler._handleRequestError(err);

			expect(handler._handleUnknownError).to.be.calledOnce;
			expect(handler._handleUnknownError).to.be.calledOn(handler);
			expect(handler._handleUnknownError).to.be.calledWith(err);
			expect(handler._handleStatusError).to.not.be.called;
			expect(handler._sendErrorResponse).to.not.be.called;
		});
	});

	describe('#_sendErrorResponse', function() {
		const err = new Error('Omg bad error!');
		const response = { error: 'response' };

		beforeEach(function() {
			sinon.stub(responseUtils, 'getErrorResponse').returns(response);
			sinon.stub(handler, '_sendResponse');

			handler._sendErrorResponse(err);
		});

		it('gets response for the provided error', function() {
			expect(responseUtils.getErrorResponse).to.be.calledOnce;
			expect(responseUtils.getErrorResponse).to.be.calledWith(err);
		});

		it('sends response for the provided error', function() {
			expect(handler._sendResponse).to.be.calledOnce;
			expect(handler._sendResponse).to.be.calledWith(response);
		});
	});

	describe('#_handleStatusError', function() {
		const message = 'some message';
		const statusCode = 42;
		const headers = { foo: 'bar' };
		const err = new HttpStatusError(
			message,
			{ info: { statusCode, headers } }
		);

		beforeEach(function() {
			sinon.stub(handler, '_prepareHttpResponse');

			handler._handleStatusError(err);
		});

		it('prepares http response with status and headers from error', function() {
			expect(handler._prepareHttpResponse).to.be.calledOnce;
			expect(handler._prepareHttpResponse).to.be.calledOn(handler);
			expect(handler._prepareHttpResponse).to.be.calledWith(
				statusCode,
				headers
			);
		});

		it('ends http response with error message after preparing', function() {
			expect(httpResponse.end).to.be.calledOnce;
			expect(httpResponse.end).to.be.calledOn(httpResponse);
			expect(httpResponse.end).to.be.calledWith(message);
			expect(httpResponse.end)
				.to.be.calledAfter(handler._prepareHttpResponse);
		});
	});

	describe('#_handleUnknownError', function() {
		const err = new Error('Omg bad error!');
		const wrapped = new Error('Wrapped error');

		beforeEach(function() {
			sinon.stub(errorUtils, 'wrapUnknownError').returns(wrapped);
			sinon.stub(handler, '_sendErrorResponse');

			handler._handleUnknownError(err);
		});

		it('wraps the provided unknown error', function() {
			expect(errorUtils.wrapUnknownError).to.be.calledOnce;
			expect(errorUtils.wrapUnknownError).to.be.calledWith(err);
		});

		it('sends response for wrapped error', function() {
			expect(handler._sendErrorResponse).to.be.calledOnce;
			expect(handler._sendErrorResponse).to.be.calledWith(wrapped);
		});
	});

	describe('#_handleLastDitchError', function() {
		const err = new Error('Last ditch error');

		beforeEach(function() {
			sinon.stub(handler, '_handleUnknownError');
		});

		it('handles error as an unknown error', function() {
			handler._handleLastDitchError(err);

			expect(handler._handleUnknownError).to.be.calledOnce;
			expect(handler._handleUnknownError).to.be.calledOn(handler);
			expect(handler._handleUnknownError).to.be.calledWith(err);
		});

		it('ignores any handling errors', function() {
			handler._handleUnknownError.throws(new Error('Holy crap.'));

			handler._handleLastDitchError(err);
		});
	});

	describe('#_sendResponse', function() {
		const response = { response: 'object' };
		const text = 'response text';

		beforeEach(function() {
			sinon.stub(responseUtils, 'serializeResponse').returns(text);
			sinon.stub(handler, '_sendResponseText');

			handler._sendResponse(response);
		});

		it('serializes the provided response', function() {
			expect(responseUtils.serializeResponse).to.be.calledOnce;
			expect(responseUtils.serializeResponse).to.be.calledWith(response);
		});

		it('sends the serialized response text', function() {
			expect(handler._sendResponseText).to.be.calledOnce;
			expect(handler._sendResponseText).to.be.calledOn(handler);
			expect(handler._sendResponseText).to.be.calledWith(text);
		});
	});

	describe('#_sendResponseText', function() {
		const text = 'response text';

		beforeEach(function() {
			sinon.stub(handler, '_prepareHttpResponse');

			handler._sendResponseText(text);
		});

		it('prepares http response with OK status and Content-Type header', function() {
			expect(handler._prepareHttpResponse).to.be.calledOnce;
			expect(handler._prepareHttpResponse).to.be.calledOn(handler);
			expect(handler._prepareHttpResponse).to.be.calledWith(
				200,
				{ 'Content-Type': 'application/json' }
			);
		});

		it('ends http response with provided text after preparing', function() {
			expect(httpResponse.end).to.be.calledOnce;
			expect(httpResponse.end).to.be.calledOn(httpResponse);
			expect(httpResponse.end).to.be.calledWith(text);
			expect(httpResponse.end)
				.to.be.calledAfter(handler._prepareHttpResponse);
		});
	});

	describe('#_prepareHttpResponse', function() {
		it('attaches a no-op error handler to http response', function() {
			handler._prepareHttpResponse();

			expect(httpResponse.on).to.be.calledOnce;
			expect(httpResponse.on).to.be.calledOn(httpResponse);
			expect(httpResponse.on).to.be.calledWith('error', sinon.match.func);
		});

		it('sets provided status code on http response', function() {
			handler._prepareHttpResponse(42);

			expect(httpResponse.statusCode).to.equal(42);
		});

		it('sets provided headers on http response', function() {
			handler._prepareHttpResponse(42, { foo: 'bar', baz: 'qux' });

			expect(httpResponse.setHeader).to.be.calledTwice;
			expect(httpResponse.setHeader).to.always.be.calledOn(httpResponse);
			expect(httpResponse.setHeader).to.be.calledWith('foo', 'bar');
			expect(httpResponse.setHeader).to.be.calledWith('baz', 'qux');
		});
	});
});
