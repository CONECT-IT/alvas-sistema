<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import Button from './Button.svelte';
</script>

<Meta title="UI/Button" component={Button} />

<Story name="Primary">
	<div class="flex min-h-[18rem] items-center justify-center bg-bg-base p-10">
		<Button variant="primary">Crear lead</Button>
	</div>
</Story>

<Story name="Secondary">
	<div class="flex min-h-[18rem] items-center justify-center bg-bg-base p-10">
		<Button variant="secondary">Actualizar</Button>
	</div>
</Story>

<Story name="Ghost">
	<div class="flex min-h-[18rem] items-center justify-center bg-bg-base p-10">
		<Button variant="ghost">Ver detalle</Button>
	</div>
</Story>

<Story name="Disabled">
	<div class="flex min-h-[18rem] items-center justify-center bg-bg-base p-10">
		<Button variant="primary" disabled>Guardando...</Button>
	</div>
</Story>

<Story name="Variants">
	<div class="flex min-h-[24rem] items-center justify-center bg-bg-base p-10">
		<div
			class="flex flex-wrap items-center gap-4 rounded-3xl border border-border-light bg-bg-card p-8 shadow-panel"
		>
			<Button variant="primary">Guardar</Button>
			<Button variant="secondary">Cancelar</Button>
			<Button variant="ghost">Volver</Button>
		</div>
	</div>
</Story>
