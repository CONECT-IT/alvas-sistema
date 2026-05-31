<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import AlvasLogo from './AlvasLogo.svelte';
</script>

<Meta title="UI/AlvasLogo" component={AlvasLogo} />

<Story name="FullMD">
	<AlvasLogo variant="full" size="md" />
</Story>

<Story name="FullSM">
	<AlvasLogo variant="full" size="sm" />
</Story>

<Story name="FullLG">
	<AlvasLogo variant="full" size="lg" />
</Story>

<Story name="IsotypeSM">
	<AlvasLogo variant="isotype" size="sm" />
</Story>

<Story name="IsotypeMD">
	<AlvasLogo variant="isotype" size="md" />
</Story>

<Story name="IsotypeLG">
	<AlvasLogo variant="isotype" size="lg" />
</Story>
