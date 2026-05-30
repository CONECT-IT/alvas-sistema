<script lang="ts">
	interface Props {
		value?: string;
		placeholder?: string;
		label?: string;
		error?: string;
		disabled?: boolean;
		required?: boolean;
		rows?: number;
		class?: string;
		resize?: boolean;
	}

	let {
		value = $bindable(''),
		placeholder = '',
		label,
		error,
		disabled = false,
		required = false,
		rows = 3,
		class: className = '',
		resize = true
	}: Props = $props();
</script>

{#if label}
	<label class="label-field">
		{label}
		<textarea
			bind:value
			{placeholder}
			{disabled}
			{required}
			{rows}
			class="input-field {className}"
			class:resize-none={!resize}
			class:border-danger={!!error}
		></textarea>
	</label>
{:else}
	<textarea
		bind:value
		{placeholder}
		{disabled}
		{required}
		{rows}
		class="input-field {className}"
		class:resize-none={!resize}
		class:border-danger={!!error}
	></textarea>
{/if}

{#if error}
	<p class="mt-1 text-xs text-danger">{error}</p>
{/if}
