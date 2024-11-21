import { makeAST } from "../src/ast";
import BodyNode from "../src/nodes/body";
import { IfDirectiveNode } from "../src/nodes/directive";
import { BooleanExpressionNode, BooleanOperator, CallExpressionNode, IdentifierExpressionNode, LiteralExpressionNode } from "../src/nodes/expression";
import FieldDeclarationNode from "../src/nodes/field";
import IdentifierNode from "../src/nodes/identifier";
import { NumberLiteralNode } from "../src/nodes/literals";
import ModuleNode from "../src/nodes/module";
import { tokenize } from "../src/tokenizer";
import { getFile } from "./common";

describe("Simple Tests", () => {
	it("should create a ModuleNode with a single SchemaNode", () => {
		const tokenList = tokenize("schema TestSchema { }");

		const ast = makeAST(tokenList);

		expect(ast).toBeDefined();
		expect(ast.name).toBe("ModuleNode");

		const children = ast.children();

		expect(children.length).toBeGreaterThan(0);

		const body = ast.body;
		expect(body.length).toBe(children.length);

		const schema = body[0];
		expect(schema.schemaName.identifierToken.value).toBe("TestSchema");
	});

	it("should create the proper AST for examples/ast", () => {
		let ast: ModuleNode = undefined as any;

		expect(() => {
			const tokens = tokenize(getFile("ast"));
			
			ast = makeAST(tokens);
		}).not.toThrow();

		expect(ast).toBeDefined();

		expect(ast.children().length).toBe(1);
		
		const body = ast.body;
		expect(body).toBeDefined();
		expect(body.length).toBe(1);

		const simpleSchema = body[0];

		const schemaBody = simpleSchema.body;
		const fields = schemaBody.fields;

		expect(fields.length).toBe(5);

		const firstField = fields[0] as FieldDeclarationNode<IdentifierNode>;
		expect(firstField.isNotCall()).toBe(true);
		const secondField = fields[1] as FieldDeclarationNode<IdentifierNode>;
		expect(secondField.isNotCall()).toBe(true);
		const thirdField = fields[2] as FieldDeclarationNode<IdentifierNode>;
		expect(thirdField.isNotCall()).toBe(true);
		const fourthField = fields[3] as FieldDeclarationNode<IdentifierNode>;
		expect(fourthField.isNotCall()).toBe(true);
		const fifthField = fields[4] as FieldDeclarationNode<CallExpressionNode>;
		expect(fifthField.isCall()).toBe(true);

		expect(firstField.identifier.identifierToken.value).toBe("firstField");
		expect(firstField.type.identifierToken.value).toBe("String");
		
		expect(secondField.identifier.identifierToken.value).toBe("secondField");
		expect(secondField.type.identifierToken.value).toBe("number");

		expect(thirdField.identifier.identifierToken.value).toBe("thirdField");
		expect(thirdField.type.identifierToken.value).toBe("SimpleAST");
		expect(thirdField.type.modifiers.length).toBe(1);
		expect(thirdField.type.modifiers[0].identifierToken.value).toBe("Ref");

		expect(fourthField.identifier.identifierToken.value).toBe("fourthField");
		expect(fourthField.type.identifierToken.value).toBe("boolean");

		const fourthFieldDefaultValue = fourthField.defaultValue! as BooleanExpressionNode;
		expect(fourthFieldDefaultValue).toBeDefined();
		expect(fourthFieldDefaultValue).toBeInstanceOf(BooleanExpressionNode);
		expect(fourthFieldDefaultValue.left).toBeInstanceOf(IdentifierExpressionNode);
		expect(fourthFieldDefaultValue.right).toBeInstanceOf(IdentifierExpressionNode);
		expect(fourthFieldDefaultValue.operator).toBe(BooleanOperator.LESS_THAN);

		
		expect(fifthField.type).toBeInstanceOf(CallExpressionNode);
		expect(fifthField.type.args.length).toBe(1);
		expect(fifthField.type.args[0].identifierNode.identifierToken.value).toBe("maxSize");
		expect(fifthField.type.args[0].value).toBeInstanceOf(LiteralExpressionNode);
		expect((fifthField.type.args[0].value as LiteralExpressionNode).literalNode.value()).toBe(5);
	});

	it("should create an array field out of examples/arrays", () => {
		let ast: ModuleNode = undefined as any;

		expect(() => {
			const tokens = tokenize(getFile("arrays"));
			ast = makeAST(tokens);
		}).not.toThrow();

		expect(ast).toBeDefined();
		expect(ast.children().length).toBe(1);

		const body = ast.body;
		expect(body).toBeDefined();
		expect(body.length).toBe(1);

		const arrayTest = body[0];
		const fields = arrayTest.body.fields;

		expect(fields.length).toBe(1);

		const arrayField = fields[0];
		expect(arrayField.isArray).toBe(true);
	});

	it("should properly create if statements from examples/directives", () => {
		let ast: ModuleNode = undefined as any;

		expect(() => {
			const tokens = tokenize(getFile("directives"));

			ast = makeAST(tokens);
		}).not.toThrow();

		expect(ast).toBeDefined();
		
		expect(ast.body[0]).toBeDefined();

		const directives = ast.body[0].body.directives;
		expect(directives.length).toBe(3);

		const ifTrue = directives[0] as IfDirectiveNode;
		expect(ifTrue.expression).toBeInstanceOf(LiteralExpressionNode);
		expect((ifTrue.expression as LiteralExpressionNode).literalNode.value()).toBe(true);
		expect(ifTrue.body.fields[0]).toBeDefined();
		expect(ifTrue.body.fields[0].identifier.identifierToken.value).toBe("included");

		const ifFalse = directives[1] as IfDirectiveNode;
		expect(ifFalse).toBeDefined();
		expect(ifFalse.expression).toBeInstanceOf(LiteralExpressionNode);
		expect((ifFalse.expression as LiteralExpressionNode).literalNode.value()).toBe(false);
		expect(ifFalse.elseNode).toBeDefined();
		expect(ifFalse.elseNode).toBeInstanceOf(BodyNode);
		expect((ifFalse.elseNode as BodyNode).fields.length).toBe(1);

		const ifElseIf = directives[2] as IfDirectiveNode;
		expect(ifElseIf).toBeDefined();
		expect(ifElseIf.expression).toBeInstanceOf(BooleanExpressionNode);
		const expr = ifElseIf.expression as BooleanExpressionNode;
		expect(expr.operator).toBe(BooleanOperator.LESS_THAN);
		expect(expr.left).toBeInstanceOf(IdentifierExpressionNode);
		expect(expr.right).toBeInstanceOf(LiteralExpressionNode);

		const elseIf = ifElseIf.elseNode as IfDirectiveNode;
		expect(elseIf).toBeInstanceOf(IfDirectiveNode);
		expect(elseIf.expression).toBeInstanceOf(LiteralExpressionNode);

		const elseIfElse = elseIf.elseNode as BodyNode;
		expect(elseIfElse).toBeInstanceOf(BodyNode);
		expect(elseIfElse.fields.length).toBe(1);
	});
});