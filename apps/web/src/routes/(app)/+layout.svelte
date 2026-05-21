<script lang="ts">
	import AppShell from '$lib/shared/ui/AppShell.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>ALVAS - Sistema</title>
</svelte:head>

<AppShell>
	{@render children()}
</AppShell>
