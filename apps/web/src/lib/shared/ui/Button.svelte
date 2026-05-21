<script lang="ts">
	import type { Snippet } from 'svelte';

	type ButtonVariant = 'primary' | 'secondary' | 'ghost';

	interface Props {
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		variant?: ButtonVariant;
		disabled?: boolean;
		class?: string;
		children: Snippet;
	}

	let {
		href,
		type = 'button',
		variant = 'primary',
		disabled = false,
		class: className = '',
		children
	}: Props = $props();

	const variants: Record<ButtonVariant, string> = {
		primary: 'bg-primary text-white shadow-sm hover:bg-primary-dark focus-visible:outline-primary',
		secondary:
			'border border-border-light bg-white text-text-main hover:border-primary/30 hover:text-primary focus-visible:outline-primary',
		ghost: 'text-text-muted hover:bg-bg-base hover:text-text-main focus-visible:outline-primary'
	};

	const baseClass =
		'inline-flex items-center justify-center rounded-xl px-5 py-3 font-display font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2';
</script>

{#if href}
	<a {href} class={`${baseClass} ${variants[variant]} ${className}`}>
		{@render children()}
	</a>
{:else}
	<button {type} {disabled} class={`${baseClass} ${variants[variant]} ${className}`}>
		{@render children()}
	</button>
{/if}
