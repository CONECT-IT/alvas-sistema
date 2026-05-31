<script lang="ts">
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import Button from './Button.svelte';
	import FloatingTextInput from './FloatingTextInput.svelte';
	import SidePanel from './SidePanel.svelte';

	let abierto = false;
	let origen: DOMRect | null = null;

	function abrir(event: MouseEvent) {
		origen = (event.currentTarget as HTMLElement).getBoundingClientRect();
		abierto = true;
	}
</script>

<Meta title="UI/SidePanel" component={SidePanel} />

<Story name="MorphFromButton">
	<div class="flex min-h-[36rem] items-center justify-center bg-bg-base p-10">
		<Button onclick={abrir}>Nuevo lead</Button>
		<SidePanel
			isOpen={abierto}
			title="Nuevo lead"
			sourceRect={origen}
			onClose={() => (abierto = false)}
		>
			<div class="grid gap-4">
				<FloatingTextInput label="Nombre" />
				<FloatingTextInput label="Teléfono" />
				<FloatingTextInput label="Precio estimado (PEN)" type="number" />
				<div class="flex justify-end gap-2 pt-2">
					<Button variant="secondary" onclick={() => (abierto = false)}>Cancelar</Button>
					<Button onclick={() => (abierto = false)}>Guardar</Button>
				</div>
			</div>
		</SidePanel>
	</div>
</Story>
