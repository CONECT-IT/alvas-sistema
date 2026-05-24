import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		rules: {
			'svelte/no-navigation-without-resolve': 'off',
			'@typescript-eslint/no-explicit-any': 'off'
		}
	},
	{
		ignores: [
			'.svelte-kit/**',
			'.wrangler/**',
			'build/**',
			'dist/**',
			'worker-configuration.d.ts',
			'coverage/**',
			'playwright-report/**',
			'test-results/**'
		]
	}
);
