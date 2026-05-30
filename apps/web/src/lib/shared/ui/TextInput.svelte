<script lang="ts">
	interface Props {
		value?: string | number;
		type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url';
		placeholder?: string;
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
		placeholder = '',
		label,
		error,
		disabled = false,
		required = false,
		min,
		max,
		step,
		class: className = ''
	}: Props = $props();
</script>

{#if label}
	<label class="label-field">
		{label}
		<input
			bind:value
			{type}
			{placeholder}
			{disabled}
			{required}
			{min}
			{max}
			{step}
			class="input-field {className}"
			class:border-danger={!!error}
		/>
	</label>
{:else}
	<input
		bind:value
		{type}
		{placeholder}
		{disabled}
		{required}
		{min}
		{max}
		{step}
		class="input-field {className}"
		class:border-danger={!!error}
	/>
{/if}

{#if error}
	<p class="mt-1 text-xs text-danger">{error}</p>
{/if}
