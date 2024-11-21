import ASTNode from "./base";
import SchemaNode from "./schema";

export default class ModuleNode extends ASTNode {
	public readonly name: string = "ModuleNode";

	constructor(public readonly body: SchemaNode[]) {
		super();
	}

	public children(): ASTNode[] {
		return this.body;
	}
}