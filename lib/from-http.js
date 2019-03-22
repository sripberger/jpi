import { getBody, parseBody, validateHttp } from './request-utils';
import { Request } from './request';
import { RequestBatch } from './request-batch';
import { isArray } from 'lodash';

export async function fromHttp(req) {
	validateHttp(req);
	const body = parseBody(await getBody(req));
	return isArray(body) ? RequestBatch.fromArray(body) : new Request(body);
}
