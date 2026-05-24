<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import { opcionesTipoVenta } from '$lib/shared/presentation';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { LeadPipeline } from '$lib/ventas/domain/models/LeadPipeline';
	import { listarPipeline } from '$lib/ventas/application/use-cases/listarPipeline';
	import { registrarLead } from '$lib/ventas/application/use-cases/registrarLead';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';
	import LeadPipelineTable from '$lib/ventas/presentation/LeadPipelineTable.svelte';
	import LeadKanban from '$lib/ventas/presentation/LeadKanban.svelte';
	import PipelineStats from '$lib/ventas/presentation/PipelineStats.svelte';
	import ActividadLeadTimeline from '$lib/ventas/presentation/ActividadLeadTimeline.svelte';

	let leads = $state<LeadPipeline[]>([]);
	let mostrarConvertidos = $state(false);
	let vista = $state<'tabla' | 'kanban'>('kanban');
	let loading = $state(true);
	let error = $state<string | null>(null);
	let guardando = $state(false);
	let accionError = $state<string | null>(null);
	let formLead = $state({
		nombre: '',
		email: '',
		telefono: '',
		tipo: 'COMPRA' as 'COMPRA' | 'VENTA',
		idPropiedadInteres: '',
		propiedadTitulo: '',
		propiedadDescripcion: '',
		propiedadPrecio: ''
	});

	let leadsFiltrados = $derived(
		mostrarConvertidos ? leads : leads.filter((l) => l.estado !== 'CONVERTIDO')
	);

	async function cargarLeads() {
		loading = true;
		error = null;
		try {
			leads = await listarPipeline(ventasRepository);
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar tus leads.';
		} finally {
			loading = false;
		}
	}

	function irALead(lead: LeadPipeline) {
		goto(`/asesor/leads/${encodeURIComponent(lead.id)}`);
	}

	// SidePanel state
	let panelOpen = $state(false);
	let panelMode = $state<'crear' | 'editar' | 'contrato' | 'actividad' | null>(null);
	let actividadLeadId = $state('');

	function abrirPanel(modo: 'crear' | 'editar' | 'contrato' | 'actividad', lead?: LeadPipeline) {
		panelMode = modo;
		if (modo === 'actividad' && lead) {
			actividadLeadId = lead.id;
		}
		panelOpen = true;
	}

	function cerrarPanel() {
		panelOpen = false;
		panelMode = null;
		accionError = null;
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

	$effect(() => {
		cargarLeads();
	});
</script>

<svelte:head>
	<title>Mis Leads | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<!-- Header -->
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="text-sm font-semibold tracking-[0.18em] text-amber-600 uppercase">Cartera</p>
			<h1 class="page-heading">Mis leads</h1>
			<p class="text-leading-relaxed mt-2 max-w-2xl text-text-muted">
				Prospectos asignados a tu usuario, con estado actual y citas registradas para seguimiento.
			</p>
		</div>
		<div class="flex gap-2">
			<Button variant="secondary" onclick={cargarLeads}>Actualizar</Button>
			<Button onclick={() => abrirPanel('crear')}>Nuevo lead</Button>
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
		<PipelineStats leads={leadsFiltrados} />
		<Card>
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h2 class="font-display text-xl font-bold text-text-main">Tus leads</h2>
					<p class="text-sm text-text-muted">{leadsFiltrados.length} prospectos en cartera</p>
				</div>
				<div class="flex items-center gap-4">
					<div class="mr-2 flex items-center rounded-xl bg-surface-muted p-1">
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
						Mostrar convertidos
					</label>
				</div>
			</div>

			{#if vista === 'tabla'}
				<LeadPipelineTable
					leads={leadsFiltrados}
					onLeadClick={irALead}
					onStatusChanged={cargarLeads}
				/>
			{:else}
				<LeadKanban leads={leadsFiltrados} onLeadClick={irALead} onStatusChanged={cargarLeads} />
			{/if}
		</Card>
	{/if}
</div>

<SidePanel
	isOpen={panelOpen}
	onClose={cerrarPanel}
	title={panelMode === 'crear' ? 'Nuevo lead' : 'Actividad del lead'}
>
	{#if panelMode === 'crear'}
		<div class="space-y-4">
			{#if accionError}
				<div class="border-danger/20 bg-danger/10 text-danger rounded-lg border p-3 text-sm">
					{accionError}
				</div>
			{/if}

			<input class="input" placeholder="Nombre" bind:value={formLead.nombre} />
			<input class="input" placeholder="Email" type="email" bind:value={formLead.email} />
			<input class="input" placeholder="Telefono" bind:value={formLead.telefono} />
			<select class="input" bind:value={formLead.tipo}>
{#each opcionesTipoVenta() as opt (opt.value)}
				<option value={opt.value}>{opt.label}</option>
			{/each}
			</select>

			{#if formLead.tipo === 'COMPRA'}
				<input
					class="input"
					placeholder="ID propiedad de interes (opcional)"
					bind:value={formLead.idPropiedadInteres}
				/>
			{:else}
				<input
					class="input"
					placeholder="Titulo de propiedad preliminar"
					bind:value={formLead.propiedadTitulo}
				/>
				<textarea
					class="input min-h-24"
					placeholder="Descripcion de la propiedad"
					bind:value={formLead.propiedadDescripcion}
				></textarea>
				<input
					class="input"
					type="number"
					min="0"
					placeholder="Precio esperado"
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
