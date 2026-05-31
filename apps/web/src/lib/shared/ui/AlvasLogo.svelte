<script lang="ts">
	interface Props {
		variant?: 'full' | 'isotype';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let { variant = 'full', size = 'md', class: className = '' }: Props = $props();

	const sizes = {
		sm: { iso: 'h-7 w-7', full: 'h-7' },
		md: { iso: 'h-9 w-9', full: 'h-9' },
		lg: { iso: 'h-11 w-11', full: 'h-11' }
	};

	const sizeClass = $derived(variant === 'full' ? sizes[size].full : sizes[size].iso);
</script>

{#if variant === 'isotype'}
	<svg
		class="{sizeClass} {className}"
		viewBox="0 0 48 48"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-label="ALVAS"
	>
		<defs>
			<linearGradient id="iso-grad" x1="0" y1="4" x2="48" y2="44" gradientUnits="userSpaceOnUse">
				<stop offset="0%" stop-color="#FBBF24" />
				<stop offset="100%" stop-color="#EA580C" />
			</linearGradient>
		</defs>
		<path d="M24 5 L7 42 L41 42 Z" fill="url(#iso-grad)" opacity="0.15" />
		<path d="M24 5 L9 39" stroke="url(#iso-grad)" stroke-width="5" stroke-linecap="round" />
		<path d="M24 5 L39 39" stroke="url(#iso-grad)" stroke-width="5" stroke-linecap="round" />
		<path d="M14 27 L34 27" stroke="url(#iso-grad)" stroke-width="4.5" stroke-linecap="round" />
		<rect x="22" y="1" width="4" height="8" rx="2" fill="url(#iso-grad)" />
	</svg>
{:else}
	<span class="inline-flex items-center gap-2.5 {className}">
		<svg
			class={sizeClass}
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<defs>
				<linearGradient
					id="logo-grad"
					x1="0"
					y1="4"
					x2="48"
					y2="44"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0%" stop-color="#FBBF24" />
					<stop offset="100%" stop-color="#EA580C" />
				</linearGradient>
			</defs>
			<path d="M24 5 L7 42 L41 42 Z" fill="url(#logo-grad)" opacity="0.15" />
			<path d="M24 5 L9 39" stroke="url(#logo-grad)" stroke-width="5" stroke-linecap="round" />
			<path d="M24 5 L39 39" stroke="url(#logo-grad)" stroke-width="5" stroke-linecap="round" />
			<path d="M14 27 L34 27" stroke="url(#logo-grad)" stroke-width="4.5" stroke-linecap="round" />
			<rect x="22" y="1" width="4" height="8" rx="2" fill="url(#logo-grad)" />
		</svg>
		<span class="font-display text-lg font-bold tracking-tight text-text-main">ALVAS</span>
	</span>
{/if}
