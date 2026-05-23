<script lang="ts">
	import '$lib/shared/design-system/tokens.css';

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

<div class="min-h-screen bg-bg-base font-sans text-text-main">
	{@render children()}
</div>
