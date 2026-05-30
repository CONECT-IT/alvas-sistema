<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string;
		label?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		class?: string;
		children: Snippet;
	}

	let {
		value = $bindable(''),
		label,
		error,
		disabled = false,
		required = false,
		class: className = '',
		children
	}: Props = $props();
</script>

{#if label}
	<label class="label-field">
		{label}
		<select
			bind:value
			{disabled}
			{required}
			class="input-field {className}"
			class:border-danger={!!error}
		>
			{@render children()}
		</select>
	</label>
{:else}
	<select
		bind:value
		{disabled}
		{required}
		class="input-field {className}"
		class:border-danger={!!error}
	>
		{@render children()}
	</select>
{/if}

{#if error}
	<p class="mt-1 text-xs text-danger">{error}</p>
{/if}
