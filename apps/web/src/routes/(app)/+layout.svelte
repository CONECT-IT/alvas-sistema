<script lang="ts">
	import AppShell from '$lib/shared/ui/AppShell.svelte';
	import { authStore } from '$lib/auth/infrastructure/authStore';
	import { page } from '$app/stores';
	import { pageTransition } from '$lib/shared/actions/gsapPageTransition';

	let { data, children } = $props();

	$effect(() => {
		authStore.hydrate(data.user);
	});
</script>

<svelte:head>
	<title>ALVAS - Sistema</title>
</svelte:head>

<AppShell>
	{#key $page.url.pathname}
		<div use:pageTransition>
			{@render children()}
		</div>
	{/key}
</AppShell>
