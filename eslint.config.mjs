import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: ["dist", "node_modules", "coverage", "eslint.config.mjs"],
	},
	js.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	prettierConfig,
	{
		files: ["**/*.{ts,tsx,mts,cts,js,mjs,cjs}"],
		plugins: {
			prettier: pluginPrettier,
			"simple-import-sort": simpleImportSort,
		},
		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest,
			},
			sourceType: "module",
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},

		rules: {
			"prettier/prettier": [
				"error",
				{
					endOfLine: "auto",
				},
			],
			"simple-import-sort/imports": [
				"error",
				{
					groups: [
						["^\\u0000"],
						["^node:"],
						["^@nestjs"],
						["^@?\\w"],
						["^@"],
						["^#"],
						["^\\.\\.(?!/?$)", "^\\.\\./?$"],
						["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
					],
				},
			],
			"simple-import-sort/exports": "error",
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: ["../*"],
							message: "❌ Avoid relative imports — use aliases instead.",
						},
					],
				},
			],
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{
					prefer: "type-imports",
				},
			],

			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-misused-promises": "error",
			"@typescript-eslint/no-unsafe-argument": "warn",
			"@typescript-eslint/require-await": "warn",

			"no-console": [
				"warn",
				{
					allow: ["warn", "error"],
				},
			],
		},
	},
	{
		files: ["**/*.spec.ts", "**/*.e2e-spec.ts"],
		languageOptions: {
			globals: {
				...globals.jest,
				...globals.node,
			},

			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			// Tests are intentionally relaxed
			"@typescript-eslint/no-floating-promises": "off",
			"@typescript-eslint/no-unsafe-call": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
		},
	},
);
