import { Token, TokenType } from "../tokenizer";
import ASTNode from "./base";

export default class IdentifierNode extends ASTNode {
	public readonly name = "IdentifierNode";
	constructor(public readonly identifierToken: Token<TokenType.Identifier>, public readonly modifiers: IdentifierNode[]) {
		super();
	}
}