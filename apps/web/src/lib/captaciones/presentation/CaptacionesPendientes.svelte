<script lang="ts">
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { HttpError } from '$lib/shared/http/httpClient';
	import {
		convertirCaptacion,
		marcarCaptacionDuplicada,
		rechazarCaptacion,
		revisarCaptacion
	} from '../application/use-cases/gestionarCaptacionPendiente';
	import { listarCaptacionesPendientes } from '../application/use-cases/listarCaptacionesPendientes';
	import { captacionRepository } from '../infrastructure/captacionRepository';
	import type { CaptacionPendiente } from '../domain/models/CaptacionPendiente';
	import { presentarEstadoCaptacion, presentarTipoVenta } from '$lib/shared/presentation';

	let captaciones = $state<CaptacionPendiente[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let accionando = $state<string | null>(null);
	let razonPorCaptacion = $state<Record<string, string>>({});
	let idAsesorPorCaptacion = $state<Record<string, string>>({});
	const basePath = $derived($page.url.pathname.startsWith('/admin') ? '/admin' : '/asesor');

	const pendientes = $derived(captaciones.filter((captacion) => captacion.estado === 'PENDIENTE'));
	const revisadas = $derived(captaciones.filter((captacion) => captacion.estado === 'REVISADA'));

	async function cargar() {
		loading = true;
		error = null;
		try {
			captaciones = await listarCaptacionesPendientes(captacionRepository);
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudieron cargar las captaciones.';
		} finally {
			loading = false;
		}
	}

	async function ejecutar(id: string, accion: () => Promise<unknown>) {
		accionando = id;
		error = null;
		try {
			await accion();
			await cargar();
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo procesar la captacion.';
		} finally {
			accionando = null;
		}
	}

	function formatearFecha(iso: string): string {
		return new Date(iso).toLocaleString('es-PE', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	$effect(() => {
		cargar();
	});
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<p class="section-label">Captaciones WhatsApp</p>
			<h1 class="page-heading">Bandeja de revisión</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Prospectos captados desde WhatsApp antes de convertirse en leads operativos.
			</p>
		</div>
		<Button onclick={cargar} disabled={loading}>{loading ? 'Cargando...' : 'Actualizar'}</Button>
	</div>

	<div class="grid gap-4 md:grid-cols-3">
		<Card>
			<p class="stat-label">Pendientes</p>
			<p class="page-heading">{pendientes.length}</p>
		</Card>
		<Card>
			<p class="stat-label">Revisadas</p>
			<p class="page-heading">{revisadas.length}</p>
		</Card>
		<Card>
			<p class="stat-label">Total visible</p>
			<p class="page-heading">{captaciones.length}</p>
		</Card>
	</div>

	{#if error}
		<Card class="border-red-200 bg-red-50/60">
			<p class="text-sm font-semibold text-red-700">{error}</p>
		</Card>
	{/if}

	{#if loading}
		<Card>
			<div class="h-56 animate-pulse rounded-xl bg-surface-muted"></div>
		</Card>
	{:else if captaciones.length === 0}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No hay captaciones pendientes</p>
			<p class="mt-2 text-sm text-text-muted">
				Los mensajes nuevos de WhatsApp aparecerán aquí para revisión.
			</p>
		</Card>
	{:else}
		<div class="grid gap-4">
			{#each captaciones as captacion (captacion.id)}
				<Card>
					<div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
						<div class="min-w-0 flex-1">
							<div class="flex flex-wrap items-center gap-2">
								<h2 class="font-display text-xl font-bold text-text-main">{captacion.nombre}</h2>
								<Badge tone={presentarEstadoCaptacion(captacion.estado).tone}
									>{presentarEstadoCaptacion(captacion.estado).label}</Badge
								>
								<Badge tone={presentarTipoVenta(captacion.tipo).tone}>
									{presentarTipoVenta(captacion.tipo).label}
								</Badge>
							</div>
							<div class="mt-3 grid gap-2 text-sm text-text-muted md:grid-cols-2">
								<p>
									<span class="font-semibold text-text-main">Teléfono:</span>
									{captacion.telefono}
								</p>
								<p><span class="font-semibold text-text-main">Email:</span> {captacion.email}</p>
								<p><span class="font-semibold text-text-main">Canal:</span> {captacion.canal}</p>
								<p><span class="font-semibold text-text-main">Origen:</span> {captacion.origen}</p>
								<p>
									<span class="font-semibold text-text-main">Captada:</span>
									{formatearFecha(captacion.creadoEn)}
								</p>
								{#if captacion.idPropiedadInteres}
									<p>
										<span class="font-semibold text-text-main">Propiedad interés:</span>
										{captacion.idPropiedadInteres}
									</p>
								{/if}
							</div>
							{#if captacion.metadata}
								<div class="mt-3 flex flex-wrap gap-2">
									{#each Object.entries(captacion.metadata) as [clave, valor] (clave)}
										<span
											class="rounded-md border border-border-light bg-surface-muted px-2 py-1 text-xs font-medium text-text-muted"
										>
											{clave}: {valor}
										</span>
									{/each}
								</div>
							{/if}
						</div>

						<div class="flex w-full flex-col gap-3 xl:w-80">
							<div class="grid grid-cols-2 gap-2">
								<Button
									variant="ghost"
									disabled={accionando === captacion.id}
									onclick={() =>
										ejecutar(captacion.id, () =>
											revisarCaptacion(captacionRepository, captacion.id)
										)}
								>
									Revisar
								</Button>
								<Button
									disabled={accionando === captacion.id}
									onclick={() =>
										ejecutar(captacion.id, async () => {
											const resultado = await convertirCaptacion(
												captacionRepository,
												captacion.id,
												idAsesorPorCaptacion[captacion.id] || undefined
											);
											await goto(`${basePath}/leads/${encodeURIComponent(resultado.idLead)}`);
										})}
								>
									Convertir
								</Button>
							</div>

							<input
								class="rounded-lg border border-border-light bg-bg-card px-3 py-2 text-sm outline-none focus:border-primary"
								placeholder="ID asesor opcional para admin"
								value={idAsesorPorCaptacion[captacion.id] ?? ''}
								oninput={(event) =>
									(idAsesorPorCaptacion = {
										...idAsesorPorCaptacion,
										[captacion.id]: event.currentTarget.value
									})}
							/>

							<textarea
								class="min-h-20 rounded-lg border border-border-light bg-bg-card px-3 py-2 text-sm outline-none focus:border-primary"
								placeholder="Razón para duplicar o rechazar"
								value={razonPorCaptacion[captacion.id] ?? ''}
								oninput={(event) =>
									(razonPorCaptacion = {
										...razonPorCaptacion,
										[captacion.id]: event.currentTarget.value
									})}
							></textarea>
							<div class="grid grid-cols-2 gap-2">
								<Button
									variant="ghost"
									disabled={accionando === captacion.id}
									onclick={() =>
										ejecutar(captacion.id, () =>
											marcarCaptacionDuplicada(
												captacionRepository,
												captacion.id,
												razonPorCaptacion[captacion.id] ?? ''
											)
										)}
								>
									Duplicada
								</Button>
								<Button
									variant="ghost"
									disabled={accionando === captacion.id}
									onclick={() =>
										ejecutar(captacion.id, () =>
											rechazarCaptacion(
												captacionRepository,
												captacion.id,
												razonPorCaptacion[captacion.id]
											)
										)}
								>
									Rechazar
								</Button>
							</div>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
