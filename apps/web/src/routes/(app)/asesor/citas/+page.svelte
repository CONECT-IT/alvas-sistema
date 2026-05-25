<script lang="ts">
	import { goto } from '$app/navigation';
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import DateTimePicker from '$lib/shared/ui/DateTimePicker.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import { presentarEstadoCita, opcionesEstadoCita } from '$lib/shared/presentation';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { CitaPipeline, LeadPipeline } from '$lib/ventas/domain/models/LeadPipeline';
	import type { Propiedad } from '$lib/propiedades/domain/models/Propiedad';
	import { listarPropiedades } from '$lib/propiedades/application/use-cases/listarPropiedades';
	import { propiedadRepository } from '$lib/propiedades/infrastructure/propiedadRepository';
	import {
		actualizarCita,
		type EstadoCita
	} from '$lib/ventas/application/use-cases/actualizarCita';
	import { agendarCita } from '$lib/ventas/application/use-cases/agendarCita';
	import { listarPipeline } from '$lib/ventas/application/use-cases/listarPipeline';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';
	import LeadPipelineTable from '$lib/ventas/presentation/LeadPipelineTable.svelte';

	let leads = $state<LeadPipeline[]>([]);
	let propiedadesDisponibles = $state<Propiedad[]>([]);
	let loading = $state(true);
	let creating = $state(false);
	let mostrarPanelCrear = $state(false);
	let mostrarPanelEditar = $state(false);
	let error = $state<string | null>(null);
	let createError = $state<string | null>(null);
	let updating = $state(false);

	let idLead = $state('');
	let idPropiedad = $state('');
	let fechaCita = $state('');
	let horaCita = $state('');
	let duracionMinutos = $state('');
	let observacion = $state('');

	let editKey = $state('');
	let editLeadNombre = $state('');
	let editIdLead = $state('');
	let editFechaCita = $state('');
	let editHoraCita = $state('');
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
			const [leadsResult, propiedadesResult] = await Promise.all([
				listarPipeline(ventasRepository),
				listarPropiedades(propiedadRepository)
			]);
			leads = leadsResult;
			propiedadesDisponibles = propiedadesResult.filter(
				(propiedad) => propiedad.estado.toUpperCase() === 'DISPONIBLE'
			);
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar la agenda.';
		} finally {
			loading = false;
		}
	}

	function limpiarFormularioCita() {
		idLead = '';
		idPropiedad = '';
		fechaCita = '';
		horaCita = '';
		duracionMinutos = '';
		observacion = '';
		mostrarPanelCrear = false;
	}

	function limpiarFormularioEdicion() {
		editKey = '';
		editLeadNombre = '';
		editIdLead = '';
		editFechaCita = '';
		editHoraCita = '';
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
		const fechaHora = obtenerFechaHoraLocal(cita.fechaInicio);
		editFechaCita = fechaHora.fecha;
		editHoraCita = fechaHora.hora;
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

	function etiquetaPropiedad(propiedad: Propiedad): string {
		return `${propiedad.titulo} - S/ ${propiedad.precio.toLocaleString('es-PE')}`;
	}

	function crearFechaHoraLocal(fecha: string, hora: string): Date | null {
		if (!fecha || !hora) return null;
		const date = new Date(`${fecha}T${hora}:00`);
		return Number.isNaN(date.getTime()) ? null : date;
	}

	function obtenerFechaHoraLocal(iso: string): { fecha: string; hora: string } {
		const date = new Date(iso);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return { fecha: `${year}-${month}-${day}`, hora: `${hours}:${minutes}` };
	}

	async function crearCita(event: SubmitEvent) {
		event.preventDefault();
		createError = null;

		const duracion = Number(duracionMinutos);
		const fechaInicio = crearFechaHoraLocal(fechaCita, horaCita);

		if (!idLead.trim() || !fechaInicio || Number.isNaN(duracion) || duracion <= 0) {
			createError = 'Completa lead, fecha, hora y duración válida.';
			return;
		}

		creating = true;

		try {
			await agendarCita(ventasRepository, {
				idLead: idLead.trim(),
				idPropiedad: idPropiedad.trim() || undefined,
				fechaInicio: fechaInicio.toISOString(),
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
			!editFechaCita.trim() &&
			!editHoraCita.trim() &&
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
			const fechaInicio =
				editFechaCita && editHoraCita ? crearFechaHoraLocal(editFechaCita, editHoraCita) : null;

			if ((editFechaCita || editHoraCita) && !fechaInicio) {
				error = 'Selecciona fecha y hora para reprogramar la cita.';
				return;
			}

			await actualizarCita(ventasRepository, {
				idLead: editIdLead,
				idCita: editKey.split('::')[1],
				fechaInicio: fechaInicio ? fechaInicio.toISOString() : undefined,
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

	function verDetalle(lead: LeadPipeline) {
		goto(`/asesor/leads/${lead.id}`);
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
			<p class="section-label">Agenda</p>
			<h1 class="page-heading">Gestión de citas</h1>
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
			<label class="label-field">
				Lead
				<select bind:value={idLead} class="input-field">
					<option value="">Selecciona un lead</option>
					{#each leads as lead (lead.id)}
						<option value={lead.id}>{lead.nombre}</option>
					{/each}
				</select>
			</label>

			<label class="label-field">
				Propiedad (opcional)
				<select bind:value={idPropiedad} class="input-field">
					<option value="">Sin propiedad asociada</option>
					{#each propiedadesDisponibles as propiedad (propiedad.id)}
						<option value={propiedad.id}>{etiquetaPropiedad(propiedad)}</option>
					{/each}
				</select>
			</label>

			<DateTimePicker bind:fecha={fechaCita} bind:hora={horaCita} required />

			<label class="label-field">
				Duración
				<select bind:value={duracionMinutos} class="input-field" required>
					<option value="">Selecciona duración</option>
					<option value="30">30 minutos</option>
					<option value="45">45 minutos</option>
					<option value="60">1 hora</option>
					<option value="90">1 hora 30 minutos</option>
					<option value="120">2 horas</option>
				</select>
			</label>

			<label class="label-field">
				Observación
				<textarea bind:value={observacion} rows="3" class="input-field resize-none"></textarea>
			</label>

			{#if createError}
				<p class="error-alert">
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
			<DateTimePicker bind:fecha={editFechaCita} bind:hora={editHoraCita} />

			<label class="label-field">
				Duración
				<select bind:value={editDuracionMinutos} class="input-field">
					<option value="">Sin cambio</option>
					<option value="30">30 minutos</option>
					<option value="45">45 minutos</option>
					<option value="60">1 hora</option>
					<option value="90">1 hora 30 minutos</option>
					<option value="120">2 horas</option>
				</select>
			</label>

			<label class="label-field">
				Estado
				<select bind:value={editEstado} class="input-field">
					<option value="">Sin cambio</option>
					{#each opcionesEstadoCita() as opt (opt.value)}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</label>

			<label class="label-field">
				Observación
				<textarea
					bind:value={editObservacion}
					rows="3"
					class="input-field resize-none"
					placeholder="Motivo de reprogramación, cierre de visita o cancelación."
				></textarea>
			</label>

			{#if error}
				<p class="error-alert">
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
			<div class="skeleton"></div>
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
						class="grid items-center gap-3 rounded-2xl border border-border-light bg-bg-card px-4 py-3 md:grid-cols-[1.2fr_0.9fr_auto_auto]"
					>
						<div>
							<p class="font-semibold text-text-main">{cita.leadNombre}</p>
							<p class="mt-1 text-xs font-medium text-text-muted">Interés: {cita.leadTipo}</p>
						</div>
						<div>
							<p class="text-sm font-semibold text-text-main">{formatearFecha(cita.fechaInicio)}</p>
							<p class="mt-1 text-xs text-text-muted">
								{cita.observacion ?? 'Sin observación registrada'}
							</p>
						</div>
						<div class="flex items-center">
							<Badge tone={presentarEstadoCita(cita.estado).tone}>
								{presentarEstadoCita(cita.estado).label}
							</Badge>
						</div>
						<Button variant="ghost" onclick={() => abrirEditarCita(cita)}>Editar</Button>
					</div>
				{/each}
			</div>
		</Card>

		<Card>
			<LeadPipelineTable leads={leadsConCitas} onLeadClick={verDetalle} />
		</Card>
	{/if}
</div>
