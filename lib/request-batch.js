import { Request } from './request';

export class RequestBatch {
	constructor(requests = []) {
		this.requests = requests;
	}

	static fromArray(arr) {
		return new this(arr.map((obj) => new Request(obj)));
	}
}
