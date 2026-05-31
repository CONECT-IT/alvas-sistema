<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import Card from './Card.svelte';
</script>

<Meta title="UI/Card" component={Card} />

<Story name="Default">
	<Card>
		<div class="p-4">
			<h3 class="font-semibold text-lg">Card Title</h3>
			<p class="text-text-muted mt-1">This is a default card with some content.</p>
		</div>
	</Card>
</Story>

<Story name="WithTilt">
	<Card tilt>
		<div class="p-4">
			<h3 class="font-semibold text-lg">Interactive Card</h3>
			<p class="text-text-muted mt-1">Hover over me — I tilt on mouse move!</p>
		</div>
	</Card>
</Story>
