<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { Propiedad } from '$lib/propiedades/domain/models/Propiedad';
	import { actualizarPropiedad } from '$lib/propiedades/application/use-cases/actualizarPropiedad';
	import { crearPropiedad } from '$lib/propiedades/application/use-cases/crearPropiedad';
	import { listarPropiedades } from '$lib/propiedades/application/use-cases/listarPropiedades';
	import { propiedadRepository } from '$lib/propiedades/infrastructure/propiedadRepository';
	import PropiedadAdminTable from '$lib/propiedades/presentation/PropiedadAdminTable.svelte';
	import PropiedadStats from '$lib/propiedades/presentation/PropiedadStats.svelte';

	let propiedades = $state<Propiedad[]>([]);
	let loading = $state(true);
	let creating = $state(false);
	let updatingId = $state<string | null>(null);
	let error = $state<string | null>(null);
	let createError = $state<string | null>(null);
	let reviewError = $state<string | null>(null);
	let reviewSuccess = $state<string | null>(null);
	let mostrarPanel = $state(false);
	let titulo = $state('');
	let descripcion = $state('');
	let precio = $state('');
	let estado = $state('DISPONIBLE');
	let asesorResponsableId = $state('');
	const skeletonCards = [1, 2, 3];
	const estados = ['BORRADOR', 'DISPONIBLE', 'RESERVADA', 'VENDIDA', 'ARCHIVADA'];
	const captaciones = $derived(propiedades.filter((p) => p.estado.toUpperCase() === 'BORRADOR'));
	const disponibles = $derived(propiedades.filter((p) => p.estado.toUpperCase() === 'DISPONIBLE'));
	const otras = $derived(
		propiedades.filter((p) => !['BORRADOR', 'DISPONIBLE'].includes(p.estado.toUpperCase()))
	);

	async function cargarPropiedades() {
		loading = true;
		error = null;

		try {
			propiedades = await listarPropiedades(propiedadRepository);
		} catch (err) {
			if (err instanceof HttpError) {
				error = err.message;
			} else {
				error = 'No se pudo cargar el catálogo de propiedades.';
			}
		} finally {
			loading = false;
		}
	}

	async function cambiarEstadoPropiedad(propiedad: Propiedad, nuevoEstado: string) {
		reviewError = null;
		reviewSuccess = null;
		updatingId = propiedad.id;

		try {
			await actualizarPropiedad(propiedadRepository, {
				id: propiedad.id,
				estado: nuevoEstado
			});
			reviewSuccess = `${propiedad.titulo} pasó a ${nuevoEstado}.`;
			await cargarPropiedades();
		} catch (err) {
			reviewError =
				err instanceof HttpError ? err.message : 'No se pudo actualizar el estado de la propiedad.';
		} finally {
			updatingId = null;
		}
	}

	function limpiarFormulario() {
		titulo = '';
		descripcion = '';
		precio = '';
		estado = 'DISPONIBLE';
		asesorResponsableId = '';
	}

	async function registrarPropiedad(event: SubmitEvent) {
		event.preventDefault();
		createError = null;

		const precioNumerico = Number(precio);

		if (!titulo.trim() || !descripcion.trim() || Number.isNaN(precioNumerico)) {
			createError = 'Completa título, descripción y precio válido.';
			return;
		}

		if (precioNumerico < 0) {
			createError = 'El precio no puede ser negativo.';
			return;
		}

		creating = true;

		try {
			await crearPropiedad(propiedadRepository, {
				titulo: titulo.trim(),
				descripcion: descripcion.trim(),
				precio: precioNumerico,
				estado,
				asesorResponsableId: asesorResponsableId.trim() || undefined
			});
			limpiarFormulario();
			mostrarPanel = false;
			await cargarPropiedades();
		} catch (err) {
			createError =
				err instanceof HttpError ? err.message : 'No se pudo registrar la propiedad ALVAS.';
		} finally {
			creating = false;
		}
	}

	function verDetalle(propiedad: Propiedad) {
		goto(`/admin/propiedades/${propiedad.id}`);
	}

	$effect(() => {
		cargarPropiedades();
	});
</script>

