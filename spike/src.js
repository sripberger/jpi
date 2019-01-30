import Jpi from './jpi';
import http from 'http';
import JpiError from 'jpi-error';

const app = new Jpi();
const server = http.createServer(app.getCallback());

app.register({
	method: 'foo',
	omg: 'yay',
}, (ctx) => {
	if (ctx.params.whatever !== 'wow') {
		throw new JpiError(
			JpiError.INVALID_PARAMS,
			{ params: ctx.params }
		);
	}
} ,(ctx) => {
	return {
		bar: 'baz',
		params: ctx.params,
		options: ctx.options,
	};
});

server.listen(1234);
console.log('listening on port 1234...'); // eslint-disable-line no-console
