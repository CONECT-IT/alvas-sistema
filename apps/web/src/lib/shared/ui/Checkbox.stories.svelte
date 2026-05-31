<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import Checkbox from './Checkbox.svelte';
</script>

<Meta title="UI/Checkbox" component={Checkbox} />

<Story name="Unchecked">
	<div class="flex min-h-[18rem] items-center justify-center bg-bg-base p-10">
		<Checkbox label="Mostrar convertidos" />
	</div>
</Story>

<Story name="Checked">
	<div class="flex min-h-[18rem] items-center justify-center bg-bg-base p-10">
		<Checkbox checked label="Mostrar convertidos" />
	</div>
</Story>

<Story name="WithLabel">
	<div class="flex min-h-[18rem] items-center justify-center bg-bg-base p-10">
		<Checkbox checked label="Enviar notificación al asesor" />
	</div>
</Story>

<Story name="Disabled">
	<div class="flex min-h-[18rem] items-center justify-center bg-bg-base p-10">
		<Checkbox disabled label="Opción no disponible" />
	</div>
</Story>
