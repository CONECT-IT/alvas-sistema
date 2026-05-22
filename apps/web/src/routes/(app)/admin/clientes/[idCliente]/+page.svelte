<script lang="ts">
	import { page } from '$app/stores';
	import ClienteDetail from '$lib/clientes/presentation/ClienteDetail.svelte';

	let clienteId = $derived($page.params.idCliente ?? '');
</script>

<svelte:head>
	<title>Cliente {clienteId} | ALVAS</title>
</svelte:head>

<ClienteDetail {clienteId} />
