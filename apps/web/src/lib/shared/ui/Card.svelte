<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className = '', children }: Props = $props();
</script>

<section class={`rounded-3xl border border-border-light bg-white p-6 shadow-xs ${className}`}>
	{@render children()}
</section>
