<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import FloatingTextInput from '$lib/shared/ui/FloatingTextInput.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import { propiedadRepository } from '$lib/propiedades/infrastructure/propiedadRepository';
	import { actualizarPropiedad } from '$lib/propiedades/application/use-cases/actualizarPropiedad';
	import type { Propiedad } from '$lib/propiedades/domain/models/Propiedad';
	import { presentarEstadoPropiedad, opcionesEstadoPropiedad } from '$lib/shared/presentation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let propiedad = $derived(data?.propiedad as unknown as Propiedad);
	let loading = $state(false);
	let updating = $state(false);
	let error = $state<string | null>(null);
	let updateSuccess = $state<string | null>(null);
	let updateError = $state<string | null>(null);
	let editando = $state(false);

	let titulo = $state('');
	let descripcion = $state('');
	let precio = $state(0);
	let estado = $state('');

	$effect(() => {
		if (propiedad) {
			titulo = propiedad.titulo;
			descripcion = propiedad.descripcion;
			precio = propiedad.precio;
			estado = propiedad.estado;
		}
	});

	async function cargar() {
		loading = true;
		error = null;
		try {
			await invalidateAll();
		} catch {
			error = 'No se pudo actualizar la propiedad.';
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
			await invalidateAll();
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

	function formatearPrecio(valor: number): string {
		return valor.toLocaleString('es-PE', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0
		});
	}
</script>

<svelte:head>
	<title>{propiedad?.titulo ?? 'Detalle de propiedad'} | ALVAS</title>
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
				<FloatingTextInput label="Titulo" bind:value={titulo} />
				<FloatingTextInput label="Precio (USD)" type="number" bind:value={precio} />

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

		<div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
			<div class="grid gap-5">
				<Card>
					<div class="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
						<div>
							<p class="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
								Ficha comercial
							</p>
							<h2 class="mt-2 font-display text-2xl font-bold text-text-main">
								{propiedad.titulo}
							</h2>
							<p class="mt-4 max-w-3xl text-sm leading-relaxed text-text-muted">
								{propiedad.descripcion}
							</p>
						</div>
						<Badge tone={presentarEstadoPropiedad(propiedad.estado).tone}>
							{presentarEstadoPropiedad(propiedad.estado).label}
						</Badge>
					</div>
				</Card>

				<div class="grid gap-4 md:grid-cols-3">
					<Card tilt>
						<p class="stat-label">Precio</p>
						<p class="mt-3 font-display text-3xl font-bold text-primary">
							{formatearPrecio(propiedad.precio)}
						</p>
					</Card>
					<Card tilt>
						<p class="stat-label">Origen</p>
						<p class="mt-3 font-display text-2xl font-bold text-text-main">{propiedad.origen}</p>
					</Card>
					<Card tilt>
						<p class="stat-label">Responsable</p>
						<p class="mt-3 font-display text-2xl font-bold text-text-main">
							{propiedad.asesorResponsableId ? 'Asignado' : 'Sin asignar'}
						</p>
					</Card>
				</div>
			</div>

			<Card>
				<h2 class="card-title">Seguimiento CRM</h2>
				<div class="grid gap-3 text-sm">
					<div class="rounded-xl bg-surface-muted p-4">
						<p class="font-semibold text-text-main">Estado comercial</p>
						<p class="mt-1 text-text-muted">{presentarEstadoPropiedad(propiedad.estado).label}</p>
					</div>
					<div class="rounded-xl bg-surface-muted p-4">
						<p class="font-semibold text-text-main">Origen comercial</p>
						<p class="mt-1 text-text-muted">
							{propiedad.idLeadOrigen ? 'Lead de captación' : 'Registro directo'}
						</p>
					</div>
					<div class="rounded-xl bg-surface-muted p-4">
						<p class="font-semibold text-text-main">Cliente propietario</p>
						<p class="mt-1 text-text-muted">
							{propiedad.idClientePropietario ?? 'Sin propietario vinculado'}
						</p>
					</div>
				</div>
			</Card>
		</div>
	{/if}
</div>
