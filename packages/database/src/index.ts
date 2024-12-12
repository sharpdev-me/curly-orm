export type QueryBuilder<RawType, ClassType> = {
	execute(): Promise<ClassType[]>;
}

export type QueryProvider = {
	query<RawType, ClassType>(): QueryBuilder<RawType, ClassType>;
}