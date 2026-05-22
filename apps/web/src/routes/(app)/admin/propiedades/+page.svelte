<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
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
	let createSuccess = $state<string | null>(null);
	let reviewError = $state<string | null>(null);
	let reviewSuccess = $state<string | null>(null);
	let mostrarFormulario = $state(false);
	let titulo = $state('');
	let descripcion = $state('');
	let precio = $state('');
	let estado = $state('DISPONIBLE');
	let asesorResponsableId = $state('');
	const skeletonCards = [1, 2, 3];
	const estados = ['PRELIMINAR', 'EN_VALIDACION', 'DISPONIBLE', 'RESERVADA'];
	const propiedadesEnRevision = $derived(
		propiedades.filter((propiedad) =>
			['PRELIMINAR', 'EN_VALIDACION'].includes(propiedad.estado.toUpperCase())
		)
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
		createSuccess = null;

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
			createSuccess = 'Propiedad ALVAS registrada correctamente.';
			limpiarFormulario();
			mostrarFormulario = false;
			await cargarPropiedades();
		} catch (err) {
			createError =
				err instanceof HttpError ? err.message : 'No se pudo registrar la propiedad ALVAS.';
		} finally {
			creating = false;
		}
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
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Administración</p>
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Catálogo de propiedades</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Consulta el inventario registrado, revisa disponibilidad y detecta propiedades sin asesor
				responsable.
			</p>
		</div>

		<Button variant="secondary" onclick={cargarPropiedades} class="md:self-end">
			Actualizar listado
		</Button>
	</div>

	<Card>
		<div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
			<div>
				<h2 class="font-display text-xl font-bold text-text-main">Registrar propiedad ALVAS</h2>
				<p class="mt-1 max-w-2xl text-sm leading-relaxed text-text-muted">
					Alta directa de propiedades que pertenecen al inventario de la empresa, sin asociarlas a
					un cliente propietario.
				</p>
			</div>
			<Button
				variant={mostrarFormulario ? 'ghost' : 'primary'}
				onclick={() => (mostrarFormulario = !mostrarFormulario)}
			>
				{mostrarFormulario ? 'Cerrar formulario' : 'Nueva propiedad'}
			</Button>
		</div>

		{#if createSuccess}
			<p class="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
				{createSuccess}
			</p>
		{/if}

		{#if createError}
			<p class="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
				{createError}
			</p>
		{/if}

		{#if mostrarFormulario}
			<form class="mt-6 grid gap-4 md:grid-cols-2" onsubmit={registrarPropiedad}>
				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
					Título
					<input
						bind:value={titulo}
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="Terreno en zona residencial"
					/>
				</label>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
					Precio
					<input
						bind:value={precio}
						type="number"
						min="0"
						step="0.01"
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="150000"
					/>
				</label>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main md:col-span-2">
					Descripción
					<textarea
						bind:value={descripcion}
						rows="4"
						class="resize-none rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="Ubicación, metraje, accesos y observaciones comerciales."
					></textarea>
				</label>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
					Estado inicial
					<select
						bind:value={estado}
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
					>
						{#each estados as item (item)}
							<option value={item}>{item}</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
					Asesor responsable
					<input
						bind:value={asesorResponsableId}
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="ID del asesor, opcional"
					/>
				</label>

				<div class="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
					<Button type="button" variant="ghost" onclick={limpiarFormulario}>Limpiar</Button>
					<Button type="submit" disabled={creating}>
						{creating ? 'Registrando...' : 'Registrar propiedad'}
					</Button>
				</div>
			</form>
		{/if}
	</Card>

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
			<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
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
		<Card>
			<div class="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
				<div>
					<h2 class="font-display text-xl font-bold text-text-main">Revisión de captaciones</h2>
					<p class="mt-1 text-sm text-text-muted">
						Propiedades que todavía no deben mostrarse al equipo comercial ni al público.
					</p>
				</div>
				<p class="text-sm font-semibold text-primary">
					{propiedadesEnRevision.length} pendientes
				</p>
			</div>

			{#if reviewSuccess}
				<p class="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
					{reviewSuccess}
				</p>
			{/if}

			{#if reviewError}
				<p class="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
					{reviewError}
				</p>
			{/if}

			{#if propiedadesEnRevision.length === 0}
				<p class="rounded-2xl bg-surface-muted px-4 py-5 text-sm text-text-muted">
					No hay propiedades preliminares o en validación.
				</p>
			{:else}
				<div class="grid gap-4">
					{#each propiedadesEnRevision as propiedad (propiedad.id)}
						<article class="rounded-2xl border border-border-light bg-bg-base p-5">
							<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
								<div>
									<div class="flex flex-wrap items-center gap-2">
										<p class="font-display text-lg font-bold text-text-main">
											{propiedad.titulo}
										</p>
										<span
											class="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-dark"
										>
											{propiedad.estado}
										</span>
										<span
											class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-text-muted"
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
										onclick={() => cambiarEstadoPropiedad(propiedad, 'EN_VALIDACION')}
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
										onclick={() => cambiarEstadoPropiedad(propiedad, 'DESCARTADA')}
									>
										Descartar
									</Button>
								</div>
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</Card>

		<Card>
			<div class="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
				<div>
					<h2 class="font-display text-xl font-bold text-text-main">Inventario registrado</h2>
					<p class="mt-1 text-sm text-text-muted">
						Datos cargados directamente desde la API de propiedades.
					</p>
				</div>
				<p class="text-sm font-semibold text-primary">{propiedades.length} registros</p>
			</div>

			<PropiedadAdminTable {propiedades} />
		</Card>
	{/if}
</div>
