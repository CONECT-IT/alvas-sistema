<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import Select from '$lib/shared/ui/Select.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import Textarea from '$lib/shared/ui/Textarea.svelte';
	import TextInput from '$lib/shared/ui/TextInput.svelte';
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
	let vista = $state<'tabla' | 'kanban'>('kanban');
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
			<p class="section-label">Leads</p>
			<h1 class="page-heading">Pipeline completo</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Todos los prospectos del sistema, sus estados de avance y citas asociadas.
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
		<PipelineStats leads={leadsFiltrados} />
		<Card>
			<div class="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
				<div>
					<h2 class="font-display text-xl font-bold text-text-main">Leads registrados</h2>
					<p class="mt-1 text-sm text-text-muted">Todos los prospectos visibles en el sistema.</p>
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
					<p class="text-sm font-semibold text-primary">{leadsFiltrados.length} leads</p>
				</div>
			</div>

			{#if vista === 'tabla'}
				<LeadPipelineTable
					leads={leadsFiltrados}
					onLeadClick={irALead}
					onStatusChanged={actualizarEstadoLeadLocal}
				/>
			{:else}
				<LeadKanban
					leads={leadsFiltrados}
					onLeadClick={irALead}
					onStatusChanged={actualizarEstadoLeadLocal}
				/>
			{/if}
		</Card>
	{/if}
</div>

<SidePanel isOpen={panelCrear} onClose={cerrarCrear} title="Nuevo lead">
	<div class="space-y-4">
		{#if accionError}
			<div class="rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
				{accionError}
			</div>
		{/if}

		<TextInput placeholder="Nombre" bind:value={formLead.nombre} />
		<TextInput placeholder="Email" type="email" bind:value={formLead.email} />
		<TextInput placeholder="Telefono" bind:value={formLead.telefono} />
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
			<TextInput
				placeholder="Titulo de propiedad en borrador"
				bind:value={formLead.propiedadTitulo}
			/>
			<Textarea
				placeholder="Descripcion de la propiedad"
				bind:value={formLead.propiedadDescripcion}
				rows={4}
				resize={false}
			/>
			<TextInput
				type="number"
				min={0}
				placeholder="Precio esperado"
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
