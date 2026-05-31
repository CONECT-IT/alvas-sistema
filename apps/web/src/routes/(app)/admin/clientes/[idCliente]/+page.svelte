<script lang="ts">
	import ClienteDetail from '$lib/clientes/presentation/ClienteDetail.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Cliente {data.cliente?.nombre ?? 'Detalle'} | ALVAS</title>
</svelte:head>

<ClienteDetail clienteId={data.cliente?.id ?? ''} initialCliente={data.cliente} />
