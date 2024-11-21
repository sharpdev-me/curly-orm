import type ASTNode from "./nodes/base";
import { Token, TokenType } from "./tokenizer";

export class UnexpectedToken extends Error {
	constructor(token: Token<TokenType>) {
		super(`Unexpected token '${token.value}' (${TokenType[token.type]}) at ${token.line}:${token.pos}`);
	}
}

export class UnexpectedNode extends Error {
	constructor(node: ASTNode) {
		super(`Unexpected node: ${node.name}`);
	}
}

export class NodeNotFound extends Error {
	constructor() {
		super("Could not construct a node.");
	}
}

export class UnexpectedEOF extends Error {
	constructor() {
		super("Unexpected EOF");
	}
}