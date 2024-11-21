import { Token, tokenize, TokenType } from "../src/tokenizer";
import { getTestFile } from "./common";

describe("Simple Tests", () => {
	it("should return an empty array for an empty string", () => {
		expect(tokenize("")).toEqual([]);
	});

	it("examples/basic", () => {
		const [source, result] = getTestFile("basic");

		expect(tokenize(source)).toEqual(JSON.parse(result));
	});

	it("examples/edge_case", () => {
		const [source, result] = getTestFile("edge_case");

		expect(tokenize(source)).toEqual(JSON.parse(result));
	});

	it("should properly create number tokens", () => {
		expect(tokenize("123")).toEqual([
			{
				line: 1,
				pos: 1,
				tokenStart: 0,
				tokenEnd: 3,
				type: 16,
				value: "123"
			}
		]);

		expect(tokenize("123.45")).toEqual([
			{
				line: 1,
				pos: 1,
				tokenStart: 0,
				tokenEnd: 6,
				type: 16,
				value: "123.45"
			}
		]);

		expect(() => tokenize(".123")).toThrow();
	});

	it("should create string tokens", () => {
		expect(tokenize("\"Hello, World!\"")).toEqual<Token<TokenType.StringLiteral>[]>([
			{
				line: 1,
				pos: 1,
				tokenStart: 0,
				tokenEnd: 15,
				type: TokenType.StringLiteral,
				value: "\"Hello, World!\""
			}
		]);

		expect(tokenize("\"welcome to the \\\"show\\\"\"")).toEqual<Token<TokenType.StringLiteral>[]>([
			{
				line: 1,
				pos: 1,
				tokenStart: 0,
				tokenEnd: 25,
				type: TokenType.StringLiteral,
				value: "\"welcome to the \\\"show\\\"\""
			}
		]);
	});

	it("should create boolean keywords", () => {
		expect(tokenize("true")).toEqual<Token<TokenType.Keyword>[]>([
			{
				line: 1,
				pos: 1,
				tokenStart: 0,
				tokenEnd: 4,
				type: TokenType.Keyword,
				value: "true"
			}
		]);

		expect(tokenize("false")).toEqual<Token<TokenType.Keyword>[]>([
			{
				line: 1,
				pos: 1,
				tokenStart: 0,
				tokenEnd: 5,
				type: TokenType.Keyword,
				value: "false"
			}
		]);
	});
});