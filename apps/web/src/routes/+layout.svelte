<script lang="ts">
	import '$lib/shared/design-system/tokens.css';
	import { navigating } from '$app/stores';

	let { children } = $props();

	function initTema() {
		if (typeof localStorage !== 'undefined') {
			const tema = localStorage.getItem('alvas-tema') || 'light';
			document.documentElement.setAttribute('data-tema', tema);
		}
	}

	$effect(() => {
		initTema();
	});
</script>

<svelte:head>
	<title>ALVAS</title>
</svelte:head>

{#if $navigating}
	<div class="fixed top-0 left-0 z-[9999] h-1 w-full bg-border-light">
		<div class="h-full w-1/3 animate-pulse rounded-r-full bg-primary"></div>
	</div>
{/if}

<div class="min-h-screen bg-bg-base font-sans text-text-main">
	{@render children()}
</div>
