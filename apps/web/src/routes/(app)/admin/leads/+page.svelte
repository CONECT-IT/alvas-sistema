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

	let leads = $state<LeadPipeline[]>([]);
	let mostrarConvertidos = $state(false);
	let vista = $state<'tabla' | 'kanban'>('kanban');
	let loading = $state(true);
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
			leads = await listarPipeline(ventasRepository);
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudieron cargar los leads.';
		} finally {
			loading = false;
		}
	}

	function irALead(lead: LeadPipeline) {
		goto(`/admin/leads/${encodeURIComponent(lead.id)}`);
	}

	function cerrarCrear() {
		panelCrear = false;
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

	$effect(() => {
		cargar();
	});
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
				<LeadPipelineTable leads={leadsFiltrados} onLeadClick={irALead} onStatusChanged={cargar} />
			{:else}
				<LeadKanban leads={leadsFiltrados} onLeadClick={irALead} onStatusChanged={cargar} />
			{/if}
		</Card>
	{/if}
</div>

<SidePanel isOpen={panelCrear} onClose={cerrarCrear} title="Nuevo lead">
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
		<input
			class="input"
			placeholder="ID asesor asignado (opcional)"
			bind:value={formLead.idAsesor}
		/>

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
			<Button variant="secondary" onclick={cerrarCrear}>Cancelar</Button>
			<Button onclick={crearLead} disabled={guardando}>
				{guardando ? 'Registrando...' : 'Registrar lead'}
			</Button>
		</div>
	</div>
</SidePanel>
