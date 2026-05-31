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
	<input type="checkbox" bind:checked {disabled} {required} class="peer sr-only" />
	<span
		class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-base {checked
			? 'border-primary bg-primary text-white shadow-sm'
			: 'border-border-light bg-bg-card text-transparent'} {error ? 'border-danger' : ''}"
		aria-hidden="true"
	>
		<svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none">
			<path
				d="M4 10.5L8.2 14.5L16 5.5"
				stroke="currentColor"
				stroke-width="2.4"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</span>
	{#if label}
		<span class="text-sm text-text-main">{label}</span>
	{/if}
</label>
{#if error}
	<p class="mt-1 text-xs text-danger">{error}</p>
{/if}
