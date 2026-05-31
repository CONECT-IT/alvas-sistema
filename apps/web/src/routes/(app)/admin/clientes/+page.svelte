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
			<h1 class="page-heading">Clientes y contratos</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
				Cartera de clientes formalizados con acceso directo a contratos asociados.
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
		<div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
			<Card class="text-center">
				<p class="font-display text-xl font-bold text-text-main">No hay clientes registrados</p>
				<p class="mx-auto mt-2 max-w-xl text-sm text-text-muted">
					Los leads convertidos y clientes directos aparecerán aquí.
				</p>
			</Card>
			<Card>
				<h2 class="font-display text-xl font-bold text-text-main">Contratos</h2>
				<p class="mt-2 text-sm text-text-muted">Sin clientes registrados todavía.</p>
				<Button href="/admin/contratos" variant="secondary" class="mt-5">Ver contratos</Button>
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
					Revisa documentos activos, firmas pendientes y cancelaciones desde el módulo contractual.
				</p>
				<div class="mt-5 grid gap-3">
					<a
						href="/admin/contratos"
						class="rounded-xl border border-border-light bg-bg-base p-4 text-sm font-semibold text-text-main transition hover:border-primary/40"
					>
						Contratos activos
					</a>
					<a
						href="/admin/contratos"
						class="rounded-xl border border-border-light bg-bg-base p-4 text-sm font-semibold text-text-main transition hover:border-primary/40"
					>
						Firmas y seguimiento
					</a>
				</div>
			</Card>
		</div>
	{/if}
</div>
