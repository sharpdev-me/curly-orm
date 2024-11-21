import { LiteralToken, Token, TokenType } from "../tokenizer";
import ASTNode from "./base";

export default class SchemaArgNode extends ASTNode {
	public readonly name = "SchemaArgNode";
	
	private readonly _identifier: Token<TokenType.Identifier>;
	private readonly _value?: LiteralToken;
	private readonly _type?: Token<TokenType.Identifier>;

	constructor(identifier: Token<TokenType.Identifier>, value?: Token<TokenType.StringLiteral | TokenType.NumberLiteral | TokenType.Keyword>, type?: Token<TokenType.Identifier>) {
		super();

		this._identifier = identifier;
		this._value = value;
		this._type = type;
	}

	public identifier() {
		return this._identifier;
	}

	public value() {
		return this._value;
	}

	public type() {
		return this._type;
	}
}