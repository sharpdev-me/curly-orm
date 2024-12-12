import { GenerateFn, Generator, GeneratorMap, NodeType } from "@curly-orm/compiler/generator";
import ModuleNode from "@curly-orm/compiler/nodes/module";
import { Program, ProgramSource } from "@curly-orm/compiler";
import SchemaNode from "@curly-orm/compiler/nodes/schema";

export default function MakeTypescriptGenerator(): GeneratorMap {
	const TypeScriptGeneratorMap: GeneratorMap = {
		"ModuleNode": async function(program: Program, source: ProgramSource, node: ModuleNode, generate: GenerateFn) {
			const schemas = node.body;
			const imports = node.imports;
	
			const output: string[] = [];
	
			for(const importNode of imports) {
				const importPath = importNode.path.value();
	
				await program.importFile(importPath, source);
			}
	
			for(const schema of schemas) {
				output.push(...await generate(schema));
			}
	
			return output;
		},
	
		"SchemaNode": async function(program, source, node: SchemaNode, generate) {
			const { body, schemaName } = node;
	
			const name = schemaName.identifierToken.value;
			return [];
		}
	};

	return TypeScriptGeneratorMap;
}