import { CurlyClass, KeyMapSymbol, PrimaryKeySymbol } from "@curly-orm/ts/src/runtime";

type Curly_ISimpleSchema = {
	firstField: string;
	lastField: number;
}

const SimpleSchema: CurlyClass<Curly_ISimpleSchema> = Object.freeze(class {
	private readonly data: Curly_ISimpleSchema;
	public static readonly [KeyMapSymbol] = {
		"firstField": "firstField",
		"lastField": "lastField"
	};
	public static readonly [PrimaryKeySymbol] = "firstField";

	constructor(data: Curly_ISimpleSchema) {
		this.data = data;
	}

	private markDirty() {

	}

	get firstField(): string {
		return this.data.firstField;
	}

	set firstField(value: string) {
		this.markDirty();

		this.data.firstField = value;
	}
	
	get lastField(): number {
		return this.data.lastField;
	}

	set lastField(value: number) {
		this.markDirty();

		this.data.lastField = value;
	}
}) as unknown as CurlyClass<Curly_ISimpleSchema>;

const _ = new SimpleSchema({
	firstField: "",
	lastField: 5
});