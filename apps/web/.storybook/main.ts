import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(ts|svelte)', '../stories/**/*.stories.@(ts|svelte)'],
	addons: [
		{
			name: '@storybook/addon-svelte-csf',
			options: { legacyTemplate: true }
		}
	],
	framework: '@storybook/sveltekit'
};

export default config;
