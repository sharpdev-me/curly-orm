// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	[
		{
			ignores: [
				".yarn/**/*",
				".pnp*",
			],
		},
		{
			files: [
				"packages/**/*.test.ts"
			],
			rules: {
				"@typescript-eslint/no-explicit-any": "off"
			}
		}
	]
)