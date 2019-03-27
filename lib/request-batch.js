import { InvalidRequestError } from 'jpi-errors';
import { Request } from './request';
import { isEmpty } from 'lodash';
import { map } from 'pasync';

export class RequestBatch {
	constructor(requests = []) {
		this.requests = requests;
	}

	getResponse(registry, httpRequest) {
		return map(
			this.requests,
			(request) => request.getResponse(registry, httpRequest)
		);
	}

	static fromArray(arr) {
		if (isEmpty(arr)) throw new InvalidRequestError();
		return new this(arr.map((obj) => new Request(obj)));
	}
}
