<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { CitaPipeline, LeadPipeline } from '$lib/ventas/domain/models/LeadPipeline';
	import {
		actualizarCita,
		type EstadoCita
	} from '$lib/ventas/application/use-cases/actualizarCita';
	import { agendarCita } from '$lib/ventas/application/use-cases/agendarCita';
	import { listarPipeline } from '$lib/ventas/application/use-cases/listarPipeline';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';
	import LeadPipelineTable from '$lib/ventas/presentation/LeadPipelineTable.svelte';

	let leads = $state<LeadPipeline[]>([]);
	let loading = $state(true);
	let creating = $state(false);
	let mostrarPanelCrear = $state(false);
	let mostrarPanelEditar = $state(false);
	let error = $state<string | null>(null);
	let createError = $state<string | null>(null);
	let updating = $state(false);

	let idLead = $state('');
	let idPropiedad = $state('');
	let fechaInicio = $state('');
	let duracionMinutos = $state('60');
	let observacion = $state('');

	let editKey = $state('');
	let editLeadNombre = $state('');
	let editIdLead = $state('');
	let editFechaInicio = $state('');
	let editDuracionMinutos = $state('');
	let editEstado = $state<EstadoCita | ''>('');
	let editObservacion = $state('');

	const leadsConCitas = $derived(leads.filter((lead) => lead.citasCount > 0));
	const citasAgenda = $derived(
		leads.flatMap((lead) =>
			lead.citas.map((cita) => ({
				...cita,
				key: `${lead.id}::${cita.id}`,
				leadNombre: lead.nombre,
				leadTipo: lead.tipo
			}))
		)
	);

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
		mostrarPanelCrear = false;
	}

	function limpiarFormularioEdicion() {
		editKey = '';
		editLeadNombre = '';
		editIdLead = '';
		editFechaInicio = '';
		editDuracionMinutos = '';
		editEstado = '';
		editObservacion = '';
		mostrarPanelEditar = false;
	}

	function abrirEditarCita(
		cita: CitaPipeline & { leadNombre: string; key: string; idLead: string }
	) {
		editKey = cita.key;
		editLeadNombre = cita.leadNombre;
		editIdLead = cita.idLead;
		editFechaInicio = cita.fechaInicio.slice(0, 16);
		editDuracionMinutos = String(
			Math.round((new Date(cita.fechaFin).getTime() - new Date(cita.fechaInicio).getTime()) / 60000)
		);
		editEstado = cita.estado as EstadoCita;
		editObservacion = cita.observacion ?? '';
		mostrarPanelEditar = true;
	}

	function formatearFecha(fechaIso: string): string {
		return new Intl.DateTimeFormat('es-PE', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(fechaIso));
	}

	async function crearCita(event: SubmitEvent) {
		event.preventDefault();
		createError = null;

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
			limpiarFormularioCita();
			await cargarCitas();
		} catch (err) {
			createError = err instanceof HttpError ? err.message : 'No se pudo agendar la cita.';
		} finally {
			creating = false;
		}
	}

	async function editarCita(event: SubmitEvent) {
		event.preventDefault();
		error = null;

		const duracion = editDuracionMinutos ? Number(editDuracionMinutos) : undefined;

		if (!editKey) {
			error = 'Selecciona una cita registrada.';
			return;
		}

		if (
			!editFechaInicio.trim() &&
			!editDuracionMinutos.trim() &&
			!editEstado &&
			!editObservacion.trim()
		) {
			error = 'Indica al menos un cambio para la cita.';
			return;
		}

		if (duracion !== undefined && (Number.isNaN(duracion) || duracion <= 0)) {
			error = 'La duración debe ser un número mayor que cero.';
			return;
		}

		updating = true;

		try {
			await actualizarCita(ventasRepository, {
				idLead: editIdLead,
				idCita: editKey.split('::')[1],
				fechaInicio: editFechaInicio ? new Date(editFechaInicio).toISOString() : undefined,
				duracionMinutos: duracion,
				estado: editEstado || undefined,
				observacion: editObservacion.trim() || undefined
			});
			limpiarFormularioEdicion();
			await cargarCitas();
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo actualizar la cita.';
		} finally {
			updating = false;
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
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Gestión de citas</h1>
		</div>

		<Button variant="secondary" onclick={() => (mostrarPanelCrear = true)}
			>Agendar nueva cita</Button
		>
	</div>

	<SidePanel
		isOpen={mostrarPanelCrear}
		title="Nueva cita"
		onClose={() => (mostrarPanelCrear = false)}
	>
		<form class="grid gap-4" onsubmit={crearCita}>
			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Lead
				<select
					bind:value={idLead}
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
				>
					<option value="">Selecciona un lead</option>
					{#each leads as lead (lead.id)}
						<option value={lead.id}>{lead.nombre}</option>
					{/each}
				</select>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Propiedad (opcional)
				<input
					bind:value={idPropiedad}
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
					placeholder="ID de propiedad"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Fecha y hora
				<input
					bind:value={fechaInicio}
					type="datetime-local"
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Duración (minutos)
				<input
					bind:value={duracionMinutos}
					type="number"
					min="15"
					step="15"
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Observación
				<textarea
					bind:value={observacion}
					rows="3"
					class="resize-none rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
				></textarea>
			</label>

			{#if createError}
				<p class="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
					{createError}
				</p>
			{/if}

			<Button type="submit" disabled={creating}>
				{creating ? 'Agendando...' : 'Guardar cita'}
			</Button>
		</form>
	</SidePanel>

	<SidePanel
		isOpen={mostrarPanelEditar}
		title={editLeadNombre ? `Editar cita - ${editLeadNombre}` : 'Editar cita'}
		onClose={() => (mostrarPanelEditar = false)}
	>
		<form class="grid gap-4" onsubmit={editarCita}>
			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Fecha y hora
				<input
					bind:value={editFechaInicio}
					type="datetime-local"
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Duración (minutos)
				<input
					bind:value={editDuracionMinutos}
					type="number"
					min="15"
					step="15"
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
					placeholder="Sin cambio"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Estado
				<select
					bind:value={editEstado}
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
				>
					<option value="">Sin cambio</option>
					<option value="PENDIENTE">Pendiente</option>
					<option value="REALIZADA">Realizada</option>
					<option value="CANCELADA">Cancelada</option>
					<option value="REPROGRAMADA">Reprogramada</option>
				</select>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Observación
				<textarea
					bind:value={editObservacion}
					rows="3"
					class="resize-none rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
					placeholder="Motivo de reprogramación, cierre de visita o cancelación."
				></textarea>
			</label>

			{#if error}
				<p class="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
					{error}
				</p>
			{/if}

			<div class="flex gap-3">
				<Button type="button" variant="ghost" onclick={limpiarFormularioEdicion}>Cancelar</Button>
				<Button type="submit" disabled={updating}>
					{updating ? 'Actualizando...' : 'Guardar cambios'}
				</Button>
			</div>
		</form>
	</SidePanel>

	{#if loading}
		<Card>
			<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
		</Card>
	{:else if error && !mostrarPanelEditar}
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
			<div class="mb-5">
				<h2 class="font-display text-xl font-bold text-text-main">Agenda registrada</h2>
				<p class="mt-1 text-sm text-text-muted">
					Citas asociadas a tus leads, disponibles para seguimiento y actualización.
				</p>
			</div>

			<div class="grid gap-3">
				{#each citasAgenda as cita (cita.key)}
					<div
						class="grid items-center gap-3 rounded-2xl border border-border-light bg-white px-4 py-3 md:grid-cols-[1.2fr_0.9fr_auto_auto]"
					>
						<div>
							<p class="font-semibold text-text-main">{cita.leadNombre}</p>
							<p class="mt-1 text-xs font-medium text-text-muted">{cita.leadTipo}</p>
						</div>
						<div>
							<p class="text-sm font-semibold text-text-main">{formatearFecha(cita.fechaInicio)}</p>
							<p class="mt-1 text-xs text-text-muted">
								{cita.observacion ?? 'Sin observación registrada'}
							</p>
						</div>
						<p
							class="rounded-full bg-primary-light px-3 py-1 text-center text-xs font-bold text-primary-dark"
						>
							{cita.estado}
						</p>
						<Button variant="ghost" onclick={() => abrirEditarCita(cita)}>Editar</Button>
					</div>
				{/each}
			</div>
		</Card>

		<Card>
			<LeadPipelineTable leads={leadsConCitas} />
		</Card>
	{/if}
</div>
