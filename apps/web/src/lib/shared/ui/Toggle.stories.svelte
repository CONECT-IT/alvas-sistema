<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import Toggle from './Toggle.svelte';
</script>

<Meta title="UI/Toggle" component={Toggle} />

<Story name="Off">
	<Toggle />
</Story>

<Story name="On">
	<Toggle checked />
</Story>

<Story name="WithLabel">
	<Toggle checked label="Enable notifications" />
</Story>

<Story name="Disabled">
	<Toggle disabled label="Feature locked" />
</Story>
