<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
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
	let loading = $state(true);
	let creating = $state(false);
	let error = $state<string | null>(null);
	let createError = $state<string | null>(null);
	let createSuccess = $state<string | null>(null);
	let updateError = $state<string | null>(null);
	let updateSuccess = $state<string | null>(null);
	let updating = $state(false);
	let nombre = $state('');
	let email = $state('');
	let telefono = $state('');
	let tipo = $state<'COMPRA' | 'VENTA'>('COMPRA');
	let idPropiedadInteres = $state('');
	let tituloPropiedad = $state('');
	let descripcionPropiedad = $state('');
	let precioPropiedad = $state(0);
	let editIdLead = $state('');
	let editNombre = $state('');
	let editEmail = $state('');
	let editTelefono = $state('');
	let editTipo = $state<'COMPRA' | 'VENTA' | ''>('');
	let editIdPropiedadInteres = $state('');

	// Estado del flujo lead -> contrato -> firma (cliente se crea al firmar)
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

	async function cargarPropiedades() {
		if (propiedades.length > 0) return;
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
		nombre = '';
		email = '';
		telefono = '';
		tipo = 'COMPRA';
		idPropiedadInteres = '';
		tituloPropiedad = '';
		descripcionPropiedad = '';
		precioPropiedad = 0;
	}

	function limpiarFormularioEdicion() {
		editIdLead = '';
		editNombre = '';
		editEmail = '';
		editTelefono = '';
		editTipo = '';
		editIdPropiedadInteres = '';
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

	async function crearLead(event: SubmitEvent) {
		event.preventDefault();
		createError = null;
		createSuccess = null;

		if (!nombre.trim() || !email.trim() || !telefono.trim()) {
			createError = 'Completa nombre, correo y teléfono del prospecto.';
			return;
		}

		if (tipo === 'VENTA' && idPropiedadInteres.trim()) {
			createError = 'Un lead vendedor no debe vincularse a una propiedad pública de interés.';
			return;
		}

		creating = true;

		try {
			await registrarLead(ventasRepository, {
				nombre: nombre.trim(),
				email: email.trim(),
				telefono: telefono.trim(),
				tipo,
				idPropiedadInteres: tipo === 'COMPRA' ? idPropiedadInteres.trim() || undefined : undefined,
				datosPropiedad:
					tipo === 'VENTA' && tituloPropiedad.trim()
						? {
								titulo: tituloPropiedad.trim(),
								descripcion: descripcionPropiedad.trim(),
								precio: precioPropiedad
							}
						: undefined
			});
			createSuccess = 'Lead registrado y asignado a tu cartera.';
			limpiarFormularioLead();
			await cargarLeads();
		} catch (err) {
			createError = err instanceof HttpError ? err.message : 'No se pudo registrar el lead.';
		} finally {
			creating = false;
		}
	}

	$effect(() => {
		cargarLeads();
		cargarPropiedades();
	});
</script>

<svelte:head>
	<title>Mis Leads | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Cartera</p>
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Mis leads</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Prospectos asignados a tu usuario, con estado actual y citas registradas para seguimiento.
			</p>
		</div>

		<Button variant="secondary" onclick={cargarLeads}>Actualizar leads</Button>
	</div>

	<Card>
		<div class="mb-5">
			<h2 class="font-display text-xl font-bold text-text-main">Registrar lead</h2>
			<p class="mt-1 text-sm leading-relaxed text-text-muted">
				Alta manual para prospectos contactados por el asesor. Los compradores pueden indicar una
				propiedad disponible de interés; los vendedores deben entrar por captación.
			</p>
		</div>

		{#if createSuccess}
			<p class="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
				{createSuccess}
			</p>
		{/if}

		{#if createError}
			<p class="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
				{createError}
			</p>
		{/if}

		<form class="grid gap-4 md:grid-cols-2" onsubmit={crearLead}>
			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Nombre
				<input
					bind:value={nombre}
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
					placeholder="Nombre del prospecto"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Teléfono
				<input
					bind:value={telefono}
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
					placeholder="Número de contacto"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Correo
				<input
					bind:value={email}
					type="email"
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
					placeholder="correo@ejemplo.com"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Tipo
				<select
					bind:value={tipo}
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
				>
					<option value="COMPRA">Compra</option>
					<option value="VENTA">Venta</option>
				</select>
			</label>

			{#if tipo === 'COMPRA'}
				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main md:col-span-2">
					Propiedad de interés
					<select
						bind:value={idPropiedadInteres}
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
					>
						<option value="">Selecciona una propiedad (opcional)</option>
						{#each propiedades as prop (prop.id)}
							<option value={prop.id}>{prop.titulo || prop.id}</option>
						{/each}
					</select>
				</label>
			{:else}
				<div class="grid gap-4 rounded-2xl bg-surface-muted p-5 md:col-span-2 md:grid-cols-2">
					<div class="md:col-span-2">
						<h3 class="text-sm font-bold text-text-main">Datos de la propiedad a vender</h3>
						<p class="text-xs text-text-muted">
							Se creará una propiedad preliminar asociada a este lead.
						</p>
					</div>

					<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
						Título de la propiedad
						<input
							bind:value={tituloPropiedad}
							class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
							placeholder="Ej: Departamento en Miraflores"
						/>
					</label>

					<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
						Precio estimado (USD)
						<input
							bind:value={precioPropiedad}
							type="number"
							class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
							placeholder="0.00"
						/>
					</label>

					<label class="flex flex-col gap-2 text-sm font-semibold text-text-main md:col-span-2">
						Descripción breve
						<textarea
							bind:value={descripcionPropiedad}
							class="min-h-[80px] rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
							placeholder="Detalles sobre la propiedad..."
						></textarea>
					</label>
				</div>
			{/if}

			<div class="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
				<Button type="button" variant="ghost" onclick={limpiarFormularioLead}>Limpiar</Button>
				<Button type="submit" disabled={creating}>
					{creating ? 'Registrando...' : 'Registrar lead'}
				</Button>
			</div>
		</form>
	</Card>

	<Card>
		<div class="mb-5">
			<h2 class="font-display text-xl font-bold text-text-main">Gestionar lead</h2>
			<p class="mt-1 text-sm leading-relaxed text-text-muted">
				Ajusta datos del prospecto o crea un contrato directamente. Al firmar el contrato, el lead
				se convierte automáticamente en cliente.
			</p>
		</div>

		{#if updateSuccess}
			<p class="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
				{updateSuccess}
			</p>
		{/if}

		{#if updateError}
			<p class="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
				{updateError}
			</p>
		{/if}

		<datalist id="leads-cartera">
			{#each leads as lead (lead.id)}
				<option value={lead.id}>{lead.nombre}</option>
			{/each}
		</datalist>

		<div class="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
			<form class="grid gap-4 md:grid-cols-2" onsubmit={editarLead}>
				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main md:col-span-2">
					Lead
					<input
						bind:value={editIdLead}
						list="leads-cartera"
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="ID del lead"
					/>
				</label>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
					Nombre
					<input
						bind:value={editNombre}
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="Nuevo nombre"
					/>
				</label>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
					Teléfono
					<input
						bind:value={editTelefono}
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="Nuevo teléfono"
					/>
				</label>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
					Correo
					<input
						bind:value={editEmail}
						type="email"
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="Nuevo correo"
					/>
				</label>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
					Tipo
					<select
						bind:value={editTipo}
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
					>
						<option value="">Sin cambio</option>
						<option value="COMPRA">Compra</option>
						<option value="VENTA">Venta</option>
					</select>
				</label>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main md:col-span-2">
					Propiedad de interés
					<input
						bind:value={editIdPropiedadInteres}
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="ID de propiedad, si aplica"
					/>
				</label>

				<div class="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
					<Button type="button" variant="ghost" onclick={limpiarFormularioEdicion}>Limpiar</Button>
					<Button type="submit" disabled={updating}>
						{updating ? 'Actualizando...' : 'Actualizar lead'}
					</Button>
				</div>
			</form>

			<form
				class="flex flex-col justify-between gap-4 rounded-3xl border border-primary/15 bg-primary-light/45 p-5"
				onsubmit={crearContratoParaLead}
			>
				<div>
					<h3 class="font-display text-lg font-bold text-text-main">Crear contrato</h3>
					<p class="mt-1 text-sm leading-relaxed text-text-muted">
						Crea un contrato en borrador para el lead. Al firmarlo se convertirá automáticamente en
						cliente.
					</p>
				</div>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
					Lead
					<input
						bind:value={contratoLeadId}
						list="leads-cartera"
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="ID del lead"
					/>
				</label>

				<Button type="button" variant="ghost" onclick={cargarPropiedades}>Cargar propiedades</Button
				>
			</form>
		</div>
	</Card>

	{#if contratoLeadId.trim()}
		<Card>
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
									? 'El contrato ya está vigente. El lead se convirtió en cliente automáticamente.'
									: `Contrato en estado ${contratoCreado.estado} para el lead.`}
							</p>
						</div>
					</div>

					<div class="rounded-2xl border border-border-light bg-bg-base p-4 text-sm">
						<div class="grid gap-2 sm:grid-cols-2">
							<div>
								<span class="font-semibold text-text-main">Lead:</span>
								<span class="ml-1 text-text-muted">{contratoCreado.idLead}</span>
							</div>
							{#if contratoCreado.idCliente}
								<div>
									<span class="font-semibold text-text-main">Cliente generado:</span>
									<span class="ml-1 text-text-muted">{contratoCreado.idCliente}</span>
								</div>
							{/if}
							<div>
								<span class="font-semibold text-text-main">Propiedad:</span>
								<span class="ml-1 text-text-muted">{contratoCreado.idPropiedad}</span>
							</div>
							<div>
								<span class="font-semibold text-text-main">Inicio:</span>
								<span class="ml-1 text-text-muted"
									>{new Date(contratoCreado.fechaInicio).toLocaleDateString('es-PE')}</span
								>
							</div>
							<div>
								<span class="font-semibold text-text-main">Fin:</span>
								<span class="ml-1 text-text-muted"
									>{new Date(contratoCreado.fechaFin).toLocaleDateString('es-PE')}</span
								>
							</div>
						</div>
					</div>

					{#if contratoFirmado}
						<p class="text-sm font-semibold text-emerald-700">
							Contrato vigente. Puedes verlo en la sección de contratos.
						</p>
						<Button variant="secondary" onclick={reiniciarFlujoContrato}>Cerrar</Button>
					{:else}
						<div class="flex gap-3">
							<Button onclick={firmarContratoCreado} disabled={firmandoContrato}>
								{firmandoContrato ? 'Firmando...' : 'Firmar contrato'}
							</Button>
							<Button variant="ghost" onclick={reiniciarFlujoContrato}>Descartar</Button>
						</div>
					{/if}
				</div>
			{:else}
				<div class="flex flex-col gap-4">
					<div class="flex items-center gap-3">
						<span
							class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-lg font-bold text-primary"
							>+</span
						>
						<div>
							<h3 class="font-display text-lg font-bold text-text-main">Crear contrato</h3>
							<p class="text-sm text-text-muted">Registra un contrato en borrador para el lead.</p>
						</div>
					</div>

					{#if contratoError}
						<p class="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
							{contratoError}
						</p>
					{/if}

					<form class="grid gap-4 md:grid-cols-2" onsubmit={crearContratoParaLead}>
						<label class="flex flex-col gap-2 text-sm font-semibold text-text-main md:col-span-2">
							Propiedad
							<select
								bind:value={contratoPropiedadId}
								class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
							>
								<option value="">Seleccionar propiedad</option>
								{#each propiedades as p (p.id)}
									<option value={p.id}>{p.titulo || p.id}</option>
								{/each}
							</select>
						</label>

						<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
							Fecha de inicio
							<input
								type="date"
								bind:value={contratoFechaInicio}
								class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
							/>
						</label>

						<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
							Fecha de fin
							<input
								type="date"
								bind:value={contratoFechaFin}
								class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
							/>
						</label>

						<div class="flex gap-3 md:col-span-2 md:justify-end">
							<Button type="button" variant="ghost" onclick={reiniciarFlujoContrato}
								>Cancelar</Button
							>
							<Button type="submit" disabled={creandoContrato}>
								{creandoContrato ? 'Creando...' : 'Crear contrato'}
							</Button>
						</div>
					</form>
				</div>
			{/if}
		</Card>
	{/if}

	{#if editIdLead.trim()}
		<Card>
			<ActividadLeadTimeline leadId={editIdLead.trim()} />
		</Card>
	{/if}

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
		<PipelineStats {leads} />
		<Card>
			<LeadPipelineTable {leads} />
		</Card>
	{/if}
</div>
