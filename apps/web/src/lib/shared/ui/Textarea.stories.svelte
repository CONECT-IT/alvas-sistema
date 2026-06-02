<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import Textarea from './Textarea.svelte';
</script>

<Meta title="UI/Textarea" component={Textarea} />

<Story name="Default">
	<Textarea placeholder="Escribe una nota..." />
</Story>

<Story name="WithLabel">
	<Textarea label="Descripción" placeholder="Describe el lead..." />
</Story>

<Story name="WithError">
	<Textarea label="Comentarios" value="Texto inválido" error="Este campo es obligatorio" />
</Story>

<Story name="Disabled">
	<Textarea label="Notas" value="Lead cerrado" disabled />
</Story>

<Story name="CustomRows">
	<Textarea label="Detalle" rows={5} placeholder="Más espacio para escribir..." />
</Story>
