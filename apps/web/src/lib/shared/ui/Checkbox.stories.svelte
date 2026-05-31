<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import Checkbox from './Checkbox.svelte';
</script>

<Meta title="UI/Checkbox" component={Checkbox} />

<Story name="Unchecked">
	<Checkbox />
</Story>

<Story name="Checked">
	<Checkbox checked />
</Story>

<Story name="WithLabel">
	<Checkbox checked label="Accept terms and conditions" />
</Story>

<Story name="Disabled">
	<Checkbox disabled label="Option unavailable" />
</Story>
