<script lang="ts">
	import Button from '$lib/shared/ui/Button.svelte';
	import Card from '$lib/shared/ui/Card.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import type { Cliente } from '$lib/clientes/domain/models/Cliente';
	import ClienteTable from '$lib/clientes/presentation/ClienteTable.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let clientes = $derived((data?.clientes as unknown as Cliente[]) ?? []);
	let loading = $state(false);
	let error = $state<string | null>(null);

	function irACliente(c: Cliente) {
		goto(`/admin/clientes/${encodeURIComponent(c.id)}`);
	}

	async function cargar() {
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
</script>

<svelte:head>
	<title>Clientes | ALVAS</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
		<div>
			<p class="section-label">Clientes</p>
			<h1 class="page-heading">Todos los clientes</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Clientes formalizados desde leads convertidos o registrados directamente.
			</p>
		</div>

		<Button variant="secondary" onclick={cargar}>Actualizar</Button>
	</div>

	{#if loading}
		<Card>
			<div class="skeleton"></div>
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
			<ClienteTable {clientes} onClienteClick={irACliente} />
		</Card>
	{/if}
</div>
