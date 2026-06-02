import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(ts|svelte|mdx)'],
	addons: [
		'@storybook/addon-docs',
		{
			name: '@storybook/addon-svelte-csf',
			options: { legacyTemplate: true }
		}
	],
	framework: '@storybook/sveltekit'
};

export default config;
