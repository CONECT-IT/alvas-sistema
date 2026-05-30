<script lang="ts">
	interface Props {
		checked?: boolean;
		label?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		class?: string;
	}

	let {
		checked = $bindable(false),
		label = '',
		error,
		disabled = false,
		required = false,
		class: className = ''
	}: Props = $props();
</script>

<label
	class="inline-flex items-start gap-3 {disabled
		? 'cursor-not-allowed opacity-50'
		: 'cursor-pointer'} {className}"
>
	<input
		type="checkbox"
		bind:checked
		{disabled}
		{required}
		class="mt-0.5 h-4 w-4 rounded border-border-light bg-bg-card text-primary focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 focus:ring-offset-bg-base"
		class:border-danger={!!error}
	/>
	{#if label}
		<span class="text-sm text-text-main">{label}</span>
	{/if}
</label>
{#if error}
	<p class="mt-1 text-xs text-danger">{error}</p>
{/if}
