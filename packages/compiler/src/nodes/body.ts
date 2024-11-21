import ASTNode from "./base";
import { DirectiveNode } from "./directive";
import { CallExpressionNode } from "./expression";
import FieldNode from "./field";
import IdentifierNode from "./identifier";

export default class BodyNode extends ASTNode {
	public readonly name = "BodyNode";

	constructor(public readonly fields: FieldNode<IdentifierNode | CallExpressionNode>[], public readonly directives: DirectiveNode[]) {
		super();
	}
}