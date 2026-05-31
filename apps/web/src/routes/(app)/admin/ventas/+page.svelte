<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import Checkbox from '$lib/shared/ui/Checkbox.svelte';
	import FloatingTextInput from '$lib/shared/ui/FloatingTextInput.svelte';
	import Select from '$lib/shared/ui/Select.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import Textarea from '$lib/shared/ui/Textarea.svelte';
	import { opcionesTipoVenta, presentarEstadoLead } from '$lib/shared/presentation';
	import type { LeadPipeline } from '$lib/ventas/domain/models/LeadPipeline';
	import LeadPipelineTable from '$lib/ventas/presentation/LeadPipelineTable.svelte';
	import PipelineStats from '$lib/ventas/presentation/PipelineStats.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let initialLeads = $derived((data?.leads as unknown as LeadPipeline[]) ?? []);
	let leads = $state<LeadPipeline[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let busqueda = $state('');
	let mostrarConvertidos = $state(false);
	type FiltroLeads = 'todos' | 'conCitas' | 'nuevos';
	let filtro = $state<FiltroLeads>('todos');
	let panelCrear = $state(false);
	let panelOrigen = $state<DOMRect | null>(null);
	let formLead = $state({
		nombre: '',
		email: '',
		telefono: '',
		tipo: 'COMPRA' as 'COMPRA' | 'VENTA',
		propiedadTitulo: '',
		propiedadDescripcion: '',
		propiedadPrecio: ''
	});

	$effect(() => {
		if (initialLeads.length > 0 && leads.length === 0) {
			leads = [...initialLeads];
		}
	});

	let leadsBase = $derived(
		mostrarConvertidos ? leads : leads.filter((lead) => lead.estado !== 'CONVERTIDO')
	);
	let leadsFiltrados = $derived(
		leadsBase.filter((lead) => {
			if (filtro === 'conCitas') return (lead.citasCount ?? 0) > 0;
			if (filtro === 'nuevos') return presentarEstadoLead(lead.estado).tone === 'warning';
			return true;
		})
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

	function actualizarEstadoLead(idLead: string, nuevoEstado: string) {
		leads = leads.map((lead) =>
			lead.id === idLead ? { ...lead, estado: nuevoEstado.toUpperCase() } : lead
		);
	}

	function aplicarFiltroLead(key: FiltroLeads) {
		filtro = key;
	}

	function abrirNuevoLead(event: MouseEvent) {
		panelOrigen = (event.currentTarget as HTMLElement).getBoundingClientRect();
		panelCrear = true;
	}

	function cerrarNuevoLead() {
		panelCrear = false;
		panelOrigen = null;
	}

	async function cargarPipeline() {
		loading = true;
		error = null;

		try {
			await invalidateAll();
			leads = [...((data?.leads as unknown as LeadPipeline[]) ?? [])];
		} catch {
			error = 'No se pudo actualizar la cartera comercial.';
		} finally {
			loading = false;
		}
	}

	function verDetalle(lead: LeadPipeline) {
		goto(`/admin/leads/${lead.id}`);
	}
</script>

<svelte:head>
	<title>Ventas y CRM | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="section-label">CRM</p>
			<h1 class="page-heading">Cartera comercial</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Revisa los prospectos visibles para la sesión, sus estados de avance y la cantidad de citas
				asociadas.
			</p>
		</div>

		<div class="flex gap-2">
			<Button variant="secondary" onclick={cargarPipeline}>Actualizar cartera</Button>
			<Button onclick={abrirNuevoLead}>Nuevo lead</Button>
		</div>
	</div>

	{#if loading}
		<Card>
			<div class="skeleton"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudo cargar ventas</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargarPipeline}>Intentar nuevamente</Button>
		</Card>
	{:else}
		<PipelineStats leads={leadsBase} {filtro} onFilter={aplicarFiltroLead} />
		<Card>
			<div class="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
				<div>
					<h2 class="font-display text-xl font-bold text-text-main">Leads registrados</h2>
					<p class="mt-1 text-sm text-text-muted">Datos cargados desde ventas/pipeline.</p>
				</div>
				<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
					<FloatingTextInput label="Buscar lead" bind:value={busqueda} class="sm:w-56" />
					<Checkbox bind:checked={mostrarConvertidos} label="Convertidos" />
				</div>
			</div>

			<div class="overflow-x-auto">
				<LeadPipelineTable
					leads={leadsVisibles}
					onLeadClick={verDetalle}
					onStatusChanged={actualizarEstadoLead}
				/>
			</div>
		</Card>
	{/if}
</div>

<SidePanel
	isOpen={panelCrear}
	onClose={cerrarNuevoLead}
	title="Nuevo lead"
	sourceRect={panelOrigen}
>
	<div class="space-y-4">
		<FloatingTextInput label="Nombre" bind:value={formLead.nombre} />
		<FloatingTextInput label="Email" type="email" bind:value={formLead.email} />
		<FloatingTextInput label="Teléfono" bind:value={formLead.telefono} />
		<Select bind:value={formLead.tipo}>
			{#each opcionesTipoVenta() as opt (opt.value)}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</Select>

		{#if formLead.tipo === 'VENTA'}
			<FloatingTextInput label="Título de propiedad" bind:value={formLead.propiedadTitulo} />
			<Textarea
				placeholder="Descripción de la propiedad"
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
			<Button variant="secondary" onclick={cerrarNuevoLead}>Cancelar</Button>
			<Button onclick={cerrarNuevoLead}>Registrar lead</Button>
		</div>
	</div>
</SidePanel>
