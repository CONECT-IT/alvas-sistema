<script lang="ts">
	interface Props {
		checked?: boolean;
		label?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		onchange?: (checked: boolean) => void;
		class?: string;
	}

	let {
		checked = $bindable(false),
		label = '',
		error,
		disabled = false,
		onchange,
		class: className = ''
	}: Props = $props();

	function toggle() {
		if (disabled) return;
		checked = !checked;
		onchange?.(checked);
	}
</script>

<label
	class="inline-flex items-center gap-3 {disabled
		? 'cursor-not-allowed opacity-50'
		: 'cursor-pointer'} {className}"
>
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		aria-label={label || 'Toggle'}
		{disabled}
		onclick={toggle}
		onkeydown={(e) => {
			if (e.key === ' ' || e.key === 'Enter') {
				e.preventDefault();
				toggle();
			}
		}}
		class="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary {checked
			? 'bg-primary'
			: 'bg-border-light'}"
	>
		<span
			class="inline-block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out {checked
				? 'translate-x-[1.375rem]'
				: ''}"
		></span>
	</button>
	{#if label}
		<span class="text-sm text-text-main">{label}</span>
	{/if}
</label>
{#if error}
	<p class="mt-1 text-xs text-danger">{error}</p>
{/if}
