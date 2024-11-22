import ASTNode from "./base";
import ImportNode from "./import";
import SchemaNode from "./schema";

export default class ModuleNode extends ASTNode {
	public readonly name: string = "ModuleNode";

	constructor(public readonly body: SchemaNode[], public readonly imports: ImportNode[]) {
		super();
	}

	public children(): ASTNode[] {
		return this.body;
	}
}