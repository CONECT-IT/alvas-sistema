<script lang="ts">
	import AppShell from '$lib/shared/ui/AppShell.svelte';
	import { authStore } from '$lib/auth/infrastructure/authStore';

	let { data, children } = $props();

	$effect(() => {
		authStore.hydrate(data.user);
	});
</script>

<svelte:head>
	<title>ALVAS - Sistema</title>
</svelte:head>

<AppShell>
	{@render children()}
</AppShell>
