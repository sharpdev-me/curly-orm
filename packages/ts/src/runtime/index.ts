import { QueryBuilder, QueryProvider } from "@curly-orm/database/index";

export const PrimaryKeySymbol = Symbol("cPrimaryKey");
export const KeyMapSymbol = Symbol("cKeyMap");

type ClassKeys<T> = {
	[P in keyof T]: T[P]
}

type CurlyClassInstance<T> = {
	
} & ClassKeys<T>;

export type CurlyClass<T, U extends QueryProvider> = {
	new (rawData: T): CurlyClassInstance<T>;
	readonly [PrimaryKeySymbol]: keyof T;
	readonly [KeyMapSymbol]: {
		[P in keyof T]: string
	};
	readonly query: () => QueryBuilder<T, CurlyClassInstance<T>>
}