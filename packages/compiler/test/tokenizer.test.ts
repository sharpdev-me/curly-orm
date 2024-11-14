import { tokenize } from "../src/tokenizer";
import { getTestFile } from "./common";

describe("Simple Tests", () => {
	it("should return an empty array for an empty string", () => {
		expect(tokenize("")).toEqual([]);
	});

	it("examples/basic", () => {
		const [source, result] = getTestFile("basic");

		expect(tokenize(source)).toBe(result);
	});
});