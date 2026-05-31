<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import FloatingTextInput from './FloatingTextInput.svelte';

	let nombre = 'María Torres';
	let precio = 96500;
</script>

<Meta title="UI/FloatingTextInput" component={FloatingTextInput} />

<Story name="Default">
	<div class="flex min-h-[22rem] items-center justify-center bg-bg-base p-10">
		<div class="w-full max-w-md rounded-3xl border border-border-light bg-bg-card p-8 shadow-panel">
			<FloatingTextInput label="Nombre del lead" bind:value={nombre} />
		</div>
	</div>
</Story>

<Story name="FormStack">
	<div class="flex min-h-[30rem] items-center justify-center bg-bg-base p-10">
		<div
			class="grid w-full max-w-lg gap-4 rounded-3xl border border-border-light bg-bg-card p-8 shadow-panel"
		>
			<FloatingTextInput label="Nombre" bind:value={nombre} />
			<FloatingTextInput label="Precio estimado (PEN)" type="number" bind:value={precio} />
			<FloatingTextInput label="Correo opcional" type="email" />
		</div>
	</div>
</Story>
