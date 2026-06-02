<script>
	import { Meta, Story } from '@storybook/addon-svelte-csf';
	import ConfirmDialog from './ConfirmDialog.svelte';

	let isOpenConfirm = $state(true);
	let isOpenDanger = $state(false);
	let isOpenInfo = $state(false);
</script>

<Meta title="UI/ConfirmDialog" component={ConfirmDialog} />

<Story name="Confirm">
	<div class="p-8">
		<button
			class="rounded-xl bg-primary px-5 py-3 font-display font-semibold text-white"
			onclick={() => (isOpenConfirm = true)}
		>
			Abrir confirmación
		</button>
		<ConfirmDialog
			isOpen={isOpenConfirm}
			title="Publicar propiedad"
			message="¿Estás seguro de que deseas publicar esta propiedad? Asegúrate de que los datos sean correctos y que se cuente con el contrato respectivo."
			confirmLabel="Publicar"
			cancelLabel="Cancelar"
			onConfirm={() => (isOpenConfirm = false)}
			onCancel={() => (isOpenConfirm = false)}
		/>
	</div>
</Story>

<Story name="Danger">
	<div class="p-8">
		<button
			class="rounded-xl bg-danger px-5 py-3 font-display font-semibold text-white"
			onclick={() => (isOpenDanger = true)}
		>
			Eliminar
		</button>
		<ConfirmDialog
			isOpen={isOpenDanger}
			variant="danger"
			title="Eliminar lead"
			message="Esta acción eliminará permanentemente el lead y todo su historial. No se podrá deshacer."
			confirmLabel="Eliminar"
			cancelLabel="Cancelar"
			onConfirm={() => (isOpenDanger = false)}
			onCancel={() => (isOpenDanger = false)}
		/>
	</div>
</Story>

<Story name="Info">
	<div class="p-8">
		<button
			class="rounded-xl bg-sky-600 px-5 py-3 font-display font-semibold text-white"
			onclick={() => (isOpenInfo = true)}
		>
			Más información
		</button>
		<ConfirmDialog
			isOpen={isOpenInfo}
			variant="info"
			title="Conversión de lead"
			message="Al convertir este lead a cliente podrás asociar contratos y propiedades. El lead se moverá a la sección de clientes."
			confirmLabel="Entendido"
			cancelLabel="Cerrar"
			onConfirm={() => (isOpenInfo = false)}
			onCancel={() => (isOpenInfo = false)}
		/>
	</div>
</Story>

<Story name="Loading State">
	<ConfirmDialog
		isOpen={true}
		variant="confirm"
		title="Procesando"
		message="Estamos procesando tu solicitud. Por favor espera unos segundos."
		confirmLabel="Confirmar"
		cancelLabel="Cancelar"
		loading={true}
		onConfirm={() => {}}
		onCancel={() => {}}
	/>
</Story>
