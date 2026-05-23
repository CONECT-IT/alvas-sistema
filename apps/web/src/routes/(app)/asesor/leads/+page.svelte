<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import { httpClient, HttpError } from '$lib/shared/http/httpClient';
	import type { LeadPipeline } from '$lib/ventas/domain/models/LeadPipeline';
	import { actualizarLead } from '$lib/ventas/application/use-cases/actualizarLead';
	import { crearContrato } from '$lib/ventas/application/use-cases/crearContrato';
	import { firmarContrato } from '$lib/ventas/application/use-cases/firmarContrato';
	import { listarPipeline } from '$lib/ventas/application/use-cases/listarPipeline';
	import { registrarLead } from '$lib/ventas/application/use-cases/registrarLead';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';
	import ActividadLeadTimeline from '$lib/ventas/presentation/ActividadLeadTimeline.svelte';
	import LeadPipelineTable from '$lib/ventas/presentation/LeadPipelineTable.svelte';
	import PipelineStats from '$lib/ventas/presentation/PipelineStats.svelte';
	import type { ContratoDTO } from '$lib/ventas/infrastructure/dto/VentasDTOs';

	type PropiedadItem = {
		id: string;
		titulo: string;
	};

	let leads = $state<LeadPipeline[]>([]);
	let mostrarConvertidos = $state(false);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let leadsFiltrados = $derived(
		mostrarConvertidos ? leads : leads.filter((l) => l.estado !== 'CONVERTIDO')
	);

	// SidePanel state
	let panelOpen = $state(false);
	let panelMode = $state<'crear' | 'editar' | 'contrato' | 'actividad' | null>(null);

	// Create form
	let createNombre = $state('');
	let createEmail = $state('');
	let createTelefono = $state('');
	let createTipo = $state<'COMPRA' | 'VENTA'>('COMPRA');
	let createIdPropiedadInteres = $state('');
	let createTituloPropiedad = $state('');
	let createDescripcionPropiedad = $state('');
	let createPrecioPropiedad = $state(0);
	let creating = $state(false);
	let createError = $state<string | null>(null);
	let createSuccess = $state<string | null>(null);

	// Edit form
	let editIdLead = $state('');
	let editNombre = $state('');
	let editEmail = $state('');
	let editTelefono = $state('');
	let editTipo = $state<'COMPRA' | 'VENTA' | ''>('');
	let editIdPropiedadInteres = $state('');
	let updating = $state(false);
	let updateError = $state<string | null>(null);
	let updateSuccess = $state<string | null>(null);

	// Contract flow
	let contratoLeadId = $state('');
	let propiedades = $state<PropiedadItem[]>([]);
	let contratoPropiedadId = $state('');
	let contratoFechaInicio = $state('');
	let contratoFechaFin = $state('');
	let contratoCreado = $state<ContratoDTO | null>(null);
	let creandoContrato = $state(false);
	let contratoError = $state<string | null>(null);
	let firmandoContrato = $state(false);
	let contratoFirmado = $state(false);

	// Activity
	let actividadLeadId = $state('');

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

	function abrirPanel(modo: 'crear' | 'editar' | 'contrato' | 'actividad', lead?: LeadPipeline) {
		panelMode = modo;
		createError = null;
		createSuccess = null;
		updateError = null;
		updateSuccess = null;
		contratoError = null;

		if (modo === 'editar' && lead) {
			editIdLead = lead.id;
			editNombre = lead.nombre;
			editEmail = '';
			editTelefono = '';
			editTipo = lead.tipo as 'COMPRA' | 'VENTA' | '';
			editIdPropiedadInteres = '';
		}

		if (modo === 'contrato' && lead) {
			contratoLeadId = lead.id;
			contratoPropiedadId = '';
			contratoFechaInicio = '';
			contratoFechaFin = '';
			contratoCreado = null;
			contratoFirmado = false;
			cargarPropiedades();
		}

		if (modo === 'actividad' && lead) {
			actividadLeadId = lead.id;
		}

		panelOpen = true;
	}

	function cerrarPanel() {
		panelOpen = false;
		panelMode = null;
	}

	async function cargarPropiedades() {
		try {
			const res = await httpClient.get<{ success: boolean; data: PropiedadItem[] }>(
				'/api/propiedades'
			);
			propiedades = (res.data ?? []).filter((p) => p.titulo || p.id);
		} catch {
			// silencioso
		}
	}

	function reiniciarFlujoContrato() {
		contratoLeadId = '';
		propiedades = [];
		contratoPropiedadId = '';
		contratoFechaInicio = '';
		contratoFechaFin = '';
		contratoCreado = null;
		contratoError = null;
		contratoFirmado = false;
	}

	function limpiarFormularioLead() {
		createNombre = '';
		createEmail = '';
		createTelefono = '';
		createTipo = 'COMPRA';
		createIdPropiedadInteres = '';
		createTituloPropiedad = '';
		createDescripcionPropiedad = '';
		createPrecioPropiedad = 0;
	}

	function limpiarFormularioEdicion() {
		editIdLead = '';
		editNombre = '';
		editEmail = '';
		editTelefono = '';
		editTipo = '';
		editIdPropiedadInteres = '';
	}

	async function crearLead(event: SubmitEvent) {
		event.preventDefault();
		createError = null;
		createSuccess = null;

		if (!createNombre.trim() || !createEmail.trim() || !createTelefono.trim()) {
			createError = 'Completa nombre, correo y teléfono del prospecto.';
			return;
		}

		if (createTipo === 'VENTA' && createIdPropiedadInteres.trim()) {
			createError = 'Un lead vendedor no debe vincularse a una propiedad pública de interés.';
			return;
		}

		creating = true;
		try {
			await registrarLead(ventasRepository, {
				nombre: createNombre.trim(),
				email: createEmail.trim(),
				telefono: createTelefono.trim(),
				tipo: createTipo,
				idPropiedadInteres:
					createTipo === 'COMPRA' ? createIdPropiedadInteres.trim() || undefined : undefined,
				datosPropiedad:
					createTipo === 'VENTA' && createTituloPropiedad.trim()
						? {
								titulo: createTituloPropiedad.trim(),
								descripcion: createDescripcionPropiedad.trim(),
								precio: createPrecioPropiedad
							}
						: undefined
			});
			createSuccess = 'Lead registrado y asignado a tu cartera.';
			limpiarFormularioLead();
			await cargarLeads();
			cerrarPanel();
		} catch (err) {
			createError = err instanceof HttpError ? err.message : 'No se pudo registrar el lead.';
		} finally {
			creating = false;
		}
	}

	async function editarLead(event: SubmitEvent) {
		event.preventDefault();
		updateError = null;
		updateSuccess = null;

		if (!editIdLead.trim()) {
			updateError = 'Selecciona el lead que vas a actualizar.';
			return;
		}

		if (
			!editNombre.trim() &&
			!editEmail.trim() &&
			!editTelefono.trim() &&
			!editTipo &&
			!editIdPropiedadInteres.trim()
		) {
			updateError = 'Indica al menos un dato para actualizar.';
			return;
		}

		updating = true;
		try {
			await actualizarLead(ventasRepository, {
				idLead: editIdLead.trim(),
				nombre: editNombre.trim() || undefined,
				email: editEmail.trim() || undefined,
				telefono: editTelefono.trim() || undefined,
				tipo: editTipo || undefined,
				idPropiedadInteres: editIdPropiedadInteres.trim() || undefined
			});
			updateSuccess = 'Lead actualizado. La API registró la actividad correspondiente.';
			limpiarFormularioEdicion();
			await cargarLeads();
		} catch (err) {
			updateError = err instanceof HttpError ? err.message : 'No se pudo actualizar el lead.';
		} finally {
			updating = false;
		}
	}

	async function crearContratoParaLead(event: SubmitEvent) {
		event.preventDefault();
		contratoError = null;

		if (
			!contratoLeadId.trim() ||
			!contratoPropiedadId ||
			!contratoFechaInicio ||
			!contratoFechaFin
		) {
			contratoError = 'Completa todos los campos del contrato.';
			return;
		}

		if (new Date(contratoFechaFin) <= new Date(contratoFechaInicio)) {
			contratoError = 'La fecha de fin debe ser posterior a la fecha de inicio.';
			return;
		}

		creandoContrato = true;
		try {
			const contrato = await crearContrato(ventasRepository, {
				idLead: contratoLeadId.trim(),
				idPropiedad: contratoPropiedadId,
				fechaInicio: new Date(contratoFechaInicio).toISOString(),
				fechaFin: new Date(contratoFechaFin).toISOString()
			});
			contratoCreado = contrato;
		} catch (err) {
			contratoError = err instanceof HttpError ? err.message : 'No se pudo crear el contrato.';
		} finally {
			creandoContrato = false;
		}
	}

	async function firmarContratoCreado() {
		if (!contratoCreado) return;
		firmandoContrato = true;
		try {
			await firmarContrato(ventasRepository, contratoCreado.id);
			contratoFirmado = true;
		} catch (err) {
			contratoError = err instanceof HttpError ? err.message : 'No se pudo firmar el contrato.';
		} finally {
			firmandoContrato = false;
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
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Mis leads</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Prospectos asignados a tu usuario, con estado actual y citas registradas para seguimiento.
			</p>
		</div>
		<div class="flex gap-2">
			<Button variant="secondary" onclick={cargarLeads}>Actualizar</Button>
			<Button onclick={() => abrirPanel('crear')}>+ Nuevo lead</Button>
		</div>
	</div>

	<!-- Data first: Stats + Table -->
	{#if loading}
		<Card>
			<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
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
					<label class="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
						<input type="checkbox" bind:checked={mostrarConvertidos} class="accent-primary" />
						Mostrar convertidos
					</label>
					<Button variant="secondary" onclick={() => abrirPanel('crear')}>+ Nuevo lead</Button>
				</div>
			</div>
			<LeadPipelineTable
				leads={leadsFiltrados}
				onLeadClick={(lead) => abrirPanel('actividad', lead)}
				onEditClick={(lead) => abrirPanel('editar', lead)}
			/>
		</Card>
	{/if}
</div>

<!-- SidePanel with forms -->
<SidePanel
	isOpen={panelOpen}
	onClose={cerrarPanel}
	title={panelMode === 'crear'
		? 'Registrar lead'
		: panelMode === 'editar'
			? 'Editar lead'
			: panelMode === 'contrato'
				? 'Crear contrato'
				: 'Actividad del lead'}
>
	{#if panelMode === 'crear'}
		<form class="flex flex-col gap-4" onsubmit={crearLead}>
			{#if createSuccess}
				<p class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
					{createSuccess}
				</p>
			{/if}
			{#if createError}
				<p class="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
					{createError}
				</p>
			{/if}

			<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
				Nombre
				<input
					bind:value={createNombre}
					class="rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
					placeholder="Nombre del prospecto"
				/>
			</label>
			<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
				Teléfono
				<input
					bind:value={createTelefono}
					class="rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
					placeholder="Número de contacto"
				/>
			</label>
			<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
				Correo
				<input
					bind:value={createEmail}
					type="email"
					class="rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
					placeholder="correo@ejemplo.com"
				/>
			</label>
			<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
				Tipo
				<select
					bind:value={createTipo}
					class="rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
				>
					<option value="COMPRA">Compra</option>
					<option value="VENTA">Venta</option>
				</select>
			</label>

			{#if createTipo === 'COMPRA'}
				<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
					Propiedad de interés
					<select
						bind:value={createIdPropiedadInteres}
						class="rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
					>
						<option value="">Selecciona una propiedad (opcional)</option>
						{#each propiedades as prop (prop.id)}
							<option value={prop.id}>{prop.titulo || prop.id}</option>
						{/each}
					</select>
				</label>
			{:else}
				<div class="flex flex-col gap-3 rounded-2xl bg-surface-muted p-4">
					<p class="text-xs font-semibold text-text-main">Datos de la propiedad a vender</p>
					<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
						Título
						<input
							bind:value={createTituloPropiedad}
							class="rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
							placeholder="Ej: Departamento en Miraflores"
						/>
					</label>
					<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
						Precio (USD)
						<input
							bind:value={createPrecioPropiedad}
							type="number"
							class="rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
						/>
					</label>
					<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
						Descripción
						<textarea
							bind:value={createDescripcionPropiedad}
							class="min-h-[60px] rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
						></textarea>
					</label>
				</div>
			{/if}

			<div class="mt-2 flex gap-3">
				<Button type="button" variant="ghost" onclick={limpiarFormularioLead}>Limpiar</Button>
				<Button type="submit" disabled={creating}
					>{creating ? 'Registrando...' : 'Registrar lead'}</Button
				>
			</div>
		</form>
	{:else if panelMode === 'editar'}
		<form class="flex flex-col gap-4" onsubmit={editarLead}>
			{#if updateSuccess}
				<p class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
					{updateSuccess}
				</p>
			{/if}
			{#if updateError}
				<p class="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
					{updateError}
				</p>
			{/if}

			<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
				ID del lead
				<input
					bind:value={editIdLead}
					class="rounded-xl border border-border-light bg-white px-4 py-2.5 font-mono text-xs transition outline-none focus:border-amber-400"
					placeholder="Selecciona un lead de la tabla"
					disabled
				/>
			</label>
			<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
				Nombre
				<input
					bind:value={editNombre}
					class="rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
					placeholder="Nuevo nombre"
				/>
			</label>
			<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
				Teléfono
				<input
					bind:value={editTelefono}
					class="rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
					placeholder="Nuevo teléfono"
				/>
			</label>
			<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
				Correo
				<input
					bind:value={editEmail}
					type="email"
					class="rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
					placeholder="Nuevo correo"
				/>
			</label>
			<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
				Tipo
				<select
					bind:value={editTipo}
					class="rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
				>
					<option value="">Sin cambio</option>
					<option value="COMPRA">Compra</option>
					<option value="VENTA">Venta</option>
				</select>
			</label>
			<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
				Propiedad de interés
				<input
					bind:value={editIdPropiedadInteres}
					class="rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
					placeholder="ID de propiedad"
				/>
			</label>

			<div class="mt-2 flex gap-3">
				<Button type="button" variant="ghost" onclick={limpiarFormularioEdicion}>Limpiar</Button>
				<Button type="submit" disabled={updating}
					>{updating ? 'Actualizando...' : 'Actualizar lead'}</Button
				>
			</div>
		</form>
	{:else if panelMode === 'contrato'}
		{#if contratoCreado}
			<div class="flex flex-col gap-4">
				<div class="flex items-center gap-3">
					<span
						class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700"
						>✓</span
					>
					<div>
						<h3 class="font-display text-lg font-bold text-text-main">
							{contratoFirmado ? 'Contrato firmado' : 'Contrato creado'}
						</h3>
						<p class="text-sm text-text-muted">
							{contratoFirmado
								? 'El contrato ya está vigente.'
								: `Estado: ${contratoCreado.estado}`}
						</p>
					</div>
				</div>
				<div class="rounded-xl border border-border-light bg-bg-base p-4 text-sm">
					<p><span class="font-semibold">Propiedad:</span> {contratoCreado.idPropiedad}</p>
					<p>
						<span class="font-semibold">Inicio:</span>
						{new Date(contratoCreado.fechaInicio).toLocaleDateString('es-PE')}
					</p>
					<p>
						<span class="font-semibold">Fin:</span>
						{new Date(contratoCreado.fechaFin).toLocaleDateString('es-PE')}
					</p>
				</div>
				{#if contratoFirmado}
					<Button onclick={cerrarPanel}>Cerrar</Button>
				{:else}
					<div class="flex gap-3">
						<Button onclick={firmarContratoCreado} disabled={firmandoContrato}
							>{firmandoContrato ? 'Firmando...' : 'Firmar contrato'}</Button
						>
						<Button variant="ghost" onclick={reiniciarFlujoContrato}>Descartar</Button>
					</div>
				{/if}
			</div>
		{:else}
			<form class="flex flex-col gap-4" onsubmit={crearContratoParaLead}>
				{#if contratoError}
					<p class="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
						{contratoError}
					</p>
				{/if}

				<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
					Lead
					<input
						bind:value={contratoLeadId}
						class="rounded-xl border border-border-light bg-white px-4 py-2.5 font-mono text-xs transition outline-none focus:border-amber-400"
						disabled
					/>
				</label>
				<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
					Propiedad
					<select
						bind:value={contratoPropiedadId}
						class="rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
					>
						<option value="">Seleccionar propiedad</option>
						{#each propiedades as p (p.id)}
							<option value={p.id}>{p.titulo || p.id}</option>
						{/each}
					</select>
				</label>
				<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
					Fecha de inicio
					<input
						type="date"
						bind:value={contratoFechaInicio}
						class="rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
					/>
				</label>
				<label class="flex flex-col gap-1.5 text-sm font-semibold text-text-main">
					Fecha de fin
					<input
						type="date"
						bind:value={contratoFechaFin}
						class="rounded-xl border border-border-light bg-white px-4 py-2.5 transition outline-none focus:border-amber-400"
					/>
				</label>

				<Button type="submit" disabled={creandoContrato}
					>{creandoContrato ? 'Creando...' : 'Crear contrato'}</Button
				>
			</form>
		{/if}
	{:else if panelMode === 'actividad'}
		<ActividadLeadTimeline leadId={actividadLeadId} />
	{/if}
</SidePanel>
