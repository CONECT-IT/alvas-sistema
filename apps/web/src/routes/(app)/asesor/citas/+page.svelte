<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { LeadPipeline } from '$lib/ventas/domain/models/LeadPipeline';
	import { agendarCita } from '$lib/ventas/application/use-cases/agendarCita';
	import { listarPipeline } from '$lib/ventas/application/use-cases/listarPipeline';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';
	import LeadPipelineTable from '$lib/ventas/presentation/LeadPipelineTable.svelte';

	let leads = $state<LeadPipeline[]>([]);
	let loading = $state(true);
	let creating = $state(false);
	let error = $state<string | null>(null);
	let createError = $state<string | null>(null);
	let createSuccess = $state<string | null>(null);
	let idLead = $state('');
	let idPropiedad = $state('');
	let fechaInicio = $state('');
	let duracionMinutos = $state('60');
	let observacion = $state('');
	const leadsConCitas = $derived(leads.filter((lead) => lead.citasCount > 0));

	async function cargarCitas() {
		loading = true;
		error = null;

		try {
			leads = await listarPipeline(ventasRepository);
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar la agenda.';
		} finally {
			loading = false;
		}
	}

	function limpiarFormularioCita() {
		idLead = '';
		idPropiedad = '';
		fechaInicio = '';
		duracionMinutos = '60';
		observacion = '';
	}

	async function crearCita(event: SubmitEvent) {
		event.preventDefault();
		createError = null;
		createSuccess = null;

		const duracion = Number(duracionMinutos);

		if (!idLead.trim() || !fechaInicio.trim() || Number.isNaN(duracion) || duracion <= 0) {
			createError = 'Completa lead, fecha de inicio y duración válida.';
			return;
		}

		creating = true;

		try {
			await agendarCita(ventasRepository, {
				idLead: idLead.trim(),
				idPropiedad: idPropiedad.trim() || undefined,
				fechaInicio: new Date(fechaInicio).toISOString(),
				duracionMinutos: duracion,
				observacion: observacion.trim() || undefined
			});
			createSuccess = 'Cita agendada correctamente.';
			limpiarFormularioCita();
			await cargarCitas();
		} catch (err) {
			createError = err instanceof HttpError ? err.message : 'No se pudo agendar la cita.';
		} finally {
			creating = false;
		}
	}

	$effect(() => {
		cargarCitas();
	});
</script>

<svelte:head>
	<title>Agenda de Citas | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Agenda</p>
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Leads con citas</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Seguimiento de prospectos que ya tienen una cita o contacto programado en la cartera.
			</p>
		</div>

		<Button variant="secondary" onclick={cargarCitas}>Actualizar agenda</Button>
	</div>

	<Card>
		<div class="mb-5">
			<h2 class="font-display text-xl font-bold text-text-main">Agendar cita</h2>
			<p class="mt-1 text-sm leading-relaxed text-text-muted">
				Programa una visita, llamada o seguimiento sobre un lead activo. Puedes asociar una
				propiedad si la cita corresponde a una visita concreta.
			</p>
		</div>

		{#if createSuccess}
			<p class="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
				{createSuccess}
			</p>
		{/if}

		{#if createError}
			<p class="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
				{createError}
			</p>
		{/if}

		<form class="grid gap-4 md:grid-cols-2" onsubmit={crearCita}>
			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Lead
				<input
					bind:value={idLead}
					list="leads-disponibles"
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
					placeholder="ID del lead"
				/>
				<datalist id="leads-disponibles">
					{#each leads as lead (lead.id)}
						<option value={lead.id}>{lead.nombre}</option>
					{/each}
				</datalist>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Fecha y hora
				<input
					bind:value={fechaInicio}
					type="datetime-local"
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Duración
				<input
					bind:value={duracionMinutos}
					type="number"
					min="15"
					step="15"
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
					placeholder="60"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Propiedad opcional
				<input
					bind:value={idPropiedad}
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
					placeholder="ID de propiedad"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main md:col-span-2">
				Observación
				<textarea
					bind:value={observacion}
					rows="3"
					class="resize-none rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
					placeholder="Motivo, dirección, documentos o acuerdos previos."
				></textarea>
			</label>

			<div class="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
				<Button type="button" variant="ghost" onclick={limpiarFormularioCita}>Limpiar</Button>
				<Button type="submit" disabled={creating}>
					{creating ? 'Agendando...' : 'Agendar cita'}
				</Button>
			</div>
		</form>
	</Card>

	{#if loading}
		<Card>
			<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudo cargar la agenda</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargarCitas}>Intentar nuevamente</Button>
		</Card>
	{:else if leadsConCitas.length === 0}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No hay citas registradas</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">
				Cuando agendes citas desde la cartera comercial, aparecerán en esta vista.
			</p>
		</Card>
	{:else}
		<Card>
			<LeadPipelineTable leads={leadsConCitas} />
		</Card>
	{/if}
</div>
