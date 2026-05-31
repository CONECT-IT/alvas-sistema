import type { Preview } from '@storybook/svelte';
import '../src/lib/shared/design-system/tokens.css';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		}
	}
};

export default preview;
