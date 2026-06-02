<script lang="ts">
	import LeadDetail from '$lib/ventas/presentation/LeadDetail.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Lead {data.lead?.nombre ?? 'Detalle'} | ALVAS</title>
</svelte:head>

<LeadDetail leadId={data.lead?.id ?? ''} initialLead={data.lead} />
