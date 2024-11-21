import { readFileSync } from "fs";
import { resolve } from "path";

export function getTestFile(name: string): [string, string] {
	const sourcePath = `./examples/${name}.curly`;
	const outPath = `./examples/${name}.curly.out`;

	const sourceContent = readFileSync(resolve(__dirname, sourcePath), {encoding: "utf-8"}).trim();
	const outContent = readFileSync(resolve(__dirname, outPath), {encoding: "utf-8"}).trim();

	return [sourceContent, outContent];
}

export function getFile(name: string): string {
	return readFileSync(resolve(__dirname, `./examples/${name}.curly`), {encoding:"utf-8"});
}