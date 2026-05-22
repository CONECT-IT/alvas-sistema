<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { LeadPipeline } from '$lib/ventas/domain/models/LeadPipeline';
	import { listarPipeline } from '$lib/ventas/application/use-cases/listarPipeline';
	import { registrarLead } from '$lib/ventas/application/use-cases/registrarLead';
	import { ventasRepository } from '$lib/ventas/infrastructure/ventasRepository';
	import LeadPipelineTable from '$lib/ventas/presentation/LeadPipelineTable.svelte';
	import PipelineStats from '$lib/ventas/presentation/PipelineStats.svelte';

	let leads = $state<LeadPipeline[]>([]);
	let loading = $state(true);
	let creating = $state(false);
	let error = $state<string | null>(null);
	let createError = $state<string | null>(null);
	let createSuccess = $state<string | null>(null);
	let nombre = $state('');
	let email = $state('');
	let telefono = $state('');
	let tipo = $state<'COMPRA' | 'VENTA'>('COMPRA');
	let idPropiedadInteres = $state('');

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
