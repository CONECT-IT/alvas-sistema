<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import Card from './Card.svelte';
</script>

<Meta title="UI/Card" component={Card} />

<Story name="Default">
	<Card>
		<div class="p-4">
			<h3 class="text-lg font-semibold">Card Title</h3>
			<p class="mt-1 text-text-muted">This is a default card with some content.</p>
		</div>
	</Card>
</Story>

<Story name="WithTilt">
	<Card tilt>
		<div class="p-4">
			<h3 class="text-lg font-semibold">Interactive Card</h3>
			<p class="mt-1 text-text-muted">Hover over me — I tilt on mouse move!</p>
		</div>
	</Card>
</Story>
