export enum TokenType {
	Keyword,
	Colon,
	SemiColon,
	Comma,
	LeftBrace,
	RightBrace,
	RightParenthesis,
	LeftParenthesis,
	LeftBracket,
	RightBracket,
	LeftArrow,
	RightArrow,
	Pound,
	QuestionMark,
	Identifier,
	StringLiteral,
	NumberLiteral,
	Equals,
	Not
}

const singleCharacterTokens = {
	':': TokenType.Colon,
	';': TokenType.SemiColon,
	',': TokenType.Comma,
	'{': TokenType.LeftBrace,
	'}': TokenType.RightBrace,
	'(': TokenType.LeftParenthesis,
	')': TokenType.RightParenthesis,
	'[': TokenType.LeftBracket,
	']': TokenType.RightBracket,
	'<': TokenType.LeftArrow,
	'>': TokenType.RightArrow,
	'#': TokenType.Pound,
	'?': TokenType.QuestionMark,
	'=': TokenType.Equals,
	'!': TokenType.Not,
} as const;

const keywords = [
	"schema",
	"type",
	"true",
	"false",
	"if",
	"else",
	"import"
] as const;

export type Keyword = typeof keywords[number];

export type Token<T extends TokenType> = {
	type: T,
	value: string,
	pos: number,
	line: number,
	tokenStart: number,
	tokenEnd: number
}

export type LiteralToken = Token<TokenType.StringLiteral | TokenType.NumberLiteral | TokenType.Keyword>;

const identifierRegex = /^[_a-zA-Z$]\w*$/;
const numberRegex = /(?:^[0-9]+(?:\.[0-9]+)?$)|(?:^0x[0-9a-fA-F]+$)/;

export function isValidIdentifier(input: string): boolean {
	if((keywords as readonly string[]).includes(input)) return false;

	return identifierRegex.test(input);
}

export function isValidNumber(input: string): boolean {
	return numberRegex.test(input);
}

export function getTokenType(input: string): TokenType | null {
	if((keywords as readonly string[]).includes(input)) return TokenType.Keyword;

	const singleCharacterToken = (singleCharacterTokens as {[key: string]: TokenType})[input];
	if(singleCharacterToken !== undefined && singleCharacterToken !== null) return singleCharacterToken;

	if(isValidNumber(input)) return TokenType.NumberLiteral;
	if(isValidIdentifier(input)) return TokenType.Identifier;

	return null;
}

function isWhitespace(character: string): boolean {
	return character == '\n' || character == '\r' || character == '\t' || character == ' ';
}

export function isTokenType<T extends TokenType>(obj: Token<TokenType>, type: T): obj is Token<T> {
	return obj.type === type;
}

export function isLiteralToken(obj: Token<TokenType>): obj is LiteralToken {
	return obj.type === TokenType.StringLiteral || obj.type === TokenType.NumberLiteral || (obj.type === TokenType.Keyword && (obj.value === "true" || obj.value === "false"));
}

export function tokenize(input: string): Token<TokenType>[] {
	if(input === undefined || input.length <= 0) return [];

	const tokenList: Token<TokenType>[] = [];

	const characterList = [...input];

	let tokenStartHolder = 0;

	let currentLine = 1;
	let linePosition = 1;

	let inString = false;

	for(let i = 0; i < characterList.length; i++) {
		const char = characterList[i];
		const previousChar = characterList[i - 1];

		if(inString) {
			if(char === '"') {
				if(previousChar === "\\") {
					linePosition++;
					continue;
				}
	
				tokenList.push({
					tokenStart: tokenStartHolder,
					tokenEnd: i + 1,
					line: currentLine,
					pos: linePosition - (i - tokenStartHolder),
					type: TokenType.StringLiteral,
					value: characterList.slice(tokenStartHolder, i + 1).join("")
				});
	
				tokenStartHolder = i + 1;
				linePosition++;
	
				inString = false;
			}

			linePosition++;
			continue;
		}

		if(isWhitespace(char)) {
			if(tokenStartHolder != i) {
				const tokenValue = characterList.slice(tokenStartHolder, i).join("");

				const tokenType = getTokenType(tokenValue);
				if(tokenType === null) throw new UnknownToken(currentLine, linePosition, tokenValue);

				tokenList.push({
					tokenStart: tokenStartHolder,
					tokenEnd: i,
					line: currentLine,
					pos: linePosition - (i - tokenStartHolder),
					value: tokenValue,
					type: tokenType
				});
			}

			if(char === "\n") {
				currentLine++;
				linePosition = 1;
			} else linePosition++;

			tokenStartHolder = i + 1;
			continue;
		}



		if(char === "\"") {
			tokenStartHolder = i;
			linePosition++;
			inString = true;

			continue;
		}

		const singleCharacterToken = (singleCharacterTokens as {[key: string]: TokenType})[char];
		if(singleCharacterToken === undefined || singleCharacterToken === null) {
			linePosition++;
			continue;
		}

		if(tokenStartHolder != i) {
			const tokenValue = characterList.slice(tokenStartHolder, i).join("");

			const tokenType = getTokenType(tokenValue);
			if(tokenType === null) throw new UnknownToken(currentLine, linePosition, tokenValue);

			tokenList.push({
				tokenStart: tokenStartHolder,
				tokenEnd: i,
				line: currentLine,
				pos: linePosition - (i - tokenStartHolder),
				value: tokenValue,
				type: tokenType
			});

			tokenStartHolder = i;
		}

		tokenList.push({
			tokenStart: tokenStartHolder,
			tokenEnd: i + 1,
			line: currentLine,
			pos: linePosition - (i - tokenStartHolder),
			value: char,
			type: singleCharacterToken
		});

		tokenStartHolder = i + 1;
		linePosition++;
	}

	if(tokenStartHolder != characterList.length) {
		const tokenValue = characterList.slice(tokenStartHolder).join("");
		const tokenType = getTokenType(tokenValue);

		if(tokenType === undefined || tokenType === null) throw new UnknownToken(currentLine, linePosition, tokenValue);

		tokenList.push({
			tokenStart: tokenStartHolder,
			tokenEnd: characterList.length,
			line: currentLine,
			pos: linePosition - (characterList.length - tokenStartHolder),
			value: tokenValue,
			type: tokenType
		});
	}

	return tokenList;
}

class UnknownToken extends Error {
	constructor(line: number, pos: number, value: string) {
		super(`Unknown token '${value}' at ${line}:${pos}`);
	}
}