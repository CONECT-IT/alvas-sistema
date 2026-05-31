<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import Modal from './Modal.svelte';
</script>

<Meta title="UI/Modal" component={Modal} />

<Story name="Simple">
	<Modal isOpen={true} title="Hello">
		<p class="text-text-muted">This is a simple modal with just a body message.</p>
	</Modal>
</Story>

<Story name="WithActions">
	<Modal isOpen={true} title="Confirm Delete">
		<p class="text-text-muted">Are you sure you want to delete this item?</p>
	</Modal>
</Story>
