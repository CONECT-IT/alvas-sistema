<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { HttpError } from '$lib/shared/http/httpClient';
	import type { Cliente } from '$lib/clientes/domain/models/Cliente';
	import { listarClientes } from '$lib/clientes/application/use-cases/listarClientes';
	import { clienteRepository } from '$lib/clientes/infrastructure/clienteRepository';
	import ClienteTable from '$lib/clientes/presentation/ClienteTable.svelte';

	let clientes = $state<Cliente[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function cargar() {
		loading = true;
		error = null;

		try {
			clientes = await listarClientes(clienteRepository);
		} catch (err) {
			error = err instanceof HttpError ? err.message : 'No se pudieron cargar los clientes.';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		cargar();
	});
</script>

<svelte:head>
	<title>Clientes | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="text-sm font-semibold tracking-[0.18em] text-primary uppercase">Clientes</p>
			<h1 class="mt-2 font-display text-3xl font-bold text-text-main">Todos los clientes</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Clientes formalizados desde leads convertidos o registrados directamente.
			</p>
		</div>

		<Button variant="secondary" onclick={cargar}>Actualizar</Button>
	</div>

	{#if loading}
		<Card>
			<div class="h-64 animate-pulse rounded-2xl bg-surface-muted"></div>
		</Card>
	{:else if error}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">
				No se pudieron cargar los clientes
			</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">{error}</p>
			<Button class="mt-5" onclick={cargar}>Intentar nuevamente</Button>
		</Card>
	{:else if clientes.length === 0}
		<Card class="text-center">
			<p class="font-display text-xl font-bold text-text-main">No hay clientes registrados</p>
			<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">
				Los leads convertidos y clientes directos aparecerán aquí.
			</p>
		</Card>
	{:else}
		<Card>
			<ClienteTable {clientes} />
		</Card>
	{/if}
</div>
