export function getSuccessResponse(result, id) {
	return id === undefined ? null : { jsonrpc: '2.0', id, result };
}
