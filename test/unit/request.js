import { Request } from '../../lib/request';

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

	it('defaults to null JSON-RPC properties', function() {
		const request = new Request();

		expect(request).to.deep.equal({
			jsonrpc: null,
			method: null,
			params: null,
			id: null,
		});
	});
});
