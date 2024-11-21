import ASTNode from "./base";
import BodyNode from "./body";
import { CallExpressionNode } from "./expression";
import FieldDeclarationNode from "./field";
import IdentifierNode from "./identifier";

export default class SchemaNode extends ASTNode {
	public readonly name = "SchemaNode";

	constructor(public readonly schemaName: IdentifierNode, public readonly args: FieldDeclarationNode<IdentifierNode | CallExpressionNode>[], public readonly body: BodyNode) {
		super();
	}
}