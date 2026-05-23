<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import SidePanel from '$lib/shared/ui/SidePanel.svelte';
	import { goto } from '$app/navigation';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { Cliente } from '$lib/clientes/domain/models/Cliente';
	import { listarClientes } from '$lib/clientes/application/use-cases/listarClientes';
	import { registrarCliente } from '$lib/clientes/application/use-cases/registrarCliente';
	import { clienteRepository } from '$lib/clientes/infrastructure/clienteRepository';
	import ClienteTable from '$lib/clientes/presentation/ClienteTable.svelte';

	let clientes = $state<Cliente[]>([]);
	let loading = $state(true);
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
			clientes = await listarClientes(clienteRepository);
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudo cargar clientes.';
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

	$effect(() => {
		cargarClientes();
	});
</script>

<svelte:head>
	<title>Clientes | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Clientes</p>
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Cartera de clientes</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Clientes formalizados desde leads convertidos o registrados directamente para seguimiento
				comercial.
			</p>
		</div>

		<Button variant="secondary" onclick={() => (mostrarPanel = true)}>Nuevo cliente</Button>
	</div>

	<SidePanel isOpen={mostrarPanel} title="Nuevo cliente" onClose={() => (mostrarPanel = false)}>
		<form class="grid gap-4" onsubmit={crearCliente}>
			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Nombre
				<input
					bind:value={nombre}
					class="rounded-2xl border border-border-light bg-bg-card px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
					placeholder="Nombre del cliente"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Teléfono
				<input
					bind:value={telefono}
					class="rounded-2xl border border-border-light bg-bg-card px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
					placeholder="Número de contacto"
				/>
			</label>

			<label class="flex flex-col gap-2 text-sm font-semibold text-text-main">
				Correo
				<input
					bind:value={email}
					type="email"
					class="rounded-2xl border border-border-light bg-bg-card px-4 py-3 font-normal text-text-main outline-none focus:border-primary"
					placeholder="correo@ejemplo.com"
				/>
			</label>

			{#if createError}
				<p class="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
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
			<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No se pudo cargar clientes</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargarClientes}>Intentar nuevamente</Button>
		</Card>
	{:else if clientes.length === 0}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No hay clientes registrados</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">
				Los leads convertidos y clientes directos aparecerán en esta cartera.
			</p>
		</Card>
	{:else}
		<Card>
			<ClienteTable {clientes} onClienteClick={irACliente} />
		</Card>
	{/if}
</div>
