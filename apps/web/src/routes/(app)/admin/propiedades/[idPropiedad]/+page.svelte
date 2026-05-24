<script lang="ts">
	import { page } from '$app/stores';
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import { propiedadRepository } from '$lib/propiedades/infrastructure/propiedadRepository';
	import { obtenerPropiedad } from '$lib/propiedades/application/use-cases/obtenerPropiedad';
	import { actualizarPropiedad } from '$lib/propiedades/application/use-cases/actualizarPropiedad';
	import type { Propiedad } from '$lib/propiedades/domain/models/Propiedad';
	import { presentarEstadoPropiedad, opcionesEstadoPropiedad } from '$lib/shared/presentation';

	let propiedadId = $derived($page.params.idPropiedad ?? '');
	let propiedad = $state<Propiedad | null>(null);
	let loading = $state(true);
	let updating = $state(false);
	let error = $state<string | null>(null);
	let updateSuccess = $state<string | null>(null);
	let updateError = $state<string | null>(null);
	let editando = $state(false);

	let titulo = $state('');
	let descripcion = $state('');
	let precio = $state(0);
	let estado = $state('');

	async function cargar() {
		if (!propiedadId) return;
		loading = true;
		error = null;
		try {
			propiedad = await obtenerPropiedad(propiedadRepository, propiedadId);
			if (propiedad) {
				titulo = propiedad.titulo;
				descripcion = propiedad.descripcion;
				precio = propiedad.precio;
				estado = propiedad.estado;
			}
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar la propiedad.';
		} finally {
			loading = false;
		}
	}

	async function manejarActualizar(event: SubmitEvent) {
		event.preventDefault();
		if (!propiedad) return;

		updating = true;
		updateSuccess = null;
		updateError = null;

		try {
			await actualizarPropiedad(propiedadRepository, {
				id: propiedad.id,
				titulo,
				descripcion,
				precio,
				estado
			});
			updateSuccess = 'Propiedad actualizada correctamente.';
			editando = false;
			await cargar();
		} catch (err) {
			updateError = err instanceof HttpError ? err.message : 'No se pudo actualizar la propiedad.';
		} finally {
			updating = false;
		}
	}

	function iniciarEdicion() {
		if (!propiedad) return;
		titulo = propiedad.titulo;
		descripcion = propiedad.descripcion;
		precio = propiedad.precio;
		estado = propiedad.estado;
		updateError = null;
		editando = true;
	}

	function cancelarEdicion() {
		editando = false;
		updateError = null;
	}

	$effect(() => {
		cargar();
	});
</script>

<svelte:head>
	<title>Propiedad {propiedadId} | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div>
			<p class="section-label">Detalle</p>
			<h1 class="page-heading">
				{propiedad?.titulo || 'Cargando propiedad...'}
			</h1>
		</div>
		<div class="flex gap-3">
			{#if propiedad}
				<Button variant="secondary" onclick={iniciarEdicion}>Editar</Button>
			{/if}
			<Button variant="ghost" onclick={() => window.history.back()}>Volver</Button>
		</div>
	</div>

	{#if loading}
		<Card>
			<div class="skeleton"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">Error</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button onclick={cargar}>Reintentar</Button>
		</Card>
	{:else if propiedad}
		{#if updateSuccess}
			<p class="success-alert">
				{updateSuccess}
			</p>
		{/if}

		<SidePanel isOpen={editando} title="Editar propiedad" onClose={cancelarEdicion}>
			<form class="grid gap-4" onsubmit={manejarActualizar}>
				<label class="label-field">
					Título
					<input bind:value={titulo} class="input-field" />
				</label>

				<label class="label-field">
					Precio (USD)
					<input type="number" bind:value={precio} class="input-field" />
				</label>

				<label class="label-field">
					Estado
					<select bind:value={estado} class="input-field">
						{#each opcionesEstadoPropiedad() as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</label>

				<label class="label-field">
					Descripción
					<textarea bind:value={descripcion} class="input-field min-h-[120px]"></textarea>
				</label>

				{#if updateError}
					<p class="error-alert">
						{updateError}
					</p>
				{/if}

				<div class="flex justify-end gap-3">
					<Button type="button" variant="ghost" onclick={cancelarEdicion}>Cancelar</Button>
					<Button type="submit" disabled={updating}>
						{updating ? 'Guardando...' : 'Guardar cambios'}
					</Button>
				</div>
			</form>
		</SidePanel>

		<Card>
			<h2 class="card-title">Datos actuales</h2>
			<dl class="dl-grid">
				<dt class="font-semibold text-text-muted">ID</dt>
				<dd class="font-mono text-text-main">{propiedad.id}</dd>

				<dt class="font-semibold text-text-muted">Estado</dt>
				<dd>
					<Badge tone={presentarEstadoPropiedad(propiedad.estado).tone}
						>{presentarEstadoPropiedad(propiedad.estado).label}</Badge
					>
				</dd>

				<dt class="font-semibold text-text-muted">Origen</dt>
				<dd class="text-text-main">{propiedad.origen}</dd>

				{#if propiedad.idLeadOrigen}
					<dt class="font-semibold text-text-muted">Lead Origen</dt>
					<dd class="text-text-main">{propiedad.idLeadOrigen}</dd>
				{/if}

				<dt class="font-semibold text-text-muted">Responsable</dt>
				<dd class="text-text-main">{propiedad.asesorResponsableId ?? 'Sin asignar'}</dd>
			</dl>
		</Card>
	{/if}
</div>
