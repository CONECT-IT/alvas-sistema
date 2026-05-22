<script lang="ts">
	import { page } from '$app/stores';
	import LeadDetail from '$lib/ventas/presentation/LeadDetail.svelte';

	let leadId = $derived($page.params.idLead ?? '');
</script>

<svelte:head>
	<title>Lead {leadId} | ALVAS</title>
</svelte:head>

<LeadDetail {leadId} />
