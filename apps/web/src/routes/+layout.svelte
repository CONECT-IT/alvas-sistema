<script lang="ts">
	import '$lib/shared/design-system/tokens.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>ALVAS</title>
</svelte:head>

<div class="min-h-screen bg-bg-base font-sans text-text-main">
	{@render children()}
</div>
