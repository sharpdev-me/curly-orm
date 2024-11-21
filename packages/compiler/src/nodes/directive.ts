import ASTNode from "./base";
import BodyNode from "./body";
import { ExpressionNode } from "./expression";

export class DirectiveNode extends ASTNode {
	public readonly name: string = "DirectiveNode";
}

export class IfDirectiveNode extends DirectiveNode {
	public readonly name = "IfDirectiveNode";

	constructor(public readonly expression: ExpressionNode, public readonly body: BodyNode, public readonly elseNode?: BodyNode | IfDirectiveNode) {
		super();
	}
}