<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import Badge from '$lib/shared/ui/Badge.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import { propiedadRepository } from '$lib/propiedades/infrastructure/propiedadRepository';
	import { obtenerPropiedad } from '$lib/propiedades/application/use-cases/obtenerPropiedad';
	import { actualizarPropiedad } from '$lib/propiedades/application/use-cases/actualizarPropiedad';
	import type { Propiedad } from '$lib/propiedades/domain/models/Propiedad';

	let propiedadId = $derived($page.params.idPropiedad ?? '');
	let propiedad = $state<Propiedad | null>(null);
	let loading = $state(true);
	let updating = $state(false);
	let error = $state<string | null>(null);
	let updateSuccess = $state<string | null>(null);
	let updateError = $state<string | null>(null);

	// Campos de edición
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
			await cargar();
		} catch (err) {
			updateError = err instanceof HttpError ? err.message : 'No se pudo actualizar la propiedad.';
		} finally {
			updating = false;
		}
	}

	function getEstadoTone(e: string): 'brand' | 'success' | 'neutral' {
		const n = e.toUpperCase();
		if (n === 'DISPONIBLE') return 'success';
		if (n === 'RESERVADA') return 'brand';
		return 'neutral';
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
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Detalle</p>
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">
				{propiedad?.titulo || 'Cargando propiedad...'}
			</h1>
		</div>
		<Button variant="secondary" onclick={() => window.history.back()}>Volver</Button>
	</div>

	{#if loading}
		<Card>
			<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">Error</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button onclick={cargar}>Reintentar</Button>
		</Card>
	{:else if propiedad}
		<div class="grid gap-6 lg:grid-cols-2">
			<Card>
				<h2 class="mb-5 font-display text-xl font-bold text-text-main">Editar información</h2>

				{#if updateSuccess}
					<p class="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
						{updateSuccess}
					</p>
				{/if}

				{#if updateError}
					<p class="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
						{updateError}
					</p>
				{/if}

				<form class="grid gap-4" onsubmit={manejarActualizar}>
					<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
						Título
						<input
							bind:value={titulo}
							class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
						/>
					</label>

					<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
						Precio (USD)
						<input
							type="number"
							bind:value={precio}
							class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
						/>
					</label>

					<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
						Estado
						<select
							bind:value={estado}
							class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
						>
							<option value="PRELIMINAR">Preliminar (Borrador)</option>
							<option value="EN_VALIDACION">En Validación</option>
							<option value="DISPONIBLE">Disponible (Pública)</option>
							<option value="RESERVADA">Reservada</option>
							<option value="VENDIDA">Vendida</option>
							<option value="DESCARTADA">Descartada</option>
						</select>
					</label>

					<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
						Descripción
						<textarea
							bind:value={descripcion}
							class="min-h-[120px] rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
						></textarea>
					</label>

					<Button type="submit" disabled={updating}>
						{updating ? 'Guardando...' : 'Guardar cambios'}
					</Button>
				</form>
			</Card>

			<div class="flex flex-col gap-6">
				<Card>
					<h2 class="mb-4 font-display text-xl font-bold text-text-main">Datos actuales</h2>
					<dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
						<dt class="font-semibold text-text-muted">ID</dt>
						<dd class="font-mono text-text-main">{propiedad.id}</dd>

						<dt class="font-semibold text-text-muted">Estado</dt>
						<dd><Badge tone={getEstadoTone(propiedad.estado)}>{propiedad.estado}</Badge></dd>

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
			</div>
		</div>
	{/if}
</div>
