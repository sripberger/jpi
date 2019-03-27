import * as nani from 'nani';
import { InvalidRequestError } from 'jpi-errors';
import { Request } from '../../lib/request';
import { RequestHandler } from '../../lib/request-handler';
import { ValidationError } from '../../lib/validation-error';

describe('Request', function() {
	it('copies standard JSON-RPC properties from the provided object', function() {
		const jsonrpc = '2.0';
		const method = 'some method';
		const params = { some: 'params' };
		const id = 'some id';
		const obj = {
			jsonrpc,
			method,
			params,
			id,
			foo: 'bar',
		};

		const request = new Request(obj);

		expect(request).to.deep.equal({ jsonrpc, method, params, id });
	});

	it('defaults to no properties', function() {
		const request = new Request();

		expect(request).to.deep.equal({});
	});

	it('supports undefined as a property', function() {
		const request = new Request({ method: undefined });

		expect(request).to.deep.equal({ method: undefined });
	});

	describe('#validate', function() {
		const errors = [ new Error('foo'), new Error('bar') ];
		let request;

		beforeEach(function() {
			request = new Request();
			sinon.stub(request, '_getValidationErrors').returns(errors);
			sinon.stub(nani, 'fromArray').returns(null);
		});

		it('gets request validation errors', function() {
			request.validate();

			expect(request._getValidationErrors).to.be.calledOnce;
			expect(request._getValidationErrors).to.be.calledOn(request);
		});

		it('wraps validation errors using nani::fromArray', function() {
			request.validate();

			expect(nani.fromArray).to.be.calledOnce;
			expect(nani.fromArray).to.be.calledWith(errors);
		});

		it('throws if fromArray result is not null', function() {
			const errFromArray = new Error('Error from array');
			nani.fromArray.returns(errFromArray);

			expect(() => {
				request.validate();
			}).to.throw(InvalidRequestError).that.satisfies((err) => {
				expect(err.cause).to.equal(errFromArray);
				return true;
			});
		});
	});

	describe('#getResponse', function() {
		const middlewareManager = { middleware: 'manager' };
		const httpRequest = { http: 'request' };
		const response = { foo: 'bar' };
		let request, handler, result;

		beforeEach(async function() {
			request = new Request();
			handler = sinon.createStubInstance(RequestHandler);
			sinon.stub(request, '_getHandler').returns(handler);
			handler.getResponse.resolves(response);

			result = await request.getResponse(
				middlewareManager,
				httpRequest
			);
		});

		it('gets a handler for the request', function() {
			expect(request._getHandler).to.be.calledOnce;
			expect(request._getHandler).to.be.calledOn(request);
			expect(request._getHandler).to.be.calledWith(
				middlewareManager,
				httpRequest
			);
		});

		it('gets the response from the handler', function() {
			expect(handler.getResponse).to.be.calledOnce;
			expect(handler.getResponse).to.be.calledOn(handler);
		});

		it('resolves with the response', function() {
			expect(result).to.equal(response);
		});
	});

	describe('#_getValidationErrors', function() {
		let request;

		beforeEach(function() {
			request = new Request();
			sinon.stub(request, '_getJsonrpcError').returns('foo');
			sinon.stub(request, '_getMethodError').returns('bar');
			sinon.stub(request, '_getParamsError').returns('baz');
			sinon.stub(request, '_getIdError').returns('qux');
		});

		it('gets the all validation errors', function() {
			request._getValidationErrors();

			expect(request._getJsonrpcError).to.be.calledOnce;
			expect(request._getJsonrpcError).to.be.calledOn(request);
			expect(request._getMethodError).to.be.calledOnce;
			expect(request._getMethodError).to.be.calledOn(request);
			expect(request._getParamsError).to.be.calledOnce;
			expect(request._getParamsError).to.be.calledOn(request);
			expect(request._getIdError).to.be.calledOnce;
			expect(request._getIdError).to.be.calledOn(request);
		});

		it('returns all validation errors in an array', function() {
			const result = request._getValidationErrors();

			expect(result).to.deep.equal([ 'foo', 'bar', 'baz', 'qux' ]);
		});

		it('filters out null errors', function() {
			request._getMethodError.returns(null);

			const result = request._getValidationErrors();

			expect(result).to.deep.equal([ 'foo', 'baz', 'qux' ]);
		});
	});

	describe('#_getJsonrpcError', function() {
		it('returns null if jsonrpc is 2.0', function() {
			const request = new Request({ jsonrpc: '2.0' });

			expect(request._getJsonrpcError()).to.be.null;
		});

		it('returns an appropriate error if jsonrpc is missing', function() {
			const request = new Request();

			const result = request._getJsonrpcError();

			expect(result).to.be.an.instanceof(ValidationError);
			expect(result.message).to.equal('Only jsonrpc 2.0 is supported');
			expect(result.info).to.be.null;
		});

		it('returns an appropriate error if jsonrpc is anything else', function() {
			const request = new Request({ jsonrpc: 'foo' });

			const result = request._getJsonrpcError();

			expect(result).to.be.an.instanceof(ValidationError);
			expect(result.message).to.equal('Only jsonrpc 2.0 is supported');
			expect(result.info).to.deep.equal({ jsonrpc: 'foo' });
		});
	});

	describe('#_getMethodError', function() {
		it('returns null for a valid method', function() {
			const request = new Request({ method: 'foo' });

			expect(request._getMethodError()).to.be.null;
		});

		it('returns an appropriate error if request has no method', function() {
			const request = new Request();

			const result = request._getMethodError();

			expect(result).to.be.an.instanceof(ValidationError);
			expect(result.message).to.equal('method is required');
		});

		it('returns an appropriate error if method is not a string', function() {
			const request = new Request({ method: 42 });

			const result = request._getMethodError();

			expect(result).to.be.an.instanceof(ValidationError);
			expect(result.message).to.equal(
				'method must be a string, recieved 42'
			);
			expect(result.info).to.deep.equal({ method: 42 });
		});

		it('returns an appropriate error if method is undefined', function() {
			const request = new Request({ method: undefined });

			const result = request._getMethodError();

			expect(result).to.be.an.instanceof(ValidationError);
			expect(result.message).to.equal(
				'method must be a string, recieved undefined'
			);
			expect(result.info).to.deep.equal({ method: undefined });
		});

		it('returns an appropriate rror if method is an empty string', function() {
			const request = new Request({ method: '' });

			const result = request._getMethodError();

			expect(result).to.be.an.instanceof(ValidationError);
			expect(result.message).to.equal('method string must not be empty');
			expect(result.info).to.deep.equal({ method: '' });
		});
	});

	describe('_getParamsError', function() {
		it('returns null for object params', function() {
			const request = new Request({ params: { foo: 'bar' } });

			expect(request._getParamsError()).to.be.null;
		});

		it('returns null for array params', function() {
			const request = new Request({ params: [ 'foo', 'bar' ] });

			expect(request._getParamsError()).to.be.null;
		});

		it('returns null for omitted params', function() {
			const request = new Request();

			expect(request._getParamsError()).to.be.null;
		});

		it('returns an appropriate error if params is invalid', function() {
			const request = new Request({ params: 42 });

			const result = request._getParamsError();

			expect(result).to.be.an.instanceof(ValidationError);
			expect(result.message).to.equal(
				'params must be an object or array, recieved 42'
			);
			expect(result.info).to.deep.equal({ params: 42 });
		});

		it('returns an appropriate error if params is undefined', function() {
			const request = new Request({ params: undefined });

			const result = request._getParamsError();

			expect(result).to.be.an.instanceof(ValidationError);
			expect(result.message).to.equal(
				'params must be an object or array, recieved undefined'
			);
			expect(result.info).to.deep.equal({ params: undefined });
		});
	});

	describe('_getIdError', function() {
		it('returns null for a string id', function() {
			const request = new Request({ id: 'foo' });

			expect(request._getIdError()).to.be.null;
		});

		it('returns null for a number id', function() {
			const request = new Request({ id: 42 });

			expect(request._getIdError()).to.be.null;
		});

		it('returns null for a null id', function() {
			const request = new Request({ id: null });

			expect(request._getIdError()).to.be.null;
		});

		it('returns null for an omitted id', function() {
			const request = new Request();

			expect(request._getIdError()).to.be.null;
		});

		it('returns an appropriate error if id is invalid', function() {
			const request = new Request({ id: true });

			const result = request._getIdError();

			expect(result).to.be.an.instanceof(ValidationError);
			expect(result.message).to.equal(
				'id must be a string, number, or null, recieved true'
			);
			expect(result.info).to.deep.equal({ id: true });
		});

		it('returns an appropriate error if id is undefined', function() {
			const request = new Request({ id: undefined });

			const result = request._getIdError();

			expect(result).to.be.an.instanceof(ValidationError);
			expect(result.message).to.equal(
				'id must be a string, number, or null, recieved undefined'
			);
			expect(result.info).to.deep.equal({ id: undefined });
		});
	});

	describe('#_getHandler', function() {
		it('returns a RequestHandler populated with arguments', function() {
			const request = new Request();
			const middlewareManager = { middleware: 'manager' };
			const httpRequest = { http: 'request' };

			const result = request._getHandler(middlewareManager, httpRequest);

			expect(result).to.be.an.instanceof(RequestHandler);
			expect(result.request).to.equal(request);
			expect(result.middlewareManager).to.equal(middlewareManager);
			expect(result.httpRequest).to.equal(httpRequest);
		});
	});
});
