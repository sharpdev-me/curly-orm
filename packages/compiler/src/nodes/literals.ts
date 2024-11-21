import { UnexpectedToken } from "../errors";
import { isTokenType, LiteralToken, Token, TokenType } from "../tokenizer";
import ASTNode from "./base";

export abstract class LiteralNode<T extends TokenType.NumberLiteral | TokenType.StringLiteral | TokenType.Keyword = TokenType.NumberLiteral | TokenType.StringLiteral | TokenType.Keyword, R extends T extends TokenType.NumberLiteral ? number
: T extends TokenType.StringLiteral
	? string
	: T extends TokenType.Keyword
		? boolean
		: never = T extends TokenType.NumberLiteral ? number
		: T extends TokenType.StringLiteral
			? string
			: T extends TokenType.Keyword
				? boolean
				: never> extends ASTNode {

	public abstract readonly name: `${"Number" | "String" | "Boolean"}LiteralNode`;
	constructor(public readonly token: Token<T>) {
		super();
	}

	public value(): R
		{
			if(isTokenType(this.token, TokenType.NumberLiteral)) {
				return (Number(this.token.value)) as R;
			} else if(isTokenType(this.token, TokenType.StringLiteral)) {
				return (this.token.value.substring(1, this.token.value.length - 1)) as R;
			} else if(isTokenType(this.token, TokenType.Keyword)) {
				return (this.token.value === "true") as R;
			}

			throw new UnexpectedToken(this.token);
	}

	static makeLiteralNode(token: LiteralToken): LiteralNode {
		if(isTokenType(token, TokenType.NumberLiteral)) {
			return new NumberLiteralNode(token);
		}

		if(isTokenType(token, TokenType.StringLiteral)) {
			return new StringLiteralNode(token);
		}

		if(isTokenType(token, TokenType.Keyword) && (token.value === "true" || token.value === "false")) {
			return new BooleanLiteralNode(token);
		}

		throw new UnexpectedToken(token);
	}

	/* eslint @typescript-eslint/no-explicit-any: "off" */
	static [Symbol.hasInstance](obj: any): obj is LiteralNode {
		if(obj === undefined || obj === null) return false;

		return obj.name === "LiteralNode" || obj.name === "NumberLiteralNode" || obj.name === "StringLiteralNode" || obj.name === "BooleanLiteralNode";
	}
}

export class NumberLiteralNode extends LiteralNode<TokenType.NumberLiteral, number> {
	public readonly name = "NumberLiteralNode";
}

export class StringLiteralNode extends LiteralNode<TokenType.StringLiteral, string> {
	public readonly name = "StringLiteralNode";
}

export class BooleanLiteralNode extends LiteralNode<TokenType.Keyword, boolean> {
	public readonly name = "BooleanLiteralNode";
}