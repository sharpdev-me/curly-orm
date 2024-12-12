import { Program } from "../src/program";
import { resolve } from "path";

describe("Generator Test", () => {
	it("should generate an empty string when provided with an empty map", async () => {
		const program = new Program([
			resolve(__dirname, "./examples/basic.curly")
		]);

		const compiled = await program.compile();

		expect(compiled).toBe(program);
		
		const generated = await compiled.generate({});
		expect(generated.length).toBe(1);
		expect(generated[0].output).toBe("");
		expect(generated[0].source.sourceFile).toBe(resolve(__dirname, "./examples/basic.curly"));
	});
});