export enum TokenType {
	Keyword,
	Colon,
	SemiColon,
	Comma,
	LeftBrace,
	RightBrace,
	Identifier
}

export type Token = {
	type: TokenType,
	value: string,
	line: number,
	column: number,
}

export function tokenize(input: string): Token[] {
	if(input === undefined || input.length <= 0) return [];

	return [];
}