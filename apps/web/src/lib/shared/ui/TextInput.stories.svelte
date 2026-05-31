<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import TextInput from './TextInput.svelte';
</script>

<Meta title="UI/TextInput" component={TextInput} />

<Story name="Default">
	<TextInput placeholder="Enter text..." />
</Story>

<Story name="WithLabel">
	<TextInput label="Full name" placeholder="John Doe" />
</Story>

<Story name="WithError">
	<TextInput label="Email" value="invalid" error="Please enter a valid email" />
</Story>

<Story name="Disabled">
	<TextInput label="Username" value="johndoe" disabled />
</Story>

<Story name="Password">
	<TextInput type="password" label="Password" placeholder="******" />
</Story>
