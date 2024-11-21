import ASTNode from "./base";
import { StringLiteralNode } from "./literals";

export default class ImportNode extends ASTNode {
	public readonly name = "ImportNode";

	constructor(public readonly path: StringLiteralNode) {
		super();
	}
}