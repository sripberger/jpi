/* eslint max-classes-per-file: off, no-console: off */
const { values, isEmpty } = require('lodash');

class Graph {
	constructor() {
		this.nodesById = {};
	}

	addNode(id, constraints = {}) {
		const node = this.nodesById[id] = { id };
		const edges = node.edges = [];
		const { before, after } = constraints;
		if (before) edges.push(this.nodesById[before]);
		if (after) this.nodesById[after].edges.push(node);
	}

	getAllNodes() {
		return new Set(values(this.nodesById));
	}
}

class Search {
	constructor(graph) {
		this.graph = graph;
		this.unvisitedNodes = graph.getAllNodes();
		this.result = [];
	}

	get hasUnvisitedNodes() {
		return !isEmpty(this.unvisitedNodes);
	}

	get nextNode() {
		let nextNode = null;
		for (const node of this.unvisitedNodes) {
			if (!nextNode || node.id > nextNode.id) nextNode = node;
		}
		return nextNode;
	}

	run() {
		while (this.hasUnvisitedNodes) this.visit(this.nextNode);
		return this.result;
	}

	visit(node) {
		if (!this.unvisitedNodes.has(node)) return;
		if (node.marked) throw Error('Cycle detected');
		node.marked = true;
		for (const n of node.edges) this.visit(n);
		this.unvisitedNodes.delete(node);
		this.result.unshift(node.id);
	}
}

const goodGraph = new Graph();
goodGraph.addNode('bar');
goodGraph.addNode('foo', { before: 'bar' });
goodGraph.addNode('baz');
goodGraph.addNode('qux', { after: 'baz' });
goodGraph.addNode('quux', { before: 'baz', after: 'foo' });
goodGraph.addNode('wtf');

console.log(new Search(goodGraph).run());

const badGraph = new Graph();
badGraph.addNode('foo');
badGraph.addNode('bar', { after: 'foo' });
badGraph.addNode('baz', { after: 'bar', before: 'foo' });

try {
	console.log(new Search(badGraph).run());
} catch (err) {
	console.error(err);
}
