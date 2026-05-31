<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import Button from './Button.svelte';
</script>

<Meta title="UI/Button" component={Button} />

<Story name="Primary">
	<Button variant="primary">Button</Button>
</Story>

<Story name="Secondary">
	<Button variant="secondary">Cancel</Button>
</Story>

<Story name="Ghost">
	<Button variant="ghost">More info</Button>
</Story>

<Story name="Disabled">
	<Button variant="primary" disabled>Disabled</Button>
</Story>
