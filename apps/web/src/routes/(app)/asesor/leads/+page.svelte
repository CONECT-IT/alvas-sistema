<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { flip } from 'svelte/animate';
	import { SvelteDate } from 'svelte/reactivity';
	import { fly, scale } from 'svelte/transition';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import Checkbox from '$lib/shared/ui/Checkbox.svelte';
	import FloatingTextInput from '$lib/shared/ui/FloatingTextInput.svelte';
	import Select from '$lib/shared/ui/Select.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import Textarea from '$lib/shared/ui/Textarea.svelte';
	import { opcionesTipoVenta, presentarEstadoLead } from '$lib/shared/presentation';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { LeadPipeline } from '$lib/ventas/domain/models/LeadPipeline';
	import type { Propiedad } from '$lib/propiedades/domain/models/Propiedad';
	import { registrarLead } from '$lib/ventas/application/use-cases/registrarLead';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';
	import LeadPipelineTable from '$lib/ventas/presentation/LeadPipelineTable.svelte';
	import PipelineStats from '$lib/ventas/presentation/PipelineStats.svelte';
	import ActividadLeadTimeline from '$lib/ventas/presentation/ActividadLeadTimeline.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let leads = $derived((data?.leads as LeadPipeline[]) ?? []);
	let propiedadesDisponibles = $derived((data?.propiedadesDisponibles as Propiedad[]) ?? []);
	let clientes = $derived(
		(data?.clientes as Array<{ id: string; nombre: string; email: string }>) ?? []
	);
	let mostrarConvertidos = $state(false);
	let busqueda = $state('');
	type FiltroLeads = 'todos' | 'conCitas' | 'nuevos' | 'compradores' | 'vendedores';
	let filtro = $state<FiltroLeads>('todos');
	let diaSeleccionado = $state(fechaClave(Date.now()));
	let mesCalendario = new SvelteDate(inicioMes(new Date()));
	let citaResumen = $state<{
		id: string;
		idLead: string;
		leadNombre: string;
		fechaInicio: string;
		fechaFin: string;
		estado: string;
		observacion?: string;
	} | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let guardando = $state(false);
	let accionError = $state<string | null>(null);
	let panelOrigen = $state<DOMRect | null>(null);
	let formLead = $state({
		nombre: '',
		email: '',
		telefono: '',
		tipo: 'COMPRA' as 'COMPRA' | 'VENTA',
		idCliente: '',
		idPropiedadInteres: '',
		propiedadTitulo: '',
		propiedadDescripcion: '',
		propiedadPrecio: ''
	});

	let leadsBase = $derived(
		mostrarConvertidos ? leads : leads.filter((lead) => lead.estado !== 'CONVERTIDO')
	);
	let leadsFiltrados = $derived(
		leadsBase.filter((lead) => {
			if (filtro === 'conCitas') return (lead.citasCount ?? 0) > 0;
			if (filtro === 'nuevos') return presentarEstadoLead(lead.estado).tone === 'warning';
			if (filtro === 'compradores') return lead.tipo === 'COMPRA';
			if (filtro === 'vendedores') return lead.tipo === 'VENTA';
			return true;
		})
	);
	let leadsVisibles = $derived(
		leadsFiltrados.filter((lead) => {
			const query = busqueda.trim().toLowerCase();
			if (!query) return true;
			return [lead.nombre, lead.estado, lead.tipo].join(' ').toLowerCase().includes(query);
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
	let citasSeleccionadas = $derived(
		citasPendientes.filter((cita) => fechaClave(cita.fechaInicio) === diaSeleccionado)
	);
	let proximasCitas = $derived(
		citasPendientes
			.filter((cita) => new Date(cita.fechaInicio).getTime() >= inicioDia(new Date()).getTime())
			.slice(0, 6)
	);
	let etiquetaDiaSeleccionado = $derived(
		new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'short' }).format(
			Date.parse(`${diaSeleccionado}T00:00:00`)
		)
	);
	let etiquetaMesCalendario = $derived(
		new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(mesCalendario)
	);
	const diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
	const diasCalendario = $derived(construirDiasMes(mesCalendario, citasPendientes));

	async function cargarLeads() {
		loading = true;
		error = null;
		try {
			await invalidateAll();
		} catch {
			error = 'No se pudieron actualizar tus leads.';
		} finally {
			loading = false;
		}
	}

	function irALead(lead: LeadPipeline) {
		goto(`/asesor/leads/${encodeURIComponent(lead.id)}`);
	}

	function actualizarEstadoLeadLocal(idLead: string, nuevoEstado: string) {
		leads = leads.map((lead) =>
			lead.id === idLead ? { ...lead, estado: nuevoEstado.toUpperCase() } : lead
		);
	}

	function aplicarFiltroLead(key: FiltroLeads) {
		filtro = key;
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

	function inicioDia(fecha: Date): Date {
		return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
	}

	function inicioMes(fecha: Date): Date {
		return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
	}

	function moverMes(delta: number) {
		mesCalendario.setFullYear(mesCalendario.getFullYear(), mesCalendario.getMonth() + delta, 1);
		citaResumen = null;
	}

	function construirDiasMes(
		mes: Date,
		citasMes: Array<{ fechaInicio: string }>
	): Array<{ clave: string; diaMes: string; total: number; fueraDeMes: boolean }> {
		const primero = inicioMes(mes);
		const offset = (primero.getDay() + 6) % 7;
		const inicio = new SvelteDate(primero.getTime());
		inicio.setDate(primero.getDate() - offset);

		return Array.from({ length: 42 }, (_, index) => {
			const fecha = new SvelteDate(inicio.getTime());
			fecha.setDate(inicio.getDate() + index);
			const clave = fechaClave(fecha.getTime());
			return {
				clave,
				diaMes: new Intl.DateTimeFormat('es-PE', { day: 'numeric' }).format(fecha),
				total: citasMes.filter((cita) => fechaClave(cita.fechaInicio) === clave).length,
				fueraDeMes: fecha.getMonth() !== mes.getMonth()
			};
		});
	}

	function seleccionarDia(clave: string) {
		diaSeleccionado = clave;
		citaResumen = null;
	}

	function seleccionarCita(cita: NonNullable<typeof citaResumen>) {
		citaResumen = cita;
	}

	// SidePanel state
	let panelOpen = $state(false);
	let panelMode = $state<'crear' | 'editar' | 'contrato' | 'actividad' | null>(null);
	let actividadLeadId = $state('');

	function abrirPanel(
		modo: 'crear' | 'editar' | 'contrato' | 'actividad',
		lead?: LeadPipeline,
		event?: MouseEvent
	) {
		panelMode = modo;
		panelOrigen = event ? (event.currentTarget as HTMLElement).getBoundingClientRect() : null;
		if (modo === 'actividad' && lead) {
			actividadLeadId = lead.id;
		}
		panelOpen = true;
	}

	function cerrarPanel() {
		panelOpen = false;
		panelMode = null;
		accionError = null;
		panelOrigen = null;
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
				idCliente: formLead.idCliente || undefined,
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
			await cargarLeads();
			goto(`/asesor/leads/${encodeURIComponent(idLead)}`);
		} catch (err) {
			accionError = err instanceof HttpError ? err.message : 'No se pudo registrar el lead.';
		} finally {
			guardando = false;
		}
	}
</script>

<svelte:head>
	<title>Mis Leads | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="section-label">Ventas</p>
			<h1 class="page-heading">Mis captaciones, leads y citas</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Tu espacio de trabajo para convertir captaciones, mover leads y dar seguimiento a citas.
			</p>
		</div>
		<div class="flex gap-2">
			<Button variant="secondary" onclick={cargarLeads}>Actualizar</Button>
			<Button onclick={(event) => abrirPanel('crear', undefined, event)}>Nuevo lead</Button>
		</div>
	</div>

	<!-- Data first: Stats + Table -->
	{#if loading}
		<Card>
			<div class="skeleton"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudo cargar la cartera</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargarLeads}>Intentar nuevamente</Button>
		</Card>
	{:else}
		<div
			class="grid w-full min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,28rem)]"
		>
			<div class="grid min-w-0 gap-5">
				<PipelineStats leads={leadsBase} {filtro} onFilter={aplicarFiltroLead} />

				<div transition:scale={{ duration: 180, start: 0.98 }}>
					<Card class="min-w-0 overflow-hidden">
						<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
							<div>
								<p class="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
									Inbox de captación
								</p>
								<h2 class="mt-2 font-display text-xl font-bold text-text-main">
									Captaciones entrantes
								</h2>
								<p class="mt-1 max-w-2xl text-sm text-text-muted">
									Revisa solicitudes nuevas y conviértelas en leads cuando estén listas.
								</p>
							</div>
							<Button href="/asesor/captaciones" variant="secondary" class="shrink-0">
								Abrir bandeja
							</Button>
						</div>
					</Card>
				</div>

				<Card>
					<div class="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
						<div>
							<h2 class="font-display text-xl font-bold text-text-main">Leads actuales</h2>
							<p class="mt-1 text-sm text-text-muted">
								{leadsVisibles.length} prospectos en cartera.
							</p>
						</div>
						<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
							<FloatingTextInput label="Buscar lead" bind:value={busqueda} class="sm:w-56" />
							<Checkbox bind:checked={mostrarConvertidos} label="Convertidos" />
						</div>
					</div>

					<div class="min-w-0 overflow-x-auto">
						<LeadPipelineTable
							leads={leadsVisibles}
							onLeadClick={irALead}
							onStatusChanged={actualizarEstadoLeadLocal}
						/>
					</div>
				</Card>
			</div>

			<aside class="grid w-full min-w-0 gap-5 self-start">
				<Card class="min-w-0">
					<div class="flex items-start justify-between gap-4">
						<div>
							<p class="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
								Calendario
							</p>
							<h2 class="mt-2 font-display text-xl font-bold text-text-main">
								{etiquetaMesCalendario}
							</h2>
							<p class="mt-1 text-sm text-text-muted">{citasPendientes.length} citas activas</p>
						</div>
						<div class="flex items-center gap-2">
							<button
								type="button"
								class="rounded-lg border border-border-light px-3 py-1 text-sm font-semibold text-text-muted hover:border-primary/40 hover:text-primary"
								aria-label="Mes anterior"
								onclick={() => moverMes(-1)}
							>
								&lt;
							</button>
							<button
								type="button"
								class="rounded-lg border border-border-light px-3 py-1 text-sm font-semibold text-text-muted hover:border-primary/40 hover:text-primary"
								aria-label="Mes siguiente"
								onclick={() => moverMes(1)}
							>
								&gt;
							</button>
						</div>
					</div>
					<div class="mt-5 grid grid-cols-7 gap-1 text-center">
						{#each diasSemana as dia, indiceDia (indiceDia)}
							<p class="py-1 text-[10px] font-bold text-text-muted uppercase">{dia}</p>
						{/each}
						{#each diasCalendario as dia (dia.clave)}
							<button
								type="button"
								onclick={() => seleccionarDia(dia.clave)}
								class="min-h-12 rounded-xl border border-border-light bg-bg-base p-2 text-center transition hover:border-primary/50 {dia.fueraDeMes
									? 'opacity-40'
									: ''} {dia.total > 0
									? 'border-primary/40 bg-primary-light/40'
									: ''} {diaSeleccionado === dia.clave ? 'ring-2 ring-primary/20' : ''}"
							>
								<p class="font-display text-sm font-bold text-text-main">{dia.diaMes}</p>
								<p class="text-[10px] font-semibold text-primary">{dia.total || ''}</p>
							</button>
						{/each}
					</div>
				</Card>

				<Card class="min-w-0">
					<div class="mb-4 flex items-center justify-between gap-3">
						<div>
							<h2 class="font-display text-xl font-bold text-text-main">Citas</h2>
							<p class="mt-1 text-sm text-text-muted capitalize">{etiquetaDiaSeleccionado}</p>
						</div>
					</div>

					{#if citasSeleccionadas.length === 0}
						<p class="rounded-xl bg-surface-muted p-4 text-sm text-text-muted">
							No hay citas para este día.
						</p>
					{:else}
						<div class="grid gap-3">
							{#each citasSeleccionadas as cita (`${cita.id}-${cita.idLead}`)}
								<button
									type="button"
									animate:flip={{ duration: 180 }}
									transition:fly={{ y: 8, duration: 180 }}
									onclick={() => seleccionarCita(cita)}
									class="rounded-xl border border-border-light bg-bg-base p-3 text-left transition hover:border-primary/40"
								>
									<p class="text-sm font-semibold text-text-main">{cita.leadNombre}</p>
									<p class="mt-1 text-xs text-text-muted">{formatearCita(cita.fechaInicio)}</p>
									<p class="mt-2 text-xs font-semibold text-primary">{cita.estado}</p>
								</button>
							{/each}
						</div>
					{/if}
				</Card>

				<Card class="min-w-0">
					<h2 class="font-display text-xl font-bold text-text-main">Próximas citas</h2>
					{#if proximasCitas.length === 0}
						<p class="mt-3 rounded-xl bg-surface-muted p-4 text-sm text-text-muted">
							No hay citas próximas.
						</p>
					{:else}
						<div class="mt-4 grid gap-3">
							{#each proximasCitas as cita (`proxima-${cita.id}-${cita.idLead}`)}
								<button
									type="button"
									class="rounded-xl border border-border-light bg-bg-base p-3 text-left transition hover:border-primary/40"
									onclick={() => seleccionarCita(cita)}
								>
									<p class="text-sm font-semibold text-text-main">{cita.leadNombre}</p>
									<p class="mt-1 text-xs text-text-muted">{formatearCita(cita.fechaInicio)}</p>
								</button>
							{/each}
						</div>
					{/if}
				</Card>

				{#if citaResumen}
					<Card class="min-w-0 border-primary/30 bg-primary-light/20">
						<div class="flex items-start justify-between gap-3">
							<div>
								<p class="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
									Resumen de cita
								</p>
								<h2 class="mt-2 font-display text-lg font-bold text-text-main">
									{citaResumen.leadNombre}
								</h2>
								<p class="mt-1 text-sm text-text-muted">
									{formatearCita(citaResumen.fechaInicio)} - {new Date(
										citaResumen.fechaFin
									).toLocaleTimeString('es-PE', {
										hour: '2-digit',
										minute: '2-digit'
									})}
								</p>
								<p class="mt-2 text-xs font-semibold text-primary">{citaResumen.estado}</p>
								{#if citaResumen.observacion}
									<p class="mt-2 text-sm text-text-muted">{citaResumen.observacion}</p>
								{/if}
							</div>
							<button
								type="button"
								class="text-sm font-bold text-text-muted hover:text-text-main"
								aria-label="Cerrar resumen"
								onclick={() => (citaResumen = null)}
							>
								x
							</button>
						</div>
						<Button
							href={`/asesor/leads/${encodeURIComponent(citaResumen.idLead)}`}
							variant="secondary"
							class="mt-4 w-full justify-center"
						>
							Abrir lead
						</Button>
					</Card>
				{/if}
			</aside>
		</div>
	{/if}
</div>

<SidePanel
	isOpen={panelOpen}
	onClose={cerrarPanel}
	title={panelMode === 'crear' ? 'Nuevo lead' : 'Actividad del lead'}
	sourceRect={panelOrigen}
>
	{#if panelMode === 'crear'}
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

			<Select label="Cliente existente" bind:value={formLead.idCliente}>
				<option value="">Sin cliente asociado</option>
				{#each clientes as cliente (cliente.id)}
					<option value={cliente.id}>{cliente.nombre} ({cliente.email})</option>
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
				<Button variant="secondary" onclick={cerrarPanel}>Cancelar</Button>
				<Button onclick={crearLead} disabled={guardando}>
					{guardando ? 'Registrando...' : 'Registrar lead'}
				</Button>
			</div>
		</div>
	{:else if panelMode === 'actividad'}
		<ActividadLeadTimeline leadId={actividadLeadId} />
	{/if}
</SidePanel>
