import { NodeNotFound, UnexpectedNode, UnexpectedToken } from "./errors";
import ASTNode from "./nodes/base";
import BodyNode from "./nodes/body";
import { DirectiveNode, IfDirectiveNode } from "./nodes/directive";
import { BooleanExpressionNode, BooleanOperator, CallExpressionArgumentNode, CallExpressionNode, ExpressionNode, LiteralExpressionNode, tryMakeExpression } from "./nodes/expression";
import FieldDeclarationNode from "./nodes/field";
import IdentifierNode from "./nodes/identifier";
import ImportNode from "./nodes/import";
import { BooleanLiteralNode, LiteralNode, NumberLiteralNode, StringLiteralNode } from "./nodes/literals";
import ModuleNode from "./nodes/module";
import SchemaNode from "./nodes/schema";
import { isLiteralToken, isTokenType, Keyword, Token, TokenType } from "./tokenizer";

export function makeAST(tokens: Token<TokenType>[]): ModuleNode {
	let current = 0;

	function isNext<T extends TokenType>(type: T, increment = true): boolean {
		const next = tokens[current + 1];
		if(next === undefined) return false;

		const r = isTokenType(next, type);
		if(r && increment) current++;

		return r;
	}

	function is<T extends TokenType>(type: T, increment = true, token = tokens[current]): token is Token<T> {
		const res = isTokenType(token, type);
		if(res && increment) current++;

		return res;
	}

	function isKeyword(keyword: Keyword, increment = true, token = tokens[current]): token is Token<TokenType.Keyword> {
		const res = isTokenType(token, TokenType.Keyword);
		if(!res) return false;

		const r = token.value === keyword;
		if(r && increment) current++;

		return r;
	}

	function walk(): ASTNode {
		const token = tokens[current];

		if(isLiteralToken(token)) {
			const literalNode = LiteralNode.makeLiteralNode(token);
			const leftSide = new LiteralExpressionNode(literalNode);
			current++;

			function make(operator: BooleanOperator) {
				return new BooleanExpressionNode(leftSide, tryMakeExpression(walk()), operator);
			}

			if(is(TokenType.LeftArrow)) {
				const isEqual = is(TokenType.Equals);

				return make(isEqual ? BooleanOperator.LESS_THAN_OR_EQUAL : BooleanOperator.LESS_THAN);
			} else if(is(TokenType.RightArrow)) {
				const isEqual = is(TokenType.Equals);

				return make(isEqual ? BooleanOperator.GREATER_THAN_OR_EQUAL : BooleanOperator.GREATER_THAN);
			} else if(is(TokenType.Equals)) {
				if(!is(TokenType.Equals)) throw new UnexpectedToken(tokens[current]);

				return make(BooleanOperator.EQUALS);
			} else if(is(TokenType.Not)) {
				if(!is(TokenType.Equals)) throw new UnexpectedToken(tokens[current]);

				return make(BooleanOperator.NOT_EQUALS);
			}
		}

		if(isTokenType(token, TokenType.NumberLiteral)) {
			return new NumberLiteralNode(token);
		}

		if(isTokenType(token, TokenType.StringLiteral)) {
			return new StringLiteralNode(token);
		}

		if(isTokenType(token, TokenType.Keyword) && (token.value === "true" || token.value === "false")) {
			return new BooleanLiteralNode(token);
		}

		if(isTokenType(token, TokenType.Identifier)) {
			const identifier = token;
			current++;

			const modifiers: IdentifierNode[] = [];
			
			if(is(TokenType.LeftArrow)) {
				const empty = new IdentifierNode(identifier, []);
				const token = tokens[current];
				if(isTokenType(token, TokenType.Equals)) {
					current++;
					return new BooleanExpressionNode(tryMakeExpression(empty), tryMakeExpression(walk()), BooleanOperator.LESS_THAN_OR_EQUAL);
				}

				if(isLiteralToken(token)) {
					current++;
					return new BooleanExpressionNode(tryMakeExpression(empty), tryMakeExpression(LiteralNode.makeLiteralNode(token)), BooleanOperator.LESS_THAN);
				}

				while(!is(TokenType.RightArrow, false)) {
					const node = walkType<ExpressionNode | IdentifierNode>(ExpressionNode, IdentifierNode);
					if(node instanceof ExpressionNode) return new BooleanExpressionNode(tryMakeExpression(empty), node, BooleanOperator.LESS_THAN);

					if(node instanceof IdentifierNode) {
						if(is(TokenType.SemiColon)) {
							return new BooleanExpressionNode(tryMakeExpression(empty), tryMakeExpression(node), BooleanOperator.LESS_THAN);
						}
						if(is(TokenType.Comma)) {
							if(is(TokenType.Identifier, false)) continue;

							return new BooleanExpressionNode(tryMakeExpression(empty), tryMakeExpression(node), BooleanOperator.LESS_THAN);
						}
						modifiers.push(node);
					} else throw new UnexpectedNode(node);
				}

				current++;
			}

			const identifierNode = new IdentifierNode(identifier, modifiers);

			if(is(TokenType.LeftParenthesis)) {
				const args: CallExpressionArgumentNode[] = [];
				while(!is(TokenType.RightParenthesis, false)) {
					const identifier = walkType(IdentifierNode);

					if(!is(TokenType.Equals)) throw new UnexpectedToken(tokens[current]);

					const expression = tryMakeExpression(walk());

					args.push(new CallExpressionArgumentNode(identifier, expression));

					is(TokenType.Comma);
				}

				current++;

				return new CallExpressionNode(identifierNode, args);
			}

			if(is(TokenType.Colon)) {
				const fieldType = walkType<IdentifierNode | CallExpressionNode>(IdentifierNode, CallExpressionNode);

				let isArray = false;

				if(is(TokenType.LeftBracket)) {
					if(is(TokenType.RightBracket)) {
						isArray = true;
					} else throw new UnexpectedToken(tokens[current]);
				}

				let defaultValue: ExpressionNode | undefined = undefined;

				if(is(TokenType.Equals)) {
					defaultValue = tryMakeExpression(walk());
				}

				return new FieldDeclarationNode(identifierNode, fieldType, isArray, defaultValue);
			}

			return identifierNode;
		}

		if(is(TokenType.LeftBrace)) {
			const fields: FieldDeclarationNode[] = [];
			const directives: DirectiveNode[] = [];

			if(is(TokenType.RightBrace)) return new BodyNode(fields, directives);

			while(!is(TokenType.RightBrace, false)) {
				const node = walkType<FieldDeclarationNode | DirectiveNode>(FieldDeclarationNode, DirectiveNode);
				if(node instanceof FieldDeclarationNode) fields.push(node);
				if(node instanceof DirectiveNode) directives.push(node);

				if(is(TokenType.SemiColon) || is(TokenType.Comma)) continue;
			}

			current++;

			return new BodyNode(fields, directives);
		}

		if(isKeyword("schema") || isKeyword("type")) {
			const schemaName = walkType(IdentifierNode);

			const args: FieldDeclarationNode[] = [];

			if(is(TokenType.LeftParenthesis)) {
				while(!is(TokenType.RightParenthesis, false)) {
					args.push(walkType(FieldDeclarationNode));

					isNext(TokenType.Comma);
				}
			}

			const body = walkType(BodyNode);

			return new SchemaNode(schemaName, args, body);
		}

		if(isKeyword("import")) {
			const literal = walkType(StringLiteralNode);

			return new ImportNode(literal);
		}

		if(isKeyword("if")) {
			if(!is(TokenType.LeftParenthesis)) throw new UnexpectedToken(tokens[current]);

			const expression = tryMakeExpression(walk());

			if(!is(TokenType.RightParenthesis)) throw new UnexpectedToken(tokens[current]);

			const body = walkType(BodyNode);
			if(isKeyword("else")) {
				const elseNode = walkType<BodyNode | IfDirectiveNode>(BodyNode, IfDirectiveNode);

				return new IfDirectiveNode(expression, body, elseNode);
			}

			return new IfDirectiveNode(expression, body);
		}

		throw new NodeNotFound();
	}

	/* eslint @typescript-eslint/no-explicit-any: "off" */
	function walkType<T extends ASTNode>(...type: (abstract new (...args: any[]) => T)[]): T {
		const res = walk();

		for(const t of type) {
			if(res instanceof t) return res;
		}

		throw new UnexpectedNode(res);
	}

	const body: SchemaNode[] = [];

	while(current < tokens.length) {
		body.push(walkType(SchemaNode));
	}

	return new ModuleNode(body);
}