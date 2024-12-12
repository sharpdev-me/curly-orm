import { readdir, readFile, stat, Stats } from "fs";
import { resolve as resolvePath, relative, matchesGlob } from "path";
import ModuleNode from "./nodes/module";
import { tokenize } from "./tokenizer";
import { makeAST } from "./ast";
import { generate, GeneratorMap } from "./generator";

export type ProgramSource = {
	readonly sourceFile?: string;
	readonly module: ModuleNode;
	readonly imports: ProgramSource[];
}

export type ProgramConfig = {
	readonly sources: string[];
	readonly allowImportingOutsideFiles?: boolean;
	readonly allowDuplicateIdentifiers?: boolean;
}

export type GeneratedSource = {
	readonly source: ProgramSource;
	readonly output: string;
}

export class Program {
	public readonly config: ProgramConfig;

	public readonly sources: ProgramSource[] = [];

	constructor(config: ProgramConfig | string[]) {
		if(Array.isArray(config)) {
			this.config = {
				sources: config
			}
			return;
		};

		this.config = config;
	}

	private realPath(filePath: string): string {
		const baseDir = process.env.PWD ?? "./";
		return resolvePath(baseDir, filePath);
	}

	private async readFile(file: string): Promise<string> {
		const filePath = this.realPath(file);

		return new Promise<string>((resolve, reject) => {
			readFile(filePath, {
				encoding: "utf-8"
			}, (err, data) => {
				if(err) return reject(err);

				return resolve(data);
			});
		});
	}

	private async statFile(file: string): Promise<Stats> {
		const filePath = this.realPath(file);

		return new Promise<Stats>((resolve, reject) => {
			stat(filePath, (err, data) => {
				if(err) return reject(err);

				return resolve(data);
			})
		});
	}

	private async readDir(file: string, resolvePaths = true): Promise<string[]> {
		const filePath = this.realPath(file);

		return new Promise<string[]>((resolve, reject) => {
			readdir(filePath, (err, data) => {
				if(err) return reject(err);

				if(resolvePaths) return resolve(data.map(v => resolvePath(filePath, v)));

				return resolve(data);
			});
		});
	}

	public async compileFile(file: string): Promise<ProgramSource> {
		const realPath = this.realPath(file);
		const data = await this.readFile(file)

		const tokens = tokenize(data);
		const ast = makeAST(tokens);

		return {
			sourceFile: realPath,
			module: ast,
			imports: [],
		};
	}

	public async importFile(file: string, importer: ProgramSource): Promise<void> {
		const realPath = this.realPath(file);
		if(realPath == importer.sourceFile) throw new ImportError(file, "cannot import self");

		if(importer.imports.find(v => v.sourceFile === realPath) === undefined) throw new ImportError(file, "file has already been imported");

		if(this.config.allowImportingOutsideFiles !== true) {
			const sources = this.config.sources.map(v => this.realPath(v));

			if(sources.find(v => matchesGlob(this.realPath(file), `${v}/**/*`)) === undefined)
				throw new ImportError(file, "file was not included in the list of sources, and 'allowImportingOutsideFiles' was not set to true.");
		}

		const compiled = await this.compileFile(file);

		if(this.config.allowDuplicateIdentifiers !== true) {
			const allIdentifiers: string[] = [];
			const allCompiledIdentifiers: string[] = [
				...compiled.module.body.map(v => v.schemaName.identifierToken.value),
			];

			compiled.imports.map(v => v.module.body).map(v => v.map(v => v.schemaName.identifierToken.value)).forEach(v => {
				allCompiledIdentifiers.push(...v);
			});

			allIdentifiers.push(...importer.module.body.map(v => v.schemaName.identifierToken.value));
			
			for(const schema of importer.imports) {
				allIdentifiers.push(...schema.module.body.map(v => v.schemaName.identifierToken.value));
			}

			for(const identifier of allCompiledIdentifiers) {
				if(allIdentifiers.includes(identifier)) throw new ImportError(file, `duplicate identifier ${identifier} in import`);
			}
		}

		importer.imports.push(compiled);
	}

	public async compile(): Promise<typeof this> {
		for(const source of this.config.sources) {
			const stats = await this.statFile(source);

			if(stats.isDirectory()) {
				const result = await this.readDir(source).then(v => Promise.all(v.map(this.compileFile)));

				this.sources.push(...result);
			} else {
				this.sources.push(await this.compileFile(source));
			}
		}

		return this;
	}

	public async generate(generators: GeneratorMap): Promise<GeneratedSource[]> {
		const output: GeneratedSource[] = [];

		for(const source of this.sources) {
			const result = await generate(this, source, source.module, generators);

			output.push({
				source,
				output: result.join("\n")
			});
		}

		return output;
	}
}

export class ImportError extends Error {
	constructor(path: string, message: string) {
		super(`Failed to import '${path}': ${message}`);
	}
}