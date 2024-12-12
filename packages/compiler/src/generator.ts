import ASTNode from "./nodes/base"
import { Program, ProgramSource } from "./program";

export type NodeType = ASTNode & {[key: string | number | symbol]: ASTNode | ASTNode[]};

export type GenerateFn = (node: ASTNode) => Promise<string[]>;
export type Generator = (program: Program, source: ProgramSource, node: any, generate: GenerateFn) => Promise<string[] | undefined>;

export type GeneratorMap = {
	readonly [key: string]: Generator;
}

export async function generate(program: Program, source: ProgramSource, node: ASTNode, generators: GeneratorMap): Promise<string[]> {
	const generator = generators[node.name];
	if(generator === undefined) return [""];

	async function _generate(node: ASTNode): Promise<string[]> {
		return await generate(program, source, node, generators);
	}

	return await generator(program, source, node, _generate) ?? [];
}