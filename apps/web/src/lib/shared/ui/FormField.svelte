<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label?: string;
		error?: string;
		help?: string;
		class?: string;
		children: Snippet;
	}

	let { label, error, help, class: className = '', children }: Props = $props();
</script>

<div class="grid gap-1 {className}">
	{#if label}
		<span class="label-field">{label}</span>
	{/if}

	{@render children()}

	{#if help && !error}
		<p class="mt-1 text-xs text-text-muted">{help}</p>
	{/if}

	{#if error}
		<p class="mt-1 text-xs text-danger">{error}</p>
	{/if}
</div>
