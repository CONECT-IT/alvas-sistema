<script lang="ts">
	import type { Snippet } from 'svelte';

	type BadgeTone = 'brand' | 'success' | 'warning' | 'neutral';

	interface Props {
		tone?: BadgeTone;
		class?: string;
		children: Snippet;
	}

	let { tone = 'brand', class: className = '', children }: Props = $props();

	const tones: Record<BadgeTone, string> = {
		brand: 'bg-primary-light text-primary-dark',
		success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
		warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
		neutral: 'bg-surface-muted text-text-muted'
	};
</script>

<span
	class={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
>
	{@render children()}
</span>
