<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import FloatingTextInput from '$lib/shared/ui/FloatingTextInput.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { Cliente } from '$lib/clientes/domain/models/Cliente';
	import { registrarCliente } from '$lib/clientes/application/use-cases/registrarCliente';
	import { clienteRepository } from '$lib/clientes/infrastructure/clienteRepository';
	import ClienteTable from '$lib/clientes/presentation/ClienteTable.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let clientes = $derived((data?.clientes as unknown as Cliente[]) ?? []);
	let loading = $state(false);
	let creating = $state(false);
	let error = $state<string | null>(null);

	function irACliente(c: Cliente) {
		goto(`/asesor/clientes/${encodeURIComponent(c.id)}`);
	}
	let createError = $state<string | null>(null);
	let mostrarPanel = $state(false);
	let nombre = $state('');
	let email = $state('');
	let telefono = $state('');

	async function cargarClientes() {
		loading = true;
		error = null;

		try {
			await invalidateAll();
		} catch {
			error = 'No se pudieron actualizar los clientes.';
		} finally {
			loading = false;
		}
	}

	function limpiarFormulario() {
		nombre = '';
		email = '';
		telefono = '';
	}

	async function crearCliente(event: SubmitEvent) {
		event.preventDefault();
		createError = null;

		if (!nombre.trim() || !email.trim() || !telefono.trim()) {
			createError = 'Completa nombre, correo y teléfono del cliente.';
			return;
		}

		creating = true;

		try {
			await registrarCliente(clienteRepository, {
				nombre: nombre.trim(),
				email: email.trim(),
				telefono: telefono.trim()
			});
			limpiarFormulario();
			mostrarPanel = false;
			await cargarClientes();
		} catch (err) {
			createError = err instanceof HttpError ? err.message : 'No se pudo registrar el cliente.';
		} finally {
			creating = false;
		}
	}
</script>

<svelte:head>
	<title>Clientes | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="section-label">Clientes</p>
			<h1 class="page-heading">Clientes y contratos</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Tu cartera de clientes formalizados y acceso rápido a contratos de seguimiento.
			</p>
		</div>

		<Button variant="secondary" onclick={() => (mostrarPanel = true)}>Nuevo cliente</Button>
	</div>

	<SidePanel isOpen={mostrarPanel} title="Nuevo cliente" onClose={() => (mostrarPanel = false)}>
		<form class="grid gap-4" onsubmit={crearCliente}>
			<FloatingTextInput label="Nombre" bind:value={nombre} />
			<FloatingTextInput label="Telefono" bind:value={telefono} />
			<FloatingTextInput label="Correo" type="email" bind:value={email} />

			{#if createError}
				<p class="error-alert">
					{createError}
				</p>
			{/if}

			<Button type="submit" disabled={creating}>
				{creating ? 'Registrando...' : 'Registrar cliente'}
			</Button>
		</form>
	</SidePanel>

	{#if loading}
		<Card>
			<div class="skeleton"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudo cargar clientes</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargarClientes}>Intentar nuevamente</Button>
		</Card>
	{:else if clientes.length === 0}
		<div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
			<Card class="text-center">
				<p class="font-display text-xl font-bold text-text-main">No hay clientes registrados</p>
				<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">
					Los leads convertidos y clientes directos aparecerán en esta cartera.
				</p>
			</Card>
			<Card>
				<h2 class="font-display text-xl font-bold text-text-main">Contratos</h2>
				<p class="mt-2 text-sm text-text-muted">Sin clientes registrados todavía.</p>
				<Button href="/asesor/contratos" variant="secondary" class="mt-5">Ver contratos</Button>
			</Card>
		</div>
	{:else}
		<div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
			<Card>
				<div class="mb-5">
					<h2 class="font-display text-xl font-bold text-text-main">Clientes</h2>
					<p class="mt-1 text-sm text-text-muted">{clientes.length} clientes en cartera.</p>
				</div>
				<ClienteTable {clientes} onClienteClick={irACliente} />
			</Card>
			<Card>
				<h2 class="font-display text-xl font-bold text-text-main">Contratos</h2>
				<p class="mt-2 text-sm text-text-muted">
					Accede a contratos pendientes, firmados o cancelados de tus clientes.
				</p>
				<Button href="/asesor/contratos" variant="secondary" class="mt-5">Abrir contratos</Button>
			</Card>
		</div>
	{/if}
</div>
