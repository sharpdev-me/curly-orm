import { UnexpectedNode } from "../errors";
import ASTNode from "./base";
import IdentifierNode from "./identifier";
import { LiteralNode } from "./literals";

export class NotAnExpression extends Error {
	constructor(node: ASTNode) {
		super(`Unexpected node: ${node.name} (expected ExpressionNode)`);
	}
}

export enum BooleanOperator {
	EQUALS,
	NOT_EQUALS,
	AND,
	OR,
	GREATER_THAN,
	LESS_THAN,
	GREATER_THAN_OR_EQUAL,
	LESS_THAN_OR_EQUAL
}

export function tryMakeExpression(node: ASTNode): ExpressionNode {
	if(node instanceof ExpressionNode) return node;

	if(node instanceof LiteralNode) return new LiteralExpressionNode(node);

	if(node instanceof IdentifierNode) return new IdentifierExpressionNode(node);

	throw new UnexpectedNode(node);
}

export abstract class ExpressionNode extends ASTNode {
	constructor(public readonly left?: ExpressionNode, public readonly right?: ExpressionNode) {
		super();
	}
}

export class LiteralExpressionNode extends ExpressionNode {
	public readonly name = "LiteralExpressionNode";

	constructor(public readonly literalNode: LiteralNode) {
		super();
	}
}

export class IdentifierExpressionNode extends ExpressionNode {
	public readonly name = "IdentifierExpressionNode";

	constructor(public readonly identifierNode: IdentifierNode) {
		super();
	}
}

export class CallExpressionNode extends ExpressionNode {
	public readonly name = "CallExpressionNode";

	constructor(public readonly identifierNode: IdentifierNode, public readonly args: CallExpressionArgumentNode[]) {
		super();
	}
}

export class CallExpressionArgumentNode extends ExpressionNode {
	public readonly name = "CallExpressionArgumentNode";

	constructor(public readonly identifierNode: IdentifierNode, public readonly value: ExpressionNode) {
		super();
	}
}

export class BooleanExpressionNode extends ExpressionNode {
	public readonly name = "BooleanExpressionNode";

	constructor(left: ExpressionNode, right: ExpressionNode, public readonly operator: BooleanOperator) {
		super(left, right);
	}
}

export class UnaryNotExpressionNode extends ExpressionNode {
	public readonly name = "UnaryNotExpressionNode";

	constructor(public readonly expression: ExpressionNode) {
		super();
	}
}