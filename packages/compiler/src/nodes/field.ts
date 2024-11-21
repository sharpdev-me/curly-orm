import ASTNode from "./base";
import { CallExpressionNode, ExpressionNode } from "./expression";
import IdentifierNode from "./identifier";

export default class FieldDeclarationNode<T extends IdentifierNode | CallExpressionNode = IdentifierNode | CallExpressionNode> extends ASTNode {
	public readonly name = "FieldDeclarationNode";

	constructor(public readonly identifier: IdentifierNode, public readonly type: T, public readonly isArray: boolean, public readonly defaultValue?: ExpressionNode) {
		super();
	}

	public isCall(): this is FieldDeclarationNode<CallExpressionNode> {
		return this.type instanceof CallExpressionNode;
	}

	public isNotCall(): this is FieldDeclarationNode<IdentifierNode> {
		return !this.isCall();
	}
}