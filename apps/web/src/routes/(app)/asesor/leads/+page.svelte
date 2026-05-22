<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { LeadPipeline } from '$lib/ventas/domain/models/LeadPipeline';
	import { actualizarLead } from '$lib/ventas/application/use-cases/actualizarLead';
	import { convertirLead } from '$lib/ventas/application/use-cases/convertirLead';
	import { listarPipeline } from '$lib/ventas/application/use-cases/listarPipeline';
	import { registrarLead } from '$lib/ventas/application/use-cases/registrarLead';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';
	import ActividadLeadTimeline from '$lib/ventas/presentation/ActividadLeadTimeline.svelte';
	import LeadPipelineTable from '$lib/ventas/presentation/LeadPipelineTable.svelte';
	import PipelineStats from '$lib/ventas/presentation/PipelineStats.svelte';

	let leads = $state<LeadPipeline[]>([]);
	let loading = $state(true);
	let creating = $state(false);
	let error = $state<string | null>(null);
	let createError = $state<string | null>(null);
	let createSuccess = $state<string | null>(null);
	let updateError = $state<string | null>(null);
	let updateSuccess = $state<string | null>(null);
	let updating = $state(false);
	let converting = $state(false);
	let nombre = $state('');
	let email = $state('');
	let telefono = $state('');
	let tipo = $state<'COMPRA' | 'VENTA'>('COMPRA');
	let idPropiedadInteres = $state('');
	let editIdLead = $state('');
	let editNombre = $state('');
	let editEmail = $state('');
	let editTelefono = $state('');
	let editTipo = $state<'COMPRA' | 'VENTA' | ''>('');
	let editIdPropiedadInteres = $state('');
	let convertIdLead = $state('');

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

	function limpiarFormularioLead() {
		nombre = '';
		email = '';
		telefono = '';
		tipo = 'COMPRA';
		idPropiedadInteres = '';
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

	async function convertirLeadACliente(event: SubmitEvent) {
		event.preventDefault();
		updateError = null;
		updateSuccess = null;

		if (!convertIdLead.trim()) {
			updateError = 'Selecciona el lead que se convertirá a cliente.';
			return;
		}

		converting = true;

		try {
			const idCliente = await convertirLead(ventasRepository, { idLead: convertIdLead.trim() });
			updateSuccess = `Lead convertido a cliente. Cliente generado: ${idCliente}`;
			convertIdLead = '';
			await cargarLeads();
		} catch (err) {
			updateError = err instanceof HttpError ? err.message : 'No se pudo convertir el lead.';
		} finally {
			converting = false;
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
				idPropiedadInteres: tipo === 'COMPRA' ? idPropiedadInteres.trim() || undefined : undefined
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

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main md:col-span-2">
				Propiedad de interés
				<input
					bind:value={idPropiedadInteres}
					disabled={tipo === 'VENTA'}
					class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary disabled:bg-surface-muted disabled:text-text-muted"
					placeholder="ID de propiedad disponible, solo para comprador"
				/>
			</label>

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
				Ajusta datos del prospecto o conviértelo a cliente cuando la oportunidad ya esté validada.
				La trazabilidad se registra en ventas desde la API.
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
				onsubmit={convertirLeadACliente}
			>
				<div>
					<h3 class="font-display text-lg font-bold text-text-main">Convertir a cliente</h3>
					<p class="mt-1 text-sm leading-relaxed text-text-muted">
						Usa esta acción cuando el prospecto ya aceptó avanzar como cliente formal.
					</p>
				</div>

				<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
					Lead
					<input
						bind:value={convertIdLead}
						list="leads-cartera"
						class="rounded-2xl border border-border-light bg-white px-4 py-3 font-normal text-text-main transition outline-none focus:border-primary"
						placeholder="ID del lead"
					/>
				</label>

				<Button type="submit" disabled={converting}>
					{converting ? 'Convirtiendo...' : 'Convertir lead'}
				</Button>
			</form>
		</div>
	</Card>

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