<svelte:head>
	<title>Catálogo de Propiedades | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="section-label">Administración</p>
			<h1 class="page-heading">Catálogo de propiedades</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Consulta el inventario registrado, revisa disponibilidad y detecta propiedades sin asesor
				responsable.
			</p>
		</div>

		<div class="flex items-center gap-4 md:self-end">
			<Button variant="secondary" onclick={() => (mostrarPanel = true)}>Nueva propiedad</Button>
			<Button variant="secondary" onclick={cargarPropiedades}>Actualizar listado</Button>
		</div>
	</div>

	<SidePanel isOpen={mostrarPanel} title="Nueva propiedad" onClose={() => (mostrarPanel = false)}>
		<form class="grid gap-4" onsubmit={registrarPropiedad}>
			<label class="label-field">
				Título
				<input bind:value={titulo} class="input-field" placeholder="Terreno en zona residencial" />
			</label>

			<label class="label-field">
				Precio
				<input
					bind:value={precio}
					type="number"
					min="0"
					step="0.01"
					class="input-field"
					placeholder="150000"
				/>
			</label>

			<label class="label-field">
				Descripción
				<textarea
					bind:value={descripcion}
					rows="4"
					class="input-field resize-none"
					placeholder="Ubicación, metraje, accesos y observaciones comerciales."
				></textarea>
			</label>

			<label class="label-field">
				Estado inicial
				<select bind:value={estado} class="input-field">
					{#each estados as item (item)}
						<option value={item}>{item}</option>
					{/each}
				</select>
			</label>

			<label class="label-field">
				Asesor responsable
				<input
					bind:value={asesorResponsableId}
					class="input-field"
					placeholder="ID del asesor, opcional"
				/>
			</label>

			{#if createError}
				<p class="error-alert">
					{createError}
				</p>
			{/if}

			<Button type="submit" disabled={creating}>
				{creating ? 'Registrando...' : 'Registrar propiedad'}
			</Button>
		</form>
	</SidePanel>

	{#if loading}
		<div class="grid gap-4 md:grid-cols-3">
			{#each skeletonCards as skeleton (skeleton)}
				<Card>
					<div class="h-4 w-24 animate-pulse rounded bg-surface-muted"></div>
					<div class="mt-4 h-8 w-16 animate-pulse rounded bg-primary-light"></div>
					<div class="mt-3 h-3 w-32 animate-pulse rounded bg-surface-muted"></div>
				</Card>
			{/each}
		</div>
		<Card>
			<div class="skeleton"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudo cargar el catálogo</p>
			<p class="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargarPropiedades}>Intentar nuevamente</Button>
		</Card>
	{:else if propiedades.length === 0}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">
				Aún no hay propiedades registradas
			</p>
			<p class="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
				Cuando el equipo registre propiedades desde el CRM o por captación, aparecerán aquí para
				control comercial.
			</p>
		</Card>
	{:else}
		<PropiedadStats {propiedades} />

		{#if captaciones.length > 0}
			<Card>
				<div class="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
					<div>
						<h2 class="font-display text-xl font-bold text-text-main">Captaciones</h2>
						<p class="mt-1 text-sm text-text-muted">
							Propiedades preliminares captadas que requieren validación antes de publicarse.
						</p>
					</div>
					<p class="text-sm font-semibold text-amber-600">{captaciones.length} pendientes</p>
				</div>

				{#if reviewSuccess}
					<p class="success-alert mb-4">
						{reviewSuccess}
					</p>
				{/if}

				{#if reviewError}
					<p class="error-alert mb-4">
						{reviewError}
					</p>
				{/if}

				<div class="grid gap-4">
					{#each captaciones as propiedad (propiedad.id)}
						<article class="rounded-2xl border border-amber-200 bg-amber-50/30 p-5">
							<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
								<div>
									<div class="flex flex-wrap items-center gap-2">
										<p class="font-display text-lg font-bold text-text-main">
											{propiedad.titulo}
										</p>
										<span
											class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
										>
											{propiedad.estado}
										</span>
										<span
											class="rounded-full bg-bg-card px-3 py-1 text-xs font-semibold text-text-muted"
										>
											{propiedad.origen}
										</span>
									</div>
									<p class="mt-2 max-w-3xl text-sm leading-relaxed text-text-muted">
										{propiedad.descripcion}
									</p>
									<div class="mt-3 grid gap-2 text-xs text-text-muted sm:grid-cols-3">
										<p>Lead origen: {propiedad.idLeadOrigen ?? 'Sin lead'}</p>
										<p>Captada por: {propiedad.captadaPorAsesorId ?? 'Sin asesor'}</p>
										<p>Responsable: {propiedad.asesorResponsableId ?? 'Sin asignar'}</p>
									</div>
								</div>

								<div class="flex flex-col gap-2 sm:flex-row lg:flex-col">
									<Button
										variant="secondary"
										disabled={updatingId === propiedad.id}
										onclick={() => cambiarEstadoPropiedad(propiedad, 'BORRADOR')}
									>
										Validar datos
									</Button>
									<Button
										disabled={updatingId === propiedad.id}
										onclick={() => cambiarEstadoPropiedad(propiedad, 'DISPONIBLE')}
									>
										Publicar
									</Button>
									<Button
										variant="ghost"
										disabled={updatingId === propiedad.id}
										onclick={() => cambiarEstadoPropiedad(propiedad, 'ARCHIVADA')}
									>
										Descartar
									</Button>
								</div>
							</div>
						</article>
					{/each}
				</div>
			</Card>
		{/if}

		{#if disponibles.length > 0}
			<Card>
				<div class="mb-5">
					<h2 class="font-display text-xl font-bold text-text-main">Disponibles</h2>
					<p class="mt-1 text-sm text-text-muted">
						Propiedades listas para comercialización, visibles para el equipo de ventas.
					</p>
				</div>
				<PropiedadAdminTable propiedades={disponibles} onPropiedadClick={verDetalle} />
			</Card>
		{/if}

		{#if otras.length > 0}
			<Card>
				<div class="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
					<div>
						<h2 class="font-display text-xl font-bold text-text-main">Otras propiedades</h2>
						<p class="mt-1 text-sm text-text-muted">
							Propiedades en validación, reservadas, vendidas o descartadas.
						</p>
					</div>
					<p class="text-sm font-semibold text-primary">{otras.length} registros</p>
				</div>
				<PropiedadAdminTable propiedades={otras} onPropiedadClick={verDetalle} />
			</Card>
		{/if}
	{/if}
</div>
