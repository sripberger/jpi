import { InvalidRequestError } from 'jpi-errors';
import { Request } from './request';
import { isEmpty } from 'lodash';

export class RequestBatch {
	constructor(requests = []) {
		this.requests = requests;
	}

	static fromArray(arr) {
		if (isEmpty(arr)) throw new InvalidRequestError();
		return new this(arr.map((obj) => new Request(obj)));
	}
}
