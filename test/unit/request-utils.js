import * as zstreams from 'zstreams';
import { ParseError, RequestFailedError } from 'jpi-errors';
import { getBody, parseBody, validateHttp } from '../../lib/request-utils';
import { HttpStatusError } from '../../lib/http-status-error';

describe('Request Utils', function() {
	describe('validateHttp', function() {
		let req;

		beforeEach(function() {
			req = { url: '/', method: 'POST' };
		});

		it('does nothing if path and method are valid', function() {
			validateHttp(req);
		});

		it('throws if url path is not root', function() {
			req.url = '/path/to/something';

			expect(() => {
				validateHttp(req);
			}).to.throw(HttpStatusError).that.satisfies((err) => {
				expect(err.message).to.equal('Not Found');
				expect(err.info).to.deep.equal({ statusCode: 404 });
				return true;
			});
		});

		it('allows url search', function() {
			req.url = '/?foo=bar';

			validateHttp(req);
		});

		it('allows url hash', function() {
			req.url = '/#baz';

			validateHttp(req);
		});

		it('throws if method is not POST', function() {
			req.method = 'GET';

			expect(() => {
				validateHttp(req);
			}).to.throw(HttpStatusError).that.satisfies((err) => {
				expect(err.message).to.equal('Method Not Allowed');
				expect(err.info).to.deep.equal({
					statusCode: 405,
					headers: { allow: 'POST' },
				});
				return true;
			});
		});
	});

	describe('getBody', function() {
		const req = {};
		const body = 'request body';
		const stream = { intoString: () => {} };

		beforeEach(function() {
			sinon.stub(zstreams, 'default').returns(stream);
			sinon.stub(stream, 'intoString').resolves(body);
		});

		it('consumes request using zstreams intoString', async function() {
			const result = await getBody(req);

			expect(zstreams.default).to.be.calledOnce;
			expect(zstreams.default).to.be.calledWith(sinon.match.same(req));
			expect(stream.intoString).to.be.calledOnce;
			expect(stream.intoString).to.be.calledOn(stream);
			expect(stream.intoString).to.be.calledWithExactly();
			expect(result).to.equal(body);
		});

		it('wraps stream errors', function() {
			const streamErr = new Error('Stream error');
			stream.intoString.rejects(streamErr);

			return getBody(req)
				.then(() => {
					throw new Error('Promise should have rejected');
				}, (err) => {
					expect(err).to.be.an.instanceof(RequestFailedError);
					expect(err.cause).to.equal(streamErr);
				});
		});

		it('wraps zstreams conversion errors', function() {
			const zstreamsErr = new Error('zstreams conversion error');
			zstreams.default.throws(zstreamsErr);

			return getBody(req)
				.then(() => {
					throw new Error('Promise should have rejected');
				}, (err) => {
					expect(err).to.be.an.instanceof(RequestFailedError);
					expect(err.cause).to.equal(zstreamsErr);
				});
		});
	});

	describe('parseBody', function() {
		const body = 'request body';
		const parsed = { foo: 'bar' };

		beforeEach(function() {
			sinon.stub(JSON, 'parse').returns(parsed);
		});

		it('parses body as json', function() {
			parseBody(body);

			expect(JSON.parse).to.be.calledOnce;
			expect(JSON.parse).to.be.calledWith(body);
		});

		it('returns parsed body', function() {
			expect(parseBody(body)).to.equal(parsed);
		});

		it('wraps parsing errors', function() {
			const parsingErr = new Error('Parsing error');
			JSON.parse.throws(parsingErr);

			expect(() => {
				parseBody(body);
			}).to.throw(ParseError).that.satisfies((err) => {
				expect(err.cause).to.equal(parsingErr);
				return true;
			});
		});
	});
});
