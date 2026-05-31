<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import Select from './Select.svelte';
</script>

<Meta title="UI/Select" component={Select} />

<Story name="Default">
	<Select>
		<option value="" disabled>Choose an option</option>
		<option value="1">Option 1</option>
		<option value="2">Option 2</option>
		<option value="3">Option 3</option>
	</Select>
</Story>

<Story name="WithLabel">
	<Select label="Role">
		<option value="" disabled>Select role</option>
		<option value="admin">Admin</option>
		<option value="asesor">Asesor</option>
	</Select>
</Story>

<Story name="WithError">
	<Select label="Country" error="This field is required">
		<option value="" disabled>Select country</option>
		<option value="pe">Perú</option>
		<option value="mx">México</option>
	</Select>
</Story>

<Story name="Disabled">
	<Select label="Plan" disabled>
		<option value="basic">Basic</option>
	</Select>
</Story>
