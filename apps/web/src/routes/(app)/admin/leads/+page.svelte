<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import FloatingTextInput from '$lib/shared/ui/FloatingTextInput.svelte';
	import Select from '$lib/shared/ui/Select.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import Textarea from '$lib/shared/ui/Textarea.svelte';
	import { opcionesTipoVenta } from '$lib/shared/presentation';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { LeadPipeline } from '$lib/ventas/domain/models/LeadPipeline';
	import type { Propiedad } from '$lib/propiedades/domain/models/Propiedad';
	import type { Usuario } from '$lib/usuarios/domain/models/Usuario';
	import { registrarLead } from '$lib/ventas/application/use-cases/registrarLead';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';
	import LeadPipelineTable from '$lib/ventas/presentation/LeadPipelineTable.svelte';
	import LeadKanban from '$lib/ventas/presentation/LeadKanban.svelte';
	import PipelineStats from '$lib/ventas/presentation/PipelineStats.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let leads = $derived((data?.leads as LeadPipeline[]) ?? []);
	let propiedadesDisponibles = $derived((data?.propiedadesDisponibles as Propiedad[]) ?? []);
	let asesores = $derived((data?.asesores as Usuario[]) ?? []);
	let mostrarConvertidos = $state(false);
	let vista = $state<'tabla' | 'kanban'>('tabla');
	let busqueda = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);
	let panelCrear = $state(false);
	let guardando = $state(false);
	let accionError = $state<string | null>(null);
	let formLead = $state({
		nombre: '',
		email: '',
		telefono: '',
		tipo: 'COMPRA' as 'COMPRA' | 'VENTA',
		idAsesor: '',
		idPropiedadInteres: '',
		propiedadTitulo: '',
		propiedadDescripcion: '',
		propiedadPrecio: ''
	});

	let leadsFiltrados = $derived(
		mostrarConvertidos ? leads : leads.filter((l) => l.estado !== 'CONVERTIDO')
	);
	let leadsVisibles = $derived(
		leadsFiltrados.filter((lead) => {
			const query = busqueda.trim().toLowerCase();
			if (!query) return true;
			return [lead.nombre, lead.estado, lead.tipo, lead.nombreAsesor ?? '']
				.join(' ')
				.toLowerCase()
				.includes(query);
		})
	);
	let citas = $derived(
		leads
			.flatMap((lead) =>
				(lead.citas ?? []).map((cita) => ({
					...cita,
					leadNombre: lead.nombre
				}))
			)
			.sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
	);
	let citasPendientes = $derived(citas.filter((cita) => cita.estado !== 'CANCELADA'));
	let proximasCitas = $derived(citasPendientes.slice(0, 5));
	let citasHoy = $derived(
		citasPendientes.filter((cita) => fechaClave(cita.fechaInicio) === fechaClave(Date.now()))
	);
	const diasCalendario = $derived(
		Array.from({ length: 7 }, (_, index) => {
			const timestamp = Date.now() + index * 24 * 60 * 60 * 1000;
			const clave = fechaClave(timestamp);
			const total = citasPendientes.filter((cita) => fechaClave(cita.fechaInicio) === clave).length;
			return {
				clave,
				diaSemana: new Intl.DateTimeFormat('es-PE', { weekday: 'short' }).format(timestamp),
				diaMes: new Intl.DateTimeFormat('es-PE', { day: 'numeric' }).format(timestamp),
				total
			};
		})
	);

	async function cargar() {
		loading = true;
		error = null;

		try {
			await invalidateAll();
		} catch {
			error = 'No se pudieron actualizar los leads.';
		} finally {
			loading = false;
		}
	}

	function irALead(lead: LeadPipeline) {
		goto(`/admin/leads/${encodeURIComponent(lead.id)}`);
	}

	function actualizarEstadoLeadLocal(idLead: string, nuevoEstado: string) {
		leads = leads.map((lead) =>
			lead.id === idLead ? { ...lead, estado: nuevoEstado.toUpperCase() } : lead
		);
	}

	function cerrarCrear() {
		panelCrear = false;
		accionError = null;
	}

	function etiquetaPropiedad(propiedad: Propiedad): string {
		return `${propiedad.titulo} - S/ ${propiedad.precio.toLocaleString('es-PE')}`;
	}

	function formatearCita(fechaIso: string): string {
		return new Intl.DateTimeFormat('es-PE', {
			day: '2-digit',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(fechaIso));
	}

	function fechaClave(fecha: string | number): string {
		return new Intl.DateTimeFormat('en-CA').format(
			typeof fecha === 'string' ? Date.parse(fecha) : fecha
		);
	}

	async function crearLead() {
		guardando = true;
		accionError = null;

		try {
			const idLead = await registrarLead(ventasRepository, {
				nombre: formLead.nombre,
				email: formLead.email,
				telefono: formLead.telefono,
				tipo: formLead.tipo,
				idAsesor: formLead.idAsesor || undefined,
				idPropiedadInteres:
					formLead.tipo === 'COMPRA' && formLead.idPropiedadInteres
						? formLead.idPropiedadInteres
						: undefined,
				datosPropiedad:
					formLead.tipo === 'VENTA' && formLead.propiedadTitulo
						? {
								titulo: formLead.propiedadTitulo,
								descripcion: formLead.propiedadDescripcion,
								precio: Number(formLead.propiedadPrecio || 0)
							}
						: undefined
			});
			await cargar();
			goto(`/admin/leads/${encodeURIComponent(idLead)}`);
		} catch (err) {
			accionError = err instanceof HttpError ? err.message : 'No se pudo registrar el lead.';
		} finally {
			guardando = false;
		}
	}
</script>

<svelte:head>
	<title>Leads | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="section-label">Ventas</p>
			<h1 class="page-heading">Captación, leads y citas</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Un solo tablero para revisar captaciones, pipeline comercial, calendario y seguimiento.
			</p>
		</div>

		<div class="flex gap-2">
			<Button variant="secondary" onclick={cargar}>Actualizar</Button>
			<Button onclick={() => (panelCrear = true)}>Nuevo lead</Button>
		</div>
	</div>

	{#if loading}
		<Card>
			<div class="skeleton"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudieron cargar los leads</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargar}>Intentar nuevamente</Button>
		</Card>
	{:else}
		<div class="flex w-full flex-col items-start gap-5 lg:flex-row">
			<div class="grid min-w-0 flex-1 basis-0 gap-5">
				<PipelineStats leads={leadsFiltrados} />

				<Card class="min-w-0 overflow-hidden">
					<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
						<div>
							<p class="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
								Inbox de captación
							</p>
							<h2 class="mt-2 font-display text-xl font-bold text-text-main">
								WhatsApp y solicitudes por revisar
							</h2>
							<p class="mt-1 max-w-2xl text-sm text-text-muted">
								Las captaciones entrantes se revisan antes de convertirse en leads o propiedades.
							</p>
						</div>
						<Button href="/admin/captaciones" variant="secondary" class="shrink-0">
							Abrir bandeja
						</Button>
					</div>
				</Card>

				<Card>
					<div class="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
						<div>
							<h2 class="font-display text-xl font-bold text-text-main">Leads actuales</h2>
							<p class="mt-1 text-sm text-text-muted">
								{leadsVisibles.length} prospectos visibles en el pipeline.
							</p>
						</div>
						<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
							<FloatingTextInput label="Buscar lead" bind:value={busqueda} class="sm:w-56" />
							<div class="flex items-center rounded-xl bg-surface-muted p-1">
								<button
									onclick={() => (vista = 'tabla')}
									class="rounded-lg px-3 py-1 text-xs font-bold transition {vista === 'tabla'
										? 'bg-bg-card text-primary shadow-xs'
										: 'text-text-muted hover:text-text-main'}"
								>
									Lista
								</button>
								<button
									onclick={() => (vista = 'kanban')}
									class="rounded-lg px-3 py-1 text-xs font-bold transition {vista === 'kanban'
										? 'bg-bg-card text-primary shadow-xs'
										: 'text-text-muted hover:text-text-main'}"
								>
									Kanban
								</button>
							</div>
							<label class="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
								<input type="checkbox" bind:checked={mostrarConvertidos} class="accent-primary" />
								Convertidos
							</label>
						</div>
					</div>

					{#if vista === 'tabla'}
						<div class="min-w-0 overflow-x-auto">
							<LeadPipelineTable
								leads={leadsVisibles}
								onLeadClick={irALead}
								onStatusChanged={actualizarEstadoLeadLocal}
							/>
						</div>
					{:else}
						<div class="min-w-0 overflow-x-auto">
							<LeadKanban
								leads={leadsVisibles}
								onLeadClick={irALead}
								onStatusChanged={actualizarEstadoLeadLocal}
							/>
						</div>
					{/if}
				</Card>
			</div>

			<aside class="grid w-full min-w-0 shrink-0 gap-5 self-start lg:w-96">
				<Card class="min-w-0">
					<div class="flex items-start justify-between gap-4">
						<div>
							<p class="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
								Calendario
							</p>
							<h2 class="mt-2 font-display text-xl font-bold text-text-main">
								{citasHoy.length} citas hoy
							</h2>
							<p class="mt-1 text-sm text-text-muted">{citasPendientes.length} citas activas</p>
						</div>
						<Button href="/admin/citas" variant="secondary" class="px-4 py-2 text-sm">Ver</Button>
					</div>
					<div class="mt-5 grid grid-cols-7 gap-2">
						{#each diasCalendario as dia (dia.clave)}
							<div
								class="rounded-xl border border-border-light bg-bg-base p-2 text-center {dia.total >
								0
									? 'border-primary/40 bg-primary-light/40'
									: ''}"
							>
								<p class="text-[10px] font-semibold text-text-muted uppercase">
									{dia.diaSemana}
								</p>
								<p class="mt-1 font-display text-lg font-bold text-text-main">{dia.diaMes}</p>
								<p class="text-[10px] font-semibold text-primary">{dia.total || ''}</p>
							</div>
						{/each}
					</div>
				</Card>

				<Card class="min-w-0">
					<div class="mb-4 flex items-center justify-between gap-3">
						<div>
							<h2 class="font-display text-xl font-bold text-text-main">Citas</h2>
							<p class="mt-1 text-sm text-text-muted">Próximos seguimientos del pipeline.</p>
						</div>
					</div>

					{#if proximasCitas.length === 0}
						<p class="rounded-xl bg-surface-muted p-4 text-sm text-text-muted">
							No hay citas pendientes.
						</p>
					{:else}
						<div class="grid gap-3">
							{#each proximasCitas as cita (`${cita.id}-${cita.idLead}`)}
								<a
									href={`/admin/leads/${encodeURIComponent(cita.idLead)}`}
									class="rounded-xl border border-border-light bg-bg-base p-3 transition hover:border-primary/40"
								>
									<p class="text-sm font-semibold text-text-main">{cita.leadNombre}</p>
									<p class="mt-1 text-xs text-text-muted">{formatearCita(cita.fechaInicio)}</p>
									<p class="mt-2 text-xs font-semibold text-primary">{cita.estado}</p>
								</a>
							{/each}
						</div>
					{/if}
				</Card>
			</aside>
		</div>
	{/if}
</div>

<SidePanel isOpen={panelCrear} onClose={cerrarCrear} title="Nuevo lead">
	<div class="space-y-4">
		{#if accionError}
			<div class="rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
				{accionError}
			</div>
		{/if}

		<FloatingTextInput label="Nombre" bind:value={formLead.nombre} />
		<FloatingTextInput label="Email" type="email" bind:value={formLead.email} />
		<FloatingTextInput label="Telefono" bind:value={formLead.telefono} />
		<Select bind:value={formLead.tipo}>
			{#each opcionesTipoVenta() as opt (opt.value)}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</Select>
		<Select label="Asesor asignado" bind:value={formLead.idAsesor}>
			<option value="">Sin asignar</option>
			{#each asesores as asesor (asesor.id)}
				<option value={asesor.id}>{asesor.nombre} ({asesor.username})</option>
			{/each}
		</Select>

		{#if formLead.tipo === 'COMPRA'}
			<Select bind:value={formLead.idPropiedadInteres}>
				<option value="">Sin propiedad de interés</option>
				{#each propiedadesDisponibles as propiedad (propiedad.id)}
					<option value={propiedad.id}>{etiquetaPropiedad(propiedad)}</option>
				{/each}
			</Select>
		{:else}
			<FloatingTextInput
				label="Titulo de propiedad en borrador"
				bind:value={formLead.propiedadTitulo}
			/>
			<Textarea
				placeholder="Descripcion de la propiedad"
				bind:value={formLead.propiedadDescripcion}
				rows={4}
				resize={false}
			/>
			<FloatingTextInput
				type="number"
				min={0}
				label="Precio esperado"
				bind:value={formLead.propiedadPrecio}
			/>
		{/if}

		<div class="flex justify-end gap-2 pt-2">
			<Button variant="secondary" onclick={cerrarCrear}>Cancelar</Button>
			<Button onclick={crearLead} disabled={guardando}>
				{guardando ? 'Registrando...' : 'Registrar lead'}
			</Button>
		</div>
	</div>
</SidePanel>
