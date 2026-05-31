<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import Badge from './Badge.svelte';
</script>

<Meta title="UI/Badge" component={Badge} />

<Story name="Brand">
	<Badge tone="brand">Brand</Badge>
</Story>

<Story name="Success">
	<Badge tone="success">Active</Badge>
</Story>

<Story name="Warning">
	<Badge tone="warning">Pending</Badge>
</Story>

<Story name="Neutral">
	<Badge tone="neutral">Draft</Badge>
</Story>
