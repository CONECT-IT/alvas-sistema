<script lang="ts">
	interface Props {
		value?: string | number;
		type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url';
		label?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		min?: number;
		max?: number;
		step?: number;
		class?: string;
	}

	let {
		value = $bindable(''),
		type = 'text',
		label = '',
		error,
		disabled = false,
		required = false,
		min,
		max,
		step,
		class: className = ''
	}: Props = $props();

	let focused = $state(false);

	const hasValue = $derived(value !== '' && value !== undefined && value !== null);
	const float = $derived(focused || hasValue);
</script>

<label class="relative block w-full">
	<input
		bind:value
		{type}
		{disabled}
		{required}
		{min}
		{max}
		{step}
		onfocus={() => (focused = true)}
		onblur={() => (focused = false)}
		class="input-field pt-5 pb-2 placeholder-transparent disabled:cursor-not-allowed disabled:opacity-50 {className}"
		class:border-danger={Boolean(error)}
		placeholder=" "
	/>
	<span
		class="pointer-events-none absolute left-4 origin-left transition-all duration-150 ease-in-out {float
			? 'top-2 text-xs text-text-muted'
			: 'top-1/2 -translate-y-1/2 text-[0.9375rem] text-text-muted'} {focused && !error
			? 'text-primary'
			: ''} {error ? 'text-danger' : ''}"
	>
		{label}{#if required}<span class="text-danger">*</span>{/if}
	</span>
</label>
{#if error}
	<p class="mt-1 text-xs text-danger">{error}</p>
{/if}
