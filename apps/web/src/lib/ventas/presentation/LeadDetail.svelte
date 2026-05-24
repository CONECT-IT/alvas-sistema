<script lang="ts">
	import Badge from '$lib/shared/ui/Badge.svelte';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { LeadDetalle } from '../domain/models/LeadDetalle';
	import { actualizarLead } from '../application/use-cases/actualizarLead';
	import { agendarCita } from '../application/use-cases/agendarCita';
	import { convertirLead } from '../application/use-cases/convertirLead';
	import { crearContrato } from '../application/use-cases/crearContrato';
	import { obtenerLead } from '../application/use-cases/obtenerLead';
	import { listarPropiedadesPorCliente } from '../application/use-cases/listarPropiedadesPorCliente';
	import { ventasRepository } from '../infrastructure/ventasRepository';
	import ActividadLeadTimeline from './ActividadLeadTimeline.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Propiedad } from '$lib/propiedades/domain/models/Propiedad';
	import { obtenerPropiedad } from '$lib/propiedades/application/use-cases/obtenerPropiedad';
	import { propiedadRepository } from '$lib/propiedades/infrastructure/propiedadRepository';
	import { presentarEstadoLead, presentarTipoVenta, presentarEstadoCita, presentarEstadoPropiedad, opcionesEstadoLead } from '$lib/shared/presentation';

	interface Props {
		leadId: string;
	}

	let { leadId }: Props = $props();

	let lead = $state<LeadDetalle | null>(null);
	let propiedadesRelacionadas = $state<string[]>([]);
	let propiedadesDetalle = $state<Propiedad[]>([]);
	let propiedadInteres = $state<Propiedad | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let accionError = $state<string | null>(null);
	let panel = $state<'editar' | 'cita' | 'contrato' | null>(null);
	let guardando = $state(false);
	let formLead = $state({
		nombre: '',
		email: '',
		telefono: '',
		estado: 'NUEVO',
		idPropiedadInteres: ''
	});
	let formCita = $state({
		fechaInicio: '',
		duracionMinutos: 60,
		observacion: '',
		idPropiedad: ''
	});
	let formContrato = $state({
		idPropiedad: '',
		fechaInicio: '',
		fechaFin: ''
	});
	let basePath = $derived($page.url.pathname.startsWith('/admin') ? '/admin' : '/asesor');
	let propiedadesPorId = $derived(new Map(propiedadesDetalle.map((p) => [p.id, p])));

	async function cargar() {
		if (!leadId.trim()) {
			lead = null;
			loading = false;
			return;
		}
		loading = true;
		error = null;
		try {
			lead = await obtenerLead(ventasRepository, leadId.trim());
			if (lead) {
				propiedadesRelacionadas = await listarPropiedadesPorCliente(ventasRepository, lead.id);
				if (lead.idPropiedadInteres) {
					try {
						propiedadInteres = await obtenerPropiedad(propiedadRepository, lead.idPropiedadInteres);
					} catch {
						propiedadInteres = null;
					}
				} else {
					propiedadInteres = null;
				}

				if (propiedadesRelacionadas.length > 0) {
					const props = await Promise.all(
						propiedadesRelacionadas.map(async (id) => {
							try {
								return await obtenerPropiedad(propiedadRepository, id);
							} catch {
								return null;
							}
						})
					);
					propiedadesDetalle = props.filter((p): p is Propiedad => p !== null);
				} else {
					propiedadesDetalle = [];
				}
			}
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar el lead.';
		} finally {
			loading = false;
		}
	}

	function abrirEditar() {
		if (!lead) return;
		formLead = {
			nombre: lead.nombre,
			email: lead.email,
			telefono: lead.telefono,
			estado: lead.estado,
			idPropiedadInteres: lead.idPropiedadInteres ?? ''
		};
		accionError = null;
		panel = 'editar';
	}

	function abrirCita() {
		formCita = {
			fechaInicio: '',
			duracionMinutos: 60,
			observacion: '',
			idPropiedad: lead?.idPropiedadInteres ?? ''
		};
		accionError = null;
		panel = 'cita';
	}

	function abrirContrato() {
		formContrato = {
			idPropiedad: lead?.idPropiedadInteres ?? '',
			fechaInicio: '',
			fechaFin: ''
		};
		accionError = null;
		panel = 'contrato';
	}

	async function guardarLead() {
		if (!lead) return;
		guardando = true;
		accionError = null;
		try {
			await actualizarLead(ventasRepository, {
				idLead: lead.id,
				nombre: formLead.nombre,
				email: formLead.email,
				telefono: formLead.telefono,
				estado: formLead.estado,
				idPropiedadInteres: formLead.idPropiedadInteres || undefined
			});
			panel = null;
			await cargar();
		} catch (err) {
			accionError = err instanceof HttpError ? err.message : 'No se pudo actualizar el lead.';
		} finally {
			guardando = false;
		}
	}

	async function guardarCita() {
		if (!lead) return;
		guardando = true;
		accionError = null;
		try {
			await agendarCita(ventasRepository, {
				idLead: lead.id,
				fechaInicio: new Date(formCita.fechaInicio).toISOString(),
				duracionMinutos: Number(formCita.duracionMinutos),
				observacion: formCita.observacion || undefined,
				idPropiedad: formCita.idPropiedad || undefined
			});
			panel = null;
			await cargar();
		} catch (err) {
			accionError = err instanceof HttpError ? err.message : 'No se pudo agendar la cita.';
		} finally {
			guardando = false;
		}
	}

	async function convertir() {
		if (!lead) return;
		guardando = true;
		accionError = null;
		try {
			const idCliente = await convertirLead(ventasRepository, { idLead: lead.id });
			await goto(`${basePath}/clientes/${encodeURIComponent(idCliente)}`);
		} catch (err) {
			accionError = err instanceof HttpError ? err.message : 'No se pudo convertir el lead.';
		} finally {
			guardando = false;
		}
	}

	async function guardarContrato() {
		if (!lead) return;
		guardando = true;
		accionError = null;
		try {
			const contrato = await crearContrato(ventasRepository, {
				idLead: lead.id,
				idPropiedad: formContrato.idPropiedad,
				fechaInicio: new Date(formContrato.fechaInicio).toISOString(),
				fechaFin: new Date(formContrato.fechaFin).toISOString()
			});
			await goto(`${basePath}/contratos/${encodeURIComponent(contrato.id)}`);
		} catch (err) {
			accionError = err instanceof HttpError ? err.message : 'No se pudo crear el contrato.';
		} finally {
			guardando = false;
		}
	}

	function formatearFecha(iso: string): string {
		return new Date(iso).toLocaleDateString('es-PE', {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	$effect(() => {
		cargar();
	});
</script>

{#if loading}
	<Card>
		<div class="skeleton"></div>
	</Card>
{:else if error}
	<Card class="text-center">
		<p class="font-display text-xl font-bold text-text-main">No se pudo cargar el lead</p>
		<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
		<Button onclick={cargar}>Intentar nuevamente</Button>
	</Card>
{:else if lead}
	<div class="flex flex-col gap-6">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<div class="flex flex-wrap items-center gap-3">
					<h1 class="font-display text-3xl font-bold text-text-main">{lead.nombre}</h1>
					<Badge tone={presentarEstadoLead(lead.estado).tone}>{presentarEstadoLead(lead.estado).label}</Badge>
					<Badge tone={presentarTipoVenta(lead.tipo).tone}>{presentarTipoVenta(lead.tipo).label}</Badge>
				</div>
				<p class="mt-2 text-sm text-text-muted">
					ID: {lead.id} &middot; Asesor: {lead.idAsesor}
					{#if lead.idCliente}
						&middot; Cliente vinculado: {lead.idCliente}
					{/if}
				</p>
			</div>
			<div class="flex gap-2">
				<Button variant="secondary" onclick={abrirEditar}>Editar</Button>
				<Button variant="secondary" onclick={abrirCita}>Agendar cita</Button>
				{#if !lead.idCliente}
					<Button variant="secondary" onclick={convertir} disabled={guardando}>Convertir</Button>
				{/if}
				{#if lead.tipo === 'VENTA'}
					<Button onclick={abrirContrato}>Crear contrato</Button>
				{/if}
				<Button variant="ghost" onclick={() => window.history.back()}>Volver</Button>
			</div>
		</div>
		{#if accionError}
			<Card class="border-red-200 bg-red-50/60">
				<p class="text-sm font-semibold text-red-700">{accionError}</p>
			</Card>
		{/if}

		<div class="grid gap-6 xl:grid-cols-2">
			<Card>
				<h2 class="card-title">Información de contacto</h2>
				<dl class="dl-grid">
					<dt class="font-semibold text-text-muted">Email</dt>
					<dd class="text-text-main">{lead.email}</dd>
					<dt class="font-semibold text-text-muted">Teléfono</dt>
					<dd class="text-text-main">{lead.telefono}</dd>
					<dt class="font-semibold text-text-muted">Tipo</dt>
					<dd class="text-text-main">{lead.tipo}</dd>
					<dt class="font-semibold text-text-muted">Estado</dt>
					<dd class="text-text-main">{lead.estado}</dd>
					<dt class="font-semibold text-text-muted">Asesor asignado</dt>
					<dd class="text-text-main">{lead.nombreAsesor || lead.idAsesor}</dd>
					{#if lead.idPropiedadInteres}
						<dt class="font-semibold text-text-muted">Propiedad de interés</dt>
						<dd class="flex flex-wrap items-center gap-2">
							<span class="font-mono text-sm font-semibold text-text-main">
								{propiedadInteres?.titulo ?? lead.idPropiedadInteres}
							</span>
							<span class="text-xs text-text-muted">{lead.idPropiedadInteres}</span>
							<Button
								variant="ghost"
								onclick={() =>
									goto(
										`${basePath}/propiedades/${encodeURIComponent(lead.idPropiedadInteres ?? '')}`
									)}
							>
								Ver propiedad
							</Button>
						</dd>
					{/if}
					{#if lead.idCliente}
						<dt class="font-semibold text-text-muted">Cliente vinculado</dt>
						<dd class="flex flex-wrap items-center gap-2">
							<span class="font-mono text-sm font-semibold text-text-main">{lead.idCliente}</span>
							<Button
								variant="ghost"
								onclick={() =>
									goto(`${basePath}/clientes/${encodeURIComponent(lead.idCliente ?? '')}`)}
							>
								Ver cliente
							</Button>
						</dd>
					{/if}
				</dl>
			</Card>

			<Card>
				<h2 class="card-title">Fechas</h2>
				<dl class="dl-grid">
					<dt class="font-semibold text-text-muted">Creado</dt>
					<dd class="text-text-main">{formatearFecha(lead.creadoEn)}</dd>
					<dt class="font-semibold text-text-muted">Actualizado</dt>
					<dd class="text-text-main">{formatearFecha(lead.actualizadoEn)}</dd>
				</dl>
			</Card>
		</div>

		{#if propiedadesRelacionadas.length > 0}
			<Card>
				<h2 class="card-title">Propiedades asociadas</h2>
				<div class="grid gap-3">
					{#each propiedadesRelacionadas as idProp (idProp)}
						<div
							class="flex items-center justify-between rounded-xl border border-border-light p-4"
						>
							<div>
								<p class="font-semibold text-text-main">
									{propiedadesPorId.get(idProp)?.titulo ?? idProp}
								</p>
								<div class="mt-1 flex flex-wrap items-center gap-2">
									<p class="font-mono text-xs text-text-muted">{idProp}</p>
									{#if propiedadesPorId.get(idProp)?.estado}
										<Badge tone={presentarEstadoPropiedad(propiedadesPorId.get(idProp)?.estado ?? '').tone}>
											{presentarEstadoPropiedad(propiedadesPorId.get(idProp)?.estado ?? '').label}
										</Badge>
									{/if}
								</div>
							</div>
							<Button
								variant="ghost"
								onclick={() => goto(`${basePath}/propiedades/${encodeURIComponent(idProp)}`)}
							>
								Ver/Editar propiedad
							</Button>
						</div>
					{/each}
				</div>
			</Card>
		{/if}

		{#if lead.citas.length > 0}
			<Card>
				<h2 class="card-title">
					Citas ({lead.citas.length})
				</h2>
				<div class="space-y-3">
					{#each lead.citas as cita (cita.id)}
						<div class="rounded-xl border border-border-light p-4">
							<div class="flex items-start justify-between gap-4">
								<div>
									<p class="font-semibold text-text-main">
										{new Date(cita.fechaInicio).toLocaleDateString('es-PE', {
											day: '2-digit',
											month: 'long',
											year: 'numeric'
										})}
									</p>
									<p class="mt-1 text-sm text-text-muted">
										{new Date(cita.fechaInicio).toLocaleTimeString('es-PE', {
											hour: '2-digit',
											minute: '2-digit'
										})}
										&ndash;
										{new Date(cita.fechaFin).toLocaleTimeString('es-PE', {
											hour: '2-digit',
											minute: '2-digit'
										})}
									</p>
									{#if cita.observacion}
										<p class="mt-2 text-sm text-text-muted">{cita.observacion}</p>
									{/if}
								</div>
								<Badge tone={presentarEstadoCita(cita.estado).tone}>
									{presentarEstadoCita(cita.estado).label}
								</Badge>
							</div>
							{#if cita.idPropiedad}
								<p class="mt-2 text-xs text-text-muted">Propiedad: {cita.idPropiedad}</p>
							{/if}
						</div>
					{/each}
				</div>
			</Card>
		{/if}

		<ActividadLeadTimeline leadId={lead.id} />
	</div>

	<SidePanel isOpen={panel === 'editar'} title="Editar lead" onClose={() => (panel = null)}>
		<div class="space-y-4">
			<input
				class="w-full rounded-lg border border-border-light px-3 py-2"
				bind:value={formLead.nombre}
			/>
			<input
				class="w-full rounded-lg border border-border-light px-3 py-2"
				bind:value={formLead.email}
			/>
			<input
				class="w-full rounded-lg border border-border-light px-3 py-2"
				bind:value={formLead.telefono}
			/>
			<select
				class="w-full rounded-lg border border-border-light px-3 py-2"
				bind:value={formLead.estado}
			>
				{#each opcionesEstadoLead() as opt (opt.value)}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
			<input
				class="w-full rounded-lg border border-border-light px-3 py-2"
				placeholder="ID propiedad de interés"
				bind:value={formLead.idPropiedadInteres}
			/>
			<Button onclick={guardarLead} disabled={guardando}
				>{guardando ? 'Guardando...' : 'Guardar'}</Button
			>
		</div>
	</SidePanel>

	<SidePanel isOpen={panel === 'cita'} title="Agendar cita" onClose={() => (panel = null)}>
		<div class="space-y-4">
			<input
				type="datetime-local"
				class="w-full rounded-lg border border-border-light px-3 py-2"
				bind:value={formCita.fechaInicio}
			/>
			<input
				type="number"
				min="15"
				step="15"
				class="w-full rounded-lg border border-border-light px-3 py-2"
				bind:value={formCita.duracionMinutos}
			/>
			<input
				class="w-full rounded-lg border border-border-light px-3 py-2"
				placeholder="ID propiedad opcional"
				bind:value={formCita.idPropiedad}
			/>
			<textarea
				class="min-h-24 w-full rounded-lg border border-border-light px-3 py-2"
				placeholder="Observación"
				bind:value={formCita.observacion}
			></textarea>
			<Button onclick={guardarCita} disabled={guardando}
				>{guardando ? 'Agendando...' : 'Agendar'}</Button
			>
		</div>
	</SidePanel>

	<SidePanel isOpen={panel === 'contrato'} title="Crear contrato" onClose={() => (panel = null)}>
		<div class="space-y-4">
			<input
				class="w-full rounded-lg border border-border-light px-3 py-2"
				placeholder="ID propiedad"
				bind:value={formContrato.idPropiedad}
			/>
			<input
				type="date"
				class="w-full rounded-lg border border-border-light px-3 py-2"
				bind:value={formContrato.fechaInicio}
			/>
			<input
				type="date"
				class="w-full rounded-lg border border-border-light px-3 py-2"
				bind:value={formContrato.fechaFin}
			/>
			<Button onclick={guardarContrato} disabled={guardando}>
				{guardando ? 'Creando...' : 'Crear contrato'}
			</Button>
		</div>
	</SidePanel>
{/if}
