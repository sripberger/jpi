const jsonRpcProperties = [
	'jsonrpc',
	'method',
	'params',
	'id',
];

export class Request {
	constructor(obj = {}) {
		for (const prop of jsonRpcProperties) {
			this[prop] = obj[prop] || null;
		}
	}
}
