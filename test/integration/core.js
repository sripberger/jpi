const { Application } = require('../../cjs');
const { createServer } = require('http');
const { promisify } = require('util');
const request = require('request-promise-native');

const port = 39183;
const uri = `http://localhost:${port}`;

describe('Core', function() {
	let app, server;

	function startServer() {
		server = createServer(app.getCallback());
		return promisify(server.listen.bind(server))(port);
	}

	beforeEach(function() {
		app = new Application();
		server = null;
	});

	afterEach(function(done) {
		if (server) {
			server.close(done);
		} else {
			done();
		}
	});

	it('does the thing', async function() {
		app.registerMethod('echo', (ctx) => ctx.params[0]);

		await startServer();

		const response = await request({
			method: 'POST',
			uri,
			body: {
				jsonrpc: '2.0',
				method: 'echo',
				params: [ 'hello' ],
				id: 'some id',
			},
			json: true,
		});

		expect(response).to.deep.equal({
			jsonrpc: '2.0',
			result: 'hello',
			id: 'some id',
		});
	});
});
